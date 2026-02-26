"use client";

import { createContext, useContext, ReactNode } from 'react';
import { usePortfolioData } from '@/hooks';
import type { Project, SkillCategory } from '@/types';

interface PortfolioContextType {
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
  loading: boolean;
}

const PortfolioContext = createContext<PortfolioContextType | undefined>(undefined);

export function PortfolioProvider({ children }: { children: ReactNode }) {
  const data = usePortfolioData();

  return (
    <PortfolioContext.Provider value={data}>
      {children}
    </PortfolioContext.Provider>
  );
}

export function usePortfolio() {
  const context = useContext(PortfolioContext);
  if (context === undefined) {
    throw new Error('usePortfolio must be used within a PortfolioProvider');
  }
  return context;
}
