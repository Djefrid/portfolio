// ============================================================================
// MIDDLEWARE DE SÉCURITÉ — middleware.ts
// ============================================================================
//
// Ce middleware s'exécute sur TOUTES les requêtes (sauf fichiers statiques).
// Il assure deux responsabilités de sécurité :
//
//   1. Protection CSRF — vérifie que les POST vers /api/* proviennent
//      du même domaine (header Origin == header Host).
//      Les Route Handlers n'ont pas la protection CSRF native des Server Actions.
//
//   2. CSP avec nonce — génère un nonce aléatoire par requête et l'injecte
//      dans le header Content-Security-Policy.
//      Le nonce est transmis via x-nonce dans les headers de requête
//      pour que app/layout.tsx puisse l'appliquer au script JSON-LD.
//      Next.js 14 lit automatiquement x-nonce pour ses propres scripts
//      d'hydratation inline.
//
// Pourquoi un nonce ?
//   Sans nonce, le CSP doit autoriser 'unsafe-inline' pour TOUS les scripts,
//   ce qui annule largement la protection contre les injections XSS.
//   Avec 'nonce-*' + 'strict-dynamic', seuls les scripts portant ce nonce
//   sont autorisés, et les scripts qu'ils chargent dynamiquement héritent
//   de cette confiance (nécessaire pour le code-splitting Next.js).
//
// Note : 'unsafe-eval' reste nécessaire pour Excalidraw (moteur canvas + export).
// ============================================================================

import { NextResponse, type NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // ─── 1. Protection CSRF sur les API Routes ──────────────────────────────────
  // Bloque les requêtes POST dont l'Origin ne correspond pas au Host.
  // Ne bloque PAS les requêtes sans Origin (appels serveur à serveur, curl, etc.)
  // Les requêtes du navigateur depuis le même domaine ont toujours un Origin valide.
  if (request.method === 'POST' && request.nextUrl.pathname.startsWith('/api/')) {
    const origin = request.headers.get('origin');
    const host   = request.headers.get('host');
    if (origin && host && !origin.includes(host)) {
      return new NextResponse('Forbidden', { status: 403 });
    }
  }

  // ─── 2. CSP avec nonce aléatoire ────────────────────────────────────────────
  // crypto.randomUUID() est disponible dans l'Edge Runtime (Web Crypto API).
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64');

  const csp = [
    "default-src 'self'",

    // 'nonce-*'        : seuls les scripts portant ce nonce exact sont autorisés
    // 'strict-dynamic' : les scripts chargés par un script noncé héritent de la confiance
    //                    (obligatoire pour le lazy-loading et code-splitting Next.js)
    // 'unsafe-eval'    : requis par Excalidraw (moteur de rendu canvas + export PNG)
    // www.google.com + www.gstatic.com : scripts reCAPTCHA v3 (App Check)
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' 'unsafe-eval' https://www.google.com https://www.gstatic.com`,

    // 'unsafe-inline'         : requis par TipTap (styles inline : font-family, color, margin…)
    // fonts.googleapis.com    : fichier CSS de la police Inter
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",

    // firebasestorage.googleapis.com : images et fichiers uploadés dans les notes
    "img-src 'self' data: blob: https://firebasestorage.googleapis.com",

    // fonts.gstatic.com : fichiers de police Inter (woff2, ttf…)
    "font-src 'self' data: https://fonts.gstatic.com",

    // Firebase Auth (identitytoolkit, securetoken) + Firestore + Storage
    // + WebSocket temps réel Firestore (wss://)
    // + www.google.com : requêtes fetch reCAPTCHA v3 (App Check token)
    "connect-src 'self' https://*.googleapis.com https://*.firebaseio.com https://*.firebaseapp.com wss://*.firebaseio.com https://www.google.com",

    // 'self' : Service Worker PWA (sw.js servi depuis la racine)
    // blob: : Excalidraw utilise des web workers blob: pour la compression et l'export
    "worker-src 'self' blob:",

    // accounts.google.com : Google OAuth (signInWithPopup)
    // www.google.com + recaptcha.google.com : iframes reCAPTCHA v3 (App Check)
    "frame-src https://accounts.google.com https://www.google.com https://recaptcha.google.com",

    // frame-ancestors 'none' : interdit l'intégration de ce site dans des iframes
    // (renforce X-Frame-Options: DENY)
    "frame-ancestors 'none'",

    // Bloque les plugins (Flash, Java, etc.) et l'injection de balise <base>
    "object-src 'none'",
    "base-uri 'self'",

    // Empêche l'envoi de formulaires vers des domaines externes
    "form-action 'self'",

    // Force le chargement de toutes les ressources en HTTPS
    "upgrade-insecure-requests",
  ].join('; ');

  // Transmet le nonce dans les headers de requête pour que app/layout.tsx puisse le lire.
  // Next.js 14 lit automatiquement x-nonce pour ses propres scripts d'hydratation.
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-nonce', nonce);
  requestHeaders.set('Content-Security-Policy', csp);

  const response = NextResponse.next({
    request: { headers: requestHeaders },
  });

  // Applique le CSP sur la réponse HTTP (écrase celui de next.config.js pour ces routes)
  response.headers.set('Content-Security-Policy', csp);

  return response;
}

export const config = {
  matcher: [
    // Applique le middleware à toutes les routes SAUF :
    // - _next/static  : fichiers JS/CSS compilés (pas d'HTML, pas de CSP nécessaire)
    // - _next/image   : service d'optimisation d'images
    // - favicon.ico   : icône du site
    // - fichiers statiques (.svg, .png, .jpg…) dans /public
    '/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
