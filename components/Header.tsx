/**
 * ============================================================================
 * NAVBAR / HEADER — components/Header.tsx
 * ============================================================================
 *
 * Barre de navigation fixe en haut de toutes les pages du portfolio public.
 *
 * Fonctionnalités :
 *   - Logo/nom cliquable (lien vers #hero)
 *   - Navigation desktop avec liens d'ancrage (#hero, #about, etc.)
 *   - Indicateur de section active (underline + couleur) via IntersectionObserver
 *   - Fond transparent → fond flouté (backdrop-blur) après 50px de scroll
 *   - Boutons FR / EN pour changer la langue
 *   - Toggle thème sombre/clair (ThemeToggle)
 *   - Menu hamburger animé pour mobile (AnimatePresence + Framer Motion)
 *
 * Détection de la section active (IntersectionObserver) :
 *   Observe chaque section avec rootMargin "-40% 0px -55% 0px".
 *   Cela signifie qu'une section est "active" seulement quand elle occupe
 *   la zone entre 40% et 55% de la hauteur de la fenêtre.
 *   Résultat : la section qui est visuellement "au centre" est mise en évidence.
 *
 * Menu mobile :
 *   - Un backdrop semi-transparent bloque les clics derrière le menu
 *   - Le scroll de la page est bloqué (overflow: hidden) quand le menu est ouvert
 *   - Touche Escape ferme le menu
 *   - Les liens du menu ferment automatiquement le menu au clic (closeMobileMenu)
 *
 * Accessibilité :
 *   - aria-expanded sur le bouton hamburger (état du menu)
 *   - aria-label sur le bouton hamburger
 *   - aria-hidden sur le backdrop (non interactif pour les lecteurs d'écran)
 * ============================================================================
 */

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";
import { usePortfolio } from "@/context/PortfolioContext";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

/**
 * Composant Header — navbar fixe du portfolio.
 */
export default function Header() {
  /** true si l'utilisateur a scrollé de plus de 50px (déclenche le fond flouté) */
  const [isScrolled, setIsScrolled] = useState(false);
  /** Contrôle l'ouverture/fermeture du menu mobile */
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  /** ID de la section actuellement visible (utilisé pour l'indicateur actif) */
  const [activeSection, setActiveSection] = useState("hero");

  const { language, setLanguage, t } = useLanguage();
  const { profile } = usePortfolio();

  /** Définition des liens de navigation avec leurs ancres et IDs de section */
  const navLinks = [
    { href: "#hero",     label: t('nav.home'),     id: "hero"     },
    { href: "#about",    label: t('nav.about'),    id: "about"    },
    { href: "#projects", label: t('nav.projects'), id: "projects" },
    { href: "#skills",   label: t('nav.skills'),   id: "skills"   },
    { href: "#contact",  label: t('nav.contact'),  id: "contact"  },
  ];

  /**
   * Détecte le scroll pour activer le fond flouté de la navbar.
   * Le seuil de 50px évite les faux positifs au chargement.
   */
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  /**
   * IntersectionObserver pour détecter la section active.
   * rootMargin "-40% 0px -55% 0px" : la zone d'observation est une bande
   * horizontale au centre de la viewport. La section qui entre dans cette
   * bande devient la section active.
   */
  useEffect(() => {
    const sections = navLinks
      .map((l) => document.getElementById(l.id))
      .filter(Boolean) as HTMLElement[];

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveSection(entry.target.id);
        });
      },
      { rootMargin: "-40% 0px -55% 0px", threshold: 0 }
    );

    sections.forEach((s) => observer.observe(s));
    // Cleanup : arrête d'observer quand le composant est démonté
    return () => sections.forEach((s) => observer.unobserve(s));
  }, []);

  /**
   * Gestion du scroll lock et de la fermeture par Escape pour le menu mobile.
   * - Bloque le scroll de la page quand le menu est ouvert (overflow: hidden)
   * - Rétablit le scroll quand le menu se ferme (cleanup du useEffect)
   * - Écoute la touche Escape uniquement quand le menu est ouvert
   */
  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? "hidden" : "";
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeMobileMenu();
    };
    if (isMobileMenuOpen) document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isMobileMenuOpen]);

  /** Bascule l'état ouvert/fermé du menu mobile */
  const toggleMobileMenu = () => setIsMobileMenuOpen((prev) => !prev);
  /** Ferme le menu mobile (appelé au clic sur un lien ou le backdrop) */
  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <>
      {/* ── Barre de navigation fixe ── */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-dark-950/95 backdrop-blur-md shadow-lg" // Fond flouté après scroll
            : "bg-transparent"                             // Transparent au sommet
        }`}
      >
        <nav className="section-container">
          <div className="flex items-center justify-between h-16">

            {/* Logo : affiche le nom du profil ou "Portfolio" si non chargé */}
            <Link
              href="#hero"
              onClick={closeMobileMenu}
              className="text-xl font-bold text-white hover:text-primary-400 transition-colors"
            >
              {profile.name || "Portfolio"}
            </Link>

            {/* Navigation desktop (masquée sur mobile) */}
            <div className="hidden md:flex items-center gap-8">
              <ul className="flex items-center gap-8">
                {navLinks.map((link) => (
                  <li key={link.href} className="relative">
                    <Link
                      href={link.href}
                      className={`text-sm font-medium transition-colors pb-1 ${
                        activeSection === link.id
                          ? "text-primary-400"                      // Lien de la section active
                          : "text-gray-300 hover:text-primary-400"  // Liens inactifs
                      }`}
                    >
                      {link.label}
                    </Link>
                    {/* Underline animé sous le lien actif */}
                    {activeSection === link.id && (
                      <span className="absolute -bottom-0.5 left-0 right-0 h-0.5 bg-primary-400 rounded-full" />
                    )}
                  </li>
                ))}
              </ul>

              {/* Contrôles : toggle thème + sélecteur de langue */}
              <div className="flex items-center gap-2">
                <ThemeToggle />
                <div className="flex items-center gap-1">
                  {/* Bouton FR — actif si langue = fr */}
                  <button
                    type="button"
                    onClick={() => setLanguage("fr")}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                      language === "fr"
                        ? "bg-primary-500 text-white"
                        : "text-gray-400 hover:text-white"
                    }`}
                    aria-label="Français"
                  >
                    FR
                  </button>
                  {/* Bouton EN — actif si langue = en */}
                  <button
                    type="button"
                    onClick={() => setLanguage("en")}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                      language === "en"
                        ? "bg-primary-500 text-white"
                        : "text-gray-400 hover:text-white"
                    }`}
                    aria-label="English"
                  >
                    EN
                  </button>
                </div>
              </div>
            </div>

            {/* Contrôles mobiles : thème + langue + hamburger */}
            <div className="flex items-center gap-2 md:hidden">
              <ThemeToggle />
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setLanguage("fr")}
                  className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                    language === "fr" ? "bg-primary-500 text-white" : "text-gray-400"
                  }`}
                  aria-label="Français"
                >
                  FR
                </button>
                <button
                  type="button"
                  onClick={() => setLanguage("en")}
                  className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                    language === "en" ? "bg-primary-500 text-white" : "text-gray-400"
                  }`}
                  aria-label="English"
                >
                  EN
                </button>
              </div>

              {/* Bouton hamburger / X — icône change selon l'état du menu */}
              <button
                type="button"
                onClick={toggleMobileMenu}
                aria-expanded={isMobileMenuOpen}
                aria-label="Menu de navigation"
                className="p-2 text-gray-300 hover:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 rounded-lg"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {isMobileMenuOpen ? (
                    /* Icône X (fermer) */
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    /* Icône hamburger (3 lignes) */
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>

          </div>
        </nav>
      </header>

      {/* ── Menu mobile — dropdown avec backdrop animé ── */}
      {/*
        AnimatePresence permet d'animer la sortie du menu.
        Sans lui, le composant disparaîtrait immédiatement à la fermeture.
      */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop semi-transparent — clic ferme le menu */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-30 md:hidden bg-black/60"
              onClick={closeMobileMenu}
              aria-hidden="true" // Décoratif — non interactif pour les lecteurs d'écran
            />

            {/* Dropdown des liens — glisse depuis le haut */}
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="fixed top-16 left-0 right-0 z-40 md:hidden bg-dark-950 border-b border-dark-800 shadow-xl"
            >
              <ul className="section-container flex flex-col py-3">
                {navLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      onClick={closeMobileMenu} // Ferme le menu à chaque clic
                      className={`block py-3 text-base font-medium border-b border-dark-800 last:border-0 transition-colors ${
                        activeSection === link.id
                          ? "text-primary-400"
                          : "text-gray-200 hover:text-primary-400"
                      }`}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
