/**
 * ============================================================================
 * HOOK usePortfolioData — Chargement des données du portfolio
 * ============================================================================
 *
 * Ce hook est le point central pour récupérer toutes les données affichées
 * sur le site public (profil, à propos, projets, compétences).
 *
 * Logique de chargement (priorité) :
 *   1. Vérifie si Firebase est configuré (variables .env.local présentes)
 *   2. Si OUI → charge les données depuis Firebase Firestore en parallèle
 *   3. Si NON → utilise les données statiques de portfolio-data.ts (fallback)
 *
 * Ce hook gère également :
 *   - Le changement de langue (FR/EN) en temps réel sans rechargement
 *   - La conversion automatique des formats de données (legacy → nouveau)
 *   - La fusion intelligente des données Firebase avec les données statiques
 *
 * Utilisé exclusivement dans PortfolioContext.tsx qui le fournit
 * à tous les composants via le contexte React.
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

/**
 * Structure des données retournées par le hook usePortfolioData().
 * Tous les composants du site consomment cette structure via usePortfolio().
 */
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
  /** true pendant le chargement initial depuis Firebase */
  loading: boolean;
  /** 'firebase' si les données viennent de Firestore, 'static' sinon */
  source: 'firebase' | 'static';
}

/**
 * Extrait le texte pour la langue courante depuis une valeur bilingue ou legacy.
 *
 * Gère trois formats :
 *   - string (legacy, pré-bilingue) → retourné tel quel
 *   - { fr: "...", en: "..." } (nouveau format bilingue) → retourne la langue demandée
 *   - autre → retourne le fallback
 *
 * @param value  - La valeur à extraire (type inconnu car vient de Firestore)
 * @param lang   - La langue cible ('fr' ou 'en')
 * @param fallback - Valeur par défaut si rien ne correspond
 */
function getTextForLanguage(value: unknown, lang: 'fr' | 'en', fallback = ''): string {
  if (typeof value === 'string') {
    return value; // Format legacy : le texte est déjà une chaîne simple
  }
  if (typeof value === 'object' && value !== null && lang in value) {
    return (value as Record<string, string>)[lang] || fallback;
  }
  return fallback;
}

/**
 * Extrait un tableau de textes pour la langue courante depuis une valeur bilingue ou legacy.
 *
 * Gère trois formats :
 *   - string[] (legacy) → retourné tel quel
 *   - { fr: string, en: string }[] (nouveau format) → extrait la langue demandée
 *   - { fr: string[], en: string[] } (objet bilingue) → retourne le tableau de la langue
 *
 * @param value   - La valeur à extraire
 * @param lang    - La langue cible
 * @param fallback - Tableau par défaut si rien ne correspond
 */
function getArrayForLanguage(value: unknown, lang: 'fr' | 'en', fallback: string[] = []): string[] {
  if (Array.isArray(value)) {
    if (value.length === 0) return fallback;
    if (typeof value[0] === 'string') {
      return value as string[]; // Format legacy : tableau de chaînes simples
    }
    // Nouveau format : tableau d'objets { fr, en }
    return value.map((item: unknown) => getTextForLanguage(item, lang, ''));
  }
  if (typeof value === 'object' && value !== null && lang in value) {
    const arr = (value as Record<string, string[]>)[lang];
    return Array.isArray(arr) ? arr : fallback;
  }
  return fallback;
}

/**
 * Convertit le nouveau format de compétences (categories dynamiques avec ordre)
 * vers le format d'affichage SkillCategory[] utilisé par les composants du site.
 *
 * - Trie les catégories par leur champ `order`
 * - Filtre les catégories vides (sans compétences)
 * - Sélectionne le bon label (labelFr ou labelEn) selon la langue active
 *
 * @param skillsData - Données Firestore au nouveau format
 * @param language   - Langue courante pour les labels de catégories
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
 * Convertit l'ancien format de compétences (clés fixes : frontend, backend, etc.)
 * vers le format d'affichage SkillCategory[].
 *
 * Utilisé quand les données Firestore sont encore au format legacy (avant la migration
 * vers le format dynamique avec catégories libres).
 *
 * @param firebaseSkills - Données Firestore au format legacy
 * @param language       - Langue courante pour les labels de catégories
 */
function convertLegacySkillsToCategories(
  firebaseSkills: SkillsData,
  language: 'fr' | 'en'
): SkillCategory[] {
  // Labels de catégories traduits pour chaque langue
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

  // Ordre fixe des catégories legacy
  const keys: (keyof SkillsData)[] = [
    'frontend', 'backend', 'databases', 'devops',
    'networks', 'scripts', 'tools', 'collaboration'
  ];

  for (const key of keys) {
    const skills = firebaseSkills[key] || [];
    // N'affiche que les catégories qui ont au moins une compétence
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
 * Détecte automatiquement le format des données de compétences Firebase
 * et convertit vers SkillCategory[] dans tous les cas.
 *
 * Le format est détecté via isNewSkillsFormat() qui vérifie la présence
 * d'un tableau `categories` avec `labelFr`/`labelEn`.
 *
 * @param firebaseSkills - Données Firestore (format nouveau ou legacy)
 * @param language       - Langue courante
 */
function convertFirebaseSkillsToCategories(
  firebaseSkills: SkillsData | SkillsDataNew,
  language: 'fr' | 'en'
): SkillCategory[] {
  if (isNewSkillsFormat(firebaseSkills)) {
    return convertNewSkillsToCategories(firebaseSkills, language);
  }
  return convertLegacySkillsToCategories(firebaseSkills as SkillsData, language);
}

/**
 * Type flexible pour les données de profil venant de Firestore.
 * Les champs texte peuvent être en format legacy (string) ou bilingue ({ fr, en }).
 * Cela permet de gérer les deux formats sans erreur TypeScript.
 */
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

/**
 * Type flexible pour les données de projet venant de Firestore.
 * Même principe que FirebaseProfileRaw : supporte les deux formats.
 */
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
  /** Si published === false, le projet est masqué du site public */
  published?: boolean;
}

/**
 * Convertit un projet brut Firestore vers le type Project standardisé.
 * Applique getTextForLanguage/getArrayForLanguage sur tous les champs texte.
 *
 * @param firebaseProject - Données brutes du projet depuis Firestore
 * @param lang            - Langue courante pour extraire les bons textes
 */
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

/**
 * Hook principal du portfolio.
 *
 * Au premier rendu, tente de charger les données Firebase en parallèle.
 * Tant que le chargement est en cours, `loading` est true (les composants
 * affichent des skeletons pendant ce temps).
 *
 * Quand la langue change (useLanguage), les données sont re-calculées
 * immédiatement sans nouvel appel Firebase (les données brutes sont gardées
 * en state et re-converties à la volée).
 *
 * @returns PortfolioData — profil, about, projets, compétences, loading, source
 */
export function usePortfolioData(): PortfolioData {
  const { language } = useLanguage();

  // Données statiques selon la langue — servent de fallback immédiat
  const staticProfile = personalInfoBilingual[language];
  const staticAbout = aboutInfoBilingual[language];
  const staticProjects = projectsBilingual[language];
  const staticSkills = skillsBilingual[language];

  /**
   * Démarre à false pour afficher les données statiques immédiatement
   * (sans skeleton). Firebase charge en arrière-plan et met à jour l'UI.
   * Cela améliore le LCP : Projects/Skills affichent du contenu dès le rendu initial.
   */
  const [loading, setLoading] = useState(false);
  /** 'firebase' si les données ont été chargées depuis Firestore */
  const [source, setSource] = useState<'firebase' | 'static'>('static');

  // Données brutes Firebase — gardées en state pour pouvoir changer de langue
  // sans recharger depuis Firestore (conversion à la volée)
  const [firebaseProfile, setFirebaseProfile] = useState<FirebaseProfileRaw | null>(null);
  const [firebaseProjects, setFirebaseProjects] = useState<FirebaseProjectRaw[] | null>(null);
  const [firebaseSkills, setFirebaseSkills] = useState<SkillsData | SkillsDataNew | null>(null);

  // Chargement Firebase au montage du composant (une seule fois)
  useEffect(() => {
    const loadFirebaseData = async () => {
      // Si Firebase n'est pas configuré (pas de .env.local), on utilise les données statiques
      if (!isFirebaseConfigured) {
        console.log('Firebase not configured, using static data');
        setSource('static');
        setLoading(false);
        return;
      }

      try {
        // Charge profil, projets et compétences en parallèle (plus rapide que séquentiel)
        const [profileData, projectsData, skillsData] = await Promise.all([
          getProfile() as Promise<FirebaseProfileRaw | null>,
          getProjects() as Promise<FirebaseProjectRaw[] | null>,
          getSkills() as Promise<SkillsData | SkillsDataNew | null>,
        ]);

        // Vérifie si au moins une des collections contient des données
        const hasProfile = profileData !== null;
        const hasProjects = projectsData && projectsData.length > 0;
        const hasSkills = skillsData !== null;

        if (hasProfile || hasProjects || hasSkills) {
          // Stocke les données brutes pour re-conversion lors des changements de langue
          if (hasProfile) setFirebaseProfile(profileData);
          if (hasProjects) setFirebaseProjects(projectsData);
          if (hasSkills) setFirebaseSkills(skillsData);
          setSource('firebase');
          console.log('Using Firebase data');
        } else {
          // Firebase accessible mais collections vides → fallback statique
          console.log('No Firebase data found, using static data');
          setSource('static');
        }
      } catch (error) {
        // Firestore inaccessible (réseau, règles de sécurité, etc.) → fallback statique
        console.error('Firebase error, falling back to static data:', error);
        setSource('static');
      } finally {
        setLoading(false);
      }
    };

    loadFirebaseData();
  }, []); // Pas de dépendance : ne se relance pas quand la langue change

  /**
   * Vérifie si une valeur Firebase est au format bilingue { fr, en }.
   * Utilisé pour décider si on utilise les données Firebase ou statiques.
   */
  const isBilingual = (value: unknown): boolean => {
    return typeof value === 'object' && value !== null && 'fr' in value && 'en' in value;
  };

  // Vérifie si le profil Firebase contient des titres/about traduits
  const hasFirebaseBilingualProfile = firebaseProfile && isBilingual(firebaseProfile.title);
  const hasFirebaseBilingualAbout = firebaseProfile?.about?.paragraphs && isBilingual(firebaseProfile.about.paragraphs);

  /**
   * Construction du profil final :
   * - Les URLs (github, linkedin, cvUrl) et infos techniques viennent de Firebase si dispo
   * - Le titre utilise Firebase seulement s'il est au format bilingue
   * - Sinon, les données statiques bilingues (portfolio-data.ts) font foi
   */
  const profile = {
    name: firebaseProfile?.name || staticProfile.name,
    // Utilise le titre Firebase uniquement s'il est au format bilingue { fr, en }
    title: hasFirebaseBilingualProfile
      ? getTextForLanguage(firebaseProfile!.title, language, staticProfile.title)
      : staticProfile.title,
    stack: firebaseProfile?.stack || staticProfile.stack,
    email: firebaseProfile?.email || staticProfile.email,
    github: firebaseProfile?.github || staticProfile.github,
    linkedin: firebaseProfile?.linkedin || staticProfile.linkedin,
    cvUrl: firebaseProfile?.cvUrl || staticProfile.cvUrl,
    // ?? au lieu de || pour préserver `false` (openToWork peut être false intentionnellement)
    location: firebaseProfile?.location ?? staticProfile.location,
    openToWork: firebaseProfile?.openToWork ?? staticProfile.openToWork,
  };

  /**
   * Construction de la section "À propos" :
   * - Utilise Firebase seulement si les paragraphes sont au format bilingue
   * - Sinon fallback sur les données statiques (toujours à jour)
   */
  const about = hasFirebaseBilingualAbout
    ? {
        paragraphs: getArrayForLanguage(firebaseProfile!.about!.paragraphs, language, staticAbout.paragraphs),
        highlights: getArrayForLanguage(firebaseProfile!.about!.highlights, language, staticAbout.highlights),
      }
    : staticAbout;

  /**
   * Construction des projets :
   * Firebase est la source de vérité principale pour les projets.
   * Les projets avec `published: false` sont filtrés (masqués du site public).
   * Fallback sur les données statiques uniquement si Firebase n'est pas disponible.
   */
  const hasFirebaseProjects = source === 'firebase' && firebaseProjects && firebaseProjects.length > 0;
  const projects = hasFirebaseProjects
    ? firebaseProjects!
        .filter(p => p.published !== false) // Masque les projets non publiés
        .map(p => convertFirebaseProjectToProject(p, language))
    : staticProjects;

  /**
   * Construction des compétences :
   * Les noms de compétences (ex: "Docker", "React") sont identiques dans les deux langues.
   * Seuls les labels de catégories changent selon la langue.
   * convertFirebaseSkillsToCategories gère automatiquement les deux formats Firebase.
   */
  const skills = firebaseSkills && source === 'firebase'
    ? convertFirebaseSkillsToCategories(firebaseSkills, language)
    : staticSkills;

  return { profile, about, projects, skills, loading, source };
}
