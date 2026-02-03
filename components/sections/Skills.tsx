"use client";

import { usePortfolio } from "@/context/PortfolioContext";

export default function Skills() {
  const { skills } = usePortfolio();

  return (
    <section id="skills" className="py-20 bg-dark-900">
      <div className="section-container">
        <h2 className="section-title text-center">Compétences</h2>
        <p className="section-subtitle text-center">
          Technologies et outils que je maîtrise
        </p>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {skills.map((category) => (
            <div
              key={category.category}
              className="bg-dark-800 rounded-xl p-6 border border-dark-700"
            >
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
          ))}
        </div>
      </div>
    </section>
  );
}
