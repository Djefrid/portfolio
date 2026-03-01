/**
 * ============================================================================
 * CONTEXTE D'AUTHENTIFICATION - Partage de l'état auth dans toute l'app
 * ============================================================================
 *
 * Ce fichier crée un contexte React pour partager l'état d'authentification
 * dans tous les composants de l'application.
 *
 * Architecture :
 *   AuthProvider (enveloppe l'app dans Providers.tsx)
 *     └── useAuthContext() (accessible dans n'importe quel composant enfant)
 *
 * Utilisation dans un composant :
 *   const { user, isAdmin, signIn, signOut } = useAuthContext();
 * ============================================================================
 */

"use client";

import { createContext, useContext, ReactNode } from 'react';
import { useAuth } from './hooks';
import type { User } from 'firebase/auth';

/** Type du contexte : toutes les valeurs disponibles via useAuthContext() */
interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<{ user: User | null; error: string | null }>;
  signInWithGoogle: () => Promise<{ user: User | null; error: string | null }>;
  signOut: () => Promise<{ error: string | null }>;
}

/** Contexte React (undefined par défaut, initialisé par AuthProvider) */
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Provider d'authentification - Enveloppe l'application pour partager l'état auth.
 * Utilise le hook useAuth() en interne et le rend disponible via le contexte.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const auth = useAuth();

  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook pour accéder au contexte d'authentification depuis n'importe quel composant.
 * Lance une erreur si utilisé en dehors d'un AuthProvider.
 */
export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}
