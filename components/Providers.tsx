"use client";

import { ReactNode } from 'react';
import { PortfolioProvider } from '@/context/PortfolioContext';
import { LanguageProvider } from '@/context/LanguageContext';

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <LanguageProvider>
      <PortfolioProvider>
        {children}
      </PortfolioProvider>
    </LanguageProvider>
  );
}
