"use client";

import { ReactNode } from 'react';
import { ThemeProvider } from 'next-themes';
import { PortfolioProvider } from '@/context/PortfolioContext';
import { LanguageProvider } from '@/context/LanguageContext';

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <LanguageProvider>
        <PortfolioProvider>
          {children}
        </PortfolioProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
