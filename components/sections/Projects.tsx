"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { usePortfolio } from "@/context/PortfolioContext";
import { useLanguage } from "@/context/LanguageContext";
import { FadeInSection } from "@/components/ui/FadeInSection";
import type { Project } from "@/types";

/* ─── Modale détail projet ─── */
function ProjectModal({
  project,
  index,
  t,
  onClose,
  triggerRef,
}: {
  project: Project;
  index: number;
  t: (key: string) => string;
  onClose: () => void;
  triggerRef?: React.RefObject<HTMLElement | null>;
}) {
  const badges = ["🥇", "🥈", "🥉"];
  const badge = badges[index] || "";
  const panelRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  // Focus sur le bouton fermer à l'ouverture
  useEffect(() => {
    closeBtnRef.current?.focus();
  }, []);

  // Restaurer le focus sur l'élément déclencheur à la fermeture
  useEffect(() => {
    return () => {
      (triggerRef?.current as HTMLElement | null)?.focus();
    };
  }, [triggerRef]);

  // Fermer avec la touche Échap + focus trap (Tab/Shift-Tab restent dans la modale)
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") { onClose(); return; }
      if (e.key === "Tab" && panelRef.current) {
        const focusable = panelRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const first = focusable[0];
        const last  = focusable[focusable.length - 1];
        if (e.shiftKey) {
          if (document.activeElement === first) { e.preventDefault(); last?.focus(); }
        } else {
          if (document.activeElement === last) { e.preventDefault(); first?.focus(); }
        }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  // Bloquer le scroll de la page pendant que la modale est ouverte
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  return (
    /* Backdrop */
    <div
      role="dialog"
      aria-modal="true"
      aria-label={project.title}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      {/* Panneau */}
      <div
        ref={panelRef}
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-dark-800 border border-dark-600 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Bouton fermer */}
        <button
          ref={closeBtnRef}
          type="button"
          onClick={onClose}
          aria-label={t("projects.close")}
          className="absolute top-4 right-4 z-10 bg-dark-700 hover:bg-dark-600 text-gray-400 hover:text-white rounded-full w-8 h-8 flex items-center justify-center transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="p-6 sm:p-8">
          {/* Titre */}
          <div className="flex items-start gap-3 mb-4 pr-10">
            {badge && <span className="text-2xl flex-shrink-0">{badge}</span>}
            <h3 className="text-xl font-bold text-white leading-tight">{project.title}</h3>
          </div>

          {/* Description courte */}
          <p className="text-gray-300 mb-3 text-justify">{project.description}</p>

          {/* Description longue */}
          {project.longDescription && (
            <p className="text-gray-400 text-sm mb-6 whitespace-pre-line text-justify">{project.longDescription}</p>
          )}

          {/* Stack */}
          {project.stack.length > 0 && (
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-400 mb-2">{t("projects.stack")}</h4>
              <div className="flex flex-wrap gap-2">
                {project.stack.map((tech) => (
                  <span key={tech} className="skill-tag">{tech}</span>
                ))}
              </div>
            </div>
          )}

          {/* Features */}
          {project.features?.length > 0 && (
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-400 mb-2">{t("projects.features")}</h4>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {project.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-gray-300">
                    <svg className="w-4 h-4 text-primary-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Challenges */}
          {project.challenges?.length > 0 && (
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-400 mb-2">{t("projects.challenges")}</h4>
              <ul className="space-y-2">
                {project.challenges.map((challenge, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-gray-300">
                    <svg className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    {challenge}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Liens */}
          <div className="flex flex-wrap gap-3 pt-4 border-t border-dark-700">
            {project.githubUrl && (
              <Link
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-primary-400 hover:text-primary-300 transition-colors"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                </svg>
                {t("projects.sourceCode")}
              </Link>
            )}
            {project.demoUrl && (
              <Link
                href={project.demoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-primary-400 hover:text-primary-300 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                {t("projects.liveDemo")}
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Carte compacte avec hover framer-motion ─── */
function ProjectCard({
  project,
  index,
  t,
  onOpen,
}: {
  project: Project;
  index: number;
  t: (key: string) => string;
  onOpen: (el: HTMLElement) => void;
}) {
  const badges = ["🥇", "🥈", "🥉"];
  const badge = badges[index] || "";

  return (
    <motion.article
      className="card group h-full flex flex-col cursor-pointer"
      whileHover={{
        y: -6,
        boxShadow: "0 0 24px rgba(99, 102, 241, 0.25)",
        borderColor: "rgba(99, 102, 241, 0.5)",
      }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      onClick={(e) => onOpen(e.currentTarget as HTMLElement)}
    >
      {/* Header */}
      <div className="flex items-start gap-2 mb-3">
        {badge && <span className="text-xl flex-shrink-0">{badge}</span>}
        <h3 className="text-lg font-semibold text-white group-hover:text-primary-400 transition-colors leading-tight">
          {project.title}
        </h3>
      </div>

      {/* Description */}
      <p className="text-gray-400 text-sm mb-4 flex-1 line-clamp-3">{project.description}</p>

      {/* Stack */}
      {project.stack.length > 0 && (
        <div className="mb-4">
          <div className="flex flex-wrap gap-1.5">
            {project.stack.slice(0, 6).map((tech) => (
              <span key={tech} className="skill-tag">{tech}</span>
            ))}
            {project.stack.length > 6 && (
              <span className="skill-tag">+{project.stack.length - 6}</span>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 mt-auto border-t border-dark-700">
        {/* Liens */}
        <div className="flex gap-3">
          {project.githubUrl && (
            <Link
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-2 text-sm text-primary-400 hover:text-primary-300 transition-colors"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
              </svg>
              {t("projects.sourceCode")}
            </Link>
          )}
          {project.demoUrl && (
            <Link
              href={project.demoUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-2 text-sm text-primary-400 hover:text-primary-300 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              {t("projects.liveDemo")}
            </Link>
          )}
        </div>

        {/* Bouton détails */}
        <button
          type="button"
          onClick={(e) => onOpen(e.currentTarget)}
          className="text-xs text-gray-500 hover:text-primary-400 transition-colors flex items-center gap-1"
        >
          {t("projects.viewMore")}
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </motion.article>
  );
}

/* ─── Skeleton shimmer card ─── */
function ProjectSkeleton() {
  return (
    <div className="card h-full flex flex-col animate-pulse">
      <div className="flex items-start gap-2 mb-3">
        <div className="w-6 h-6 bg-dark-700 rounded flex-shrink-0" />
        <div className="h-5 bg-dark-700 rounded w-3/4" />
      </div>
      <div className="space-y-2 mb-4 flex-1">
        <div className="h-3 bg-dark-700 rounded w-full" />
        <div className="h-3 bg-dark-700 rounded w-5/6" />
        <div className="h-3 bg-dark-700 rounded w-4/6" />
      </div>
      <div className="flex flex-wrap gap-1.5 mb-4">
        {["w-20", "w-14", "w-16", "w-12"].map((w, i) => (
          <div key={i} className={`h-6 bg-dark-700 rounded-lg ${w}`} />
        ))}
      </div>
      <div className="pt-3 mt-auto border-t border-dark-700 flex gap-3">
        <div className="h-4 bg-dark-700 rounded w-20" />
        <div className="h-4 bg-dark-700 rounded w-16" />
      </div>
    </div>
  );
}

/* ─── Section principale ─── */
export default function Projects() {
  const { projects, loading } = usePortfolio();
  const { t } = useLanguage();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [selected, setSelected] = useState<{ project: Project; index: number } | null>(null);
  const openBtnRef = useRef<HTMLElement | null>(null);

  const scroll = (dir: "prev" | "next") => {
    const el = scrollRef.current;
    if (!el) return;
    const card = el.firstElementChild as HTMLElement | null;
    const cardWidth = card ? card.offsetWidth + 24 : 320;
    el.scrollBy({ left: dir === "next" ? cardWidth : -cardWidth, behavior: "smooth" });
  };

  if (loading) {
    return (
      <section className="py-20">
        <div className="section-container">
          <FadeInSection>
            <h2 className="section-title text-center">{t("projects.title")}</h2>
            <p className="section-subtitle text-center">{t("projects.subtitle")}</p>
          </FadeInSection>
          <div className="flex gap-6 overflow-hidden">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex-shrink-0 w-full sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)]">
                <ProjectSkeleton />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (projects.length === 0) return null;

  return (
    <section id="projects" className="py-20">
      <div className="section-container">
        <FadeInSection>
          <h2 className="section-title text-center">{t("projects.title")}</h2>
          <p className="section-subtitle text-center">{t("projects.subtitle")}</p>
        </FadeInSection>

        <FadeInSection delay={0.15}>
          <div className="relative">
            {/* Flèche gauche */}
            {projects.length > 1 && (
              <button
                type="button"
                onClick={() => scroll("prev")}
                aria-label="Projet précédent"
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
              {projects.map((project, index) => (
                <div
                  key={project.id}
                  className="flex-shrink-0 w-full sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] snap-start"
                >
                  <ProjectCard
                    project={project}
                    index={index}
                    t={t}
                    onOpen={(el: HTMLElement) => { openBtnRef.current = el; setSelected({ project, index }); }}
                  />
                </div>
              ))}
            </div>

            {/* Flèche droite */}
            {projects.length > 1 && (
              <button
                type="button"
                onClick={() => scroll("next")}
                aria-label="Projet suivant"
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 bg-dark-800 hover:bg-dark-700 border border-dark-600 text-white rounded-full w-10 h-10 flex items-center justify-center transition-colors shadow-lg"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            )}
          </div>
        </FadeInSection>
      </div>

      {/* Modale */}
      {selected && (
        <ProjectModal
          project={selected.project}
          index={selected.index}
          t={t}
          onClose={() => setSelected(null)}
          triggerRef={openBtnRef}
        />
      )}
    </section>
  );
}
