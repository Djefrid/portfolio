/**
 * ============================================================================
 * FIREBASE APP CHECK — lib/firebase/app-check.ts
 * ============================================================================
 *
 * Initialise Firebase App Check avec reCAPTCHA v3 côté client.
 *
 * App Check ajoute un token d'attestation à chaque requête Firebase
 * (Auth, Firestore, Storage). Une fois l'enforcement activé dans la
 * Firebase Console, toute requête sans token valide est rejetée — ce qui
 * bloque les scripts automatisés, scrapers et abus d'API.
 *
 * Fonctionnement :
 *   1. reCAPTCHA v3 analyse le comportement de l'utilisateur (score 0–1)
 *   2. Firebase valide le score côté serveur via la clé secrète
 *   3. Un token App Check est émis et joint à chaque appel Firebase
 *   4. isTokenAutoRefreshEnabled renouvelle le token en arrière-plan
 *
 * La variable NEXT_PUBLIC_RECAPTCHA_SITE_KEY est la clé publique du site
 * reCAPTCHA v3 (obtenue sur console.google.com/recaptcha).
 *
 * Ce fichier est importé dans components/Providers.tsx (côté client uniquement).
 * Il ne s'exécute jamais côté serveur (Next.js SSR) grâce à la vérification
 * typeof window !== 'undefined'.
 * ============================================================================
 */

import { initializeAppCheck, ReCaptchaEnterpriseProvider } from 'firebase/app-check';
import { app, isFirebaseConfigured } from './config';

/**
 * Initialise App Check avec reCAPTCHA v3.
 *
 * Appelé une seule fois depuis Providers.tsx au montage de l'application.
 * Sans effet si :
 *   - on est côté serveur (SSR)
 *   - on est en développement (NODE_ENV !== 'production') — App Check
 *     nécessite une clé reCAPTCHA v3 valide qui n'est utile qu'en prod.
 *     En dev, l'initialisation avec une clé v2 ou invalide bloque
 *     toutes les opérations Firebase Auth/Firestore.
 *   - Firebase n'est pas configuré (variables .env.local absentes)
 *   - la clé reCAPTCHA n'est pas définie
 */
export function initAppCheck(): void {
  // Guard SSR — App Check est une API navigateur uniquement
  if (typeof window === 'undefined') return;

  // Guard dev — désactivé en développement pour éviter les erreurs reCAPTCHA
  // qui bloqueraient Firebase Auth et Firestore. App Check est actif en prod uniquement.
  if (process.env.NODE_ENV !== 'production') {
    console.info('[AppCheck] Désactivé en développement (NODE_ENV !== production).');
    return;
  }

  // Guard Firebase — ne rien faire si Firebase n'est pas configuré
  if (!isFirebaseConfigured || !app) return;

  // Guard clé reCAPTCHA — ne rien faire si la variable n'est pas définie
  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
  if (!siteKey) {
    console.warn('[AppCheck] NEXT_PUBLIC_RECAPTCHA_SITE_KEY manquante — App Check désactivé.');
    return;
  }

  try {
    initializeAppCheck(app, {
      // ReCaptchaV3Provider utilise la clé publique du site pour générer les tokens
      provider: new ReCaptchaEnterpriseProvider(siteKey),
      // Renouvelle automatiquement le token en arrière-plan avant expiration
      isTokenAutoRefreshEnabled: true,
    });
  } catch (error) {
    // App Check peut lever une erreur si déjà initialisé (hot reload en dev)
    // On ignore silencieusement pour ne pas casser l'application
    console.warn('[AppCheck] Déjà initialisé ou erreur ignorée :', error);
  }
}
