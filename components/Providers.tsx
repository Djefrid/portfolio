/**
 * ============================================================================
 * PROVIDERS GLOBAUX — components/Providers.tsx
 * ============================================================================
 *
 * Composant Client qui enveloppe toute l'application avec les fournisseurs
 * de contexte globaux nécessaires au bon fonctionnement du portfolio.
 *
 * Utilisé dans app/layout.tsx (layout racine) pour que les contextes soient
 * disponibles dans toutes les pages (portfolio ET admin).
 *
 * Ordre des providers (de l'extérieur vers l'intérieur) :
 *   ThemeProvider       — gestion du thème clair/sombre (next-themes)
 *     LanguageProvider  — contexte i18n FR/EN (préférence persistée en localStorage)
 *       PortfolioProvider — données du portfolio (Firebase → fallback statique)
 *         {children}    — contenu de l'application
 *
 * Pourquoi ThemeProvider en premier ?
 *   next-themes utilise un attribut HTML sur <html> (attribute="class").
 *   Il doit envelopper tout le reste pour éviter les flashs de thème (FOUC).
 *
 * Configuration ThemeProvider :
 *   - attribute="class"     → ajoute la classe "dark" sur <html>
 *   - defaultTheme="dark"   → thème sombre par défaut
 *   - enableSystem={false}  → ignore la préférence système de l'OS
 *     (le portfolio est conçu pour le mode sombre uniquement)
 * ============================================================================
 */

"use client";

import { ReactNode, useEffect } from 'react';
import { ThemeProvider } from 'next-themes';
import { PortfolioProvider } from '@/context/PortfolioContext';
import { LanguageProvider } from '@/context/LanguageContext';
import { initAppCheck } from '@/lib/firebase/app-check';

/**
 * Enveloppe l'application avec tous les providers globaux.
 *
 * @param children - Le contenu de l'application (pages, layouts)
 */
export default function Providers({ children }: { children: ReactNode }) {
  // Initialise Firebase App Check au montage (côté client uniquement)
  useEffect(() => { initAppCheck(); }, []);

  return (
    // ThemeProvider : gestion du mode sombre/clair via next-themes
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      {/* LanguageProvider : contexte i18n avec traductions FR/EN */}
      <LanguageProvider>
        {/* PortfolioProvider : données du portfolio chargées depuis Firebase */}
        <PortfolioProvider>
          {children}
        </PortfolioProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
