/**
 * ============================================================================
 * IMAGE OPEN GRAPH — app/opengraph-image.tsx
 * ============================================================================
 *
 * Génère automatiquement l'image de prévisualisation (1200×630 px) affichée
 * quand le portfolio est partagé sur les réseaux sociaux (Twitter, LinkedIn,
 * Discord, Slack, iMessage, etc.).
 *
 * Fonctionnement :
 *   Next.js détecte ce fichier et génère l'image au format PNG à l'URL :
 *   /opengraph-image (ou /opengraph-image.png selon la version)
 *   Cette URL est automatiquement ajoutée aux balises <meta og:image> et
 *   <meta twitter:image> dans le <head> HTML.
 *
 * Runtime Edge :
 *   `export const runtime = 'edge'` — génération à la volée sur le CDN Vercel,
 *   sans serveur Node.js. Plus rapide que Node runtime pour ce type de tâche.
 *
 * Rendu JSX → PNG :
 *   L'API ImageResponse convertit du JSX (style inline uniquement) en PNG.
 *   Limitations : pas de Tailwind, pas de composants complexes, styles inline seulement.
 *
 * Design :
 *   - Fond dégradé sombre (cohérent avec le thème du portfolio)
 *   - Barre accent violette en haut
 *   - Badge "Disponible pour travailler" (si openToWork)
 *   - Nom, titre, stack de technologies
 *   - URL du site en bas
 * ============================================================================
 */

import { ImageResponse } from 'next/og';

/** Exécution sur le runtime Edge de Vercel (pas de Node.js) */
export const runtime = 'edge';

/** Texte alternatif de l'image pour l'accessibilité */
export const alt = 'Djefrid Byli Fotue Kuate - Développeur Full-Stack | Support IT';

/** Dimensions standard Open Graph recommandées par Facebook, Twitter, LinkedIn */
export const size = { width: 1200, height: 630 };

/** Format de l'image générée */
export const contentType = 'image/png';

/**
 * Fonction de génération de l'image Open Graph.
 * Retourne un ImageResponse (PNG 1200×630) en JSX avec styles inline.
 * Les fonts Google ne sont pas chargées ici — le navigateur utilise sans-serif.
 */
export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'sans-serif',
          padding: '60px',
          position: 'relative',
        }}
      >
        {/* Barre d'accent colorée en haut — signature visuelle du portfolio */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '6px',
            background: 'linear-gradient(90deg, #6366f1, #8b5cf6)',
          }}
        />

        {/* Badge "Disponible pour travailler" — visible sur l'aperçu partagé */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(34, 197, 94, 0.15)',
            border: '1px solid rgba(34, 197, 94, 0.4)',
            color: '#86efac',
            padding: '6px 16px',
            borderRadius: '999px',
            fontSize: '16px',
            marginBottom: '28px',
          }}
        >
          {/* Indicateur vert circulaire */}
          <div
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: '#22c55e',
            }}
          />
          Disponible pour travailler
        </div>

        {/* Nom complet — taille large pour être lisible en miniature */}
        <div
          style={{
            fontSize: '68px',
            fontWeight: 'bold',
            color: 'white',
            marginBottom: '12px',
            textAlign: 'center',
          }}
        >
          Djefrid Byli Fotue Kuate
        </div>

        {/* Titre professionnel */}
        <div
          style={{
            fontSize: '28px',
            color: '#94a3b8',
            marginBottom: '48px',
            textAlign: 'center',
          }}
        >
          Développeur Full-Stack | Support IT
        </div>

        {/* Badges du stack technique — pills violacées */}
        <div
          style={{
            display: 'flex',
            gap: '12px',
            flexWrap: 'wrap',
            justifyContent: 'center',
          }}
        >
          {['Django', 'Vue.js', 'React', 'Next.js', 'TypeScript', 'PostgreSQL', 'Docker'].map(
            (tech) => (
              <div
                key={tech}
                style={{
                  background: 'rgba(99, 102, 241, 0.15)',
                  border: '1px solid rgba(99, 102, 241, 0.4)',
                  color: '#a5b4fc',
                  padding: '8px 20px',
                  borderRadius: '999px',
                  fontSize: '18px',
                }}
              >
                {tech}
              </div>
            )
          )}
        </div>

        {/* URL du site — positionnée en bas de l'image */}
        <div
          style={{
            position: 'absolute',
            bottom: '40px',
            color: '#475569',
            fontSize: '20px',
          }}
        >
          portfolio.djefrid.ca
        </div>

      </div>
    ),
    { ...size }
  );
}
