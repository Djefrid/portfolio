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

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          // Empêche le MIME-sniffing (XSS via fichiers mal typés)
          { key: "X-Content-Type-Options", value: "nosniff" },

          // Bloque l'intégration dans des iframes (clickjacking)
          // Complété par frame-ancestors 'none' dans la CSP de middleware.ts
          { key: "X-Frame-Options", value: "DENY" },

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
