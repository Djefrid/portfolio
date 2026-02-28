"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";
import { usePortfolio } from "@/context/PortfolioContext";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("hero");
  const { language, setLanguage, t } = useLanguage();
  const { profile } = usePortfolio();

  const navLinks = [
    { href: "#hero", label: t('nav.home'), id: "hero" },
    { href: "#about", label: t('nav.about'), id: "about" },
    { href: "#projects", label: t('nav.projects'), id: "projects" },
    { href: "#skills", label: t('nav.skills'), id: "skills" },
    { href: "#contact", label: t('nav.contact'), id: "contact" },
  ];

  // Navbar background on scroll
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Active section via IntersectionObserver
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
    return () => sections.forEach((s) => observer.unobserve(s));
  }, []);

  // Scroll lock + fermeture par touche Escape
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

  const toggleMobileMenu = () => setIsMobileMenuOpen((prev) => !prev);
  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <>
      {/* ── Barre de navigation fixe ── */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-dark-950/95 backdrop-blur-md shadow-lg"
            : "bg-transparent"
        }`}
      >
        <nav className="section-container">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link
              href="#hero"
              onClick={closeMobileMenu}
              className="text-xl font-bold text-white hover:text-primary-400 transition-colors"
            >
              {profile.name || "Portfolio"}
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              <ul className="flex items-center gap-8">
                {navLinks.map((link) => (
                  <li key={link.href} className="relative">
                    <Link
                      href={link.href}
                      className={`text-sm font-medium transition-colors pb-1 ${
                        activeSection === link.id
                          ? "text-primary-400"
                          : "text-gray-300 hover:text-primary-400"
                      }`}
                    >
                      {link.label}
                    </Link>
                    {activeSection === link.id && (
                      <span className="absolute -bottom-0.5 left-0 right-0 h-0.5 bg-primary-400 rounded-full" />
                    )}
                  </li>
                ))}
              </ul>

              <div className="flex items-center gap-2">
                <ThemeToggle />
                <div className="flex items-center gap-1">
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

            {/* Mobile — contrôles */}
            <div className="flex items-center gap-2 md:hidden">
              <ThemeToggle />
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setLanguage("fr")}
                  className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                    language === "fr"
                      ? "bg-primary-500 text-white"
                      : "text-gray-400"
                  }`}
                  aria-label="Français"
                >
                  FR
                </button>
                <button
                  type="button"
                  onClick={() => setLanguage("en")}
                  className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                    language === "en"
                      ? "bg-primary-500 text-white"
                      : "text-gray-400"
                  }`}
                  aria-label="English"
                >
                  EN
                </button>
              </div>

              {/* Bouton hamburger / fermer */}
              <button
                type="button"
                onClick={toggleMobileMenu}
                aria-expanded={isMobileMenuOpen ? "true" : "false"}
                aria-label="Menu de navigation"
                className="p-2 text-gray-300 hover:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 rounded-lg"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  {isMobileMenuOpen ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </nav>
      </header>

      {/* ── Menu mobile — dropdown compact + backdrop ── */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop semi-transparent — ferme le menu au clic */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-30 md:hidden bg-black/60"
              onClick={closeMobileMenu}
              aria-hidden="true"
            />

            {/* Dropdown compact */}
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
                      onClick={closeMobileMenu}
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
