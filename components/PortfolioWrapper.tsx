/**
 * ============================================================================
 * PORTFOLIO WRAPPER — components/PortfolioWrapper.tsx
 * ============================================================================
 *
 * Composant Client qui assemble toutes les sections du portfolio en une seule
 * page et les enveloppe dans le PortfolioProvider.
 *
 * Pourquoi ce composant existe-t-il ?
 *   La page principale (app/(main)/page.tsx) est un Server Component.
 *   Le PortfolioProvider utilise des hooks React (useState, useEffect, Firebase)
 *   qui nécessitent un Client Component. Pour garder la page racine côté serveur
 *   (meilleur SEO, temps de chargement initial), ce wrapper isole la partie client.
 *
 * Architecture Server/Client :
 *   page.tsx (Server) → PortfolioWrapper (Client) → PortfolioProvider → sections
 *
 * Sections rendues (dans l'ordre d'affichage vertical) :
 *   1. Hero     — nom, titre, stack, boutons CTA
 *   2. About    — biographie et points clés
 *   3. Projects — carrousel de projets
 *   4. Skills   — carrousel de compétences par catégorie
 *   5. Contact  — formulaire de contact + liens
 * ============================================================================
 */

"use client";

import { PortfolioProvider } from '@/context/PortfolioContext';
import { Hero, About, Projects, Skills, Contact } from '@/components/sections';

/**
 * Assemblage de toutes les sections du portfolio dans un Provider.
 * Le PortfolioProvider charge les données (Firebase → fallback statique)
 * et les rend disponibles à toutes les sections via usePortfolio().
 */
export default function PortfolioWrapper() {
  return (
    <PortfolioProvider>
      <Hero />
      <About />
      <Projects />
      <Skills />
      <Contact />
    </PortfolioProvider>
  );
}
