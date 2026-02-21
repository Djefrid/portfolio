/**
 * ============================================================================
 * FIRESTORE - Fonctions CRUD pour Firebase Firestore
 * ============================================================================
 *
 * Ce fichier contient toutes les fonctions pour lire et écrire les données
 * dans la base de données Firebase Firestore.
 *
 * Structure de la base de données Firestore :
 *
 *   settings/
 *     ├── profile    → Données du profil (nom, titre, stack, about, liens)
 *     └── skills     → Compétences par catégories (nouveau format dynamique)
 *
 *   projects/
 *     ├── {id1}      → Premier projet
 *     ├── {id2}      → Deuxième projet
 *     └── ...        → Autres projets
 *
 * Chaque section (Profile, Projects, Skills) a ses propres fonctions :
 *   - get*()    : Lecture des données
 *   - update*() : Mise à jour des données
 *   - add*()    : Ajout de nouveaux éléments (projets)
 *   - delete*() : Suppression d'éléments (projets)
 *
 * Il y a aussi des "listeners" temps réel (subscribe*) qui écoutent
 * les changements dans Firestore et mettent à jour l'interface en direct.
 * ============================================================================
 */

import {
  doc,
  getDoc,
  setDoc,
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  onSnapshot,
  Firestore
} from 'firebase/firestore';
import { db } from './config';
import type { ProfileData, ProjectData, SkillsData, SkillsDataNew, SkillCategoryData } from '@/types/firebase';
import { isNewSkillsFormat } from '@/types/firebase';

/**
 * Vérifie que Firestore est initialisé avant toute opération.
 * Lance une erreur si Firebase n'est pas configuré (variables .env manquantes).
 */
function getDb(): Firestore {
  if (!db) {
    throw new Error('Firebase Firestore is not initialized');
  }
  return db;
}

// =============================================================================
// PROFIL - Lecture et mise à jour du profil utilisateur
// Firestore : collection "settings", document "profile"
// =============================================================================

/**
 * Récupère les données du profil depuis Firestore.
 * @returns Les données du profil ou null si le document n'existe pas
 */
export async function getProfile(): Promise<ProfileData | null> {
  try {
    const docRef = doc(getDb(), 'settings', 'profile');
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? (docSnap.data() as ProfileData) : null;
  } catch (error) {
    console.error('Error getting profile:', error);
    return null;
  }
}

/**
 * Met à jour le profil dans Firestore (écrase le document entier).
 * Appelé depuis le panneau admin quand l'utilisateur clique "Enregistrer".
 *
 * @param data - Les données complètes du profil à sauvegarder
 * @returns true si la sauvegarde a réussi, false sinon
 */
export async function updateProfile(data: ProfileData): Promise<boolean> {
  try {
    const docRef = doc(getDb(), 'settings', 'profile');
    await setDoc(docRef, data);
    return true;
  } catch (error) {
    console.error('Error updating profile:', error);
    return false;
  }
}

// =============================================================================
// PROJETS - CRUD complet pour la collection "projects"
// Firestore : collection "projects", un document par projet
// =============================================================================

/**
 * Récupère tous les projets depuis Firestore, triés par ordre d'affichage.
 * @returns Un tableau de projets triés par le champ "order" (ascendant)
 */
export async function getProjects(): Promise<ProjectData[]> {
  try {
    // Requête Firestore : tous les projets triés par "order" croissant
    const q = query(collection(getDb(), 'projects'), orderBy('order', 'asc'));
    const querySnapshot = await getDocs(q);

    // Transforme chaque document Firestore en objet ProjectData
    // L'id Firestore est ajouté à l'objet pour pouvoir modifier/supprimer le projet
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as ProjectData));
  } catch (error) {
    console.error('Error getting projects:', error);
    return [];
  }
}

/**
 * Ajoute un nouveau projet dans Firestore.
 * L'id est généré automatiquement par Firestore.
 *
 * @param data - Les données du projet (sans l'id)
 * @returns L'id du nouveau document créé, ou null en cas d'erreur
 */
export async function addProject(data: Omit<ProjectData, 'id'>): Promise<string | null> {
  try {
    const docRef = await addDoc(collection(getDb(), 'projects'), data);
    return docRef.id;
  } catch (error) {
    console.error('Error adding project:', error);
    return null;
  }
}

/**
 * Met à jour un projet existant dans Firestore.
 *
 * @param id - L'identifiant Firestore du projet à modifier
 * @param data - Les champs à mettre à jour (mise à jour partielle possible)
 * @returns true si la mise à jour a réussi
 */
export async function updateProject(id: string, data: Partial<ProjectData>): Promise<boolean> {
  try {
    const docRef = doc(getDb(), 'projects', id);
    await updateDoc(docRef, data);
    return true;
  } catch (error) {
    console.error('Error updating project:', error);
    return false;
  }
}

/**
 * Supprime un projet de Firestore.
 *
 * @param id - L'identifiant Firestore du projet à supprimer
 * @returns true si la suppression a réussi
 */
export async function deleteProject(id: string): Promise<boolean> {
  try {
    const docRef = doc(getDb(), 'projects', id);
    await deleteDoc(docRef);
    return true;
  } catch (error) {
    console.error('Error deleting project:', error);
    return false;
  }
}

// =============================================================================
// COMPÉTENCES (SKILLS) - Lecture et mise à jour
// Firestore : collection "settings", document "skills"
//
// Deux formats coexistent :
//   - Legacy : { frontend: [...], backend: [...], ... } (clés fixes)
//   - Nouveau : { categories: [{ id, labelFr, labelEn, skills, order }] } (dynamique)
//
// La migration de l'ancien vers le nouveau format est automatique.
// =============================================================================

/**
 * Labels par défaut pour la migration de l'ancien format vers le nouveau.
 * Associe chaque clé legacy (ex: "frontend") à ses labels bilingues.
 */
const defaultCategoryLabels: Record<string, { labelFr: string; labelEn: string }> = {
  frontend: { labelFr: 'Frontend', labelEn: 'Frontend' },
  backend: { labelFr: 'Backend', labelEn: 'Backend' },
  databases: { labelFr: 'Bases de données', labelEn: 'Databases' },
  devops: { labelFr: 'DevOps / Systèmes', labelEn: 'DevOps / Systems' },
  networks: { labelFr: 'Réseaux / Serveurs', labelEn: 'Networks / Servers' },
  scripts: { labelFr: 'Scripts & Automatisation', labelEn: 'Scripts & Automation' },
  tools: { labelFr: 'Outils & Méthodologies', labelEn: 'Tools & Methodologies' },
  collaboration: { labelFr: 'Outils collaboratifs & CMS', labelEn: 'Collaboration Tools & CMS' },
};

/**
 * Convertit les données de compétences de l'ancien format (clés fixes)
 * vers le nouveau format (tableau de catégories dynamiques).
 *
 * Cette fonction est appelée automatiquement quand on détecte l'ancien format.
 *
 * Exemple de conversion :
 *   Ancien : { frontend: ["React", "Vue.js"], backend: ["Django"] }
 *   Nouveau : { categories: [
 *     { id: "frontend", labelFr: "Frontend", labelEn: "Frontend", skills: ["React", "Vue.js"], order: 0 },
 *     { id: "backend", labelFr: "Backend", labelEn: "Backend", skills: ["Django"], order: 1 }
 *   ]}
 */
function convertLegacyToNewFormat(legacy: SkillsData): SkillsDataNew {
  const keys = ['frontend', 'backend', 'databases', 'devops', 'networks', 'scripts', 'tools', 'collaboration'] as const;
  const categories: SkillCategoryData[] = [];

  keys.forEach((key, index) => {
    const skills = legacy[key] || [];
    // On ignore les catégories vides
    if (skills.length > 0) {
      const labels = defaultCategoryLabels[key];
      categories.push({
        id: key,
        labelFr: labels.labelFr,
        labelEn: labels.labelEn,
        skills,
        order: index,
      });
    }
  });

  return { categories };
}

/**
 * Récupère les compétences au format brut (legacy ou nouveau).
 * Utilisé par usePortfolioData pour l'affichage sur le site public.
 */
export async function getSkills(): Promise<SkillsData | null> {
  try {
    const docRef = doc(getDb(), 'settings', 'skills');
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? (docSnap.data() as SkillsData) : null;
  } catch (error) {
    console.error('Error getting skills:', error);
    return null;
  }
}

/**
 * Récupère les compétences au nouveau format (avec catégories dynamiques).
 * Si les données sont encore en ancien format, elles sont converties automatiquement.
 * Utilisé par le SkillsEditor dans le panneau admin.
 *
 * @returns Les compétences au format SkillsDataNew, ou null si pas de données
 */
export async function getSkillsNew(): Promise<SkillsDataNew | null> {
  try {
    const docRef = doc(getDb(), 'settings', 'skills');
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) return null;

    const data = docSnap.data();

    // Si c'est déjà le nouveau format, on le retourne directement
    if (isNewSkillsFormat(data)) {
      return data;
    }

    // Sinon, on convertit l'ancien format vers le nouveau
    return convertLegacyToNewFormat(data as SkillsData);
  } catch (error) {
    console.error('Error getting skills:', error);
    return null;
  }
}

/**
 * Sauvegarde les compétences en ancien format (rétrocompatibilité).
 */
export async function updateSkills(data: SkillsData): Promise<boolean> {
  try {
    const docRef = doc(getDb(), 'settings', 'skills');
    await setDoc(docRef, data);
    return true;
  } catch (error) {
    console.error('Error updating skills:', error);
    return false;
  }
}

/**
 * Sauvegarde les compétences au nouveau format (catégories dynamiques).
 * Appelé par le SkillsEditor quand l'admin clique "Sauvegarder tout".
 */
export async function updateSkillsNew(data: SkillsDataNew): Promise<boolean> {
  try {
    const docRef = doc(getDb(), 'settings', 'skills');
    await setDoc(docRef, data);
    return true;
  } catch (error) {
    console.error('Error updating skills:', error);
    return false;
  }
}

// =============================================================================
// LISTENERS TEMPS RÉEL - Écoutent les changements Firestore en direct
//
// Ces fonctions utilisent onSnapshot() de Firestore pour recevoir
// automatiquement les mises à jour quand les données changent.
// Utile pour synchroniser l'interface sans recharger la page.
//
// Chaque fonction retourne une fonction "unsubscribe" à appeler
// pour arrêter d'écouter (dans le cleanup de useEffect par exemple).
// =============================================================================

/** Écoute les changements du profil en temps réel. */
export function subscribeToProfile(callback: (data: ProfileData | null) => void) {
  const docRef = doc(getDb(), 'settings', 'profile');
  return onSnapshot(docRef, (doc) => {
    callback(doc.exists() ? (doc.data() as ProfileData) : null);
  });
}

/** Écoute les changements des projets en temps réel (triés par ordre). */
export function subscribeToProjects(callback: (data: ProjectData[]) => void) {
  const q = query(collection(getDb(), 'projects'), orderBy('order', 'asc'));
  return onSnapshot(q, (querySnapshot) => {
    const projects = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as ProjectData));
    callback(projects);
  });
}

/** Écoute les changements des compétences en temps réel. */
export function subscribeToSkills(callback: (data: SkillsData | null) => void) {
  const docRef = doc(getDb(), 'settings', 'skills');
  return onSnapshot(docRef, (doc) => {
    callback(doc.exists() ? (doc.data() as SkillsData) : null);
  });
}
