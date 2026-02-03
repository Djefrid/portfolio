"use client";

import { useState, useEffect } from 'react';
import { getProfile, updateProfile } from '@/lib/firebase';
import type { ProfileData } from '@/types/firebase';

const defaultProfile: ProfileData = {
  name: '',
  title: '',
  stack: [],
  email: '',
  github: '',
  linkedin: '',
  cvUrl: '',
  about: {
    paragraphs: [''],
    highlights: [''],
  },
};

export default function ProfileEditor() {
  const [profile, setProfile] = useState<ProfileData>(defaultProfile);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    const data = await getProfile();
    if (data) {
      setProfile(data);
    }
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);

    const success = await updateProfile(profile);

    if (success) {
      setMessage({ type: 'success', text: 'Profil mis à jour avec succès!' });
    } else {
      setMessage({ type: 'error', text: 'Erreur lors de la sauvegarde' });
    }

    setSaving(false);
    setTimeout(() => setMessage(null), 3000);
  };

  const updateStack = (value: string) => {
    setProfile({ ...profile, stack: value.split(',').map(s => s.trim()).filter(Boolean) });
  };

  const updateParagraph = (index: number, value: string) => {
    const paragraphs = [...profile.about.paragraphs];
    paragraphs[index] = value;
    setProfile({ ...profile, about: { ...profile.about, paragraphs } });
  };

  const addParagraph = () => {
    setProfile({
      ...profile,
      about: { ...profile.about, paragraphs: [...profile.about.paragraphs, ''] },
    });
  };

  const removeParagraph = (index: number) => {
    const paragraphs = profile.about.paragraphs.filter((_, i) => i !== index);
    setProfile({ ...profile, about: { ...profile.about, paragraphs } });
  };

  const updateHighlight = (index: number, value: string) => {
    const highlights = [...profile.about.highlights];
    highlights[index] = value;
    setProfile({ ...profile, about: { ...profile.about, highlights } });
  };

  const addHighlight = () => {
    setProfile({
      ...profile,
      about: { ...profile.about, highlights: [...profile.about.highlights, ''] },
    });
  };

  const removeHighlight = (index: number) => {
    const highlights = profile.about.highlights.filter((_, i) => i !== index);
    setProfile({ ...profile, about: { ...profile.about, highlights } });
  };

  if (loading) {
    return <div className="text-gray-400">Chargement...</div>;
  }

  return (
    <div className="space-y-8">
      {/* Message */}
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

      {/* Hero Section */}
      <section>
        <h2 className="text-xl font-semibold text-white mb-4">Section Hero</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Nom</label>
            <input
              type="text"
              value={profile.name}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              className="w-full px-4 py-2 bg-dark-800 border border-dark-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Titre</label>
            <input
              type="text"
              value={profile.title}
              onChange={(e) => setProfile({ ...profile, title: e.target.value })}
              className="w-full px-4 py-2 bg-dark-800 border border-dark-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Stack (séparées par des virgules)
            </label>
            <input
              type="text"
              value={profile.stack.join(', ')}
              onChange={(e) => updateStack(e.target.value)}
              className="w-full px-4 py-2 bg-dark-800 border border-dark-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Django, Vue.js, React, Next.js"
            />
          </div>
        </div>
      </section>

      {/* Contact Links */}
      <section>
        <h2 className="text-xl font-semibold text-white mb-4">Liens de contact</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
            <input
              type="email"
              value={profile.email}
              onChange={(e) => setProfile({ ...profile, email: e.target.value })}
              className="w-full px-4 py-2 bg-dark-800 border border-dark-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">GitHub URL</label>
            <input
              type="url"
              value={profile.github}
              onChange={(e) => setProfile({ ...profile, github: e.target.value })}
              className="w-full px-4 py-2 bg-dark-800 border border-dark-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">LinkedIn URL</label>
            <input
              type="url"
              value={profile.linkedin}
              onChange={(e) => setProfile({ ...profile, linkedin: e.target.value })}
              className="w-full px-4 py-2 bg-dark-800 border border-dark-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">CV URL</label>
            <input
              type="text"
              value={profile.cvUrl}
              onChange={(e) => setProfile({ ...profile, cvUrl: e.target.value })}
              className="w-full px-4 py-2 bg-dark-800 border border-dark-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>
      </section>

      {/* About Section */}
      <section>
        <h2 className="text-xl font-semibold text-white mb-4">Section À propos</h2>

        {/* Paragraphs */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-300 mb-2">Paragraphes</label>
          {profile.about.paragraphs.map((paragraph, index) => (
            <div key={index} className="flex gap-2 mb-2">
              <textarea
                value={paragraph}
                onChange={(e) => updateParagraph(index, e.target.value)}
                rows={3}
                className="flex-1 px-4 py-2 bg-dark-800 border border-dark-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
              />
              <button
                onClick={() => removeParagraph(index)}
                className="px-3 py-2 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-lg transition-colors"
              >
                ✕
              </button>
            </div>
          ))}
          <button
            onClick={addParagraph}
            className="text-sm text-primary-400 hover:text-primary-300"
          >
            + Ajouter un paragraphe
          </button>
        </div>

        {/* Highlights */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Points clés</label>
          {profile.about.highlights.map((highlight, index) => (
            <div key={index} className="flex gap-2 mb-2">
              <input
                type="text"
                value={highlight}
                onChange={(e) => updateHighlight(index, e.target.value)}
                className="flex-1 px-4 py-2 bg-dark-800 border border-dark-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <button
                onClick={() => removeHighlight(index)}
                className="px-3 py-2 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-lg transition-colors"
              >
                ✕
              </button>
            </div>
          ))}
          <button
            onClick={addHighlight}
            className="text-sm text-primary-400 hover:text-primary-300"
          >
            + Ajouter un point clé
          </button>
        </div>
      </section>

      {/* Save Button */}
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
