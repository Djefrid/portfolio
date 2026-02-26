/**
 * ============================================================================
 * HOOK usePortfolioData - Chargement des données du portfolio
 * ============================================================================
 *
 * Ce hook est le point central pour récupérer les données affichées sur le site.
 *
 * Logique de chargement (priorité) :
 *   1. Vérifie si Firebase est configuré (variables .env.local)
 *   2. Si OUI → charge les données depuis Firebase Firestore
 *   3. Si NON → utilise les données statiques de portfolio-data.ts (fallback)
 *
 * Ce hook gère aussi :
 * - Le changement de langue (FR/EN) en temps réel
 * - La conversion des formats de données (legacy → nouveau)
 * - La fusion des données Firebase avec les données statiques
 *
 * Utilisé dans les composants du site public (page d'accueil, sections, etc.)
 * ============================================================================
 */

"use client";

import { useState, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import {
  personalInfoBilingual,
  aboutInfoBilingual,
  projectsBilingual,
  skillsBilingual
} from '@/data/portfolio-data';
import { getProfile, getProjects, getSkills, isFirebaseConfigured } from '@/lib/firebase';
import type { Project, SkillCategory } from '@/types';
import type { SkillsData, SkillsDataNew } from '@/types/firebase';
import { isNewSkillsFormat } from '@/types/firebase';

/** Structure des données retournées par le hook usePortfolioData() */
interface PortfolioData {
  profile: {
    name: string;
    title: string;
    stack: string[];
    email: string;
    github: string;
    linkedin: string;
    cvUrl: string;
    location?: string;
    openToWork?: boolean;
  };
  about: {
    paragraphs: string[];
    highlights: string[];
  };
  projects: Project[];
  skills: SkillCategory[];
  loading: boolean;
  source: 'firebase' | 'static';
}

/**
 * Extrait le texte pour la langue courante depuis une valeur bilingue ou legacy.
 * Gère : string (legacy), { fr, en } (bilingue), ou retourne le fallback.
 */
function getTextForLanguage(value: unknown, lang: 'fr' | 'en', fallback = ''): string {
  if (typeof value === 'string') {
    return value; // Legacy format
  }
  if (typeof value === 'object' && value !== null && lang in value) {
    return (value as Record<string, string>)[lang] || fallback;
  }
  return fallback;
}

/**
 * Extrait un tableau pour la langue courante depuis une valeur bilingue ou legacy.
 * Gère : string[] (legacy), BilingualText[] (nouveau), { fr: [], en: [] } (bilingue).
 */
function getArrayForLanguage(value: unknown, lang: 'fr' | 'en', fallback: string[] = []): string[] {
  if (Array.isArray(value)) {
    // Could be legacy format (string[]) or new format (BilingualText[])
    if (value.length === 0) return fallback;
    if (typeof value[0] === 'string') {
      return value as string[]; // Legacy format
    }
    // New format: array of {fr, en}
    return value.map((item: unknown) => getTextForLanguage(item, lang, ''));
  }
  if (typeof value === 'object' && value !== null && lang in value) {
    const arr = (value as Record<string, string[]>)[lang];
    return Array.isArray(arr) ? arr : fallback;
  }
  return fallback;
}

/**
 * Convertit le nouveau format de compétences (catégories dynamiques) vers
 * le format d'affichage SkillCategory[] utilisé par les composants du site.
 * Trie par ordre, filtre les catégories vides, et sélectionne le bon label selon la langue.
 */
function convertNewSkillsToCategories(
  skillsData: SkillsDataNew,
  language: 'fr' | 'en'
): SkillCategory[] {
  return skillsData.categories
    .sort((a, b) => a.order - b.order)
    .filter(cat => cat.skills.length > 0)
    .map(cat => ({
      category: language === 'fr' ? cat.labelFr : cat.labelEn,
      skills: cat.skills.map(name => ({ name })),
    }));
}

/**
 * Convertit l'ancien format de compétences (clés fixes) vers le format d'affichage.
 * Utilisé quand les données Firestore sont encore au format legacy.
 */
function convertLegacySkillsToCategories(
  firebaseSkills: SkillsData,
  language: 'fr' | 'en'
): SkillCategory[] {
  const categoryLabels = {
    fr: {
      frontend: 'Frontend',
      backend: 'Backend',
      databases: 'Bases de données',
      devops: 'DevOps / Systèmes',
      networks: 'Réseaux / Serveurs',
      scripts: 'Scripts & Automatisation',
      tools: 'Outils & Méthodologies',
      collaboration: 'Outils collaboratifs & CMS',
    },
    en: {
      frontend: 'Frontend',
      backend: 'Backend',
      databases: 'Databases',
      devops: 'DevOps / Systems',
      networks: 'Networks / Servers',
      scripts: 'Scripts & Automation',
      tools: 'Tools & Methodologies',
      collaboration: 'Collaboration Tools & CMS',
    },
  };

  const labels = categoryLabels[language];
  const categories: SkillCategory[] = [];

  const keys: (keyof SkillsData)[] = [
    'frontend', 'backend', 'databases', 'devops',
    'networks', 'scripts', 'tools', 'collaboration'
  ];

  for (const key of keys) {
    const skills = firebaseSkills[key] || [];
    if (skills.length > 0) {
      categories.push({
        category: labels[key],
        skills: skills.map(name => ({ name })),
      });
    }
  }

  return categories;
}

/**
 * Convertit les compétences Firebase (peu importe le format) vers SkillCategory[].
 * Détecte automatiquement si c'est le nouveau ou l'ancien format.
 */
function convertFirebaseSkillsToCategories(
  firebaseSkills: SkillsData | SkillsDataNew,
  language: 'fr' | 'en'
): SkillCategory[] {
  // Check if it's the new format with categories array
  if (isNewSkillsFormat(firebaseSkills)) {
    return convertNewSkillsToCategories(firebaseSkills, language);
  }
  // Legacy format
  return convertLegacySkillsToCategories(firebaseSkills as SkillsData, language);
}

// Firebase data types (flexible to handle both legacy and new formats)
interface FirebaseProfileRaw {
  name?: string;
  title?: string | { fr: string; en: string };
  stack?: string[];
  email?: string;
  github?: string;
  linkedin?: string;
  cvUrl?: string;
  location?: string;
  openToWork?: boolean;
  about?: {
    paragraphs?: string[] | { fr: string[]; en: string[] };
    highlights?: string[] | { fr: string[]; en: string[] };
  };
}

interface FirebaseProjectRaw {
  id?: string;
  title?: string | { fr: string; en: string };
  description?: string | { fr: string; en: string };
  longDescription?: string | { fr: string; en: string };
  stack?: string[];
  features?: string[] | { fr: string[]; en: string[] };
  challenges?: string[] | { fr: string[]; en: string[] };
  githubUrl?: string;
  demoUrl?: string;
  image?: string;
  featured?: boolean;
  order?: number;
  published?: boolean;
}

// Convert Firebase project to Project format
function convertFirebaseProjectToProject(firebaseProject: FirebaseProjectRaw, lang: 'fr' | 'en'): Project {
  return {
    id: firebaseProject.id || '',
    title: getTextForLanguage(firebaseProject.title, lang, ''),
    description: getTextForLanguage(firebaseProject.description, lang, ''),
    longDescription: getTextForLanguage(firebaseProject.longDescription, lang, ''),
    stack: firebaseProject.stack || [],
    features: getArrayForLanguage(firebaseProject.features, lang, []),
    challenges: getArrayForLanguage(firebaseProject.challenges, lang, []),
    githubUrl: firebaseProject.githubUrl || '',
    demoUrl: firebaseProject.demoUrl,
    image: firebaseProject.image || '',
    featured: firebaseProject.featured || false,
  };
}

export function usePortfolioData(): PortfolioData {
  const { language } = useLanguage();

  // Get bilingual static data based on current language (fallback)
  const staticProfile = personalInfoBilingual[language];
  const staticAbout = aboutInfoBilingual[language];
  const staticProjects = projectsBilingual[language];
  const staticSkills = skillsBilingual[language];

  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState<'firebase' | 'static'>('static');

  // State for Firebase data (raw format)
  const [firebaseProfile, setFirebaseProfile] = useState<FirebaseProfileRaw | null>(null);
  const [firebaseProjects, setFirebaseProjects] = useState<FirebaseProjectRaw[] | null>(null);
  const [firebaseSkills, setFirebaseSkills] = useState<SkillsData | SkillsDataNew | null>(null);

  useEffect(() => {
    const loadFirebaseData = async () => {
      // If Firebase is not configured, use static data immediately
      if (!isFirebaseConfigured) {
        console.log('Firebase not configured, using static data');
        setSource('static');
        setLoading(false);
        return;
      }

      try {
        // Try to load all data from Firebase in parallel
        const [profileData, projectsData, skillsData] = await Promise.all([
          getProfile() as Promise<FirebaseProfileRaw | null>,
          getProjects() as Promise<FirebaseProjectRaw[] | null>,
          getSkills() as Promise<SkillsData | SkillsDataNew | null>,
        ]);

        // Check if we got valid data from Firebase
        const hasProfile = profileData !== null;
        const hasProjects = projectsData && projectsData.length > 0;
        const hasSkills = skillsData !== null;

        if (hasProfile || hasProjects || hasSkills) {
          if (hasProfile) setFirebaseProfile(profileData);
          if (hasProjects) setFirebaseProjects(projectsData);
          if (hasSkills) setFirebaseSkills(skillsData);
          setSource('firebase');
          console.log('Using Firebase data');
        } else {
          console.log('No Firebase data found, using static data');
          setSource('static');
        }
      } catch (error) {
        console.error('Firebase error, falling back to static data:', error);
        setSource('static');
      } finally {
        setLoading(false);
      }
    };

    loadFirebaseData();
  }, []);

  // Helper to check if Firebase data is in bilingual format
  const isBilingual = (value: unknown): boolean => {
    return typeof value === 'object' && value !== null && 'fr' in value && 'en' in value;
  };

  // Check if Firebase profile has bilingual content
  const hasFirebaseBilingualProfile = firebaseProfile && isBilingual(firebaseProfile.title);
  const hasFirebaseBilingualAbout = firebaseProfile?.about?.paragraphs && isBilingual(firebaseProfile.about.paragraphs);

  // For profile: use static bilingual data for text content, Firebase for technical data (URLs, stack)
  const profile = {
    name: firebaseProfile?.name || staticProfile.name,
    // Always use static bilingual title (portfolio-data.ts has proper translations)
    title: hasFirebaseBilingualProfile
      ? getTextForLanguage(firebaseProfile!.title, language, staticProfile.title)
      : staticProfile.title,
    // Stack and URLs from Firebase if available
    stack: firebaseProfile?.stack || staticProfile.stack,
    email: firebaseProfile?.email || staticProfile.email,
    github: firebaseProfile?.github || staticProfile.github,
    linkedin: firebaseProfile?.linkedin || staticProfile.linkedin,
    cvUrl: firebaseProfile?.cvUrl || staticProfile.cvUrl,
    location: firebaseProfile?.location ?? staticProfile.location,
    openToWork: firebaseProfile?.openToWork ?? staticProfile.openToWork,
  };

  // For about: use static bilingual data unless Firebase has bilingual format
  const about = hasFirebaseBilingualAbout
    ? {
        paragraphs: getArrayForLanguage(firebaseProfile!.about!.paragraphs, language, staticAbout.paragraphs),
        highlights: getArrayForLanguage(firebaseProfile!.about!.highlights, language, staticAbout.highlights),
      }
    : staticAbout;

  // For projects: always use Firebase data when available (Firebase is the source of truth)
  // Static data (portfolio-data.ts) is only used as fallback when Firebase is not configured or has no data
  const hasFirebaseProjects = source === 'firebase' && firebaseProjects && firebaseProjects.length > 0;

  const projects = hasFirebaseProjects
    ? firebaseProjects!
        .filter(p => p.published !== false)
        .map(p => convertFirebaseProjectToProject(p, language))
    : staticProjects;

  // For skills: Firebase format is already language-agnostic (just skill names)
  // Use Firebase skills if available, category labels come from language setting
  const skills = firebaseSkills && source === 'firebase'
    ? convertFirebaseSkillsToCategories(firebaseSkills, language)
    : staticSkills;

  return { profile, about, projects, skills, loading, source };
}
