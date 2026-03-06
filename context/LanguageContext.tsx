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
      openToWork: 'Disponible pour travailler',
      availableForWork: 'Ouvert aux opportunités',
    },
    // About
    about: {
      title: 'À propos',
      subtitle: 'Mon parcours et ce qui me motive',
      highlights: 'Points clés',
      readMore: 'Lire la suite',
      readLess: 'Réduire',
    },
    // Projects
    projects: {
      title: 'Projets',
      subtitle: 'Une sélection de projets concrets avec des technologies modernes',
      stack: 'Stack technique',
      features: 'Fonctionnalités',
      challenges: 'Défis techniques',
      sourceCode: 'Code source',
      liveDemo: 'Démo live',
      viewMore: 'Voir plus',
      close: 'Fermer',
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
      subtitle: 'Opportunité de travail ou idée de projet ? Je suis disponible — discutons-en !',
      email: 'Email',
      github: 'Voir mes projets',
      linkedin: 'Mon profil professionnel',
      form: {
        title: 'Laissez-moi un message',
        name: 'Votre nom',
        email: 'Votre email',
        message: 'Votre message',
        send: 'Envoyer le message',
        sending: 'Envoi...',
        namePlaceholder: 'Jean Dupont',
        emailPlaceholder: 'jean@exemple.com',
        messagePlaceholder: 'Bonjour, je souhaite vous contacter...',
        success: '✓ Message envoyé ! Je vous répondrai bientôt.',
        error: '✗ Erreur lors de l\'envoi. Essayez par email directement.',
      },
    },
    // Footer
    footer: {
      rights: 'Tous droits réservés.',
      legal: 'Mentions légales',
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
      openToWork: 'Open to Work',
      availableForWork: 'Available for opportunities',
    },
    // About
    about: {
      title: 'About',
      subtitle: 'My background & what drives me',
      highlights: 'Key points',
      readMore: 'Read more',
      readLess: 'Show less',
    },
    // Projects
    projects: {
      title: 'Projects',
      subtitle: 'A selection of projects built with modern web technologies',
      stack: 'Tech stack',
      features: 'Features',
      challenges: 'Technical challenges',
      sourceCode: 'Source code',
      liveDemo: 'Live demo',
      viewMore: 'View more',
      close: 'Close',
    },
    // Skills
    skills: {
      title: 'Skills',
      subtitle: 'Technologies and tools I work with',
      frontend: 'Frontend',
      backend: 'Backend',
      databases: 'Databases',
      devops: 'DevOps / Environment',
    },
    // Contact
    contact: {
      title: 'Contact',
      subtitle: 'Open to work & new projects — let\'s discuss it!',
      email: 'Email',
      github: 'View my projects',
      linkedin: 'My professional profile',
      form: {
        title: 'Leave me a message',
        name: 'Your name',
        email: 'Your email',
        message: 'Your message',
        send: 'Send message',
        sending: 'Sending...',
        namePlaceholder: 'John Doe',
        emailPlaceholder: 'john@example.com',
        messagePlaceholder: 'Hello, I would like to contact you...',
        success: '✓ Message sent! I will get back to you soon.',
        error: '✗ Failed to send. Please contact me directly by email.',
      },
    },
    // Footer
    footer: {
      rights: 'All rights reserved.',
      legal: 'Legal Notice',
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
