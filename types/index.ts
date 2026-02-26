// Types pour le portfolio

export interface Project {
  id: string;
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
}

export interface Skill {
  name: string;
  icon?: string;
}

export interface SkillCategory {
  category: string;
  skills: Skill[];
}

export interface SocialLink {
  name: string;
  url: string;
  icon: string;
}

export interface PersonalInfo {
  name: string;
  title: string;
  stack: string[];
  email: string;
  github: string;
  linkedin: string;
  cvUrl: string;
  location?: string;
  openToWork?: boolean;
}

export interface AboutInfo {
  paragraphs: string[];
  highlights: string[];
}
