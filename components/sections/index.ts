/**
 * ============================================================================
 * BARREL EXPORT — components/sections/index.ts
 * ============================================================================
 *
 * Fichier d'export centralisé pour les sections du portfolio.
 * Permet d'importer toutes les sections depuis '@/components/sections'
 * en une seule ligne.
 *
 * Exemple :
 *   import { Hero, About, Projects, Skills, Contact } from '@/components/sections';
 *
 * Utilisé principalement dans PortfolioWrapper.tsx.
 * ============================================================================
 */

export { default as Hero }     from './Hero';
export { default as About }    from './About';
export { default as Projects } from './Projects';
export { default as Skills }   from './Skills';
export { default as Contact }  from './Contact';
