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
      subject: `✉️ Nouveau message de ${safeName} — Portfolio`,
      html: `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin:0;padding:0;background-color:#0f172a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0f172a;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#1e1b4b 0%,#312e81 100%);border-radius:16px 16px 0 0;padding:32px 40px;text-align:center;">
              <p style="margin:0 0 8px 0;font-size:12px;font-weight:600;letter-spacing:2px;text-transform:uppercase;color:#a5b4fc;">Portfolio</p>
              <h1 style="margin:0;font-size:24px;font-weight:700;color:#ffffff;">Nouveau message reçu</h1>
              <p style="margin:8px 0 0 0;font-size:14px;color:#c7d2fe;">${now}</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="background-color:#1e293b;padding:32px 40px;">

              <!-- Sender info -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
                <tr>
                  <td style="background-color:#0f172a;border-radius:12px;padding:20px 24px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding:4px 0;">
                          <span style="font-size:12px;font-weight:600;letter-spacing:1px;text-transform:uppercase;color:#64748b;">De</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:4px 0;">
                          <span style="font-size:18px;font-weight:700;color:#f1f5f9;">${safeName}</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:4px 0;">
                          <a href="mailto:${safeEmail}" style="font-size:14px;color:#818cf8;text-decoration:none;">${safeEmail}</a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Message -->
              <p style="margin:0 0 8px 0;font-size:12px;font-weight:600;letter-spacing:1px;text-transform:uppercase;color:#64748b;">Message</p>
              <div style="background-color:#0f172a;border-left:3px solid #6366f1;border-radius:0 12px 12px 0;padding:20px 24px;margin-bottom:32px;">
                <p style="margin:0;font-size:15px;line-height:1.7;color:#cbd5e1;white-space:pre-line;">${safeMessage}</p>
              </div>

              <!-- CTA -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="mailto:${safeEmail}?subject=Re: Message depuis ton portfolio"
                       style="display:inline-block;background:linear-gradient(135deg,#6366f1,#4f46e5);color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;padding:14px 32px;border-radius:8px;">
                      ↩ Répondre à ${safeName}
                    </a>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#0f172a;border-radius:0 0 16px 16px;padding:20px 40px;text-align:center;border-top:1px solid #1e293b;">
              <p style="margin:0 0 4px 0;font-size:12px;color:#475569;">
                Ce message a été envoyé depuis le formulaire de contact de
              </p>
              <a href="${siteUrl}" style="font-size:12px;color:#6366f1;text-decoration:none;">${siteUrl}</a>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
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
