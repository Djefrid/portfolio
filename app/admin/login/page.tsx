/**
 * ============================================================================
 * PAGE DE CONNEXION ADMIN — app/admin/login/page.tsx
 * ============================================================================
 *
 * Page de connexion au panneau d'administration.
 * Accessible via /admin/login (et redirige vers /admin si déjà connecté).
 *
 * Deux méthodes de connexion :
 *   1. Email + mot de passe (formulaire classique)
 *   2. Google OAuth (popup Firebase) — bouton "Continuer avec Google"
 *
 * Flux de connexion :
 *   1. L'utilisateur saisit ses identifiants (ou clique Google)
 *   2. Firebase Auth vérifie les credentials
 *   3. Si succès → redirection automatique vers /admin
 *   4. Si échec → message d'erreur affiché sous le formulaire
 *
 * Sécurité :
 *   - Le layout app/admin/layout.tsx vérifie que l'email connecté correspond
 *     à NEXT_PUBLIC_ADMIN_EMAIL ou NEXT_PUBLIC_ADMIN_EMAIL_2 (double vérification
 *     : utilisateur connecté ET email dans la liste admin → isAdmin === true)
 *   - La page se redirige vers /admin si l'utilisateur est déjà connecté
 *     (useEffect sur `user`)
 *
 * Note : le bouton Google affiche l'icône Google SVG inline pour éviter
 * une dépendance supplémentaire.
 * ============================================================================
 */

"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getRedirectResult } from 'firebase/auth';
import { useAuthContext } from '@/lib/firebase';
import { auth } from '@/lib/firebase';

/**
 * Composant de la page de connexion admin.
 */
export default function LoginPage() {
  /** Valeur du champ email */
  const [email, setEmail] = useState('');
  /** Valeur du champ mot de passe */
  const [password, setPassword] = useState('');
  /** Message d'erreur à afficher (vide = pas d'erreur) */
  const [error, setError] = useState('');
  /** true pendant un appel Firebase Auth en cours */
  const [isLoading, setIsLoading] = useState(false);

  // useAuthContext fournit user, signIn et signInWithGoogle depuis Firebase
  const { signIn, signInWithGoogle, user } = useAuthContext();
  const router = useRouter();

  /**
   * Traite le résultat d'un signInWithRedirect (connexion Google sur mobile).
   * Appelé une seule fois au montage — si l'utilisateur revient d'un redirect Google,
   * getRedirectResult() retourne l'utilisateur connecté grâce au proxy /__/auth/
   * (same-origin → cookies first-party → pas bloqués sur mobile).
   * Si aucun redirect n'est en cours, retourne null silencieusement.
   */
  useEffect(() => {
    if (!auth) return;
    getRedirectResult(auth)
      .then((result) => {
        if (result?.user) {
          router.push('/admin');
        }
      })
      .catch((err) => {
        // Ignorer 'auth/no-auth-event' (pas de redirect en cours — cas normal)
        if (err?.code !== 'auth/no-auth-event') {
          setError('Connexion Google échouée : ' + err.message);
        }
      });
  }, [router]);

  /**
   * Redirection automatique si l'utilisateur est déjà connecté.
   * Se déclenche au montage et à chaque changement de l'état `user`.
   */
  useEffect(() => {
    if (user) {
      router.push('/admin');
    }
  }, [user, router]);

  /**
   * Gère la connexion via Google OAuth (popup).
   * En cas de succès, Firebase met à jour `user` → le useEffect redirige.
   */
  const handleGoogle = async () => {
    setError('');
    setIsLoading(true);
    const { error } = await signInWithGoogle();
    if (error) {
      setError('Connexion Google échouée : ' + error);
      setIsLoading(false);
    }
  };

  /**
   * Gère la soumission du formulaire email/mot de passe.
   * Les règles Firestore vérifient uniquement que l'email est dans la liste admin —
   * aucune vérification d'email Firebase requise (email_verified retiré des règles).
   *
   * @param e - Événement de soumission du formulaire
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const { error } = await signIn(email, password);

    if (error) {
      // Message générique pour ne pas révéler si c'est l'email ou le mot de passe
      setError('Email ou mot de passe incorrect');
      setIsLoading(false);
    } else {
      // Connexion réussie → redirection (le useEffect s'en charge aussi)
      router.push('/admin');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-dark-900 border border-dark-800 rounded-xl p-8">
          <h1 className="text-2xl font-bold text-white text-center mb-8">
            Administration
          </h1>

          {/* Formulaire email + mot de passe */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Message d'erreur — affiché uniquement si error est non vide */}
            {error && (
              <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="username"
                className="w-full px-4 py-3 bg-dark-800 border border-dark-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="admin@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                Mot de passe
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="w-full px-4 py-3 bg-dark-800 border border-dark-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="••••••••"
              />
            </div>

            {/* Bouton de connexion — désactivé pendant le chargement */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-dark-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Connexion...' : 'Se connecter'}
            </button>
          </form>

          {/* Séparateur visuel entre les deux méthodes de connexion */}
          <div className="mt-6 flex items-center gap-3">
            <div className="flex-1 h-px bg-dark-700" />
            <span className="text-xs text-gray-500">ou</span>
            <div className="flex-1 h-px bg-dark-700" />
          </div>

          {/* Bouton Google OAuth avec icône SVG inline (4 chemins = 4 couleurs du logo Google) */}
          <button
            type="button"
            onClick={handleGoogle}
            disabled={isLoading}
            className="mt-4 w-full py-3 flex items-center justify-center gap-3 bg-dark-800 border border-dark-700 text-white font-medium rounded-lg hover:bg-dark-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-dark-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {/* Icône Google — SVG inline pour éviter une dépendance externe */}
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
              <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
              <path d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z" fill="#FBBC05"/>
              <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
            </svg>
            Continuer avec Google
          </button>

          {/* Lien de retour vers le portfolio public */}
          <div className="mt-6 text-center">
            <a href="/" className="text-sm text-gray-400 hover:text-primary-400 transition-colors">
              Retour au portfolio
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
