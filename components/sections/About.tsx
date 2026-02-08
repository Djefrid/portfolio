"use client";

import { usePortfolio } from "@/context/PortfolioContext";
import { useLanguage } from "@/context/LanguageContext";

export default function About() {
  const { about } = usePortfolio();
  const { t } = useLanguage();

  return (
    <section id="about" className="py-20 bg-dark-900">
      <div className="section-container">
        <h2 className="section-title text-center">{t('about.title')}</h2>
        <p className="section-subtitle text-center">
          {t('about.subtitle')}
        </p>

        <div className="grid md:grid-cols-2 gap-12 items-start">
          {/* Text content */}
          <div className="space-y-6 text-justify">
            {about.paragraphs.map((paragraph, index) => (
              <p key={index} className="text-gray-300 leading-relaxed">
                {paragraph}
              </p>
            ))}
          </div>

          {/* Highlights */}
          <div className="bg-dark-800 rounded-xl p-6 border border-dark-700">
            <h3 className="text-xl font-semibold text-white mb-6">
              {t('about.highlights')}
            </h3>
            <ul className="space-y-4">
              {about.highlights.map((highlight, index) => (
                <li key={index} className="flex items-start gap-3">
                  <svg
                    className="w-5 h-5 text-primary-500 mt-0.5 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span className="text-gray-300">{highlight}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
