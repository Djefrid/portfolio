"use client";

import { useState, useEffect } from 'react';
import { getSkills, updateSkills } from '@/lib/firebase';
import type { SkillsData } from '@/types/firebase';

const defaultSkills: SkillsData = {
  frontend: [],
  backend: [],
  databases: [],
  devops: [],
  networks: [],
  scripts: [],
  tools: [],
  collaboration: [],
};

const categories: { key: keyof SkillsData; label: string }[] = [
  { key: 'frontend', label: 'Frontend' },
  { key: 'backend', label: 'Backend' },
  { key: 'databases', label: 'Bases de données' },
  { key: 'devops', label: 'DevOps / Systèmes' },
  { key: 'networks', label: 'Réseaux / Serveurs' },
  { key: 'scripts', label: 'Scripts & Automatisation' },
  { key: 'tools', label: 'Outils & Méthodologies' },
  { key: 'collaboration', label: 'Outils collaboratifs & CMS' },
];

export default function SkillsEditor() {
  const [skills, setSkills] = useState<SkillsData>(defaultSkills);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadSkills();
  }, []);

  const loadSkills = async () => {
    const data = await getSkills();
    if (data) {
      // Merge with default values to handle missing categories
      setSkills({
        frontend: data.frontend || [],
        backend: data.backend || [],
        databases: data.databases || [],
        devops: data.devops || [],
        networks: data.networks || [],
        scripts: data.scripts || [],
        tools: data.tools || [],
        collaboration: data.collaboration || [],
      });
    }
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);

    const success = await updateSkills(skills);

    if (success) {
      setMessage({ type: 'success', text: 'Compétences mises à jour!' });
    } else {
      setMessage({ type: 'error', text: 'Erreur lors de la sauvegarde' });
    }

    setSaving(false);
    setTimeout(() => setMessage(null), 3000);
  };

  const updateCategory = (key: keyof SkillsData, value: string) => {
    setSkills({
      ...skills,
      [key]: value.split(',').map(s => s.trim()).filter(Boolean),
    });
  };

  if (loading) {
    return <div className="text-gray-400">Chargement...</div>;
  }

  return (
    <div className="space-y-6">
      {message && (
        <div
          className={`p-4 rounded-lg ${
            message.type === 'success'
              ? 'bg-green-500/20 border border-green-500/50 text-green-400'
              : 'bg-red-500/20 border border-red-500/50 text-red-400'
          }`}
        >
          {message.text}
        </div>
      )}

      <h2 className="text-xl font-semibold text-white">Compétences</h2>
      <p className="text-gray-400 text-sm">
        Entrez les compétences séparées par des virgules.
      </p>

      <div className="space-y-6">
        {categories.map(({ key, label }) => (
          <div key={key}>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              {label}
            </label>
            <textarea
              value={(skills[key] || []).join(', ')}
              onChange={(e) => updateCategory(key, e.target.value)}
              rows={2}
              className="w-full px-4 py-2 bg-dark-800 border border-dark-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500 resize-y"
              placeholder={`Ex: React, Vue.js, TypeScript`}
            />
            <div className="flex flex-wrap gap-2 mt-2">
              {(skills[key] || []).map((skill) => (
                <span
                  key={skill}
                  className="text-xs px-2 py-1 bg-primary-500/20 text-primary-400 rounded"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end pt-4 border-t border-dark-800">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {saving ? 'Sauvegarde...' : 'Sauvegarder'}
        </button>
      </div>
    </div>
  );
}
