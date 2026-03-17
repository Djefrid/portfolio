/**
 * ============================================================================
 * FIREBASE APP CHECK — lib/firebase/app-check.ts
 * ============================================================================
 *
 * Initialise Firebase App Check avec reCAPTCHA Enterprise côté client.
 *
 * App Check ajoute un token d'attestation à chaque requête Firebase
 * (Auth, Firestore, Storage). Une fois l'enforcement activé dans la
 * Firebase Console, toute requête sans token valide est rejetée — ce qui
 * bloque les scripts automatisés, scrapers et abus d'API.
 *
 * Pourquoi ReCaptchaEnterpriseProvider (et non ReCaptchaV3Provider) :
 *   Depuis ~2023, Google Cloud Console (admin.google.com/recaptcha) crée
 *   des clés reCAPTCHA Enterprise par défaut. Ces clés utilisent l'endpoint
 *   /enterprise/clr (pas /api2/clr). Utiliser ReCaptchaV3Provider avec une
 *   clé Enterprise retourne 400 Bad Request → erreurs appCheck/recaptcha-error.
 *   ReCaptchaEnterpriseProvider utilise le bon endpoint pour ces clés.
 *
 * Fonctionnement :
 *   1. reCAPTCHA Enterprise analyse le comportement de l'utilisateur (score 0–1)
 *   2. Firebase valide le score côté serveur via la clé configurée dans App Check Console
 *   3. Un token App Check est émis et joint à chaque appel Firebase
 *   4. isTokenAutoRefreshEnabled renouvelle le token en arrière-plan
 *
 * La variable NEXT_PUBLIC_RECAPTCHA_SITE_KEY est la clé publique du site
 * reCAPTCHA Enterprise (obtenue sur admin.google.com/recaptcha ou Google Cloud Console).
 *
 * Ce fichier est importé dans components/Providers.tsx (côté client uniquement).
 * Il ne s'exécute jamais côté serveur (Next.js SSR) grâce à la vérification
 * typeof window !== 'undefined'.
 * ============================================================================
 */

import { initializeAppCheck, ReCaptchaEnterpriseProvider } from 'firebase/app-check';
import { app, isFirebaseConfigured } from './config';

/**
 * Initialise App Check avec reCAPTCHA Enterprise.
 *
 * Appelé une seule fois depuis Providers.tsx au montage de l'application.
 * Sans effet si :
 *   - on est côté serveur (SSR)
 *   - on est en développement (NODE_ENV !== 'production') — App Check
 *     nécessite une clé reCAPTCHA valide qui n'est utile qu'en prod.
 *     En dev, l'initialisation avec une clé invalide bloque
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
      // ReCaptchaEnterpriseProvider : requis pour les clés créées via admin.google.com
      // ou Google Cloud Console (clés Enterprise, endpoint /enterprise/ au lieu de /api2/).
      // ReCaptchaV3Provider causait des 400 sur /api2/clr avec ces clés.
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
