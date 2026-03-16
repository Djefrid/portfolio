/**
 * ============================================================================
 * CONTEXTE PORTFOLIO — PortfolioContext.tsx
 * ============================================================================
 *
 * Ce fichier crée le contexte React qui fournit toutes les données du portfolio
 * (profil, à propos, projets, compétences) à l'ensemble de l'arbre de composants.
 *
 * Architecture :
 *   - PortfolioProvider : wrapper qui appelle usePortfolioData() et passe
 *     le résultat dans le contexte. À placer haut dans l'arbre (dans Providers.tsx).
 *   - usePortfolio()    : hook consommateur à utiliser dans n'importe quel
 *     composant enfant pour accéder aux données sans prop drilling.
 *
 * Pourquoi un contexte plutôt que des props ?
 *   Les données du portfolio sont nécessaires dans Hero, About, Projects,
 *   Skills, Contact et le Header. Passer ces données en props à travers
 *   plusieurs niveaux serait lourd. Le contexte centralise l'accès.
 *
 * Relation avec usePortfolioData :
 *   Ce contexte est un simple wrapper autour du hook usePortfolioData.
 *   C'est usePortfolioData qui gère toute la logique de chargement Firebase
 *   et de fallback statique. Ce fichier s'occupe uniquement de la distribution.
 * ============================================================================
 */

"use client";

import { createContext, useContext, ReactNode } from 'react';
import { usePortfolioData } from '@/hooks';
import type { Project, SkillCategory } from '@/types';

/**
 * Type du contexte : structure exacte des données exposées aux composants.
 * Correspond au retour de usePortfolioData() sans le champ `source`
 * (non pertinent pour les composants de présentation).
 */
interface PortfolioContextType {
  profile: {
    name: string;
    title: string;
    stack: string[];
    email: string;
    github: string;
    linkedin: string;
    cvUrl: string;
    location?: string;
    /** Si true, affiche le badge "Open to Work" sur le Hero */
    openToWork?: boolean;
  };
  about: {
    /** Paragraphes longs de la section À propos */
    paragraphs: string[];
    /** Points clés résumés (affichés sous forme de liste à cocher) */
    highlights: string[];
  };
  /** Liste des projets filtrés et convertis pour la langue courante */
  projects: Project[];
  /** Catégories de compétences pour la langue courante */
  skills: SkillCategory[];
  /** true pendant le chargement initial depuis Firebase */
  loading: boolean;
}

/**
 * Instance du contexte React.
 * Initialisé à `undefined` pour détecter les usages hors du Provider
 * (usePortfolio() lève une erreur explicite dans ce cas).
 */
const PortfolioContext = createContext<PortfolioContextType | undefined>(undefined);

/**
 * Provider du contexte Portfolio.
 * Charge les données via usePortfolioData() et les met à disposition
 * de tous les composants enfants.
 *
 * À utiliser dans l'arbre de composants (typiquement dans Providers.tsx) :
 *   <PortfolioProvider>
 *     <App />
 *   </PortfolioProvider>
 *
 * @param children - Composants enfants qui auront accès aux données
 */
export function PortfolioProvider({ children }: { children: ReactNode }) {
  // Appel unique du hook de chargement des données (Firebase ou statique)
  const data = usePortfolioData();

  return (
    <PortfolioContext.Provider value={data}>
      {children}
    </PortfolioContext.Provider>
  );
}

/**
 * Hook consommateur du contexte Portfolio.
 * À utiliser dans n'importe quel composant enfant de PortfolioProvider
 * pour accéder aux données du portfolio.
 *
 * Lance une erreur explicite si utilisé en dehors du Provider,
 * ce qui facilite le débogage.
 *
 * @returns PortfolioContextType — toutes les données du portfolio
 * @throws Error si utilisé hors de PortfolioProvider
 *
 * @example
 *   const { profile, loading } = usePortfolio();
 */
export function usePortfolio() {
  const context = useContext(PortfolioContext);
  if (context === undefined) {
    throw new Error('usePortfolio must be used within a PortfolioProvider');
  }
  return context;
}
