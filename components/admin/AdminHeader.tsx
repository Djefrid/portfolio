/**
 * ============================================================================
 * HEADER ADMIN — components/admin/AdminHeader.tsx
 * ============================================================================
 *
 * Barre de navigation du panneau d'administration.
 * Affichée en haut de toutes les pages admin (via app/admin/page.tsx).
 *
 * Contenu :
 *   - Lien "Admin" → retourne au tableau de bord (/admin)
 *   - Lien "Voir le site" → ouvre le portfolio public dans un nouvel onglet
 *   - Bouton "Déconnexion" → déconnecte l'utilisateur et redirige vers /admin/login
 *
 * Flux de déconnexion (handleSignOut) :
 *   1. Appelle signOut() de Firebase Auth (depuis useAuthContext)
 *   2. Redirige vers /admin/login via useRouter
 *
 * Client Component requis pour useAuthContext() et useRouter().
 * ============================================================================
 */

"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '@/lib/firebase';

/**
 * Barre de navigation du panneau admin.
 * Fournit la navigation et la déconnexion.
 */
export default function AdminHeader() {
  const { signOut } = useAuthContext();
  const router      = useRouter();

  /**
   * Déconnecte l'utilisateur Firebase et redirige vers la page de connexion.
   * signOut() est asynchrone mais la redirection n'attend pas son résultat
   * (pas de await sur router.push) car next/navigation gère la navigation
   * indépendamment de l'état async.
   */
  const handleSignOut = async () => {
    await signOut();
    router.push('/admin/login');
  };

  return (
    <header className="bg-dark-900 border-b border-dark-800">
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">

          {/* ── Navigation gauche : accueil admin + lien vers le site public ── */}
          <div className="flex items-center gap-4">
            {/* Lien principal vers le tableau de bord admin */}
            <Link href="/admin" className="text-xl font-bold text-white">
              Admin
            </Link>
            {/* Lien vers le portfolio public — ouvre dans un nouvel onglet */}
            <Link
              href="/"
              target="_blank"
              className="text-sm text-gray-400 hover:text-primary-400 transition-colors"
            >
              Voir le site
            </Link>
          </div>

          {/* ── Bouton de déconnexion ── */}
          <button
            type="button"
            onClick={handleSignOut}
            className="px-4 py-2 text-sm text-gray-400 hover:text-white hover:bg-dark-800 rounded-lg transition-colors"
          >
            Déconnexion
          </button>

        </div>
      </div>
    </header>
  );
}
