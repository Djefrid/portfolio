"use client";

import Link from "next/link";
import { usePortfolio } from "@/context/PortfolioContext";
import type { Project } from "@/types";

function ProjectCard({ project, index }: { project: Project; index: number }) {
  const badges = ["🥇", "🥈", "🥉"];
  const badge = badges[index] || "";

  return (
    <article className="card group">
      {/* Header with badge */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <span className="text-2xl mr-2">{badge}</span>
          <h3 className="inline text-xl font-semibold text-white group-hover:text-primary-400 transition-colors">
            {project.title}
          </h3>
        </div>
      </div>

      {/* Description */}
      <p className="text-gray-400 mb-4 text-justify">{project.description}</p>
      <p className="text-gray-300 text-sm mb-6 text-justify">{project.longDescription}</p>

      {/* Stack */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-400 mb-2">
          Stack technique
        </h4>
        <div className="flex flex-wrap gap-2">
          {project.stack.map((tech) => (
            <span key={tech} className="skill-tag">
              {tech}
            </span>
          ))}
        </div>
      </div>

      {/* Features */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-400 mb-2">
          Fonctionnalités
        </h4>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {project.features.map((feature, idx) => (
            <li key={idx} className="flex items-start gap-2 text-sm text-gray-300">
              <svg
                className="w-4 h-4 text-primary-500 mt-0.5 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4"
                />
              </svg>
              {feature}
            </li>
          ))}
        </ul>
      </div>

      {/* Challenges */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-400 mb-2">
          Défis techniques
        </h4>
        <ul className="space-y-2">
          {project.challenges.map((challenge, idx) => (
            <li key={idx} className="flex items-start gap-2 text-sm text-gray-300">
              <svg
                className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
              {challenge}
            </li>
          ))}
        </ul>
      </div>

      {/* Links */}
      <div className="flex flex-wrap gap-3 pt-4 border-t border-dark-700">
        <Link
          href={project.githubUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-sm text-primary-400 hover:text-primary-300 transition-colors"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path
              fillRule="evenodd"
              d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
              clipRule="evenodd"
            />
          </svg>
          Code source
        </Link>
        {project.demoUrl && (
          <Link
            href={project.demoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-primary-400 hover:text-primary-300 transition-colors"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
            Démo live
          </Link>
        )}
      </div>
    </article>
  );
}

export default function Projects() {
  const { projects } = usePortfolio();

  return (
    <section id="projects" className="py-20">
      <div className="section-container">
        <h2 className="section-title text-center">Projets</h2>
        <p className="section-subtitle text-center">
          Découvrez mes réalisations techniques
        </p>

        <div className="grid gap-8 md:grid-cols-1 lg:grid-cols-1">
          {projects.map((project, index) => (
            <ProjectCard key={project.id} project={project} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
