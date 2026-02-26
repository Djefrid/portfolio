"use client";

import { useState } from "react";
import { usePortfolio } from "@/context/PortfolioContext";
import { useLanguage } from "@/context/LanguageContext";
import { FadeInSection } from "@/components/ui/FadeInSection";

function formatWithLineBreaks(text: string): string {
  let normalized = text.replace(/\r\n/g, ' ').replace(/\n+/g, ' ').replace(/\s+/g, ' ').trim();
  return normalized.replace(/\.\s+/g, '.\n\n');
}

export default function About() {
  const { about } = usePortfolio();
  const { t } = useLanguage();
  const [expanded, setExpanded] = useState(false);

  return (
    <section id="about" className="py-20 bg-dark-900">
      <div className="section-container">
        <FadeInSection>
          <h2 className="section-title text-center">{t('about.title')}</h2>
          <p className="section-subtitle text-center">{t('about.subtitle')}</p>
        </FadeInSection>

        <div className="grid md:grid-cols-2 gap-12 items-start">
          {/* Texte avec accordion */}
          <FadeInSection delay={0.1}>
            <div className="relative">
              {/* Conteneur avec hauteur limitée ou pleine */}
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

              {/* Dégradé masquant quand replié */}
              {!expanded && (
                <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-dark-900 to-transparent pointer-events-none" />
              )}
            </div>

            {/* Bouton Lire la suite / Réduire */}
            <button
              type="button"
              onClick={() => setExpanded(!expanded)}
              className="flex items-center gap-1.5 text-sm text-primary-400 hover:text-primary-300 transition-colors mt-2"
            >
              {expanded ? (
                <>
                  Réduire
                  <svg className="w-4 h-4 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  </svg>
                </>
              ) : (
                <>
                  Lire la suite
                  <svg className="w-4 h-4 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </>
              )}
            </button>
          </FadeInSection>

          {/* Points clés — toujours visibles */}
          <FadeInSection delay={0.2}>
            <div className="bg-dark-800 rounded-xl p-6 border border-dark-700">
              <h3 className="text-xl font-semibold text-white mb-6">
                {t('about.highlights')}
              </h3>
              <ul className="space-y-4">
                {about.highlights
                  .flatMap((highlight) => formatWithLineBreaks(highlight).split('\n'))
                  .filter((line) => line.trim() !== '')
                  .map((line, index) => (
                    <li key={index} className="flex items-start gap-3">
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
