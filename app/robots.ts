import { MetadataRoute } from 'next';

/**
 * Génération dynamique du fichier robots.txt pour le référencement.
 *
 * Ce fichier indique aux robots des moteurs de recherche :
 * - Quelles pages ils peuvent crawler (explorer)
 * - Quelles pages sont interdites (ex: panneau admin)
 * - Où trouver le sitemap.xml
 *
 * Accessible à : https://portfolio.djefrid.ca/robots.txt
 */

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://portfolio.djefrid.ca';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        // Règle pour tous les moteurs de recherche (Google, Bing, etc.)
        userAgent: '*',
        // Pages autorisées au crawling
        allow: '/',
        // Pages interdites au crawling (panneau admin et API)
        disallow: [
          '/admin',       // Panneau d'administration
          '/admin/',      // Toutes les sous-pages admin
          '/api/',        // Routes API internes
        ],
      },
    ],
    // Lien vers le sitemap pour que Google le trouve automatiquement
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
