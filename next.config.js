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
          { key: "X-Frame-Options", value: "DENY" },
          // Force HTTPS pendant 2 ans (MITM / downgrade attacks)
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          // Contrôle les infos envoyées dans le header Referer
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          // Désactive les API matérielles non utilisées
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
          },
          // Empêche les fuites via DNS prefetch
          { key: "X-DNS-Prefetch-Control", value: "on" },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
