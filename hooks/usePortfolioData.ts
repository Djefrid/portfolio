"use client";

import { useState, useEffect } from 'react';
import { isFirebaseConfigured } from '@/lib/firebase/config';
import { personalInfo, aboutInfo, projects as staticProjects, skills as staticSkills } from '@/data/portfolio-data';
import type { ProfileData, ProjectData, SkillsData } from '@/types/firebase';
import type { Project, SkillCategory } from '@/types';

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
}

// Transform Firebase data to frontend format
function transformProjects(firebaseProjects: ProjectData[]): Project[] {
  return firebaseProjects
    .filter(p => p.published)
    .map(p => ({
      id: p.id || '',
      title: p.title,
      description: p.description,
      longDescription: p.longDescription,
      stack: p.stack,
      features: p.features,
      challenges: p.challenges,
      githubUrl: p.githubUrl,
      demoUrl: p.demoUrl,
      image: p.image,
      featured: p.featured,
    }));
}

function transformSkills(firebaseSkills: SkillsData): SkillCategory[] {
  return [
    { category: 'Frontend', skills: firebaseSkills.frontend.map(name => ({ name })) },
    { category: 'Backend', skills: firebaseSkills.backend.map(name => ({ name })) },
    { category: 'Bases de données', skills: firebaseSkills.databases.map(name => ({ name })) },
    { category: 'DevOps / Environnement', skills: firebaseSkills.devops.map(name => ({ name })) },
  ];
}

export function usePortfolioData(): PortfolioData {
  const [profile, setProfile] = useState({
    name: personalInfo.name,
    title: personalInfo.title,
    stack: personalInfo.stack,
    email: personalInfo.email,
    github: personalInfo.github,
    linkedin: personalInfo.linkedin,
    cvUrl: personalInfo.cvUrl,
  });
  const [about, setAbout] = useState(aboutInfo);
  const [projects, setProjects] = useState<Project[]>(staticProjects);
  const [skills, setSkills] = useState<SkillCategory[]>(staticSkills);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // If Firebase is not configured, use static data
    if (!isFirebaseConfigured) {
      setLoading(false);
      return;
    }

    // Dynamic import to avoid errors when Firebase is not configured
    import('@/lib/firebase/firestore').then(({ subscribeToProfile, subscribeToProjects, subscribeToSkills }) => {
      let unsubscribeProfile: (() => void) | undefined;
      let unsubscribeProjects: (() => void) | undefined;
      let unsubscribeSkills: (() => void) | undefined;

      try {
        // Subscribe to profile changes
        unsubscribeProfile = subscribeToProfile((data: ProfileData | null) => {
          if (data) {
            setProfile({
              name: data.name,
              title: data.title,
              stack: data.stack,
              email: data.email,
              github: data.github,
              linkedin: data.linkedin,
              cvUrl: data.cvUrl,
            });
            setAbout(data.about);
          }
          setLoading(false);
        });

        // Subscribe to projects changes
        unsubscribeProjects = subscribeToProjects((data: ProjectData[]) => {
          if (data.length > 0) {
            setProjects(transformProjects(data));
          }
        });

        // Subscribe to skills changes
        unsubscribeSkills = subscribeToSkills((data: SkillsData | null) => {
          if (data) {
            setSkills(transformSkills(data));
          }
        });
      } catch (error) {
        console.error('Error subscribing to Firebase:', error);
        setLoading(false);
      }

      // Cleanup function
      return () => {
        unsubscribeProfile?.();
        unsubscribeProjects?.();
        unsubscribeSkills?.();
      };
    }).catch((error) => {
      console.error('Error loading Firebase:', error);
      setLoading(false);
    });
  }, []);

  return { profile, about, projects, skills, loading };
}
