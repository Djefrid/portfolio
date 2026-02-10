// Types pour Firestore

// Bilingual text fields
export interface BilingualText {
  fr: string;
  en: string;
}

export interface BilingualArray {
  fr: string[];
  en: string[];
}

// Profile with bilingual support
export interface ProfileData {
  name: string; // Name is the same in both languages
  title: BilingualText;
  stack: string[]; // Technical stack is the same in both languages
  email: string;
  github: string;
  linkedin: string;
  cvUrl: string;
  about: {
    paragraphs: BilingualArray;
    highlights: BilingualArray;
  };
}

// Legacy profile format (for backward compatibility)
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

// Project with bilingual support
export interface ProjectData {
  id?: string;
  title: BilingualText;
  description: BilingualText;
  longDescription: BilingualText;
  stack: string[]; // Technical stack is the same in both languages
  features: BilingualArray;
  challenges: BilingualArray;
  githubUrl: string;
  demoUrl?: string;
  image: string;
  featured: boolean;
  order: number;
  published: boolean;
}

// Legacy project format (for backward compatibility)
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

// Dynamic skill category
export interface SkillCategoryData {
  id: string;           // Unique identifier (slug)
  labelFr: string;      // French label
  labelEn: string;      // English label
  skills: string[];     // List of skills
  order: number;        // For sorting
}

// New flexible skills structure with dynamic categories
export interface SkillsDataNew {
  categories: SkillCategoryData[];
}

// Legacy skills with fixed category keys (for backward compatibility)
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

// Helper to check if skills data is in new format
export function isNewSkillsFormat(data: unknown): data is SkillsDataNew {
  return typeof data === 'object' && data !== null && 'categories' in data && Array.isArray((data as SkillsDataNew).categories);
}

export interface PortfolioData {
  profile: ProfileData;
  projects: ProjectData[];
  skills: SkillsData;
}

// Helper to check if data is in new bilingual format
export function isBilingualText(value: unknown): value is BilingualText {
  return typeof value === 'object' && value !== null && 'fr' in value && 'en' in value;
}

export function isBilingualArray(value: unknown): value is BilingualArray {
  return typeof value === 'object' && value !== null &&
    'fr' in value && 'en' in value &&
    Array.isArray((value as BilingualArray).fr) &&
    Array.isArray((value as BilingualArray).en);
}
