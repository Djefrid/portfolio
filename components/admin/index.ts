/**
 * ============================================================================
 * BARREL EXPORT — components/admin/index.ts
 * ============================================================================
 *
 * Fichier d'export centralisé pour les composants du panneau d'administration.
 * Permet d'importer depuis '@/components/admin' au lieu du chemin complet.
 *
 * Exemple :
 *   import { AdminHeader, ProfileEditor } from '@/components/admin';
 *   // au lieu de :
 *   import AdminHeader from '@/components/admin/AdminHeader';
 *   import ProfileEditor from '@/components/admin/ProfileEditor';
 * ============================================================================
 */

export { default as AdminHeader }    from './AdminHeader';
export { default as ProfileEditor }  from './ProfileEditor';
export { default as ProjectsEditor } from './ProjectsEditor';
export { default as SkillsEditor }   from './SkillsEditor';
