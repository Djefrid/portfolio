"use client";

import { useState, useEffect } from 'react';
import { getProjects, addProject, updateProject, deleteProject } from '@/lib/firebase';
import type { ProjectData, BilingualText } from '@/types/firebase';

// Internal state type for bilingual editing
interface ProjectEditorState {
  id?: string;
  title: BilingualText;
  description: BilingualText;
  longDescription: BilingualText;
  stack: string[];
  features: BilingualText[];
  challenges: BilingualText[];
  githubUrl: string;
  demoUrl?: string;
  image: string;
  featured: boolean;
  order: number;
  published: boolean;
}

// Helper to ensure bilingual text structure
function ensureBilingualText(value: unknown, defaultValue = ''): BilingualText {
  if (typeof value === 'object' && value !== null && 'fr' in value && 'en' in value) {
    return value as BilingualText;
  }
  const str = typeof value === 'string' ? value : defaultValue;
  return { fr: str, en: str };
}

// Helper to ensure bilingual array structure (as array of BilingualText)
function ensureBilingualItems(value: unknown, defaultValue: string[] = []): BilingualText[] {
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
    return result.length > 0 ? result : [];
  }

  // If it's a simple array (legacy format)
  if (Array.isArray(value)) {
    return value.map(item => ({ fr: String(item), en: String(item) }));
  }

  return defaultValue.map(item => ({ fr: item, en: item }));
}

// Convert editor state to Firebase format
function toFirebaseFormat(state: ProjectEditorState): ProjectData {
  return {
    id: state.id,
    title: state.title,
    description: state.description,
    longDescription: state.longDescription,
    stack: state.stack,
    features: {
      fr: state.features.map(f => f.fr),
      en: state.features.map(f => f.en),
    },
    challenges: {
      fr: state.challenges.map(c => c.fr),
      en: state.challenges.map(c => c.en),
    },
    githubUrl: state.githubUrl,
    demoUrl: state.demoUrl,
    image: state.image,
    featured: state.featured,
    order: state.order,
    published: state.published !== false, // Ensure boolean, default true if undefined
  };
}

// Convert Firebase format to editor state
function toEditorState(project: ProjectData): ProjectEditorState {
  return {
    id: project.id,
    title: ensureBilingualText(project.title),
    description: ensureBilingualText(project.description),
    longDescription: ensureBilingualText(project.longDescription),
    stack: project.stack || [],
    features: ensureBilingualItems(project.features),
    challenges: ensureBilingualItems(project.challenges),
    githubUrl: project.githubUrl || '',
    demoUrl: project.demoUrl,
    image: project.image || '',
    featured: project.featured || false,
    order: project.order || 0,
    published: project.published !== false,
  };
}

const emptyProject: ProjectEditorState = {
  title: { fr: '', en: '' },
  description: { fr: '', en: '' },
  longDescription: { fr: '', en: '' },
  stack: [],
  features: [],
  challenges: [],
  githubUrl: '',
  demoUrl: '',
  image: '',
  featured: true,
  order: 0,
  published: true,
};

export default function ProjectsEditor() {
  const [projects, setProjects] = useState<ProjectData[]>([]);
  const [editingProject, setEditingProject] = useState<ProjectEditorState | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  // Always edit in French, English is auto-translated on save
  const activeLang = 'fr' as const;

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    const data = await getProjects();
    setProjects(data);
    setLoading(false);
  };

  const handleNew = () => {
    setEditingProject({ ...emptyProject, order: projects.length });
    setIsNew(true);
  };

  const handleEdit = (project: ProjectData) => {
    setEditingProject(toEditorState(project));
    setIsNew(false);
  };

  const handleCancel = () => {
    setEditingProject(null);
    setIsNew(false);
  };

  const syncProjectsToFile = async (projectsList: ProjectData[]) => {
    try {
      const response = await fetch('/api/sync-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'projects', data: projectsList }),
      });
      return response.ok;
    } catch {
      return false;
    }
  };

  const handleSave = async () => {
    if (!editingProject) return;

    setSaving(true);
    setMessage(null);

    try {
      // Step 1: Auto-translate the project data to both languages
      setMessage({ type: 'success', text: 'Traduction automatique en cours...' });

      const firebaseData = toFirebaseFormat(editingProject);

      // Translate from the active language to the other language
      const translateResponse = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'project',
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
      let success = false;

      if (isNew) {
        const { id, ...data } = dataToSave;
        const newId = await addProject(data);
        success = !!newId;
      } else {
        success = await updateProject(editingProject.id!, dataToSave);
      }

      if (success) {
        // Step 3: Reload projects and sync to local file
        setMessage({ type: 'success', text: 'Synchronisation fichier local...' });
        const updatedProjects = await getProjects();
        setProjects(updatedProjects);

        const syncSuccess = await syncProjectsToFile(updatedProjects);
        if (syncSuccess) {
          setMessage({ type: 'success', text: 'Projet traduit et synchronisé (Firebase + fichier local)!' });
        } else {
          setMessage({ type: 'success', text: 'Firebase OK + traduit, sync local non disponible' });
        }
        handleCancel();
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

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer ce projet?')) return;

    const success = await deleteProject(id);
    if (success) {
      const updatedProjects = await getProjects();
      setProjects(updatedProjects);

      const syncSuccess = await syncProjectsToFile(updatedProjects);
      if (syncSuccess) {
        setMessage({ type: 'success', text: 'Projet supprimé et synchronisé!' });
      } else {
        setMessage({ type: 'success', text: 'Projet supprimé (sync local non disponible)' });
      }
    } else {
      setMessage({ type: 'error', text: 'Erreur lors de la suppression' });
    }
    setTimeout(() => setMessage(null), 5000);
  };

  const updateBilingualField = (field: 'title' | 'description' | 'longDescription', value: string) => {
    if (!editingProject) return;
    setEditingProject({
      ...editingProject,
      [field]: { ...editingProject[field], fr: value },
    });
  };

  const updateStack = (value: string) => {
    if (!editingProject) return;
    setEditingProject({
      ...editingProject,
      stack: value.split('\n').filter(Boolean),
    });
  };

  const updateBilingualArrayField = (field: 'features' | 'challenges', value: string) => {
    if (!editingProject) return;
    const lines = value.split('\n');
    const currentItems = editingProject[field];

    // Ensure we have enough items
    const newItems: BilingualText[] = lines.map((line, i) => {
      const existing = currentItems[i] || { fr: '', en: '' };
      return { ...existing, fr: line };
    });

    setEditingProject({
      ...editingProject,
      [field]: newItems,
    });
  };

  // Get display title for project list (prefer French)
  const getDisplayTitle = (project: ProjectData): string => {
    if (typeof project.title === 'object' && 'fr' in project.title) {
      return project.title.fr || project.title.en || '';
    }
    return String(project.title || '');
  };

  const getDisplayDescription = (project: ProjectData): string => {
    if (typeof project.description === 'object' && 'fr' in project.description) {
      return project.description.fr || project.description.en || '';
    }
    return String(project.description || '');
  };

  if (loading) {
    return <div className="text-gray-400">Chargement...</div>;
  }

  // Project Form
  if (editingProject) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">
            {isNew ? 'Nouveau projet' : 'Modifier le projet'}
          </h2>
          <button
            onClick={handleCancel}
            className="text-gray-400 hover:text-white"
          >
            Annuler
          </button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Titre du projet (traduit automatiquement en anglais)
            </label>
            <textarea
              value={editingProject.title.fr}
              onChange={(e) => updateBilingualField('title', e.target.value)}
              rows={1}
              className="w-full px-4 py-2 bg-dark-800 border border-dark-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500 resize-y"
              placeholder="Nom du projet"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Description courte (traduit automatiquement en anglais)
            </label>
            <textarea
              value={editingProject.description.fr}
              onChange={(e) => updateBilingualField('description', e.target.value)}
              rows={2}
              className="w-full px-4 py-2 bg-dark-800 border border-dark-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500 resize-y"
              placeholder="Brève description du projet..."
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Description longue (traduit automatiquement en anglais)
            </label>
            <textarea
              value={editingProject.longDescription.fr}
              onChange={(e) => updateBilingualField('longDescription', e.target.value)}
              rows={3}
              className="w-full px-4 py-2 bg-dark-800 border border-dark-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500 resize-y"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">GitHub URL</label>
            <input
              type="url"
              value={editingProject.githubUrl}
              onChange={(e) => setEditingProject({ ...editingProject, githubUrl: e.target.value })}
              className="w-full px-4 py-2 bg-dark-800 border border-dark-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Demo URL (optionnel)</label>
            <input
              type="url"
              value={editingProject.demoUrl || ''}
              onChange={(e) => setEditingProject({ ...editingProject, demoUrl: e.target.value })}
              className="w-full px-4 py-2 bg-dark-800 border border-dark-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Ordre d'affichage</label>
            <input
              type="number"
              value={editingProject.order}
              onChange={(e) => setEditingProject({ ...editingProject, order: parseInt(e.target.value) || 0 })}
              className="w-full px-4 py-2 bg-dark-800 border border-dark-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-gray-300">
              <input
                type="checkbox"
                checked={editingProject.published}
                onChange={(e) => setEditingProject({ ...editingProject, published: e.target.checked })}
                className="w-4 h-4 rounded border-dark-700 bg-dark-800 text-primary-500 focus:ring-primary-500"
              />
              Publié
            </label>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Stack technique (une par ligne, identique dans les deux langues)
            </label>
            <textarea
              value={editingProject.stack.join('\n')}
              onChange={(e) => updateStack(e.target.value)}
              rows={4}
              className="w-full px-4 py-2 bg-dark-800 border border-dark-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
              placeholder="Django&#10;Vue.js&#10;PostgreSQL"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Fonctionnalités (traduit automatiquement en anglais) - une par ligne
            </label>
            <textarea
              value={editingProject.features.map(f => f.fr).join('\n')}
              onChange={(e) => updateBilingualArrayField('features', e.target.value)}
              rows={4}
              className="w-full px-4 py-2 bg-dark-800 border border-dark-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
              placeholder="Authentification sécurisée&#10;Tableau de bord interactif&#10;Export des données"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Défis techniques (traduit automatiquement en anglais) - un par ligne
            </label>
            <textarea
              value={editingProject.challenges.map(c => c.fr).join('\n')}
              onChange={(e) => updateBilingualArrayField('challenges', e.target.value)}
              rows={4}
              className="w-full px-4 py-2 bg-dark-800 border border-dark-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
              placeholder="Optimisation des performances&#10;Gestion du cache&#10;Sécurité des données"
            />
          </div>
        </div>

        <div className="flex justify-end gap-4 pt-4 border-t border-dark-800">
          <button
            onClick={handleCancel}
            className="px-4 py-2 text-gray-400 hover:text-white"
          >
            Annuler
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors"
          >
            {saving ? 'Sauvegarde...' : 'Enregistrer'}
          </button>
        </div>
      </div>
    );
  }

  // Projects List
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

      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white">Projets ({projects.length})</h2>
        <button
          onClick={handleNew}
          className="px-4 py-2 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors"
        >
          + Nouveau projet
        </button>
      </div>

      {projects.length === 0 ? (
        <p className="text-gray-400">Aucun projet. Créez votre premier projet!</p>
      ) : (
        <div className="space-y-4">
          {projects.map((project) => (
            <div
              key={project.id}
              className="flex items-center justify-between p-4 bg-dark-800 rounded-lg border border-dark-700"
            >
              <div>
                <h3 className="font-medium text-white">{getDisplayTitle(project)}</h3>
                <p className="text-sm text-gray-400">{getDisplayDescription(project)}</p>
                <div className="flex gap-2 mt-2">
                  {project.stack.slice(0, 3).map((tech) => (
                    <span key={tech} className="text-xs px-2 py-1 bg-dark-700 rounded text-gray-300">
                      {tech}
                    </span>
                  ))}
                  {!project.published && (
                    <span className="text-xs px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded">
                      Brouillon
                    </span>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(project)}
                  className="px-3 py-1 text-sm text-primary-400 hover:text-primary-300 hover:bg-primary-500/20 rounded transition-colors"
                >
                  Modifier
                </button>
                <button
                  onClick={() => handleDelete(project.id!)}
                  className="px-3 py-1 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded transition-colors"
                >
                  Supprimer
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
