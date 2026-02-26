"use client";

import { useRef } from "react";
import { usePortfolio } from "@/context/PortfolioContext";
import { useLanguage } from "@/context/LanguageContext";

export default function Skills() {
  const { skills } = usePortfolio();
  const { t } = useLanguage();
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: "prev" | "next") => {
    const el = scrollRef.current;
    if (!el) return;
    const card = el.firstElementChild as HTMLElement | null;
    const cardWidth = card ? card.offsetWidth + 24 : 320; // 24px = gap-6
    el.scrollBy({ left: dir === "next" ? cardWidth : -cardWidth, behavior: "smooth" });
  };

  if (skills.length === 0) return null;

  return (
    <section id="skills" className="py-20 bg-dark-900">
      <div className="section-container">
        <h2 className="section-title text-center">{t("skills.title")}</h2>
        <p className="section-subtitle text-center">{t("skills.subtitle")}</p>

        <div className="relative">
          {/* Flèche gauche */}
          {skills.length > 1 && (
            <button
              type="button"
              onClick={() => scroll("prev")}
              aria-label="Catégorie précédente"
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 bg-dark-800 hover:bg-dark-700 border border-dark-600 text-white rounded-full w-10 h-10 flex items-center justify-center transition-colors shadow-lg"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}

          {/* Conteneur scroll */}
          <div
            ref={scrollRef}
            className="flex gap-6 overflow-x-auto snap-x snap-mandatory pb-2 scrollbar-none"
          >
            {skills.map((category) => (
              <div
                key={category.category}
                className="flex-shrink-0 w-full sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] snap-start"
              >
                <div className="bg-dark-800 rounded-xl p-6 border border-dark-700 h-full">
                  <h3 className="text-lg font-semibold text-white mb-4">
                    {category.category}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {category.skills.map((skill) => (
                      <span key={skill.name} className="skill-tag">
                        {skill.name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Flèche droite */}
          {skills.length > 1 && (
            <button
              type="button"
              onClick={() => scroll("next")}
              aria-label="Catégorie suivante"
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 bg-dark-800 hover:bg-dark-700 border border-dark-600 text-white rounded-full w-10 h-10 flex items-center justify-center transition-colors shadow-lg"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
