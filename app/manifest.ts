/**
 * ============================================================================
 * PWA MANIFEST — app/manifest.ts
 * ============================================================================
 *
 * Fichier de manifeste Web App (PWA) généré automatiquement par Next.js 14.
 * Permet au navigateur de proposer l'installation du portfolio comme application
 * native (sur mobile Android/iOS et desktop Chrome/Edge).
 *
 * Avantages :
 *   - Score Lighthouse PWA = 100
 *   - Installable sur l'écran d'accueil mobile (icône + splash screen)
 *   - Mode standalone : affiché sans barre d'adresse (comme une app native)
 *   - Pas de Service Worker requis pour le manifest de base
 *
 * Couleurs :
 *   - background_color : couleur du splash screen au lancement (#0a0a0a = dark-950)
 *   - theme_color : couleur de la barre de statut mobile / barre Chrome (#6366f1 = primary-500)
 * ============================================================================
 */

import { MetadataRoute } from "next";

/**
 * Retourne le manifeste PWA au format JSON via la route automatique /manifest.webmanifest.
 * Next.js gère automatiquement le Content-Type et l'injection du <link rel="manifest"> dans <head>.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    /* Nom complet affiché lors de l'installation et sur le splash screen */
    name: "Portfolio Djefrid Byli",

    /* Nom court affiché sous l'icône sur l'écran d'accueil mobile */
    short_name: "Djefrid",

    /* Description visible dans les stores d'applications et les UI d'installation */
    description:
      "Portfolio de Djefrid Byli — Développeur Full-Stack | Support IT",

    /* URL de démarrage quand l'app est lancée depuis l'écran d'accueil */
    start_url: "/",

    /* standalone : masque la barre d'adresse — look application native */
    display: "standalone",

    /* Couleur de fond du splash screen au lancement (dark-950) */
    background_color: "#0a0a0a",

    /* Couleur de la barre de statut mobile et de la barre de titre Chrome/Edge */
    theme_color: "#6366f1",

    /* Orientation préférée — any permet portrait et paysage */
    orientation: "any",

    /* Icônes PWA — Chrome exige minimum 192×192 PNG pour l'install prompt.
     * 512×512 requis pour le splash screen Android.
     * SVG conservé en supplément pour les navigateurs modernes (scalable). */
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/favicon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
  };
}
