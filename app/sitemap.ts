/**
 * ============================================================================
 * SITEMAP — app/sitemap.ts
 * ============================================================================
 *
 * Génère le fichier sitemap.xml utilisé par les moteurs de recherche (Google,
 * Bing, etc.) pour découvrir et indexer les pages du portfolio.
 *
 * Next.js détecte automatiquement ce fichier et le sert à l'URL :
 *   https://portfolio.djefrid.ca/sitemap.xml
 *
 * Cette URL est également référencée dans robots.txt pour que les crawlers
 * la trouvent automatiquement.
 *
 * Pages incluses :
 *   1. Accueil (/) — priorité 1.0, mise à jour mensuelle
 *   2. Mentions légales (/legal) — priorité 0.3, mise à jour annuelle
 *      (les pages légales changent rarement et ont peu de valeur SEO)
 *
 * Note : Les pages admin (/admin/*) et les API (/api/*) ne sont pas incluses
 * dans le sitemap (et sont aussi bloquées dans robots.txt).
 * ============================================================================
 */

import { MetadataRoute } from 'next';

/** URL de base du site, configurable via variable d'environnement */
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://portfolio.djefrid.ca';

/**
 * Génère le sitemap XML du portfolio.
 * Retourne un tableau d'entrées que Next.js convertit automatiquement en XML.
 *
 * @returns Tableau d'URLs avec leurs métadonnées SEO
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      // Page d'accueil — page principale, priorité maximale
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: 'monthly', // Mise à jour lors des ajouts de projets/compétences
      priority: 1.0,              // Priorité maximale (0.0 - 1.0)
    },
    {
      // Page mentions légales — contenu statique, mise à jour rare
      url: `${SITE_URL}/legal`,
      lastModified: new Date(),
      changeFrequency: 'yearly',  // Change au maximum une fois par an
      priority: 0.3,              // Faible priorité SEO — pas de contenu de valeur
    },
  ];
}
