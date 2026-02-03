"use client";

import { useState, useEffect } from 'react';
import { getProjects, addProject, updateProject, deleteProject } from '@/lib/firebase';
import type { ProjectData } from '@/types/firebase';

const emptyProject: Omit<ProjectData, 'id'> = {
  title: '',
  description: '',
  longDescription: '',
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
  const [editingProject, setEditingProject] = useState<ProjectData | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    const data = await getProjects();
    setProjects(data);
    setLoading(false);
  };

  const handleNew = () => {
    setEditingProject({ ...emptyProject, order: projects.length } as ProjectData);
    setIsNew(true);
  };

  const handleEdit = (project: ProjectData) => {
    setEditingProject({ ...project });
    setIsNew(false);
  };

  const handleCancel = () => {
    setEditingProject(null);
    setIsNew(false);
  };

  const handleSave = async () => {
    if (!editingProject) return;

    setSaving(true);
    setMessage(null);

    let success = false;

    if (isNew) {
      const { id, ...data } = editingProject;
      const newId = await addProject(data);
      success = !!newId;
    } else {
      success = await updateProject(editingProject.id!, editingProject);
    }

    if (success) {
      setMessage({ type: 'success', text: 'Projet sauvegardé!' });
      await loadProjects();
      handleCancel();
    } else {
      setMessage({ type: 'error', text: 'Erreur lors de la sauvegarde' });
    }

    setSaving(false);
    setTimeout(() => setMessage(null), 3000);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer ce projet?')) return;

    const success = await deleteProject(id);
    if (success) {
      await loadProjects();
      setMessage({ type: 'success', text: 'Projet supprimé!' });
    } else {
      setMessage({ type: 'error', text: 'Erreur lors de la suppression' });
    }
    setTimeout(() => setMessage(null), 3000);
  };

  const updateArrayField = (field: 'stack' | 'features' | 'challenges', value: string) => {
    if (!editingProject) return;
    setEditingProject({
      ...editingProject,
      [field]: value.split('\n').filter(Boolean),
    });
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
            <label className="block text-sm font-medium text-gray-300 mb-2">Titre</label>
            <input
              type="text"
              value={editingProject.title}
              onChange={(e) => setEditingProject({ ...editingProject, title: e.target.value })}
              className="w-full px-4 py-2 bg-dark-800 border border-dark-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-300 mb-2">Description courte</label>
            <input
              type="text"
              value={editingProject.description}
              onChange={(e) => setEditingProject({ ...editingProject, description: e.target.value })}
              className="w-full px-4 py-2 bg-dark-800 border border-dark-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-300 mb-2">Description longue</label>
            <textarea
              value={editingProject.longDescription}
              onChange={(e) => setEditingProject({ ...editingProject, longDescription: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 bg-dark-800 border border-dark-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
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
              Stack technique (une par ligne)
            </label>
            <textarea
              value={editingProject.stack.join('\n')}
              onChange={(e) => updateArrayField('stack', e.target.value)}
              rows={4}
              className="w-full px-4 py-2 bg-dark-800 border border-dark-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
              placeholder="Django&#10;Vue.js&#10;PostgreSQL"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Fonctionnalités (une par ligne)
            </label>
            <textarea
              value={editingProject.features.join('\n')}
              onChange={(e) => updateArrayField('features', e.target.value)}
              rows={4}
              className="w-full px-4 py-2 bg-dark-800 border border-dark-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Défis techniques (un par ligne)
            </label>
            <textarea
              value={editingProject.challenges.join('\n')}
              onChange={(e) => updateArrayField('challenges', e.target.value)}
              rows={4}
              className="w-full px-4 py-2 bg-dark-800 border border-dark-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
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
            {saving ? 'Sauvegarde...' : 'Sauvegarder'}
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
                <h3 className="font-medium text-white">{project.title}</h3>
                <p className="text-sm text-gray-400">{project.description}</p>
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
