export { auth, db, isFirebaseConfigured } from './config';
export { useAuth } from './hooks';
export { AuthProvider, useAuthContext } from './context';

// Firestore functions
export {
  getProfile,
  updateProfile,
  getProjects,
  addProject,
  updateProject,
  deleteProject,
  getSkills,
  getSkillsNew,
  updateSkills,
  updateSkillsNew,
  subscribeToProfile,
  subscribeToProjects,
  subscribeToSkills
} from './firestore';
