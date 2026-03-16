/**
 * ============================================================================
 * BARREL EXPORT — hooks/index.ts
 * ============================================================================
 *
 * Fichier d'export centralisé pour les hooks React personnalisés du projet.
 * Permet d'importer depuis '@/hooks' au lieu du chemin complet.
 *
 * Exemple :
 *   import { usePortfolioData } from '@/hooks';
 *   // au lieu de :
 *   import { usePortfolioData } from '@/hooks/usePortfolioData';
 *
 * Note : useAdminNotes n'est pas exporté ici car il est importé directement
 * dans NotesEditor.tsx par son chemin complet.
 * ============================================================================
 */

export { usePortfolioData } from './usePortfolioData';
