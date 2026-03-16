/**
 * ============================================================================
 * API FORMULAIRE DE CONTACT — app/api/contact/route.ts
 * ============================================================================
 *
 * Route API Next.js qui reçoit les soumissions du formulaire de contact
 * et envoie un email via Resend.
 *
 * Endpoint : POST /api/contact
 *
 * Body JSON attendu :
 *   {
 *     name:     string,   // Nom de l'expéditeur
 *     email:    string,   // Email de l'expéditeur
 *     message:  string,   // Contenu du message
 *     honeypot: string,   // Champ piège anti-bot (doit être vide)
 *     elapsed:  number,   // Temps écoulé depuis le chargement de la page (ms)
 *   }
 *
 * Protection anti-spam en 3 couches :
 *   1. Honeypot : champ caché rempli uniquement par les bots (réponse 200 factice)
 *   2. Timing check : soumission < 3 secondes = bot (réponse 200 factice)
 *   3. Rate limiting : max 3 soumissions par IP par fenêtre de 10 minutes (429)
 *
 * Sécurité du contenu :
 *   - Échappement HTML de toutes les données utilisateur (anti-XSS dans l'email)
 *   - Validation du format email par regex
 *   - Limites de longueur sur tous les champs
 *
 * Variables d'environnement requises :
 *   RESEND_API_KEY  — Clé API Resend (requis)
 *   CONTACT_EMAIL   — Email de destination (requis — défini dans .env.local)
 *   NEXT_PUBLIC_SITE_URL — URL du site pour le pied de page de l'email
 * ============================================================================
 */

import { NextRequest, NextResponse } from 'next/server';

// ─── Rate limiter en mémoire ──────────────────────────────────────────────────
// Stocke le nombre de requêtes par IP avec une date d'expiration.
// Note : cette Map est réinitialisée à chaque redémarrage du serveur.
// En production Vercel, les fonctions serverless peuvent être recréées entre requêtes.
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

/** Nombre maximum de soumissions autorisées par IP dans la fenêtre */
const RATE_LIMIT = 3;
/** Durée de la fenêtre de rate limiting (10 minutes en millisecondes) */
const RATE_WINDOW_MS = 10 * 60 * 1000;

/**
 * Vérifie et incrémente le compteur de rate limiting pour une IP donnée.
 * Réinitialise le compteur si la fenêtre est expirée.
 *
 * @param ip - Adresse IP de l'expéditeur
 * @returns true si la requête est autorisée, false si le quota est dépassé
 */
function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record || now > record.resetAt) {
    // Nouvelle IP ou fenêtre expirée → crée un nouveau compteur
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return true;
  }

  if (record.count >= RATE_LIMIT) return false; // Quota dépassé

  record.count++;
  return true;
}

/**
 * Échappe les caractères HTML spéciaux dans une chaîne.
 * Protège contre les injections XSS dans le corps HTML de l'email.
 * Appliqué à TOUTES les données utilisateur avant insertion dans le template.
 *
 * @param str - Chaîne à échapper
 * @returns Chaîne avec les caractères dangereux remplacés par entités HTML
 */
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Valide le format d'une adresse email par regex.
 * Vérifie la présence d'un @ et d'un domaine avec extension d'au moins 2 caractères.
 *
 * @param email - L'adresse à valider
 * @returns true si le format est valide
 */
function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
}

/**
 * Handler POST /api/contact
 * Traite la soumission du formulaire de contact.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, message, honeypot, elapsed } = body;

    // 1. Honeypot — le champ "website" est caché en CSS, seuls les bots le remplissent
    // On répond 200 pour ne pas alerter le bot que sa tentative a été détectée
    if (honeypot) {
      return NextResponse.json({ success: true });
    }

    // 2. Timing check — un humain met au moins 3 secondes pour remplir le formulaire
    if (typeof elapsed === 'number' && elapsed < 3000) {
      return NextResponse.json({ success: true }); // Réponse factice au bot
    }

    // 3. Validation des champs requis
    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Champs manquants' }, { status: 400 });
    }

    // 4. Validation des longueurs maximales (protection contre les payloads trop longs)
    if (
      typeof name !== 'string' || name.length > 100 ||
      typeof email !== 'string' || email.length > 200 ||
      typeof message !== 'string' || message.length > 5000
    ) {
      return NextResponse.json({ error: 'Données invalides' }, { status: 400 });
    }

    // 5. Validation du format email
    if (!isValidEmail(email)) {
      return NextResponse.json({ error: 'Email invalide' }, { status: 400 });
    }

    // 6. Rate limiting par IP
    // x-forwarded-for : en-tête standard derrière un proxy/CDN (Vercel, Cloudflare)
    // x-real-ip : alternative utilisée par certains reverse proxies
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
      request.headers.get('x-real-ip') ??
      'unknown';

    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Trop de messages envoyés. Réessaie dans 10 minutes.' },
        { status: 429 }
      );
    }

    // 7. Vérification des variables d'environnement requises
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.error('RESEND_API_KEY manquant dans .env.local');
      return NextResponse.json(
        { error: 'Service email non configuré' },
        { status: 503 }
      );
    }
    if (!process.env.CONTACT_EMAIL) {
      console.error('CONTACT_EMAIL manquant dans .env.local');
      return NextResponse.json(
        { error: 'Service email non configuré' },
        { status: 503 }
      );
    }

    // 8. Échappement HTML de toutes les données utilisateur avant insertion dans l'email
    const safeName    = escapeHtml(name.trim());
    const safeEmail   = escapeHtml(email.trim());
    const safeMessage = escapeHtml(message.trim());

    // Import dynamique de Resend (réduit le bundle initial)
    const { Resend } = await import('resend');
    const resend = new Resend(apiKey);

    /** Email de destination — défini dans .env.local (CONTACT_EMAIL) */
    const toEmail  = process.env.CONTACT_EMAIL;
    /** URL du site pour le lien dans le pied de page de l'email */
    const siteUrl  = process.env.NEXT_PUBLIC_SITE_URL || 'https://portfolio.djefrid.ca';
    /** Date et heure de réception, formatées en fuseau horaire de Toronto (EST/EDT) */
    const now = new Date().toLocaleString('fr-CA', {
      timeZone: 'America/Toronto',
      dateStyle: 'long',
      timeStyle: 'short',
    });

    // Envoi de l'email via Resend
    // Le template HTML utilise des classes utilitaires (.eo, .ec, etc.) pour le mode sombre
    // car les clients email ne supportent pas les variables CSS
    await resend.emails.send({
      from: 'Portfolio Contact <onboarding@resend.dev>',
      to: toEmail,
      replyTo: safeEmail, // Répondre directement à l'expéditeur
      subject: `Nouveau message de ${safeName} — Portfolio`,
      html: `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="color-scheme" content="light dark" />
  <meta name="supported-color-schemes" content="light dark" />
  <style>
    :root { color-scheme: light dark; }
    body { margin:0; padding:0; background-color:#0b1120; }
    /* Classes utilitaires pour le mode sombre dans les clients email qui le supportent */
    [data-ogsb] .eo { background-color:#0b1120 !important; }
    [data-ogsb] .ec { background-color:#101827 !important; }
    [data-ogsb] .ef { background-color:#0d1929 !important; }
    [data-ogsb] .eb { background-color:#4338ca !important; }
    [data-ogsc] .tt { color:#dde3ed !important; }
    [data-ogsc] .tb { color:#8296b0 !important; }
    [data-ogsc] .tl { color:#6d7fbd !important; }
    [data-ogsc] .tm { color:#4a6080 !important; }
    /* Fallback prefers-color-scheme pour les clients email modernes */
    @media (prefers-color-scheme: dark) {
      .eo { background-color:#0b1120 !important; }
      .ec { background-color:#101827 !important; }
      .ef { background-color:#0d1929 !important; }
      .eb { background-color:#4338ca !important; }
      .tt { color:#dde3ed !important; }
      .tb { color:#8296b0 !important; }
      .tl { color:#6d7fbd !important; }
      .tm { color:#4a6080 !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background-color:#0b1120;" bgcolor="#0b1120">

<!-- ═══ Fond extérieur ═══ -->
<table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#0b1120" style="background-color:#0b1120;">
  <tr>
    <!-- padding ICI sur le td, jamais sur table -->
    <td class="eo" align="center" bgcolor="#0b1120"
        style="background-color:#0b1120;padding:48px 16px;">

      <!-- ═══ Colonne 560px ═══ -->
      <table width="560" cellpadding="0" cellspacing="0" border="0" bgcolor="#0b1120"
             style="background-color:#0b1120;max-width:560px;width:100%;">

        <!-- Barre accent indigo en haut de la carte -->
        <tr>
          <td class="eb" bgcolor="#4f46e5" height="4"
              style="background-color:#4f46e5;font-size:0;line-height:0;" height="4">&nbsp;</td>
        </tr>

        <!-- ═══ Carte principale ═══ -->
        <tr>
          <td class="ec" bgcolor="#101827"
              style="background-color:#101827;border:1px solid #1e2f45;border-top:none;padding:36px 36px 28px;">

            <!-- En-tête : logo/nom + titre + date -->
            <p class="tl" style="margin:0 0 4px;font-size:11px;font-weight:700;letter-spacing:2.5px;text-transform:uppercase;color:#6d7fbd;">Djefrid Byli &middot; Portfolio</p>
            <h1 class="tt" style="margin:0 0 4px;font-size:20px;font-weight:600;color:#dde3ed;line-height:1.3;">Nouveau message re&ccedil;u</h1>
            <p class="tm" style="margin:0 0 24px;font-size:12px;color:#4a6080;">${now}</p>

            <!-- Séparateur horizontal -->
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr><td bgcolor="#1e2f45" height="1" style="background-color:#1e2f45;font-size:0;line-height:0;" height="1"></td></tr>
            </table>

            <!-- Spacer -->
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr><td class="ec" bgcolor="#101827" height="20" style="background-color:#101827;font-size:0;line-height:0;" height="20"></td></tr>
            </table>

            <!-- Bloc expéditeur -->
            <p class="tm" style="margin:0 0 8px;font-size:10px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#4a6080;">Exp&eacute;diteur</p>
            <table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#0d1929"
                   style="background-color:#0d1929;">
              <tr>
                <td class="ef" bgcolor="#0d1929"
                    style="background-color:#0d1929;border-left:3px solid #4f46e5;padding:14px 18px;">
                  <p class="tt" style="margin:0 0 4px;font-size:15px;font-weight:600;color:#dde3ed;">${safeName}</p>
                  <a href="mailto:${safeEmail}" class="tl"
                     style="font-size:13px;color:#6d7fbd;text-decoration:none;">${safeEmail}</a>
                </td>
              </tr>
            </table>

            <!-- Spacer -->
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr><td class="ec" bgcolor="#101827" height="20" style="background-color:#101827;font-size:0;line-height:0;" height="20"></td></tr>
            </table>

            <!-- Bloc message -->
            <p class="tm" style="margin:0 0 8px;font-size:10px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#4a6080;">Message</p>
            <table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#0d1929"
                   style="background-color:#0d1929;">
              <tr>
                <td class="ef" bgcolor="#0d1929"
                    style="background-color:#0d1929;padding:18px 20px;">
                  <!-- white-space:pre-wrap préserve les sauts de ligne du message -->
                  <p class="tb" style="margin:0;font-size:14px;line-height:1.8;color:#8296b0;white-space:pre-wrap;">${safeMessage}</p>
                </td>
              </tr>
            </table>

            <!-- Spacer -->
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr><td class="ec" bgcolor="#101827" height="24" style="background-color:#101827;font-size:0;line-height:0;" height="24"></td></tr>
            </table>

            <!-- Bouton "Répondre" — lien mailto pré-rempli avec le sujet -->
            <table cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td class="eb" bgcolor="#4338ca"
                    style="background-color:#4338ca;border-radius:8px;">
                  <a href="mailto:${safeEmail}?subject=Re%3A%20Votre%20message%20depuis%20le%20portfolio"
                     style="display:inline-block;background-color:#4338ca;color:#e0e3f0;font-size:13px;font-weight:500;text-decoration:none;padding:12px 26px;border-radius:8px;">
                    R&eacute;pondre &agrave; ${safeName}
                  </a>
                </td>
              </tr>
            </table>

            <!-- Spacer -->
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr><td class="ec" bgcolor="#101827" height="24" style="background-color:#101827;font-size:0;line-height:0;" height="24"></td></tr>
            </table>

            <!-- Séparateur bas -->
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr><td bgcolor="#1e2f45" height="1" style="background-color:#1e2f45;font-size:0;line-height:0;" height="1"></td></tr>
            </table>

            <!-- Spacer -->
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr><td class="ec" bgcolor="#101827" height="16" style="background-color:#101827;font-size:0;line-height:0;" height="16"></td></tr>
            </table>

            <!-- Pied de page avec lien vers le site -->
            <p style="margin:0;font-size:11px;color:#4a6080;line-height:1.6;">
              Formulaire de contact &mdash;
              <a href="${siteUrl}" style="color:#5a7090;text-decoration:none;">${siteUrl}</a>
            </p>

          </td>
        </tr>

      </table>
      <!-- fin colonne 560px -->

    </td>
  </tr>
</table>
<!-- fin fond extérieur -->

</body>
</html>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erreur envoi email:', error);
    return NextResponse.json({ error: "Erreur lors de l'envoi" }, { status: 500 });
  }
}
