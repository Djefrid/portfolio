/**
 * ============================================================================
 * PAGE 404 — app/not-found.tsx
 * ============================================================================
 *
 * Page affichée automatiquement par Next.js quand une URL ne correspond
 * à aucune route définie dans l'application.
 *
 * Next.js App Router détecte automatiquement ce fichier et l'utilise
 * comme page d'erreur 404 globale (pas besoin de configuration).
 *
 * Design :
 *   - "404" affiché deux fois superposés : une version sombre (fond)
 *     et une version avec dégradé en clip-path (premier plan)
 *   - Lien de retour vers la page d'accueil
 *
 * C'est un Server Component — pas d'"use client" nécessaire.
 * ============================================================================
 */

import Link from "next/link";

/**
 * Page 404 — Page introuvable.
 * Rendue automatiquement par Next.js pour toute route inconnue.
 */
export default function NotFound() {
  return (
    <div className="min-h-screen bg-dark-950 flex items-center justify-center px-4">
      <div className="text-center max-w-md">

        {/* ── Effet visuel 404 en double couche ── */}
        {/* Technique : deux éléments absolus superposés — le fond sombre
            sert de silhouette, le premier plan applique un dégradé via
            bg-clip-text (uniquement visible sur le texte) */}
        <div className="relative mb-6">
          {/* Couche arrière : texte sombre (couleur de fond visible) */}
          <p className="text-[8rem] font-bold leading-none text-dark-800 select-none">
            404
          </p>
          {/* Couche avant : même texte avec dégradé primary via clip-path */}
          <p className="absolute inset-0 flex items-center justify-center text-[8rem] font-bold leading-none text-transparent bg-clip-text bg-gradient-to-br from-primary-400 to-primary-600 select-none">
            404
          </p>
        </div>

        <h1 className="text-2xl font-semibold text-white mb-3">
          Page introuvable
        </h1>
        <p className="text-gray-400 text-sm mb-8">
          La page que vous cherchez n&apos;existe pas ou a été déplacée.
        </p>

        {/* Bouton de retour — utilise la classe Tailwind btn-primary définie globalement */}
        <Link
          href="/"
          className="btn-primary inline-flex"
        >
          {/* Icône flèche gauche — SVG inline */}
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Retour à l&apos;accueil
        </Link>

      </div>
    </div>
  );
}
