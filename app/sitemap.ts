import { MetadataRoute } from 'next';

/**
 * Génération dynamique du sitemap.xml pour le référencement Google.
 *
 * Ce fichier est automatiquement servi par Next.js à l'URL /sitemap.xml
 * Il indique aux moteurs de recherche (Google, Bing, etc.) quelles pages
 * existent sur le site et à quelle fréquence elles sont mises à jour.
 *
 * À soumettre dans Google Search Console :
 * https://portfolio.djefrid.ca/sitemap.xml
 */

// Domaine du site (utilisé pour générer les URLs absolues)
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://portfolio.djefrid.ca';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      // Page d'accueil - La page principale du portfolio
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 1.0, // Priorité maximale : c'est la page la plus importante
    },
    {
      // Section À propos (ancre #about sur la page d'accueil)
      url: `${SITE_URL}/#about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      // Section Projets (ancre #projects sur la page d'accueil)
      url: `${SITE_URL}/#projects`,
      lastModified: new Date(),
      changeFrequency: 'weekly', // Les projets peuvent être mis à jour plus souvent
      priority: 0.9,
    },
    {
      // Section Compétences (ancre #skills sur la page d'accueil)
      url: `${SITE_URL}/#skills`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      // Section Contact (ancre #contact sur la page d'accueil)
      url: `${SITE_URL}/#contact`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.7,
    },
  ];
}
