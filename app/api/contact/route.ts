import { NextRequest, NextResponse } from 'next/server';

// ─── Rate limiter en mémoire ──────────────────────────────────────────────────
// Max 3 soumissions par IP toutes les 10 minutes
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 3;
const RATE_WINDOW_MS = 10 * 60 * 1000;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record || now > record.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return true;
  }

  if (record.count >= RATE_LIMIT) return false;

  record.count++;
  return true;
}

// ─── Utilitaire échappement HTML (anti-XSS dans le corps de l'email) ─────────
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// ─── Validation email ─────────────────────────────────────────────────────────
function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
}

// ─── Handler ──────────────────────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, message, honeypot, elapsed } = body;

    // 1. Honeypot — si le champ caché est rempli, c'est un bot
    if (honeypot) {
      // Réponse 200 factice pour ne pas alerter le bot
      return NextResponse.json({ success: true });
    }

    // 2. Timing check — soumission en moins de 3 secondes = bot
    if (typeof elapsed === 'number' && elapsed < 3000) {
      return NextResponse.json({ success: true });
    }

    // 3. Champs requis
    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Champs manquants' }, { status: 400 });
    }

    // 4. Longueurs maximales
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

    // 7. Clé API Resend
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.error('RESEND_API_KEY manquant dans .env.local');
      return NextResponse.json(
        { error: 'Service email non configuré' },
        { status: 503 }
      );
    }

    // 8. Échappement HTML de toutes les données utilisateur (anti-XSS)
    const safeName    = escapeHtml(name.trim());
    const safeEmail   = escapeHtml(email.trim());
    const safeMessage = escapeHtml(message.trim());

    const { Resend } = await import('resend');
    const resend = new Resend(apiKey);

    const toEmail  = process.env.CONTACT_EMAIL || 'djeffkuate@gmail.com';
    const siteUrl  = process.env.NEXT_PUBLIC_SITE_URL || 'https://portfolio.djefrid.ca';
    const now = new Date().toLocaleString('fr-CA', {
      timeZone: 'America/Toronto',
      dateStyle: 'long',
      timeStyle: 'short',
    });

    await resend.emails.send({
      from: 'Portfolio Contact <onboarding@resend.dev>',
      to: toEmail,
      replyTo: safeEmail,
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
    [data-ogsb] .eo { background-color:#0b1120 !important; }
    [data-ogsb] .ec { background-color:#101827 !important; }
    [data-ogsb] .ef { background-color:#0d1929 !important; }
    [data-ogsb] .eb { background-color:#4338ca !important; }
    [data-ogsc] .tt { color:#dde3ed !important; }
    [data-ogsc] .tb { color:#8296b0 !important; }
    [data-ogsc] .tl { color:#6d7fbd !important; }
    [data-ogsc] .tm { color:#4a6080 !important; }
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

        <!-- Barre accent -->
        <tr>
          <td class="eb" bgcolor="#4f46e5" height="4"
              style="background-color:#4f46e5;font-size:0;line-height:0;" height="4">&nbsp;</td>
        </tr>

        <!-- ═══ Carte ═══ -->
        <tr>
          <td class="ec" bgcolor="#101827"
              style="background-color:#101827;border:1px solid #1e2f45;border-top:none;padding:36px 36px 28px;">

            <!-- En-tête -->
            <p class="tl" style="margin:0 0 4px;font-size:11px;font-weight:700;letter-spacing:2.5px;text-transform:uppercase;color:#6d7fbd;">Djefrid Byli &middot; Portfolio</p>
            <h1 class="tt" style="margin:0 0 4px;font-size:20px;font-weight:600;color:#dde3ed;line-height:1.3;">Nouveau message re&ccedil;u</h1>
            <p class="tm" style="margin:0 0 24px;font-size:12px;color:#4a6080;">${now}</p>

            <!-- Séparateur -->
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr><td bgcolor="#1e2f45" height="1" style="background-color:#1e2f45;font-size:0;line-height:0;" height="1"></td></tr>
            </table>

            <!-- Spacer -->
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr><td class="ec" bgcolor="#101827" height="20" style="background-color:#101827;font-size:0;line-height:0;" height="20"></td></tr>
            </table>

            <!-- Expéditeur — label -->
            <p class="tm" style="margin:0 0 8px;font-size:10px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#4a6080;">Exp&eacute;diteur</p>

            <!-- Expéditeur — bloc -->
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

            <!-- Message — label -->
            <p class="tm" style="margin:0 0 8px;font-size:10px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#4a6080;">Message</p>

            <!-- Message — bloc -->
            <table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#0d1929"
                   style="background-color:#0d1929;">
              <tr>
                <td class="ef" bgcolor="#0d1929"
                    style="background-color:#0d1929;padding:18px 20px;">
                  <p class="tb" style="margin:0;font-size:14px;line-height:1.8;color:#8296b0;white-space:pre-wrap;">${safeMessage}</p>
                </td>
              </tr>
            </table>

            <!-- Spacer -->
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr><td class="ec" bgcolor="#101827" height="24" style="background-color:#101827;font-size:0;line-height:0;" height="24"></td></tr>
            </table>

            <!-- Bouton -->
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

            <!-- Pied de page -->
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
