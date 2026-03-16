/**
 * ============================================================================
 * TYPES PORTFOLIO — types/index.ts
 * ============================================================================
 *
 * Définitions TypeScript des structures de données du portfolio public.
 * Ces types décrivent les données affichées aux visiteurs (côté front).
 *
 * Note : les types Firebase/Firestore (bilingues) sont dans types/firebase.ts.
 * Ces types-ci correspondent au format "aplati" utilisé dans les composants
 * React après la transformation depuis le format Firebase.
 *
 * Hiérarchie des données :
 *   PersonalInfo  → informations du développeur (Hero, About, Contact)
 *   Project       → un projet du portfolio (Projects section)
 *   SkillCategory → une catégorie de compétences (Skills section)
 *   SocialLink    → lien réseau social (Footer)
 *   AboutInfo     → paragraphes "À propos" + points forts
 * ============================================================================
 */

/**
 * Un projet du portfolio.
 * Affiché dans la section Projects sous forme de carte avec modal de détail.
 */
export interface Project {
  id: string;
  title: string;
  description: string;         // Description courte (aperçu dans la carte)
  longDescription: string;     // Description longue (modal de détail)
  stack: string[];             // Technologies utilisées (identiques FR/EN)
  features: string[];          // Fonctionnalités principales
  challenges: string[];        // Défis techniques résolus
  githubUrl: string;
  demoUrl?: string;            // URL démo optionnelle
  image: string;               // URL ou path de l'image de couverture
  featured: boolean;           // Mis en avant sur la page d'accueil
}

/**
 * Une compétence individuelle au sein d'une catégorie.
 */
export interface Skill {
  name: string;
  icon?: string;               // Nom de l'icône (optionnel, non utilisé actuellement)
}

/**
 * Une catégorie de compétences (ex : "Frontend", "Backend", "DevOps").
 * Affichée dans la section Skills.
 */
export interface SkillCategory {
  category: string;            // Label de la catégorie (localisé)
  skills: Skill[];
}

/**
 * Lien vers un réseau social.
 * Utilisé dans le Footer et la section Contact.
 */
export interface SocialLink {
  name: string;
  url: string;
  icon: string;                // SVG path ou identifiant d'icône
}

/**
 * Informations personnelles du développeur.
 * Utilisées dans Hero, Contact, Navbar (nom du profil), et les métadonnées SEO.
 */
export interface PersonalInfo {
  name: string;
  title: string;               // Titre professionnel (ex : "Développeur Full Stack")
  stack: string[];             // Stack principal (affiché dans le Hero)
  email: string;
  github: string;              // URL GitHub
  linkedin: string;            // URL LinkedIn
  cvUrl: string;               // URL de téléchargement du CV
  location?: string;           // Ville/pays (optionnel)
  openToWork?: boolean;        // Badge "Open to Work" dans le Hero
}

/**
 * Contenu de la section "À propos".
 * Paragraphs : texte long avec accordion "Lire la suite".
 * Highlights : points forts (badges colorés).
 */
export interface AboutInfo {
  paragraphs: string[];
  highlights: string[];
}
