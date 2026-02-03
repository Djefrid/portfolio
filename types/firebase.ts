// Types pour Firestore

export interface ProfileData {
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

export interface ProjectData {
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

export interface SkillsData {
  frontend: string[];
  backend: string[];
  databases: string[];
  devops: string[];
}

export interface PortfolioData {
  profile: ProfileData;
  projects: ProjectData[];
  skills: SkillsData;
}
