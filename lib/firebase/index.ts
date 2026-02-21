/**
 * ============================================================================
 * FIREBASE - Point d'entrée principal (barrel export)
 * ============================================================================
 *
 * Ce fichier centralise tous les exports Firebase pour simplifier les imports
 * dans le reste du projet. Au lieu d'importer depuis chaque fichier individuel,
 * on importe tout depuis '@/lib/firebase'.
 *
 * Exemple :
 *   import { getProfile, updateProfile, useAuthContext } from '@/lib/firebase';
 * ============================================================================
 */

// --- Configuration et instances Firebase ---
export { auth, db, isFirebaseConfigured } from './config';

// --- Hook et contexte d'authentification ---
export { useAuth } from './hooks';
export { AuthProvider, useAuthContext } from './context';

// --- Fonctions Firestore (CRUD pour chaque section) ---
export {
  // Profil
  getProfile,
  updateProfile,
  // Projets
  getProjects,
  addProject,
  updateProject,
  deleteProject,
  // Compétences
  getSkills,
  getSkillsNew,
  updateSkills,
  updateSkillsNew,
  // Listeners temps réel
  subscribeToProfile,
  subscribeToProjects,
  subscribeToSkills
} from './firestore';
