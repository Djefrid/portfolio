"use client";

import { useState, useEffect } from 'react';
import { getProfile, updateProfile } from '@/lib/firebase';
import type { ProfileData, BilingualText, BilingualArray } from '@/types/firebase';

// Internal state type for the editor (always bilingual)
interface ProfileEditorState {
  name: string;
  title: BilingualText;
  stack: string[];
  email: string;
  github: string;
  linkedin: string;
  cvUrl: string;
  about: {
    paragraphs: BilingualText[];
    highlights: BilingualText[];
  };
}

// Helper to ensure bilingual structure for text
function ensureBilingualText(value: unknown, defaultValue = ''): BilingualText {
  if (typeof value === 'object' && value !== null && 'fr' in value && 'en' in value) {
    return value as BilingualText;
  }
  const str = typeof value === 'string' ? value : defaultValue;
  return { fr: str, en: str };
}

// Helper to ensure bilingual structure for arrays (as array of BilingualText)
function ensureBilingualParagraphs(value: unknown, defaultValue: string[] = ['']): BilingualText[] {
  // If it's already in the new format (array of {fr, en} objects)
  if (Array.isArray(value) && value.length > 0 && typeof value[0] === 'object' && 'fr' in value[0]) {
    return value as BilingualText[];
  }

  // If it's the old BilingualArray format {fr: [], en: []}
  if (typeof value === 'object' && value !== null && 'fr' in value && 'en' in value) {
    const bilingualArray = value as { fr: string[]; en: string[] };
    const maxLen = Math.max(bilingualArray.fr.length, bilingualArray.en.length);
    const result: BilingualText[] = [];
    for (let i = 0; i < maxLen; i++) {
      result.push({
        fr: bilingualArray.fr[i] || '',
        en: bilingualArray.en[i] || '',
      });
    }
    return result.length > 0 ? result : [{ fr: '', en: '' }];
  }

  // If it's a simple array (legacy format)
  if (Array.isArray(value)) {
    return value.map(item => ({ fr: String(item), en: String(item) }));
  }

  return defaultValue.map(item => ({ fr: item, en: item }));
}

// Convert editor state to Firebase format
function toFirebaseFormat(state: ProfileEditorState): ProfileData {
  return {
    name: state.name,
    title: state.title,
    stack: state.stack,
    email: state.email,
    github: state.github,
    linkedin: state.linkedin,
    cvUrl: state.cvUrl,
    about: {
      paragraphs: {
        fr: state.about.paragraphs.map(p => p.fr),
        en: state.about.paragraphs.map(p => p.en),
      },
      highlights: {
        fr: state.about.highlights.map(h => h.fr),
        en: state.about.highlights.map(h => h.en),
      },
    },
  };
}

const defaultProfile: ProfileEditorState = {
  name: '',
  title: { fr: '', en: '' },
  stack: [],
  email: '',
  github: '',
  linkedin: '',
  cvUrl: '',
  about: {
    paragraphs: [{ fr: '', en: '' }],
    highlights: [{ fr: '', en: '' }],
  },
};

export default function ProfileEditor() {
  const [profile, setProfile] = useState<ProfileEditorState>(defaultProfile);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  // Always edit in French, English is auto-translated on save
  const activeLang = 'fr' as const;

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    const data = await getProfile();
    if (data) {
      const convertedProfile: ProfileEditorState = {
        name: data.name || '',
        title: ensureBilingualText(data.title),
        stack: data.stack || [],
        email: data.email || '',
        github: data.github || '',
        linkedin: data.linkedin || '',
        cvUrl: data.cvUrl || '',
        about: {
          paragraphs: ensureBilingualParagraphs(data.about?.paragraphs),
          highlights: ensureBilingualParagraphs(data.about?.highlights),
        },
      };
      setProfile(convertedProfile);
    }
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);

    try {
      // Step 1: Auto-translate the data to both languages
      setMessage({ type: 'success', text: 'Traduction automatique en cours...' });

      const firebaseData = toFirebaseFormat(profile);

      // Translate from the active language to the other language
      const translateResponse = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'profile',
          data: firebaseData,
          sourceLang: activeLang,
        }),
      });

      let dataToSave = firebaseData;
      if (translateResponse.ok) {
        const translateResult = await translateResponse.json();
        if (translateResult.success && translateResult.data) {
          dataToSave = translateResult.data;
        }
      }

      // Step 2: Save to Firebase
      setMessage({ type: 'success', text: 'Sauvegarde Firebase...' });
      const firebaseSuccess = await updateProfile(dataToSave);

      if (firebaseSuccess) {
        // Step 3: Sync to local portfolio-data.ts file
        setMessage({ type: 'success', text: 'Synchronisation fichier local...' });

        const syncResponse = await fetch('/api/sync-data', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'profile', data: dataToSave }),
        });

        if (syncResponse.ok) {
          setMessage({ type: 'success', text: 'Profil traduit et synchronisé (Firebase + fichier local)!' });
        } else {
          setMessage({ type: 'success', text: 'Firebase OK + traduit, mais erreur sync fichier local' });
        }
      } else {
        setMessage({ type: 'error', text: 'Erreur lors de la sauvegarde Firebase' });
      }
    } catch (error) {
      console.error('Save error:', error);
      setMessage({ type: 'error', text: 'Erreur lors de la sauvegarde' });
    }

    setSaving(false);
    setTimeout(() => setMessage(null), 8000);
  };

  const updateStack = (value: string) => {
    setProfile({ ...profile, stack: value.split(',').map(s => s.trim()).filter(Boolean) });
  };

  const updateTitle = (value: string) => {
    setProfile({
      ...profile,
      title: { ...profile.title, fr: value },
    });
  };

  const updateParagraph = (index: number, value: string) => {
    const paragraphs = [...profile.about.paragraphs];
    paragraphs[index] = { ...paragraphs[index], fr: value };
    setProfile({ ...profile, about: { ...profile.about, paragraphs } });
  };

  const addParagraph = () => {
    setProfile({
      ...profile,
      about: {
        ...profile.about,
        paragraphs: [...profile.about.paragraphs, { fr: '', en: '' }],
      },
    });
  };

  const removeParagraph = (index: number) => {
    const paragraphs = profile.about.paragraphs.filter((_, i) => i !== index);
    setProfile({ ...profile, about: { ...profile.about, paragraphs } });
  };

  const updateHighlight = (index: number, value: string) => {
    const highlights = [...profile.about.highlights];
    highlights[index] = { ...highlights[index], fr: value };
    setProfile({ ...profile, about: { ...profile.about, highlights } });
  };

  const addHighlight = () => {
    setProfile({
      ...profile,
      about: {
        ...profile.about,
        highlights: [...profile.about.highlights, { fr: '', en: '' }],
      },
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
            <label className="block text-sm font-medium text-gray-300 mb-2">Nom (identique dans les deux langues)</label>
            <input
              type="text"
              value={profile.name}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              className="w-full px-4 py-2 bg-dark-800 border border-dark-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Titre / Poste (traduit automatiquement en anglais)
            </label>
            <textarea
              value={profile.title.fr}
              onChange={(e) => updateTitle(e.target.value)}
              rows={2}
              className="w-full px-4 py-2 bg-dark-800 border border-dark-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500 resize-y"
              placeholder="Développeur Web Full-Stack Junior et Technicien en Informatique"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Stack technique (identique dans les deux langues, séparées par des virgules)
            </label>
            <textarea
              value={profile.stack.join(', ')}
              onChange={(e) => updateStack(e.target.value)}
              rows={3}
              className="w-full px-4 py-2 bg-dark-800 border border-dark-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500 resize-y"
              placeholder="Django, Vue.js, React, Next.js, TypeScript, PostgreSQL, Docker"
            />
            <div className="flex flex-wrap gap-2 mt-2">
              {profile.stack.map((tech) => (
                <span
                  key={tech}
                  className="text-xs px-2 py-1 bg-primary-500/20 text-primary-400 rounded"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Contact Links */}
      <section>
        <h2 className="text-xl font-semibold text-white mb-4">Liens de contact (identiques dans les deux langues)</h2>
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
        <h2 className="text-xl font-semibold text-white mb-4">
          Section À propos (traduit automatiquement en anglais)
        </h2>

        {/* Paragraphs */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Paragraphes
          </label>
          {profile.about.paragraphs.map((paragraph, index) => (
            <div key={index} className="flex gap-2 mb-2">
              <textarea
                value={paragraph.fr}
                onChange={(e) => updateParagraph(index, e.target.value)}
                rows={3}
                className="flex-1 px-4 py-2 bg-dark-800 border border-dark-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
              />
              <button
                type="button"
                onClick={() => removeParagraph(index)}
                className="px-3 py-2 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-lg transition-colors"
              >
                ✕
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addParagraph}
            className="text-sm text-primary-400 hover:text-primary-300"
          >
            + Ajouter un paragraphe
          </button>
        </div>

        {/* Highlights */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Points clés
          </label>
          {profile.about.highlights.map((highlight, index) => (
            <div key={index} className="flex gap-2 mb-2">
              <textarea
                value={highlight.fr}
                onChange={(e) => updateHighlight(index, e.target.value)}
                rows={2}
                className="flex-1 px-4 py-2 bg-dark-800 border border-dark-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500 resize-y"
                placeholder="Ex: Formation DEC en informatique"
              />
              <button
                type="button"
                onClick={() => removeHighlight(index)}
                className="px-3 py-2 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-lg transition-colors self-start"
              >
                ✕
              </button>
            </div>
          ))}
          <button
            type="button"
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
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {saving ? 'Sauvegarde...' : 'Enregistrer'}
        </button>
      </div>
    </div>
  );
}
