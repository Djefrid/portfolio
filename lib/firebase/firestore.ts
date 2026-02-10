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

// Helper to ensure db is available
function getDb(): Firestore {
  if (!db) {
    throw new Error('Firebase Firestore is not initialized');
  }
  return db;
}

// ===== PROFILE =====

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

// ===== PROJECTS =====

export async function getProjects(): Promise<ProjectData[]> {
  try {
    const q = query(collection(getDb(), 'projects'), orderBy('order', 'asc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as ProjectData));
  } catch (error) {
    console.error('Error getting projects:', error);
    return [];
  }
}

export async function addProject(data: Omit<ProjectData, 'id'>): Promise<string | null> {
  try {
    const docRef = await addDoc(collection(getDb(), 'projects'), data);
    return docRef.id;
  } catch (error) {
    console.error('Error adding project:', error);
    return null;
  }
}

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

// ===== SKILLS =====

// Default categories for migration from legacy format
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

// Convert legacy skills format to new format
function convertLegacyToNewFormat(legacy: SkillsData): SkillsDataNew {
  const keys = ['frontend', 'backend', 'databases', 'devops', 'networks', 'scripts', 'tools', 'collaboration'] as const;
  const categories: SkillCategoryData[] = [];

  keys.forEach((key, index) => {
    const skills = legacy[key] || [];
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

// Get skills (supports both legacy and new format)
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

// Get skills in new format (with categories)
export async function getSkillsNew(): Promise<SkillsDataNew | null> {
  try {
    const docRef = doc(getDb(), 'settings', 'skills');
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) return null;

    const data = docSnap.data();

    // Check if it's already in new format
    if (isNewSkillsFormat(data)) {
      return data;
    }

    // Convert legacy format to new format
    return convertLegacyToNewFormat(data as SkillsData);
  } catch (error) {
    console.error('Error getting skills:', error);
    return null;
  }
}

// Update skills (legacy format - for backward compatibility)
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

// Update skills (new format with categories)
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

// ===== REAL-TIME LISTENERS =====

export function subscribeToProfile(callback: (data: ProfileData | null) => void) {
  const docRef = doc(getDb(), 'settings', 'profile');
  return onSnapshot(docRef, (doc) => {
    callback(doc.exists() ? (doc.data() as ProfileData) : null);
  });
}

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

export function subscribeToSkills(callback: (data: SkillsData | null) => void) {
  const docRef = doc(getDb(), 'settings', 'skills');
  return onSnapshot(docRef, (doc) => {
    callback(doc.exists() ? (doc.data() as SkillsData) : null);
  });
}
