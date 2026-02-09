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
import type { SkillsData } from '@/types/firebase';

interface PortfolioData {
  profile: {
    name: string;
    title: string;
    stack: string[];
    email: string;
    github: string;
    linkedin: string;
    cvUrl: string;
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

// Helper to extract text for current language from bilingual data
function getTextForLanguage(value: unknown, lang: 'fr' | 'en', fallback = ''): string {
  if (typeof value === 'string') {
    return value; // Legacy format
  }
  if (typeof value === 'object' && value !== null && lang in value) {
    return (value as Record<string, string>)[lang] || fallback;
  }
  return fallback;
}

// Helper to extract array for current language from bilingual data
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

// Convert Firebase skills format to SkillCategory[] format
function convertFirebaseSkillsToCategories(
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

// Firebase data types (flexible to handle both legacy and new formats)
interface FirebaseProfileRaw {
  name?: string;
  title?: string | { fr: string; en: string };
  stack?: string[];
  email?: string;
  github?: string;
  linkedin?: string;
  cvUrl?: string;
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
  const [firebaseSkills, setFirebaseSkills] = useState<SkillsData | null>(null);

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
          getSkills(),
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
