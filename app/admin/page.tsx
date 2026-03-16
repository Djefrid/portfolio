/**
 * ============================================================================
 * PAGE DASHBOARD ADMIN — app/admin/page.tsx
 * ============================================================================
 *
 * Tableau de bord de l'administration du portfolio.
 * Accessible uniquement après connexion (protégé par app/admin/layout.tsx
 * qui vérifie l'authentification Firebase).
 *
 * Fonctionnement :
 *   - La navigation entre onglets utilise les query params (?tab=xxx)
 *   - Cela permet l'URL partageable et le bookmark de chaque onglet
 *   - router.push() sans scroll: false éviterait de remonter en haut à chaque clic
 *
 * Les 4 onglets disponibles :
 *   1. "profile"  → ProfileEditor  : édite nom, titre, stack, liens, à propos
 *   2. "projects" → ProjectsEditor : ajoute/modifie/supprime des projets
 *   3. "skills"   → SkillsEditor   : gère les catégories et compétences
 *   4. "notes"    → NotesEditor    : éditeur de notes personnel (TipTap)
 *
 * Sécurité :
 *   - L'onglet actif est validé contre VALID_TABS pour éviter des valeurs injectées
 *   - La vérification d'authentification est faite dans le layout parent
 * ============================================================================
 */

"use client";

import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthContext } from '@/lib/firebase';
import AdminHeader from '@/components/admin/AdminHeader';
import ProfileEditor from '@/components/admin/ProfileEditor';
import ProjectsEditor from '@/components/admin/ProjectsEditor';
import SkillsEditor from '@/components/admin/SkillsEditor';
import NotesEditor from '@/components/admin/NotesEditor';

/** Type union des onglets valides du dashboard */
type Tab = 'profile' | 'projects' | 'skills' | 'notes';

/** Liste des onglets autorisés — utilisée pour valider le query param ?tab= */
const VALID_TABS: Tab[] = ['profile', 'projects', 'skills', 'notes'];

/**
 * Composant Dashboard Admin.
 * Gère la navigation par onglets via les query params de l'URL.
 */
export default function AdminDashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  // useAuthContext() fournit l'utilisateur connecté (vérifié dans le layout)
  const { user } = useAuthContext();

  // Lit le tab depuis l'URL, valide contre VALID_TABS, fallback sur 'profile'
  const rawTab = searchParams.get('tab') as Tab | null;
  const activeTab: Tab = rawTab && VALID_TABS.includes(rawTab) ? rawTab : 'profile';

  /**
   * Change l'onglet actif en modifiant le query param sans rechargement de page.
   * { scroll: false } empêche le scroll vers le haut lors du changement d'onglet.
   *
   * @param tab - L'onglet à activer
   */
  const setActiveTab = (tab: Tab) => {
    router.push(`/admin?tab=${tab}`, { scroll: false });
  };

  /** Définition des onglets avec leur identifiant et libellé d'affichage */
  const tabs: { id: Tab; label: string }[] = [
    { id: 'profile', label: 'Profil & À propos' },
    { id: 'projects', label: 'Projets' },
    { id: 'skills', label: 'Compétences' },
    { id: 'notes', label: '🗒 Notes' },
  ];

  return (
    <div className="min-h-screen bg-dark-950">
      {/* En-tête admin avec logo, email connecté et bouton déconnexion */}
      <AdminHeader />

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Titre du dashboard avec l'email de l'admin connecté */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
          <p className="text-gray-400">
            Connecté en tant que {user?.email}
          </p>
        </div>

        {/* Barre d'onglets de navigation */}
        <div className="flex gap-2 mb-8 border-b border-dark-800 pb-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-primary-600 text-white'           // Onglet actif
                  : 'text-gray-400 hover:text-white hover:bg-dark-800' // Onglet inactif
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Contenu de l'onglet actif — rendu conditionnel */}
        <div className="bg-dark-900 border border-dark-800 rounded-xl p-6">
          {activeTab === 'profile'  && <ProfileEditor />}
          {activeTab === 'projects' && <ProjectsEditor />}
          {activeTab === 'skills'   && <SkillsEditor />}
          {activeTab === 'notes'    && <NotesEditor />}
        </div>
      </main>
    </div>
  );
}
