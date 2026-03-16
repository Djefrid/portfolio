/**
 * ============================================================================
 * LAYOUT ADMIN — app/admin/layout.tsx
 * ============================================================================
 *
 * Layout partagé par toutes les pages du panneau d'administration (/admin/*).
 * Sa responsabilité principale est la PROTECTION des routes admin :
 * seuls les utilisateurs authentifiés ET reconnus comme admins peuvent
 * accéder aux pages autres que /admin/login.
 *
 * Architecture :
 *   AdminLayout (Server Component compatible — wrappé dans AuthProvider)
 *     └── AuthProvider  ← fournit l'état Firebase Auth via contexte
 *           └── AdminLayoutContent  ← Client Component qui gère la redirection
 *
 * Logique de protection (double vérification) :
 *   1. Si Firebase Auth est en cours de chargement → spinner
 *   2. Si la page est /admin/login → accessible sans auth
 *   3. Si pas connecté sur une autre page admin → redirection vers /admin/login
 *   4. Si connecté mais email non admin → redirection vers /admin/login
 *      (ex: compte Google authentifié mais pas dans la liste admin)
 *   5. Si connecté ET admin → rendu du contenu protégé
 *
 * Note : Le Client Component (AdminLayoutContent) est séparé du layout
 * pour permettre l'utilisation de hooks (useRouter, useAuthContext, useEffect)
 * qui ne sont pas disponibles dans les Server Components.
 *
 * Couches de sécurité :
 *   - Ce layout : garde UI côté client (bloque l'affichage)
 *   - Firestore Rules : garde serveur (bloque les lectures/écritures)
 *   Les deux couches sont complémentaires.
 * ============================================================================
 */

"use client";

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { AuthProvider, useAuthContext } from '@/lib/firebase';

/**
 * Contenu interne du layout admin.
 * Client Component séparé pour pouvoir utiliser les hooks React.
 * Gère la redirection automatique des utilisateurs non authentifiés ou non admins.
 *
 * @param children - Le contenu de la page admin à protéger
 */
function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  // isAdmin = true uniquement si user.email correspond à NEXT_PUBLIC_ADMIN_EMAIL
  // ou NEXT_PUBLIC_ADMIN_EMAIL_2 (vérifié dans lib/firebase/hooks.ts)
  const { user, loading, isAdmin } = useAuthContext();
  const router   = useRouter();
  const pathname = usePathname();

  /**
   * Effet de garde d'authentification et d'autorisation admin.
   *
   * Cas de redirection vers /admin/login :
   *   - Chargement terminé + pas d'utilisateur connecté (non authentifié)
   *   - Chargement terminé + utilisateur connecté mais pas admin
   *     (email non présent dans NEXT_PUBLIC_ADMIN_EMAIL / NEXT_PUBLIC_ADMIN_EMAIL_2)
   *
   * Ce double check empêche un compte Google ou Firebase quelconque
   * d'accéder au dashboard même s'il est authentifié.
   *
   * Dépendances : [user, loading, isAdmin, router, pathname]
   */
  useEffect(() => {
    if (loading) return; // Attendre la résolution de l'état auth
    if (pathname === '/admin/login') return; // Page de login toujours accessible

    // Rediriger si pas connecté OU si connecté mais pas admin
    if (!user || !isAdmin) {
      router.push('/admin/login');
    }
  }, [user, loading, isAdmin, router, pathname]);

  // Affiche un spinner pendant la vérification de l'état d'authentification
  if (loading) {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center">
        <div className="text-white">Chargement...</div>
      </div>
    );
  }

  // Autorise l'accès à la page de connexion sans authentification
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  // Affiche null pendant la redirection (évite un flash de contenu protégé)
  // Couvre les deux cas : pas connecté OU connecté mais pas admin
  if (!user || !isAdmin) {
    return null;
  }

  // Utilisateur authentifié ET admin → rend le contenu de la page admin
  return <>{children}</>;
}

/**
 * Layout racine du panneau admin.
 * Enveloppe tout dans AuthProvider pour partager l'état Firebase Auth
 * via le contexte React dans toute la hiérarchie admin.
 *
 * @param children - Le contenu de la page admin
 */
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      {/* Fond sombre uniforme pour tout le panneau admin */}
      <div className="min-h-screen bg-dark-950">
        <AdminLayoutContent>{children}</AdminLayoutContent>
      </div>
    </AuthProvider>
  );
}
