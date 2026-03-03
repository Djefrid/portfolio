/**
 * ============================================================================
 * CONFIGURATION FIREBASE - Initialisation de l'application Firebase
 * ============================================================================
 *
 * Ce fichier initialise Firebase (Auth + Firestore) à partir des
 * variables d'environnement définies dans le fichier .env.local
 *
 * Firebase n'est initialisé QUE si les variables d'environnement sont présentes.
 * Cela permet au site de fonctionner même sans Firebase (avec les données statiques).
 *
 * Variables requises dans .env.local :
 *   NEXT_PUBLIC_FIREBASE_API_KEY
 *   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
 *   NEXT_PUBLIC_FIREBASE_PROJECT_ID
 *   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
 *   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
 *   NEXT_PUBLIC_FIREBASE_APP_ID
 * ============================================================================
 */

import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';

/**
 * Configuration Firebase lue depuis les variables d'environnement.
 * Le préfixe NEXT_PUBLIC_ rend ces variables accessibles côté client (navigateur).
 */
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

/**
 * Vérifie si Firebase est configuré (les 3 variables essentielles sont présentes).
 * Utilisé dans tout le projet pour décider si on charge les données depuis Firebase
 * ou depuis les données statiques (portfolio-data.ts).
 */
export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.projectId &&
  firebaseConfig.authDomain
);

// Instances Firebase (null si Firebase n'est pas configuré)
let app: FirebaseApp | null = null;
let auth: Auth | null = null;            // Pour l'authentification admin
let db: Firestore | null = null;         // Pour la base de données Firestore
let storage: FirebaseStorage | null = null; // Pour le stockage des fichiers (images)

/**
 * Initialise Firebase seulement si les variables d'environnement sont définies.
 * getApps() vérifie si une instance existe déjà (évite les doublons en dev avec Hot Reload).
 */
if (isFirebaseConfigured) {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);
}

export { app, auth, db, storage };
export default app;
