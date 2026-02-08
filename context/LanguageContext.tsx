"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'fr' | 'en';

interface Translations {
  [key: string]: string | Translations;
}

const translations: Record<Language, Translations> = {
  fr: {
    // Navigation
    nav: {
      home: 'Accueil',
      about: 'À propos',
      projects: 'Projets',
      skills: 'Compétences',
      contact: 'Contact',
    },
    // Hero
    hero: {
      downloadCV: 'Télécharger CV',
      scrollDown: 'Défiler vers la section À propos',
    },
    // About
    about: {
      title: 'À propos',
      subtitle: 'Mon parcours et mes motivations',
      highlights: 'Points clés',
    },
    // Projects
    projects: {
      title: 'Projets',
      subtitle: 'Découvrez mes réalisations techniques',
      stack: 'Stack technique',
      features: 'Fonctionnalités',
      challenges: 'Défis techniques',
      sourceCode: 'Code source',
      liveDemo: 'Démo live',
    },
    // Skills
    skills: {
      title: 'Compétences',
      subtitle: 'Technologies et outils que je maîtrise',
      frontend: 'Frontend',
      backend: 'Backend',
      databases: 'Bases de données',
      devops: 'DevOps / Environnement',
    },
    // Contact
    contact: {
      title: 'Contact',
      subtitle: 'Intéressé par mon profil ? Contactez-moi !',
      email: 'Email',
      github: 'Voir mes projets',
      linkedin: 'Mon profil professionnel',
    },
    // Footer
    footer: {
      rights: 'Tous droits réservés.',
    },
  },
  en: {
    // Navigation
    nav: {
      home: 'Home',
      about: 'About',
      projects: 'Projects',
      skills: 'Skills',
      contact: 'Contact',
    },
    // Hero
    hero: {
      downloadCV: 'Download CV',
      scrollDown: 'Scroll to About section',
    },
    // About
    about: {
      title: 'About',
      subtitle: 'My journey and motivations',
      highlights: 'Key points',
    },
    // Projects
    projects: {
      title: 'Projects',
      subtitle: 'Discover my technical achievements',
      stack: 'Tech stack',
      features: 'Features',
      challenges: 'Technical challenges',
      sourceCode: 'Source code',
      liveDemo: 'Live demo',
    },
    // Skills
    skills: {
      title: 'Skills',
      subtitle: 'Technologies and tools I master',
      frontend: 'Frontend',
      backend: 'Backend',
      databases: 'Databases',
      devops: 'DevOps / Environment',
    },
    // Contact
    contact: {
      title: 'Contact',
      subtitle: 'Interested in my profile? Contact me!',
      email: 'Email',
      github: 'View my projects',
      linkedin: 'My professional profile',
    },
    // Footer
    footer: {
      rights: 'All rights reserved.',
    },
  },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('fr');

  // Load language preference from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('portfolio-language') as Language;
    if (saved && (saved === 'fr' || saved === 'en')) {
      setLanguage(saved);
    } else {
      // Detect browser language
      const browserLang = navigator.language.slice(0, 2);
      if (browserLang === 'en') {
        setLanguage('en');
      }
    }
  }, []);

  // Save language preference
  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('portfolio-language', lang);
  };

  // Translation function
  const t = (key: string): string => {
    const keys = key.split('.');
    let value: string | Translations = translations[language];

    for (const k of keys) {
      if (typeof value === 'object' && value !== null && k in value) {
        value = value[k];
      } else {
        return key; // Return key if translation not found
      }
    }

    return typeof value === 'string' ? value : key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
