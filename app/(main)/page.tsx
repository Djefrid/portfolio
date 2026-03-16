/**
 * ============================================================================
 * PAGE D'ACCUEIL — app/(main)/page.tsx
 * ============================================================================
 *
 * Page principale du portfolio (route "/").
 * Fait partie du groupe de routes (main) qui partage un layout commun
 * avec Header et Footer (défini dans app/(main)/layout.tsx).
 *
 * Ce composant est volontairement minimal : il délègue tout le rendu
 * à PortfolioWrapper, qui gère le chargement des données et l'affichage
 * des sections (Hero, About, Projects, Skills, Contact).
 *
 * Ce pattern (page légère + wrapper client) permet :
 *   - À la page d'être un Server Component (meilleur SEO)
 *   - À PortfolioWrapper d'être un Client Component avec accès au contexte
 * ============================================================================
 */

import PortfolioWrapper from "@/components/PortfolioWrapper";

/**
 * Composant de la page d'accueil.
 * Délègue entièrement le rendu à PortfolioWrapper.
 */
export default function Home() {
  return <PortfolioWrapper />;
}
