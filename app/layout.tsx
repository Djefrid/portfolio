/**
 * ============================================================================
 * LAYOUT RACINE — app/layout.tsx
 * ============================================================================
 *
 * Layout racine de l'application Next.js 14 (App Router).
 * Ce composant englobe TOUTES les pages du site.
 *
 * Responsabilités :
 *   1. Définit les métadonnées SEO globales (title, description, OG, Twitter)
 *   2. Injecte le balisage structuré JSON-LD Schema.org (référencement Google)
 *   3. Charge la police Inter depuis Google Fonts
 *   4. Fournit les Providers (thème, langue, portfolio) via le composant Providers
 *   5. Intègre Vercel Analytics pour le suivi des performances
 *
 * Important pour le SEO :
 *   - suppressHydrationWarning sur <html> est nécessaire pour next-themes
 *     (évite les warnings liés au changement de classe dark/light côté client)
 *   - metadataBase permet à Next.js de construire les URLs absolues pour OG/Twitter
 *   - Le JSON-LD est injecté via dangerouslySetInnerHTML (seul moyen valide en Next.js)
 *
 * Variables d'environnement utilisées :
 *   NEXT_PUBLIC_SITE_URL — URL de production (ex: https://portfolio.djefrid.ca)
 * ============================================================================
 */

import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/components/Providers";
import { Analytics } from "@vercel/analytics/next";
import { headers } from "next/headers";
import { Inter } from "next/font/google";

/**
 * Police Inter chargée via next/font/google.
 * Avantage vs <link> Google Fonts :
 *   - Téléchargée au BUILD (self-hosted sur Vercel)
 *   - Aucune requête externe bloquante au chargement de la page
 *   - Élimine le "render-blocking" qui coûtait ~1850ms de LCP sur mobile
 *   - display: 'swap' évite le FOIT (flash de texte invisible)
 *   - variable: '--font-inter' expose la police via CSS variable (utilisée par Tailwind font-sans)
 */
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

/** URL de base du site. Fallback vers l'URL de production si non définie. */
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://portfolio.djefrid.ca';

/**
 * Métadonnées SEO globales exportées pour Next.js.
 * Ces informations sont utilisées par :
 *   - Google pour l'indexation et les résultats de recherche
 *   - Les réseaux sociaux (LinkedIn, Facebook) pour les aperçus de liens
 *   - Twitter/X pour les Twitter Cards
 *   - Les navigateurs pour le titre de l'onglet
 */
export const metadata: Metadata = {
  // --- Titre de la page ---
  // `template` : ajoute automatiquement le suffixe sur les sous-pages
  // ex: page admin → "Dashboard | Djefrid Byli Portfolio"
  title: {
    default: "Djefrid Byli - Développeur Full-Stack | Support IT | Portfolio",
    template: "%s | Djefrid Byli Portfolio",
  },
  description: "Portfolio de Djefrid Byli, développeur full-stack et technicien support IT spécialisé en Django, Vue.js, React, Next.js, .NET et PostgreSQL. Découvrez mes projets et compétences en développement web et administration système.",
  // Mots-clés pour le référencement (impact modéré aujourd'hui mais utile pour clarté)
  keywords: [
    "Djefrid Byli", "développeur web", "full-stack", "support IT",
    "Django", "Vue.js", "React", "Next.js", ".NET", "ASP.NET Core",
    "TypeScript", "PostgreSQL", "Docker", "portfolio",
    "développeur Québec", "développeur Canada", "web developer",
    "technicien informatique", "DEC informatique",
  ],
  authors: [{ name: "Djefrid Byli", url: SITE_URL }],
  creator: "Djefrid Byli",
  publisher: "Djefrid Byli",

  // --- Favicon ---
  // SVG préféré au PNG car vectoriel (s'adapte à toutes les tailles)
  icons: {
    icon: "/favicon.svg",
  },

  // --- URL canonique et hreflang bilingue FR/EN ---
  // metadataBase est requis pour que Next.js génère les URLs absolues OG/Twitter
  metadataBase: new URL(SITE_URL),
  alternates: {
    canonical: '/',
    // hreflang indique aux moteurs de recherche les versions linguistiques disponibles
    languages: {
      'fr-CA': '/',
      'en-CA': '/',
    },
  },

  // --- Open Graph (aperçu lors du partage sur Facebook, LinkedIn, etc.) ---
  openGraph: {
    title: "Djefrid Byli - Développeur Full-Stack | Support IT",
    description: "Portfolio de Djefrid Byli : projets full-stack et support IT, compétences en Django, React, Next.js, .NET et plus encore.",
    type: "website",
    locale: "fr_CA",
    alternateLocale: "en_CA",
    url: SITE_URL,
    siteName: "Portfolio Djefrid Byli",
    // Image OG générée dynamiquement via /app/opengraph-image.tsx (Edge Runtime)
    images: [
      {
        url: `${SITE_URL}/og-image.png`,
        width: 1200,
        height: 630,
        alt: "Djefrid Byli — Développeur Full-Stack | Support IT",
      },
    ],
  },

  // --- Twitter Card (aperçu lors du partage sur Twitter/X) ---
  twitter: {
    card: "summary_large_image", // Grande image (1200×630) pour un meilleur impact visuel
    title: "Djefrid Byli - Développeur Full-Stack | Support IT",
    description: "Portfolio de Djefrid Byli : projets full-stack et support IT, compétences en Django, React, Next.js, .NET et plus encore.",
    images: [`${SITE_URL}/og-image.png`],
  },

  // --- Instructions pour les robots d'indexation ---
  // Complète le fichier /app/robots.ts qui génère robots.txt
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,    // Pas de limite sur les previews vidéo
      'max-image-preview': 'large', // Grandes images dans les résultats
      'max-snippet': -1,          // Pas de limite sur les snippets texte
    },
  },

  // --- Vérification Google Search Console ---
  // Décommenter et remplir après inscription sur Google Search Console :
  // verification: {
  //   google: 'VOTRE_CODE_DE_VERIFICATION_GOOGLE',
  // },
};

/**
 * Données structurées JSON-LD (Schema.org / Person).
 * Ces données aident Google à comprendre qui est le propriétaire du site
 * et peuvent générer des résultats enrichis (rich results) dans la recherche.
 *
 * Le type Person indique qu'il s'agit d'un portfolio individuel.
 * sameAs relie le profil aux réseaux sociaux pour l'entité connaissance Google.
 */
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: 'Djefrid Byli Fotue Kuate',
  url: SITE_URL,
  jobTitle: 'Développeur Full-Stack | Support IT',
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL,
  sameAs: [
    'https://github.com/Djefrid',
    'https://www.linkedin.com/in/djefrid-byli-fotue-kuate-a30633225/',
  ],
};

/**
 * Composant Layout racine.
 * Reçoit les pages enfants via la prop `children` (convention Next.js App Router).
 *
 * Notes techniques :
 *   - `lang="fr"` : langue par défaut pour l'accessibilité et le SEO
 *   - `suppressHydrationWarning` : nécessaire pour next-themes qui modifie
 *     la classe du <html> côté client (dark/light) → évite les warnings React
 *   - `scroll-smooth` : active le smooth scroll CSS pour les liens d'ancrage (#about, etc.)
 *   - `font-sans` : applique la police Inter chargée depuis Google Fonts
 *   - `antialiased` : améliore le rendu du texte sur tous les écrans
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Lit le nonce généré par middleware.ts pour l'appliquer au script JSON-LD.
  // Next.js 14 lit x-nonce automatiquement pour ses propres scripts d'hydratation inline.
  const nonce = headers().get('x-nonce') ?? undefined;

  return (
    <html lang="fr" className={`scroll-smooth ${inter.variable}`} suppressHydrationWarning>
      <head>
        {/* Balisage structuré JSON-LD pour Google — nonce requis par la CSP */}
        <script
          type="application/ld+json"
          nonce={nonce}
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {/* Note : plus de <link> Google Fonts ici — next/font/google
         *  télécharge et self-host Inter au build → zéro requête externe bloquante */}
      </head>
      <body className="font-sans antialiased">
        {/* Skip link — premier élément focusable de la page (WCAG 2.4.1 — niveau A).
         *  Invisible par défaut (sr-only), visible uniquement au focus clavier.
         *  Permet aux utilisateurs naviguant au clavier de sauter directement au
         *  contenu principal sans traverser la navbar et tous ses liens. */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:z-[9999] focus:top-4 focus:left-4 focus:px-4 focus:py-2 focus:bg-primary-600 focus:text-white focus:rounded-lg focus:shadow-lg focus:outline-none"
        >
          Aller au contenu principal
        </a>

        {/* Providers : wraps ThemeProvider, LanguageProvider, PortfolioProvider */}
        <Providers>
          {children}
        </Providers>
        {/* Vercel Analytics : suivi des performances et des pages vues */}
        <Analytics />
      </body>
    </html>
  );
}
