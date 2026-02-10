"use client";

import { useState, useEffect } from 'react';
import { getSkillsNew, updateSkillsNew } from '@/lib/firebase';
import type { SkillCategoryData, SkillsDataNew } from '@/types/firebase';

// Generate a unique ID for new categories
function generateId(label: string): string {
  return label
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

// Empty category template
const emptyCategory: Omit<SkillCategoryData, 'id' | 'order'> = {
  labelFr: '',
  labelEn: '',
  skills: [],
};

export default function SkillsEditor() {
  const [categories, setCategories] = useState<SkillCategoryData[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Edit mode state
  const [editingCategory, setEditingCategory] = useState<SkillCategoryData | null>(null);
  const [isNewCategory, setIsNewCategory] = useState(false);

  useEffect(() => {
    loadSkills();
  }, []);

  const loadSkills = async () => {
    const data = await getSkillsNew();
    if (data && data.categories) {
      // Sort by order
      const sorted = [...data.categories].sort((a, b) => a.order - b.order);
      setCategories(sorted);
    }
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);

    const dataToSave: SkillsDataNew = { categories };
    const success = await updateSkillsNew(dataToSave);

    if (success) {
      setMessage({ type: 'success', text: 'Compétences mises à jour!' });
    } else {
      setMessage({ type: 'error', text: 'Erreur lors de la sauvegarde' });
    }

    setSaving(false);
    setTimeout(() => setMessage(null), 3000);
  };

  // Add new category
  const handleAddCategory = () => {
    const newCategory: SkillCategoryData = {
      ...emptyCategory,
      id: `new-${Date.now()}`,
      order: categories.length,
    };
    setEditingCategory(newCategory);
    setIsNewCategory(true);
  };

  // Edit existing category
  const handleEditCategory = (category: SkillCategoryData) => {
    setEditingCategory({ ...category });
    setIsNewCategory(false);
  };

  // Delete category
  const handleDeleteCategory = (id: string) => {
    if (!confirm('Supprimer cette catégorie et toutes ses compétences?')) return;

    const updated = categories
      .filter(c => c.id !== id)
      .map((c, index) => ({ ...c, order: index }));
    setCategories(updated);
  };

  // Move category up/down
  const handleMoveCategory = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === categories.length - 1) return;

    const newIndex = direction === 'up' ? index - 1 : index + 1;
    const updated = [...categories];
    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];

    // Update order values
    const reordered = updated.map((c, i) => ({ ...c, order: i }));
    setCategories(reordered);
  };

  // Save category being edited
  const handleSaveCategory = () => {
    if (!editingCategory) return;
    if (!editingCategory.labelFr.trim() || !editingCategory.labelEn.trim()) {
      setMessage({ type: 'error', text: 'Les labels FR et EN sont requis' });
      return;
    }

    // Generate ID from French label if new
    const categoryToSave: SkillCategoryData = {
      ...editingCategory,
      id: isNewCategory ? generateId(editingCategory.labelFr) : editingCategory.id,
    };

    if (isNewCategory) {
      setCategories([...categories, categoryToSave]);
    } else {
      setCategories(categories.map(c => c.id === categoryToSave.id ? categoryToSave : c));
    }

    setEditingCategory(null);
    setIsNewCategory(false);
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setEditingCategory(null);
    setIsNewCategory(false);
  };

  // Update skills in a category
  const updateCategorySkills = (value: string) => {
    if (!editingCategory) return;
    setEditingCategory({
      ...editingCategory,
      skills: value.split(',').map(s => s.trim()).filter(Boolean),
    });
  };

  if (loading) {
    return <div className="text-gray-400">Chargement...</div>;
  }

  // Edit mode UI
  if (editingCategory) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">
            {isNewCategory ? 'Nouvelle catégorie' : 'Modifier la catégorie'}
          </h2>
          <button
            onClick={handleCancelEdit}
            className="text-gray-400 hover:text-white"
          >
            ✕ Annuler
          </button>
        </div>

        <div className="space-y-4">
          {/* French Label */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Nom de la catégorie (Français) *
            </label>
            <input
              type="text"
              value={editingCategory.labelFr}
              onChange={(e) => setEditingCategory({ ...editingCategory, labelFr: e.target.value })}
              className="w-full px-4 py-2 bg-dark-800 border border-dark-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Ex: Frontend, Backend, DevOps..."
            />
          </div>

          {/* English Label */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Nom de la catégorie (English) *
            </label>
            <input
              type="text"
              value={editingCategory.labelEn}
              onChange={(e) => setEditingCategory({ ...editingCategory, labelEn: e.target.value })}
              className="w-full px-4 py-2 bg-dark-800 border border-dark-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Ex: Frontend, Backend, DevOps..."
            />
          </div>

          {/* Skills */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Compétences (séparées par des virgules)
            </label>
            <textarea
              value={editingCategory.skills.join(', ')}
              onChange={(e) => updateCategorySkills(e.target.value)}
              rows={3}
              className="w-full px-4 py-2 bg-dark-800 border border-dark-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500 resize-y"
              placeholder="Ex: React, Vue.js, TypeScript, HTML5, CSS3..."
            />
            <div className="flex flex-wrap gap-2 mt-2">
              {editingCategory.skills.map((skill) => (
                <span
                  key={skill}
                  className="text-xs px-2 py-1 bg-primary-500/20 text-primary-400 rounded"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-dark-800">
          <button
            onClick={handleCancelEdit}
            className="px-4 py-2 bg-dark-700 text-white rounded-lg hover:bg-dark-600 transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={handleSaveCategory}
            className="px-6 py-2 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors"
          >
            {isNewCategory ? 'Ajouter' : 'Enregistrer'}
          </button>
        </div>
      </div>
    );
  }

  // Main list UI
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
        <div>
          <h2 className="text-xl font-semibold text-white">Catégories de compétences</h2>
          <p className="text-gray-400 text-sm mt-1">
            Gérez vos catégories et compétences. Les labels sont affichés selon la langue du site.
          </p>
        </div>
        <button
          onClick={handleAddCategory}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
        >
          <span>+</span> Nouvelle catégorie
        </button>
      </div>

      {categories.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <p>Aucune catégorie. Cliquez sur &quot;Nouvelle catégorie&quot; pour commencer.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {categories.map((category, index) => (
            <div
              key={category.id}
              className="bg-dark-800 border border-dark-700 rounded-lg p-4"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-medium text-white">{category.labelFr}</h3>
                  <p className="text-sm text-gray-400">{category.labelEn}</p>
                </div>
                <div className="flex items-center gap-2">
                  {/* Move buttons */}
                  <button
                    onClick={() => handleMoveCategory(index, 'up')}
                    disabled={index === 0}
                    className="p-1 text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Monter"
                  >
                    ↑
                  </button>
                  <button
                    onClick={() => handleMoveCategory(index, 'down')}
                    disabled={index === categories.length - 1}
                    className="p-1 text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Descendre"
                  >
                    ↓
                  </button>
                  {/* Edit button */}
                  <button
                    onClick={() => handleEditCategory(category)}
                    className="px-3 py-1 text-sm bg-primary-600/20 text-primary-400 rounded hover:bg-primary-600/30 transition-colors"
                  >
                    Modifier
                  </button>
                  {/* Delete button */}
                  <button
                    onClick={() => handleDeleteCategory(category.id)}
                    className="px-3 py-1 text-sm bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 transition-colors"
                  >
                    Supprimer
                  </button>
                </div>
              </div>

              {/* Skills preview */}
              <div className="flex flex-wrap gap-2">
                {category.skills.length > 0 ? (
                  category.skills.map((skill) => (
                    <span
                      key={skill}
                      className="text-xs px-2 py-1 bg-dark-700 text-gray-300 rounded"
                    >
                      {skill}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-gray-500 italic">Aucune compétence</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex justify-end pt-4 border-t border-dark-800">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {saving ? 'Sauvegarde...' : 'Sauvegarder tout'}
        </button>
      </div>
    </div>
  );
}
