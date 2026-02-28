import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/components/Providers";
import { Analytics } from "@vercel/analytics/next";

/** URL du site utilisée pour les métadonnées SEO et les liens canoniques */
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://portfolio.djefrid.ca';

/**
 * Métadonnées SEO globales du site.
 * Ces informations sont utilisées par Google, les réseaux sociaux
 * et les navigateurs pour afficher les bonnes informations.
 */
export const metadata: Metadata = {
  // --- Métadonnées de base ---
  title: {
    default: "Djefrid Byli - Développeur Web Full-Stack Junior | Portfolio",
    template: "%s | Djefrid Byli Portfolio",
  },
  description: "Portfolio de Djefrid Byli, développeur web full-stack junior spécialisé en Django, Vue.js, React, Next.js, .NET et PostgreSQL. Découvrez mes projets et compétences en développement web et administration système.",
  keywords: [
    "Djefrid Byli", "développeur web", "full-stack", "junior",
    "Django", "Vue.js", "React", "Next.js", ".NET", "ASP.NET Core",
    "TypeScript", "PostgreSQL", "Docker", "portfolio",
    "développeur Montréal", "développeur Canada", "web developer",
    "technicien informatique", "DEC informatique",
  ],
  authors: [{ name: "Djefrid Byli", url: SITE_URL }],
  creator: "Djefrid Byli",
  publisher: "Djefrid Byli",

  // --- Favicon et icônes ---
  icons: {
    icon: "/favicon.svg",
  },

  // --- URL canonique (évite le contenu dupliqué pour Google) ---
  metadataBase: new URL(SITE_URL),
  alternates: {
    canonical: '/',
  },

  // --- Open Graph (Facebook, LinkedIn, etc.) ---
  openGraph: {
    title: "Djefrid Byli - Développeur Web Full-Stack Junior",
    description: "Portfolio de Djefrid Byli : projets web full-stack, compétences en Django, React, Next.js, .NET et plus encore.",
    type: "website",
    locale: "fr_CA",
    alternateLocale: "en_CA",
    url: SITE_URL,
    siteName: "Portfolio Djefrid Byli",
  },

  // --- Twitter Card ---
  twitter: {
    card: "summary_large_image",
    title: "Djefrid Byli - Développeur Web Full-Stack Junior",
    description: "Portfolio de Djefrid Byli : projets web full-stack, compétences en Django, React, Next.js, .NET et plus encore.",
  },

  // --- Robots (complète le fichier robots.txt) ---
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },

  // --- Vérification Google Search Console ---
  // À remplir après inscription sur Google Search Console :
  // verification: {
  //   google: 'VOTRE_CODE_DE_VERIFICATION_GOOGLE',
  // },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="scroll-smooth" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans antialiased">
        <Providers>
          {children}
        </Providers>
        <Analytics />
      </body>
    </html>
  );
}
