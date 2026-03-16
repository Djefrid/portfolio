/**
 * ============================================================================
 * TOGGLE THÈME — components/ui/ThemeToggle.tsx
 * ============================================================================
 *
 * Bouton de bascule entre le thème clair et le thème sombre.
 * Affiché dans la navbar (Header.tsx) à droite du toggle de langue.
 *
 * Fonctionnement :
 *   - Utilise next-themes (useTheme) pour lire et changer le thème actif
 *   - L'icône bascule entre Moon (mode sombre) et Sun (mode clair)
 *   - Framer Motion anime la transition entre les deux icônes (rotation + fade)
 *
 * Protection anti-hydratation (SSR) :
 *   Le hook useTheme() retourne undefined côté serveur car le thème est stocké
 *   en localStorage (côté client uniquement). Si le composant se rendait
 *   immédiatement côté serveur, il y aurait un mismatch entre le HTML serveur
 *   et le HTML client (hydration mismatch → erreur React).
 *   Solution : `mounted` est false jusqu'au premier useEffect (côté client).
 *   Avant le montage, on retourne un <div> vide aux mêmes dimensions pour
 *   éviter le layout shift (CLS — Cumulative Layout Shift).
 *
 * Animation (Framer Motion AnimatePresence) :
 *   - mode="wait" : attend la fin de l'animation de sortie avant d'entrer
 *   - initial={false} : pas d'animation au premier rendu
 *   - Les icônes entrent/sortent avec une rotation de ±90° et un fade
 * ============================================================================
 */

"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Moon, Sun } from "lucide-react";

/**
 * Bouton de bascule thème clair/sombre avec animation fluide.
 */
export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  /**
   * Protection contre l'hydratation SSR.
   * false côté serveur et pendant le rendu initial côté client.
   * Passe à true après le premier useEffect (uniquement côté client).
   */
  const [mounted, setMounted] = useState(false);

  /** Marque le composant comme monté (côté client uniquement) */
  useEffect(() => setMounted(true), []);

  // Avant le montage → div vide aux mêmes dimensions pour éviter le layout shift
  if (!mounted) return <div className="w-9 h-9" />;

  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "Passer en mode clair" : "Passer en mode sombre"}
      className={`relative w-9 h-9 flex items-center justify-center rounded-full border transition-colors overflow-hidden ${
        isDark
          ? "border-dark-600 bg-dark-800 hover:bg-dark-700"
          : "border-gray-300 bg-gray-100 hover:bg-gray-200"
      }`}
    >
      {/* AnimatePresence avec mode="wait" : l'icône sortante se termine
          avant que l'icône entrante commence son animation */}
      <AnimatePresence mode="wait" initial={false}>
        {isDark ? (
          // Icône lune — mode sombre actif
          <motion.span
            key="moon"
            initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
            animate={{ rotate: 0, opacity: 1, scale: 1 }}
            exit={{ rotate: 90, opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="absolute"
          >
            <Moon className="w-4 h-4 text-primary-400" />
          </motion.span>
        ) : (
          // Icône soleil — mode clair actif
          <motion.span
            key="sun"
            initial={{ rotate: 90, opacity: 0, scale: 0.5 }}
            animate={{ rotate: 0, opacity: 1, scale: 1 }}
            exit={{ rotate: -90, opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="absolute"
          >
            <Sun className="w-4 h-4 text-yellow-500" />
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
}
