/**
 * ============================================================================
 * CONTEXTE DE LANGUE — LanguageContext.tsx
 * ============================================================================
 *
 * Ce fichier gère le système de traduction (i18n) du portfolio.
 * Il fournit :
 *   1. La langue active ('fr' | 'en') et une fonction pour la changer
 *   2. La fonction t(key) pour accéder aux traductions de l'interface
 *      (labels de navigation, boutons, messages, etc.)
 *
 * Note importante : ce contexte gère les TRADUCTIONS DE L'INTERFACE uniquement.
 * Le contenu du portfolio (textes du profil, descriptions de projets, etc.)
 * est géré séparément dans usePortfolioData via portfolio-data.ts et Firebase.
 *
 * Persistance de la langue :
 *   - Au chargement, la langue est lue depuis localStorage
 *   - Si absent, la langue du navigateur est détectée automatiquement
 *   - Par défaut : français
 *
 * Structure des clés de traduction (notation pointée) :
 *   "nav.home"           → translations.fr.nav.home
 *   "contact.form.send"  → translations.fr.contact.form.send
 * ============================================================================
 */

"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

/** Les deux langues supportées par le portfolio */
type Language = 'fr' | 'en';

/**
 * Type récursif pour la structure des traductions.
 * Permet d'imbriquer les clés à plusieurs niveaux (ex: nav.home, contact.form.send).
 */
interface Translations {
  [key: string]: string | Translations;
}

/**
 * Dictionnaire complet de toutes les traductions de l'interface.
 * Organisé par section (nav, hero, about, projects, skills, contact, footer).
 *
 * À étendre ici si un nouveau texte d'interface doit être traduit.
 * Ne pas mettre ici le contenu du portfolio (profil, projets, etc.) —
 * ces données sont dans portfolio-data.ts.
 */
const translations: Record<Language, Translations> = {
  fr: {
    // Navigation principale
    nav: {
      home: 'Accueil',
      about: 'À propos',
      projects: 'Projets',
      skills: 'Compétences',
      contact: 'Contact',
    },
    // Section Hero (bannière principale)
    hero: {
      downloadCV: 'Télécharger CV',
      scrollDown: 'Défiler vers la section À propos',
      openToWork: 'Disponible pour travailler',
      availableForWork: 'Ouvert aux opportunités',
    },
    // Section À propos
    about: {
      title: 'À propos',
      subtitle: 'Mon parcours et ce qui me motive',
      highlights: 'Points clés',
      readMore: 'Lire la suite',
      readLess: 'Réduire',
    },
    // Section Projets
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
    // Section Compétences
    skills: {
      title: 'Compétences',
      subtitle: 'Technologies et outils que je maîtrise',
      frontend: 'Frontend',
      backend: 'Backend',
      databases: 'Bases de données',
      devops: 'DevOps / Environnement',
    },
    // Section Contact
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
    // Pied de page
    footer: {
      rights: 'Tous droits réservés.',
      legal: 'Mentions légales',
    },
  },
  en: {
    // Main navigation
    nav: {
      home: 'Home',
      about: 'About',
      projects: 'Projects',
      skills: 'Skills',
      contact: 'Contact',
    },
    // Hero section
    hero: {
      downloadCV: 'Download CV',
      scrollDown: 'Scroll to About section',
      openToWork: 'Open to Work',
      availableForWork: 'Available for opportunities',
    },
    // About section
    about: {
      title: 'About',
      subtitle: 'My background & what drives me',
      highlights: 'Key points',
      readMore: 'Read more',
      readLess: 'Show less',
    },
    // Projects section
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
    // Skills section
    skills: {
      title: 'Skills',
      subtitle: 'Technologies and tools I work with',
      frontend: 'Frontend',
      backend: 'Backend',
      databases: 'Databases',
      devops: 'DevOps / Environment',
    },
    // Contact section
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

/**
 * Type du contexte de langue exposé aux composants.
 */
interface LanguageContextType {
  /** Langue active ('fr' ou 'en') */
  language: Language;
  /** Fonction pour changer la langue (persiste en localStorage) */
  setLanguage: (lang: Language) => void;
  /**
   * Fonction de traduction.
   * @param key - Clé pointée (ex: 'nav.home', 'contact.form.send')
   * @returns La traduction ou la clé si introuvable
   */
  t: (key: string) => string;
}

/**
 * Instance du contexte React.
 * undefined par défaut pour détecter les usages hors Provider.
 */
const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

/**
 * Provider du contexte de langue.
 * Gère la détection automatique et la persistance de la langue préférée.
 *
 * @param children - Composants enfants ayant accès aux traductions
 */
export function LanguageProvider({ children }: { children: ReactNode }) {
  // Langue par défaut : français (peut changer après détection du navigateur)
  const [language, setLanguage] = useState<Language>('fr');

  /**
   * Au montage, lit la préférence sauvegardée ou détecte la langue du navigateur.
   * Ce useEffect s'exécute côté client uniquement (pas de localStorage en SSR).
   */
  useEffect(() => {
    const saved = localStorage.getItem('portfolio-language') as Language;
    if (saved && (saved === 'fr' || saved === 'en')) {
      // Préférence explicite de l'utilisateur
      setLanguage(saved);
    } else {
      // Pas de préférence sauvegardée → détecte la langue du navigateur
      const browserLang = navigator.language.slice(0, 2);
      if (browserLang === 'en') {
        setLanguage('en');
      }
      // Si browserLang n'est ni 'en' ni 'fr', on reste en français par défaut
    }
  }, []);

  /**
   * Change la langue active et sauvegarde la préférence en localStorage.
   * La sauvegarde permet de retrouver la même langue à la prochaine visite.
   *
   * @param lang - La nouvelle langue ('fr' ou 'en')
   */
  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('portfolio-language', lang);
  };

  /**
   * Fonction de traduction : récupère le texte correspondant à une clé pointée.
   *
   * Parcourt l'objet de traductions niveau par niveau en suivant les points.
   * Ex: t('contact.form.send') → translations['fr']['contact']['form']['send']
   *
   * Si une clé est introuvable (traduction manquante), retourne la clé elle-même.
   * Cela évite les erreurs silencieuses et facilite le débogage.
   *
   * @param key - Clé pointée de la traduction
   * @returns Le texte traduit ou la clé si introuvable
   */
  const t = (key: string): string => {
    const keys = key.split('.');
    let value: string | Translations = translations[language];

    for (const k of keys) {
      if (typeof value === 'object' && value !== null && k in value) {
        value = value[k];
      } else {
        return key; // Clé introuvable → retourne la clé comme fallback visible
      }
    }

    // Si la valeur finale est un objet (clé partielle), retourne la clé
    return typeof value === 'string' ? value : key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

/**
 * Hook consommateur du contexte de langue.
 * À utiliser dans tout composant nécessitant des traductions ou le changement de langue.
 *
 * @returns { language, setLanguage, t }
 * @throws Error si utilisé hors de LanguageProvider
 *
 * @example
 *   const { t, language, setLanguage } = useLanguage();
 *   <h2>{t('about.title')}</h2>
 */
export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
