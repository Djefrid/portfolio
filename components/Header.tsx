"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
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

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Track active section via IntersectionObserver
  useEffect(() => {
    const sections = navLinks.map(l => document.getElementById(l.id)).filter(Boolean) as HTMLElement[];

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: "-40% 0px -55% 0px", threshold: 0 }
    );

    sections.forEach((section) => observer.observe(section));
    return () => sections.forEach((section) => observer.unobserve(section));
  }, []);

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-dark-950/95 backdrop-blur-md shadow-lg"
          : "bg-transparent"
      }`}
    >
      <nav className="section-container">
        <div className="flex items-center justify-between h-16">
          {/* Logo — nom du profil */}
          <Link
            href="#hero"
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
                  {/* Indicateur actif */}
                  {activeSection === link.id && (
                    <span className="absolute -bottom-0.5 left-0 right-0 h-0.5 bg-primary-400 rounded-full" />
                  )}
                </li>
              ))}
            </ul>

            {/* Language Switcher + Theme Toggle */}
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setLanguage('fr')}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    language === 'fr'
                      ? 'bg-primary-500 text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                  aria-label="Français"
                >
                  FR
                </button>
                <button
                  type="button"
                  onClick={() => setLanguage('en')}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    language === 'en'
                      ? 'bg-primary-500 text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                  aria-label="English"
                >
                  EN
                </button>
              </div>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 md:hidden">
            <ThemeToggle />
            {/* Mobile Language Switcher */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setLanguage('fr')}
                className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                  language === 'fr'
                    ? 'bg-primary-500 text-white'
                    : 'text-gray-400'
                }`}
                aria-label="Français"
              >
                FR
              </button>
              <button
                type="button"
                onClick={() => setLanguage('en')}
                className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                  language === 'en'
                    ? 'bg-primary-500 text-white'
                    : 'text-gray-400'
                }`}
                aria-label="English"
              >
                EN
              </button>
            </div>

            <button
              type="button"
              className="p-2 text-gray-300 hover:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 rounded-lg"
              onClick={toggleMobileMenu}
              aria-expanded={isMobileMenuOpen ? "true" : "false"}
              aria-label="Menu de navigation"
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

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-dark-800">
            <ul className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={`block py-2 font-medium transition-colors ${
                      activeSection === link.id
                        ? "text-primary-400"
                        : "text-gray-300 hover:text-primary-400"
                    }`}
                    onClick={closeMobileMenu}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </nav>
    </header>
  );
}
