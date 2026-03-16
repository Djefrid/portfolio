/**
 * ============================================================================
 * SECTION À PROPOS — components/sections/About.tsx
 * ============================================================================
 *
 * Deuxième section du portfolio, présentant le parcours du développeur.
 * Divisée en deux colonnes :
 *   - Gauche : texte long avec accordion "Lire la suite / Réduire"
 *   - Droite : points clés toujours visibles (liste avec coches)
 *
 * Accordion :
 *   - État `expanded` contrôle la hauteur du conteneur texte
 *   - Replié  : max-h-[12rem] + dégradé masquant en bas
 *   - Déplié  : max-h-[2000px] (assez grand pour tout texte raisonnable)
 *   - Transition CSS smooth (duration-500) pour l'animation de hauteur
 *   - Pas de Framer Motion ici — la transition CSS suffit et est plus légère
 *
 * Formatage du texte :
 *   La fonction formatWithLineBreaks() normalise les retours à la ligne
 *   pour un affichage cohérent quelle que soit la source des données
 *   (Firebase peut avoir des formats différents du fichier statique).
 *
 * Données :
 *   - about.paragraphs : texte long de la section
 *   - about.highlights : points clés résumés
 * ============================================================================
 */

"use client";

import { useState } from "react";
import { usePortfolio } from "@/context/PortfolioContext";
import { useLanguage } from "@/context/LanguageContext";
import { FadeInSection } from "@/components/ui/FadeInSection";

/**
 * Normalise le formatage d'un texte pour l'affichage.
 * Remplace tous les retours à la ligne multiples par des doubles sauts de ligne,
 * en normalisant d'abord les espaces et les retours chariot Windows (\r\n).
 *
 * But : assurer un affichage cohérent qu'on vienne de Firebase (texte brut)
 * ou des données statiques (texte avec \n formatés).
 *
 * @param text - Le texte à formatter
 * @returns Texte avec les paragraphes séparés par des lignes vides
 */
function formatWithLineBreaks(text: string): string {
  let normalized = text.replace(/\r\n/g, ' ').replace(/\n+/g, ' ').replace(/\s+/g, ' ').trim();
  return normalized.replace(/\.\s+/g, '.\n\n');
}

/**
 * Composant About — section "À propos" du portfolio.
 */
export default function About() {
  const { about } = usePortfolio();
  const { t } = useLanguage();

  /** Contrôle l'état replié/déplié de l'accordion du texte long */
  const [expanded, setExpanded] = useState(false);

  return (
    <section id="about" className="py-20 bg-dark-900">
      <div className="section-container">

        {/* Titre et sous-titre de la section — animés au scroll */}
        <FadeInSection>
          <h2 className="section-title text-center">{t('about.title')}</h2>
          <p className="section-subtitle text-center">{t('about.subtitle')}</p>
        </FadeInSection>

        {/* Grille deux colonnes (empilées sur mobile) */}
        <div className="grid md:grid-cols-2 gap-12 items-start">

          {/* Colonne gauche : texte avec accordion */}
          <FadeInSection delay={0.1}>
            <div className="relative">
              {/* Conteneur avec hauteur contrainte ou pleine selon l'état expanded */}
              <div
                className={`overflow-hidden transition-all duration-500 ease-in-out ${
                  expanded ? "max-h-[2000px]" : "max-h-[12rem]"
                }`}
              >
                <div className="space-y-6 text-justify">
                  {about.paragraphs.map((paragraph, index) => (
                    <p key={index} className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                      {formatWithLineBreaks(paragraph)}
                    </p>
                  ))}
                </div>
              </div>

              {/* Dégradé masquant le bas du texte quand l'accordion est replié */}
              {/* pointer-events-none pour ne pas bloquer les clics sur le texte */}
              {!expanded && (
                <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-dark-900 to-transparent pointer-events-none" />
              )}
            </div>

            {/* Bouton toggle Lire la suite / Réduire */}
            <button
              type="button"
              onClick={() => setExpanded(!expanded)}
              className="flex items-center gap-1.5 text-sm text-primary-400 hover:text-primary-300 transition-colors mt-2"
            >
              {expanded ? (
                <>
                  {t('about.readLess')}
                  {/* Flèche vers le haut quand déplié */}
                  <svg className="w-4 h-4 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  </svg>
                </>
              ) : (
                <>
                  {t('about.readMore')}
                  {/* Flèche vers le bas quand replié */}
                  <svg className="w-4 h-4 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </>
              )}
            </button>
          </FadeInSection>

          {/* Colonne droite : points clés — toujours entièrement visibles */}
          <FadeInSection delay={0.2}>
            <div className="bg-dark-800 rounded-xl p-6 border border-dark-700">
              <h3 className="text-xl font-semibold text-white mb-6">
                {t('about.highlights')}
              </h3>
              <ul className="space-y-4">
                {/*
                  flatMap : un highlight peut contenir plusieurs lignes (séparées par \n)
                  On les éclate en lignes individuelles, puis on filtre les lignes vides.
                  Chaque ligne devient un élément de liste avec une icône de coche.
                */}
                {about.highlights
                  .flatMap((highlight) => formatWithLineBreaks(highlight).split('\n'))
                  .filter((line) => line.trim() !== '')
                  .map((line, index) => (
                    <li key={index} className="flex items-start gap-3">
                      {/* Icône de coche verte — décorative */}
                      <svg
                        className="w-5 h-5 text-primary-500 mt-0.5 flex-shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-gray-300">{line}</span>
                    </li>
                  ))}
              </ul>
            </div>
          </FadeInSection>

        </div>
      </div>
    </section>
  );
}
