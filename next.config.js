// ============================================================================
// CONFIGURATION NEXT.JS — next.config.js
// ============================================================================
//
// Headers de sécurité HTTP appliqués à toutes les réponses.
//
// Note CSP : le Content-Security-Policy avec nonce est géré par middleware.ts
// et non ici. Le middleware génère un nonce aléatoire par requête, ce qui
// renforce la protection XSS en éliminant 'unsafe-inline' des scripts.
//
// Bundle analyzer : ANALYZE=true npm run build → ouvre un rapport HTML visuel
// des chunks JS (client + server + edge) pour identifier les dépendances lourdes.
// ============================================================================

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
  openAnalyzer: true,
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",

  /**
   * Proxy transparent pour Firebase Auth redirect flow.
   *
   * POURQUOI :
   *   signInWithRedirect utilise /__/auth/handler pour communiquer le token
   *   entre Google et l'application. Par défaut, ce handler est hébergé sur
   *   portfolio-8d07b.firebaseapp.com (domaine tiers).
   *   Les navigateurs mobiles (Safari iOS, Chrome Android) bloquent les cookies
   *   tiers → getRedirectResult() retourne toujours null → auth échoue silencieusement.
   *
   * SOLUTION (Option 3 Firebase officielle) :
   *   Proxifier /__/auth/* vers firebaseapp.com depuis notre propre domaine.
   *   Firebase Auth SDK voit portfolio.djefrid.ca comme authDomain (same-origin)
   *   → cookies first-party → getRedirectResult() fonctionne sur tous les mobiles.
   *
   * PRÉREQUIS MANUEL (à faire une seule fois dans Google Cloud Console) :
   *   APIs & Services → Credentials → OAuth 2.0 Client ID Web application
   *   → Authorized redirect URIs → ajouter :
   *   https://portfolio.djefrid.ca/__/auth/handler
   */
  async rewrites() {
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'portfolio-8d07b';
    return {
      beforeFiles: [
        {
          source: '/__/auth/:path*',
          destination: `https://${projectId}.firebaseapp.com/__/auth/:path*`,
        },
      ],
    };
  },

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          // Empêche le MIME-sniffing (XSS via fichiers mal typés)
          { key: "X-Content-Type-Options", value: "nosniff" },

          // SAMEORIGIN (et non DENY) : Firebase Auth signInWithPopup crée un iframe
          // /__/auth/iframe (proxié same-origin) dont le contenu (firebaseapp.com)
          // frame portfolio.djefrid.ca/ pour la gestion de session OAuth.
          // DENY bloquait ce framing → auth/popup-closed-by-user.
          // SAMEORIGIN autorise le framing same-origin (Firebase proxy = même domaine).
          // Protection clickjacking cross-origin maintenue par frame-ancestors 'self'
          // dans le CSP de middleware.ts (priorité sur X-Frame-Options en Chrome/FF/Safari).
          { key: "X-Frame-Options", value: "SAMEORIGIN" },

          // Force HTTPS pendant 2 ans (protection MITM / downgrade attacks)
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },

          // Contrôle les informations envoyées dans le header Referer
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },

          // Désactive les API matérielles non utilisées par le site
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
          },

          // Accélère la résolution DNS pour les ressources first-party
          { key: "X-DNS-Prefetch-Control", value: "on" },

          // Permet aux popups ouvertes par cette page (Firebase OAuth) de communiquer
          // avec l'opener via window.opener / window.closed.
          // 'same-origin-allow-popups' : les popups cross-origin peuvent être ouvertes
          // et communiquer — requis par Firebase signInWithPopup.
          // (sans ce header ou avec 'same-origin', la popup ne peut pas communiquer
          // et l'auth échoue silencieusement avec window.closed bloqué)
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin-allow-popups",
          },
        ],
      },
    ];
  },
};

module.exports = withBundleAnalyzer(nextConfig);
