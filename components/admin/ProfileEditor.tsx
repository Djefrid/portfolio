/**
 * ============================================================================
 * ÉDITEUR DE PROFIL ADMIN — components/admin/ProfileEditor.tsx
 * ============================================================================
 *
 * Formulaire d'édition du profil personnel du portfolio, accessible depuis
 * l'onglet "Profil" du panneau d'administration.
 *
 * Flux de sauvegarde en 3 étapes (handleSave) :
 *   1. Traduction automatique (FR → EN) via /api/translate
 *      → Le contenu est toujours rédigé en français, l'anglais est généré
 *   2. Sauvegarde dans Firebase Firestore (source de vérité)
 *      → updateProfile() écrit le document dans la collection "profile"
 *   3. Synchronisation du fichier statique local via /api/sync-data
 *      → Met à jour portfolio-data.ts pour le fallback et le build Next.js
 *
 * Gestion des formats hérités (legacy) :
 *   Firestore peut contenir 3 générations de format de données :
 *   - Ancien : { fr: string[], en: string[] }   (BilingualArray)
 *   - Intermédiaire : string[]                  (tableau simple)
 *   - Actuel : { fr: string, en: string }[]     (tableau de BilingualText)
 *   Les fonctions ensureBilingualText et ensureBilingualParagraphs normalisent
 *   tous ces formats vers le format actuel avant l'affichage dans le formulaire.
 *
 * Champs du profil :
 *   - name, location, openToWork (identiques FR/EN)
 *   - title (bilingue — FR saisi, EN auto-traduit)
 *   - stack (liste de technologies, identique FR/EN)
 *   - email, github, linkedin, cvUrl (identiques FR/EN)
 *   - about.paragraphs (bilingue — FR saisi, EN auto-traduit)
 *   - about.highlights (bilingue — FR saisi, EN auto-traduit)
 * ============================================================================
 */

"use client";

import { useState, useEffect } from 'react';
import { getProfile, updateProfile } from '@/lib/firebase';
import type { ProfileData, BilingualText, BilingualArray } from '@/types/firebase';

/**
 * Type interne de l'état de l'éditeur.
 * Toutes les valeurs bilingues sont stockées au format BilingualText[] (actuel)
 * pour permettre l'édition champ par champ, peu importe le format d'origine.
 */
interface ProfileEditorState {
  name: string;
  title: BilingualText;
  stack: string[];
  email: string;
  github: string;
  linkedin: string;
  cvUrl: string;
  location: string;
  openToWork: boolean;
  about: {
    /** Paragraphes de la section "À propos" */
    paragraphs: BilingualText[];
    /** Points clés / faits saillants affichés sous les paragraphes */
    highlights: BilingualText[];
  };
}

/**
 * Normalise une valeur inconnue vers le format BilingualText { fr, en }.
 * Couvre 3 cas :
 *   - Déjà en format BilingualText → retourné tel quel
 *   - Chaîne simple (legacy) → { fr: str, en: str }
 *   - Autre (null, undefined, etc.) → { fr: defaultValue, en: defaultValue }
 *
 * @param value        - Valeur à normaliser (provenance Firestore inconnue)
 * @param defaultValue - Valeur de repli si la conversion échoue (défaut: '')
 * @returns BilingualText normalisé
 */
function ensureBilingualText(value: unknown, defaultValue = ''): BilingualText {
  if (typeof value === 'object' && value !== null && 'fr' in value && 'en' in value) {
    return value as BilingualText;
  }
  const str = typeof value === 'string' ? value : defaultValue;
  return { fr: str, en: str };
}

/**
 * Normalise une valeur inconnue vers un tableau de BilingualText.
 * Couvre 3 générations de format :
 *   1. Format actuel  : { fr: string, en: string }[]  → retourné tel quel
 *   2. Format legacy  : { fr: string[], en: string[] } → converti element par element
 *   3. Format ancien  : string[]                       → chaque item devient { fr, en }
 *   4. Autre          : utilise defaultValue[] comme repli
 *
 * @param value        - Valeur brute issue de Firestore
 * @param defaultValue - Tableau de chaînes de repli si la conversion échoue
 * @returns Tableau de BilingualText normalisé
 */
function ensureBilingualParagraphs(value: unknown, defaultValue: string[] = ['']): BilingualText[] {
  // Format actuel : tableau d'objets { fr, en }
  if (Array.isArray(value) && value.length > 0 && typeof value[0] === 'object' && 'fr' in value[0]) {
    return value as BilingualText[];
  }

  // Format legacy : objet { fr: string[], en: string[] }
  if (typeof value === 'object' && value !== null && 'fr' in value && 'en' in value) {
    const bilingualArray = value as { fr: string[]; en: string[] };
    // Utilise la longueur maximale pour ne pas tronquer la langue la plus longue
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

  // Format ancien : tableau de chaînes simples (même texte pour les deux langues)
  if (Array.isArray(value)) {
    return value.map(item => ({ fr: String(item), en: String(item) }));
  }

  // Repli total : convertit defaultValue en BilingualText[]
  return defaultValue.map(item => ({ fr: item, en: item }));
}

/**
 * Convertit l'état interne de l'éditeur vers le format Firebase (ProfileData).
 * Les paragraphes et highlights stockés en tableau de BilingualText sont
 * re-séparés en { fr: string[], en: string[] } pour Firestore.
 *
 * @param state - État interne de l'éditeur
 * @returns ProfileData compatible avec Firestore
 */
function toFirebaseFormat(state: ProfileEditorState): ProfileData {
  return {
    name: state.name,
    title: state.title,
    stack: state.stack,
    email: state.email,
    github: state.github,
    linkedin: state.linkedin,
    cvUrl: state.cvUrl,
    location: state.location,
    openToWork: state.openToWork,
    about: {
      // Re-sépare chaque BilingualText en deux tableaux parallèles (format Firestore)
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

/**
 * État initial vide utilisé avant le chargement Firebase.
 * Garantit que le formulaire est toujours rendu avec des valeurs définies.
 */
const defaultProfile: ProfileEditorState = {
  name: '',
  title: { fr: '', en: '' },
  stack: [],
  email: '',
  github: '',
  linkedin: '',
  cvUrl: '',
  location: '',
  openToWork: false,
  about: {
    paragraphs: [{ fr: '', en: '' }],
    highlights: [{ fr: '', en: '' }],
  },
};

/**
 * Composant principal de l'éditeur de profil.
 * Chargé dans l'onglet "Profil" de l'admin panel (/admin?tab=profile).
 */
export default function ProfileEditor() {
  /** Données du profil dans l'état de l'éditeur (format BilingualText[]) */
  const [profile, setProfile] = useState<ProfileEditorState>(defaultProfile);

  /** true pendant le chargement initial depuis Firebase */
  const [loading, setLoading] = useState(true);

  /** true pendant les 3 étapes de sauvegarde (translate → Firebase → sync) */
  const [saving, setSaving] = useState(false);

  /**
   * Message de retour affiché après une action (succès ou erreur).
   * Nullable : null = aucun message affiché.
   * Auto-effacé après 8 secondes via setTimeout dans handleSave.
   */
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  /**
   * Langue d'édition fixée à 'fr'.
   * L'admin rédige toujours en français ; l'anglais est généré automatiquement
   * par l'API DeepL lors de la sauvegarde. `as const` force le type littéral
   * 'fr' plutôt que string, nécessaire pour l'API /api/translate.
   */
  const activeLang = 'fr' as const;

  /**
   * Charge le profil depuis Firebase au montage du composant.
   * Dépendances vides [] → exécuté une seule fois à l'initialisation.
   */
  useEffect(() => {
    loadProfile();
  }, []);

  /**
   * Charge le profil depuis Firestore et normalise les données legacy.
   * Si Firebase retourne null (collection vide), le defaultProfile reste actif.
   * Appelle ensureBilingualText et ensureBilingualParagraphs sur chaque champ
   * pour garantir que le formulaire reçoit toujours des données bien structurées.
   */
  const loadProfile = async () => {
    const data = await getProfile();
    if (data) {
      const convertedProfile: ProfileEditorState = {
        name: data.name || '',
        // Normalise le titre : peut être une string ou un objet { fr, en }
        title: ensureBilingualText(data.title),
        stack: data.stack || [],
        email: data.email || '',
        github: data.github || '',
        linkedin: data.linkedin || '',
        cvUrl: data.cvUrl || '',
        location: data.location || '',
        openToWork: data.openToWork ?? false,
        about: {
          // Normalise les paragraphes : peut être string[], BilingualArray, ou BilingualText[]
          paragraphs: ensureBilingualParagraphs(data.about?.paragraphs),
          highlights: ensureBilingualParagraphs(data.about?.highlights),
        },
      };
      setProfile(convertedProfile);
    }
    setLoading(false);
  };

  /**
   * Orchestre la sauvegarde en 3 étapes séquentielles :
   *   1. Traduction automatique FR → EN via /api/translate (DeepL)
   *      En cas d'erreur API, continue avec les données FR uniquement.
   *   2. Sauvegarde dans Firebase Firestore via updateProfile()
   *   3. Sync du fichier portfolio-data.ts local via /api/sync-data
   *      (dev seulement — en production, Firestore est la seule source)
   * Affiche des messages de progression à chaque étape.
   * Désactive le bouton pendant l'opération via `saving`.
   */
  const handleSave = async () => {
    setSaving(true);
    setMessage(null);

    try {
      // ── Étape 1 : Traduction automatique FR → EN ──────────────────────────
      setMessage({ type: 'success', text: 'Traduction automatique en cours...' });

      // Convertit d'abord l'état interne vers le format Firestore
      const firebaseData = toFirebaseFormat(profile);

      const translateResponse = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'profile',
          data: firebaseData,
          sourceLang: activeLang, // Toujours 'fr' (langue d'édition)
        }),
      });

      let dataToSave = firebaseData;
      if (translateResponse.ok) {
        const translateResult = await translateResponse.json();
        // Utilise la version traduite uniquement si la traduction a réussi
        if (translateResult.success && translateResult.data) {
          dataToSave = translateResult.data;
        }
      }
      // Si la traduction échoue : on continue avec dataToSave = firebaseData (FR uniquement)

      // ── Étape 2 : Sauvegarde Firebase Firestore ───────────────────────────
      setMessage({ type: 'success', text: 'Sauvegarde Firebase...' });
      const firebaseSuccess = await updateProfile(dataToSave);

      if (firebaseSuccess) {
        // ── Étape 3 : Synchronisation du fichier local ──────────────────────
        setMessage({ type: 'success', text: 'Synchronisation fichier local...' });

        const syncResponse = await fetch('/api/sync-data', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'profile', data: dataToSave }),
        });

        if (syncResponse.ok) {
          setMessage({ type: 'success', text: 'Profil traduit et synchronisé (Firebase + fichier local)!' });
        } else {
          // Firebase OK mais sync local échoué (non bloquant en production)
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
    // Masque le message de résultat automatiquement après 8 secondes
    setTimeout(() => setMessage(null), 8000);
  };

  /**
   * Met à jour la liste de technologies du stack.
   * La valeur est une chaîne séparée par des virgules → splitée + trimée.
   * Les chaînes vides sont filtrées (filter(Boolean)).
   *
   * @param value - Chaîne CSV des technologies (ex: "React, Next.js, TypeScript")
   */
  const updateStack = (value: string) => {
    setProfile({ ...profile, stack: value.split(',').map(s => s.trim()).filter(Boolean) });
  };

  /**
   * Met à jour uniquement la valeur FR du titre.
   * L'EN sera généré automatiquement lors de la prochaine sauvegarde.
   * Garde l'EN existant intact pour ne pas le perdre.
   *
   * @param value - Nouveau titre en français
   */
  const updateTitle = (value: string) => {
    setProfile({
      ...profile,
      title: { ...profile.title, fr: value },
    });
  };

  /**
   * Met à jour la valeur FR d'un paragraphe spécifique de la section About.
   * Utilise l'index pour cibler l'élément, crée une copie du tableau (immutabilité React).
   *
   * @param index - Position du paragraphe dans le tableau
   * @param value - Nouveau texte en français
   */
  const updateParagraph = (index: number, value: string) => {
    const paragraphs = [...profile.about.paragraphs];
    paragraphs[index] = { ...paragraphs[index], fr: value };
    setProfile({ ...profile, about: { ...profile.about, paragraphs } });
  };

  /**
   * Ajoute un nouveau paragraphe vide (FR et EN à '') à la fin de la liste.
   * L'EN sera traduit au prochain handleSave.
   */
  const addParagraph = () => {
    setProfile({
      ...profile,
      about: {
        ...profile.about,
        paragraphs: [...profile.about.paragraphs, { fr: '', en: '' }],
      },
    });
  };

  /**
   * Supprime un paragraphe à une position donnée.
   * filter((_, i) => i !== index) crée un nouveau tableau sans l'élément.
   *
   * @param index - Position du paragraphe à supprimer
   */
  const removeParagraph = (index: number) => {
    const paragraphs = profile.about.paragraphs.filter((_, i) => i !== index);
    setProfile({ ...profile, about: { ...profile.about, paragraphs } });
  };

  /**
   * Met à jour la valeur FR d'un point clé (highlight) spécifique.
   *
   * @param index - Position du highlight dans le tableau
   * @param value - Nouveau texte en français
   */
  const updateHighlight = (index: number, value: string) => {
    const highlights = [...profile.about.highlights];
    highlights[index] = { ...highlights[index], fr: value };
    setProfile({ ...profile, about: { ...profile.about, highlights } });
  };

  /**
   * Ajoute un nouveau point clé vide (FR et EN à '') à la fin de la liste.
   */
  const addHighlight = () => {
    setProfile({
      ...profile,
      about: {
        ...profile.about,
        highlights: [...profile.about.highlights, { fr: '', en: '' }],
      },
    });
  };

  /**
   * Supprime un point clé à une position donnée.
   *
   * @param index - Position du highlight à supprimer
   */
  const removeHighlight = (index: number) => {
    const highlights = profile.about.highlights.filter((_, i) => i !== index);
    setProfile({ ...profile, about: { ...profile.about, highlights } });
  };

  // ── Rendu conditionnel : spinner de chargement ─────────────────────────────
  if (loading) {
    return <div className="text-gray-400">Chargement...</div>;
  }

  return (
    <div className="space-y-8">

      {/* ── Message de retour (succès / erreur / progression) ── */}
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

      {/* ── Section Hero : nom, localisation, disponibilité, titre, stack ── */}
      <section>
        <h2 className="text-xl font-semibold text-white mb-4">Section Hero</h2>
        <div className="grid gap-4 sm:grid-cols-2">

          {/* Nom — identique dans les deux langues, non traduit */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Nom (identique dans les deux langues)</label>
            <input
              type="text"
              value={profile.name}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              className="w-full px-4 py-2 bg-dark-800 border border-dark-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {/* Localisation — identique FR/EN (ex: "Montréal, QC") */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Localisation (ex: Montréal, QC)</label>
            <input
              type="text"
              value={profile.location}
              onChange={(e) => setProfile({ ...profile, location: e.target.value })}
              placeholder="Montréal, QC"
              className="w-full px-4 py-2 bg-dark-800 border border-dark-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {/* Toggle "Open to Work" — active le badge pulsé dans le Hero */}
          <div className="sm:col-span-2 flex items-center gap-3">
            <button
              type="button"
              onClick={() => setProfile({ ...profile, openToWork: !profile.openToWork })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-dark-900 ${
                profile.openToWork ? 'bg-green-500' : 'bg-dark-600'
              }`}
              aria-label="Disponible pour travailler"
            >
              {/* Indicateur visuel (cercle blanc) qui glisse selon l'état */}
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  profile.openToWork ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
            <label className="text-sm font-medium text-gray-300">
              Disponible pour travailler (badge &quot;Open to Work&quot;)
              {profile.openToWork && <span className="ml-2 text-green-400">● Activé</span>}
            </label>
          </div>

          {/* Titre / Poste — saisi en FR, traduit automatiquement en EN au save */}
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

          {/* Stack technique — liste CSV affichée sous forme de badges */}
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
            {/* Aperçu des badges du stack en temps réel */}
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

      {/* ── Liens de contact — identiques FR/EN, non traduits ── */}
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

      {/* ── Section À propos — paragraphes + points clés, traduits en EN au save ── */}
      <section>
        <h2 className="text-xl font-semibold text-white mb-4">
          Section À propos (traduit automatiquement en anglais)
        </h2>

        {/* Paragraphes — texte long bilingue de la section About */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Paragraphes
          </label>
          {profile.about.paragraphs.map((paragraph, index) => (
            <div key={index} className="flex gap-2 mb-2">
              {/* Seule la version FR est éditée — l'EN est auto-traduit au save */}
              <textarea
                value={paragraph.fr}
                onChange={(e) => updateParagraph(index, e.target.value)}
                rows={3}
                className="flex-1 px-4 py-2 bg-dark-800 border border-dark-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
              />
              {/* Bouton suppression — désactivé s'il n'y a qu'un seul paragraphe serait souhaitable */}
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

        {/* Points clés (highlights) — liste de faits saillants affichés dans About */}
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
              {/* self-start aligne le bouton en haut du textarea (pas centré verticalement) */}
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

      {/* ── Bouton de sauvegarde — déclenche les 3 étapes séquentielles ── */}
      <div className="flex justify-end pt-4 border-t border-dark-800">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving} // Désactivé pendant l'opération pour éviter les doubles sauvegardes
          className="px-6 py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {saving ? 'Sauvegarde...' : 'Enregistrer'}
        </button>
      </div>

    </div>
  );
}
