/**
 * ============================================================================
 * ÉDITEUR DE COMPÉTENCES - Panneau admin pour gérer les catégories de skills
 * ============================================================================
 *
 * Ce composant permet à l'admin de :
 * - Voir toutes les catégories de compétences
 * - Ajouter une nouvelle catégorie (avec labels FR et EN)
 * - Modifier une catégorie existante (labels et compétences)
 * - Supprimer une catégorie
 * - Réordonner les catégories (monter/descendre)
 * - Sauvegarder tout vers Firebase Firestore
 *
 * Les modifications sont stockées localement dans le state React,
 * puis envoyées à Firebase quand l'admin clique "Sauvegarder tout".
 * ============================================================================
 */

"use client";

import { useState, useEffect } from 'react';
import { getSkillsNew, updateSkillsNew } from '@/lib/firebase';
import type { SkillCategoryData, SkillsDataNew } from '@/types/firebase';

/**
 * Génère un identifiant unique (slug) à partir du label français.
 * Ex: "Cloud & Hébergement" → "cloud-hebergement"
 *
 * Étapes :
 * 1. Convertit en minuscules
 * 2. Supprime les accents (normalize NFD + regex)
 * 3. Remplace les caractères non-alphanumériques par des tirets
 * 4. Supprime les tirets au début/fin
 */
function generateId(label: string): string {
  return label
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

/** Template vide pour créer une nouvelle catégorie */
const emptyCategory: Omit<SkillCategoryData, 'id' | 'order'> = {
  labelFr: '',
  labelEn: '',
  skills: [],
};

export default function SkillsEditor() {
  // --- State principal ---
  const [categories, setCategories] = useState<SkillCategoryData[]>([]); // Liste des catégories
  const [loading, setLoading] = useState(true);    // Chargement initial depuis Firebase
  const [saving, setSaving] = useState(false);      // Sauvegarde en cours
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // --- State du mode édition ---
  const [editingCategory, setEditingCategory] = useState<SkillCategoryData | null>(null); // Catégorie en cours d'édition
  const [isNewCategory, setIsNewCategory] = useState(false); // true = ajout, false = modification

  /** Charge les compétences depuis Firebase au montage du composant */
  useEffect(() => {
    loadSkills();
  }, []);

  /** Récupère les compétences depuis Firestore et les trie par ordre */
  const loadSkills = async () => {
    const data = await getSkillsNew();
    if (data && data.categories) {
      const sorted = [...data.categories].sort((a, b) => a.order - b.order);
      setCategories(sorted);
    }
    setLoading(false);
  };

  /** Sauvegarde TOUTES les catégories vers Firebase Firestore */
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

  /** Ouvre le formulaire pour créer une nouvelle catégorie */
  const handleAddCategory = () => {
    const newCategory: SkillCategoryData = {
      ...emptyCategory,
      id: `new-${Date.now()}`,       // ID temporaire, sera remplacé par le slug du label
      order: categories.length,       // Ajouté à la fin de la liste
    };
    setEditingCategory(newCategory);
    setIsNewCategory(true);
  };

  /** Ouvre le formulaire pour modifier une catégorie existante */
  const handleEditCategory = (category: SkillCategoryData) => {
    setEditingCategory({ ...category }); // Copie pour ne pas modifier l'original
    setIsNewCategory(false);
  };

  /** Supprime une catégorie (avec confirmation) et recalcule les ordres */
  const handleDeleteCategory = (id: string) => {
    if (!confirm('Supprimer cette catégorie et toutes ses compétences?')) return;

    const updated = categories
      .filter(c => c.id !== id)                        // Supprime la catégorie
      .map((c, index) => ({ ...c, order: index }));    // Recalcule les ordres
    setCategories(updated);
  };

  /** Déplace une catégorie vers le haut ou le bas dans la liste */
  const handleMoveCategory = (index: number, direction: 'up' | 'down') => {
    // Vérifie les limites
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === categories.length - 1) return;

    const newIndex = direction === 'up' ? index - 1 : index + 1;
    const updated = [...categories];
    // Échange les deux catégories (swap)
    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];

    // Recalcule les ordres après le déplacement
    const reordered = updated.map((c, i) => ({ ...c, order: i }));
    setCategories(reordered);
  };

  /** Valide et enregistre la catégorie en cours d'édition dans le state local */
  const handleSaveCategory = () => {
    if (!editingCategory) return;

    // Validation : les deux labels sont obligatoires
    if (!editingCategory.labelFr.trim() || !editingCategory.labelEn.trim()) {
      setMessage({ type: 'error', text: 'Les labels FR et EN sont requis' });
      return;
    }

    // Pour une nouvelle catégorie, génère un ID à partir du label français
    const categoryToSave: SkillCategoryData = {
      ...editingCategory,
      id: isNewCategory ? generateId(editingCategory.labelFr) : editingCategory.id,
    };

    // Ajoute ou met à jour dans la liste locale
    if (isNewCategory) {
      setCategories([...categories, categoryToSave]);
    } else {
      setCategories(categories.map(c => c.id === categoryToSave.id ? categoryToSave : c));
    }

    // Ferme le formulaire d'édition
    setEditingCategory(null);
    setIsNewCategory(false);
  };

  /** Annule l'édition en cours et ferme le formulaire */
  const handleCancelEdit = () => {
    setEditingCategory(null);
    setIsNewCategory(false);
  };

  /**
   * Met à jour la liste des compétences d'une catégorie.
   * Les compétences sont séparées par des virgules dans le textarea.
   * Ex: "React, Vue.js, TypeScript" → ["React", "Vue.js", "TypeScript"]
   */
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
