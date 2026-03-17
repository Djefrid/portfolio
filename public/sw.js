/**
 * ============================================================================
 * SERVICE WORKER MINIMAL — public/sw.js
 * ============================================================================
 *
 * Service Worker requis par Chrome pour activer le bouton d'installation PWA.
 * Sans Service Worker, Chrome n'affiche pas l'invite d'installation même si
 * le manifest.webmanifest est valide.
 *
 * Stratégie de cache :
 *   - Install : met en cache la page d'accueil et les assets essentiels
 *   - Fetch : Network First (réseau prioritaire, cache en fallback si offline)
 *
 * Ce SW est intentionnellement minimal — il ne gère pas de cache complexe
 * pour ne pas interférer avec le cache Next.js et Firebase.
 * ============================================================================
 */

/** Nom et version du cache — incrémenter la version pour invalider l'ancien cache */
const CACHE_NAME = 'portfolio-v4'; // v4 : exclusion /__/auth/* (fix Google OAuth redirect SW)

/** Assets mis en cache lors de l'installation */
const PRECACHE_URLS = [
  '/',
  '/favicon.svg',
  '/icon-192.png',
  '/icon-512.png',
];

/**
 * Événement install — déclenché une fois lors de la première installation du SW.
 * Pré-cache les assets essentiels et active immédiatement le SW (skipWaiting).
 */
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS))
  );
  // Active immédiatement sans attendre la fermeture des onglets existants
  self.skipWaiting();
});

/**
 * Événement activate — déclenché quand ce SW prend le contrôle.
 * Supprime les anciens caches (versions précédentes).
 */
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  // Prend le contrôle immédiatement de tous les onglets ouverts
  self.clients.claim();
});

/**
 * Événement fetch — intercepte toutes les requêtes réseau.
 * Stratégie Network First : essaie le réseau, utilise le cache si offline.
 * Les requêtes Firebase, Firestore et API externes ne sont pas mises en cache.
 */
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Ne pas intercepter les requêtes Firebase, Firestore, Google APIs ni ressources tierces.
  // CRITIQUE : apis.google.com (Firebase signInWithPopup) et gstatic.com (reCAPTCHA)
  // doivent être exclus — le SW retournerait undefined depuis le cache vide,
  // ce qui bloque Google OAuth et App Check avec une erreur auth/internal-error.
  // chrome-extension:// et moz-extension:// : le Cache API n'accepte pas ces schémas
  // → TypeError: Failed to execute 'put' on 'Cache': Request scheme 'chrome-extension' is unsupported
  // /__/auth/* : handler Firebase Auth redirect — le proxy Next.js doit traiter ces URLs
  // directement sans interférence du SW, sinon getRedirectResult() retourne null (page blanche mobile)
  if (
    url.protocol === 'chrome-extension:' ||  // Extensions Chrome — schéma non cacheable
    url.protocol === 'moz-extension:' ||      // Extensions Firefox — schéma non cacheable
    url.pathname.startsWith('/__/auth/') ||   // Firebase Auth redirect handler — CRITIQUE : doit passer au proxy Next.js sans interférence SW
    url.hostname.includes('firebase') ||
    url.hostname.includes('firestore') ||
    url.hostname.includes('googleapis') ||
    url.hostname.includes('google.com') ||    // apis.google.com, accounts.google.com, recaptcha.google.com
    url.hostname.includes('gstatic.com') ||   // www.gstatic.com (reCAPTCHA scripts, polices)
    url.hostname.includes('vercel') ||
    event.request.method !== 'GET'
  ) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Met en cache la réponse fraîche pour usage offline
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseClone));
        return response;
      })
      .catch(() => {
        // Réseau indisponible → fallback sur le cache
        return caches.match(event.request);
      })
  );
});
