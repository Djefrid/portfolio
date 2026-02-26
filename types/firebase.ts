/**
 * ============================================================================
 * TYPES FIREBASE - Définitions TypeScript pour Firestore
 * ============================================================================
 *
 * Ce fichier contient toutes les interfaces TypeScript utilisées pour
 * structurer les données échangées avec Firebase Firestore.
 *
 * Le portfolio supporte deux langues (FR/EN), donc la plupart des
 * données textuelles utilisent un format bilingue { fr: "...", en: "..." }.
 *
 * Il existe aussi des formats "legacy" (ancien format) pour assurer
 * la rétrocompatibilité avec les données existantes dans Firestore.
 * ============================================================================
 */

// ---------------------------------------------------------------------------
// TYPES DE BASE BILINGUES
// ---------------------------------------------------------------------------

/**
 * Texte bilingue - Utilisé pour tous les champs texte qui doivent
 * être traduits en français et en anglais.
 * Exemple : { fr: "Développeur Web", en: "Web Developer" }
 */
export interface BilingualText {
  fr: string;
  en: string;
}

/**
 * Tableau bilingue - Utilisé pour les listes de textes traduits.
 * Chaque langue a son propre tableau de chaînes.
 * Exemple : { fr: ["Point 1", "Point 2"], en: ["Item 1", "Item 2"] }
 */
export interface BilingualArray {
  fr: string[];
  en: string[];
}

// ---------------------------------------------------------------------------
// PROFIL UTILISATEUR
// ---------------------------------------------------------------------------

/**
 * Données du profil au format bilingue (format actuel).
 * Stocké dans Firestore : collection "settings", document "profile"
 *
 * - name : Le nom complet (identique dans les deux langues)
 * - title : Le titre professionnel (traduit automatiquement via /api/translate)
 * - stack : Les technologies maîtrisées (identiques dans les deux langues)
 * - email, github, linkedin, cvUrl : Liens de contact (identiques)
 * - about : Section "À propos" avec paragraphes et points clés bilingues
 */
export interface ProfileData {
  name: string;
  title: BilingualText;
  stack: string[];
  email: string;
  github: string;
  linkedin: string;
  cvUrl: string;
  location?: string;
  openToWork?: boolean;
  about: {
    paragraphs: BilingualArray;
    highlights: BilingualArray;
  };
}

/**
 * Ancien format du profil (avant l'ajout du bilingue).
 * Conservé pour la rétrocompatibilité lors de la migration des données.
 */
export interface ProfileDataLegacy {
  name: string;
  title: string;
  stack: string[];
  email: string;
  github: string;
  linkedin: string;
  cvUrl: string;
  about: {
    paragraphs: string[];
    highlights: string[];
  };
}

// ---------------------------------------------------------------------------
// PROJETS
// ---------------------------------------------------------------------------

/**
 * Données d'un projet au format bilingue (format actuel).
 * Stocké dans Firestore : collection "projects", un document par projet
 *
 * - id : Identifiant Firestore du document (généré automatiquement)
 * - title, description, longDescription : Textes bilingues traduits automatiquement
 * - stack : Technologies utilisées (identiques dans les deux langues)
 * - features : Liste des fonctionnalités (bilingue)
 * - challenges : Liste des défis techniques (bilingue)
 * - githubUrl, demoUrl : Liens vers le code source et la démo
 * - featured : Si le projet est mis en avant
 * - order : Position d'affichage (0 = premier)
 * - published : Si le projet est visible sur le site public (true par défaut)
 */
export interface ProjectData {
  id?: string;
  title: BilingualText;
  description: BilingualText;
  longDescription: BilingualText;
  stack: string[];
  features: BilingualArray;
  challenges: BilingualArray;
  githubUrl: string;
  demoUrl?: string;
  image: string;
  featured: boolean;
  order: number;
  published: boolean;
}

/**
 * Ancien format de projet (avant l'ajout du bilingue).
 * Conservé pour la rétrocompatibilité lors de la migration des données.
 */
export interface ProjectDataLegacy {
  id?: string;
  title: string;
  description: string;
  longDescription: string;
  stack: string[];
  features: string[];
  challenges: string[];
  githubUrl: string;
  demoUrl?: string;
  image: string;
  featured: boolean;
  order: number;
  published: boolean;
}

// ---------------------------------------------------------------------------
// COMPÉTENCES (SKILLS)
// ---------------------------------------------------------------------------

/**
 * Une catégorie de compétences dynamique (nouveau format).
 * Permet à l'admin de créer/modifier/supprimer des catégories librement.
 *
 * - id : Identifiant unique généré à partir du label FR (ex: "cloud-hebergement")
 * - labelFr : Nom en français (ex: "Cloud & Hébergement")
 * - labelEn : Nom en anglais (ex: "Cloud & Hosting")
 * - skills : Liste des compétences (ex: ["AWS", "Azure"])
 * - order : Position d'affichage (0 = première catégorie)
 */
export interface SkillCategoryData {
  id: string;
  labelFr: string;
  labelEn: string;
  skills: string[];
  order: number;
}

/**
 * Nouveau format flexible des compétences avec catégories dynamiques.
 * Stocké dans Firestore : collection "settings", document "skills"
 *
 * Structure : { categories: [ { id, labelFr, labelEn, skills, order }, ... ] }
 */
export interface SkillsDataNew {
  categories: SkillCategoryData[];
}

/**
 * Ancien format des compétences avec catégories fixes (legacy).
 * Ne permettait pas d'ajouter de nouvelles catégories.
 * Conservé pour la migration automatique vers le nouveau format.
 */
export interface SkillsData {
  frontend: string[];
  backend: string[];
  databases: string[];
  devops: string[];
  networks: string[];
  scripts: string[];
  tools: string[];
  collaboration: string[];
}

/**
 * Type guard : vérifie si les données sont au nouveau format (avec categories).
 * Permet à TypeScript de distinguer SkillsData de SkillsDataNew automatiquement.
 *
 * @param data - Données brutes de Firestore
 * @returns true si les données contiennent un tableau "categories"
 */
export function isNewSkillsFormat(data: unknown): data is SkillsDataNew {
  return typeof data === 'object' && data !== null && 'categories' in data && Array.isArray((data as SkillsDataNew).categories);
}

// ---------------------------------------------------------------------------
// TYPE GLOBAL DU PORTFOLIO
// ---------------------------------------------------------------------------

/** Structure complète des données du portfolio dans Firestore. */
export interface PortfolioData {
  profile: ProfileData;
  projects: ProjectData[];
  skills: SkillsData;
}

// ---------------------------------------------------------------------------
// FONCTIONS UTILITAIRES DE VÉRIFICATION DE FORMAT
// ---------------------------------------------------------------------------

/** Vérifie si une valeur est un texte bilingue { fr: "...", en: "..." }. */
export function isBilingualText(value: unknown): value is BilingualText {
  return typeof value === 'object' && value !== null && 'fr' in value && 'en' in value;
}

/** Vérifie si une valeur est un tableau bilingue { fr: [...], en: [...] }. */
export function isBilingualArray(value: unknown): value is BilingualArray {
  return typeof value === 'object' && value !== null &&
    'fr' in value && 'en' in value &&
    Array.isArray((value as BilingualArray).fr) &&
    Array.isArray((value as BilingualArray).en);
}
