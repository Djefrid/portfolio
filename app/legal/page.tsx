/**
 * ============================================================================
 * PAGE MENTIONS LÉGALES — app/legal/page.tsx
 * ============================================================================
 *
 * Page statique des mentions légales du portfolio.
 * Accessible à l'URL : /legal
 *
 * Contenu :
 *   - Éditeur du site (portfolio personnel)
 *   - Hébergeur (Vercel)
 *   - Propriété intellectuelle
 *   - Données personnelles (formulaire de contact, RGPD)
 *   - Politique de cookies (localStorage uniquement, pas de tracking)
 *   - Clause de responsabilité
 *
 * SEO :
 *   - robots: { index: false } → la page n'est pas indexée par Google
 *     (les mentions légales n'apportent pas de valeur SEO)
 *   - title personnalisé pour les onglets du navigateur
 *
 * C'est un Server Component pur (pas de "use client") — rendu côté serveur.
 * ============================================================================
 */

import Link from "next/link";
import type { Metadata } from "next";

/**
 * Métadonnées de la page pour Next.js.
 * robots: { index: false } empêche l'indexation par les moteurs de recherche.
 */
export const metadata: Metadata = {
  title: "Mentions légales | Portfolio",
  robots: { index: false },
};

/**
 * Page des mentions légales.
 * Composant serveur statique — pas d'interactivité ni d'état React.
 */
export default function LegalPage() {
  return (
    <div className="min-h-screen bg-dark-950 py-20 px-4">
      <div className="max-w-2xl mx-auto">

        {/* Lien de retour vers la page d'accueil */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-primary-400 transition-colors mb-10"
        >
          {/* Icône flèche gauche — SVG inline pour éviter une dépendance */}
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Retour à l&apos;accueil
        </Link>

        <h1 className="text-3xl font-bold text-white mb-10">Mentions légales</h1>

        <div className="space-y-8 text-gray-300 text-sm leading-relaxed">

          {/* ── Éditeur du site ── */}
          <section>
            <h2 className="text-lg font-semibold text-white mb-3">Éditeur du site</h2>
            <p>Ce site est un portfolio personnel à vocation professionnelle.</p>
            <p className="mt-2">
              Il est édité et hébergé par son auteur, développeur web indépendant.
            </p>
          </section>

          {/* ── Hébergeur ── */}
          <section>
            <h2 className="text-lg font-semibold text-white mb-3">Hébergement</h2>
            <p>
              Ce site est hébergé par <strong className="text-white">Vercel Inc.</strong>
              <br />
              440 N Barranca Ave #4133, Covina, CA 91723, États-Unis.
              <br />
              <a
                href="https://vercel.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-400 hover:text-primary-300 transition-colors"
              >
                vercel.com
              </a>
            </p>
          </section>

          {/* ── Propriété intellectuelle ── */}
          <section>
            <h2 className="text-lg font-semibold text-white mb-3">Propriété intellectuelle</h2>
            <p>
              L&apos;ensemble du contenu de ce site (textes, projets, code source) est la propriété
              exclusive de son auteur. Toute reproduction, même partielle, est interdite sans
              autorisation préalable.
            </p>
          </section>

          {/* ── Données personnelles (RGPD) ── */}
          <section>
            <h2 className="text-lg font-semibold text-white mb-3">Données personnelles</h2>
            <p>
              Les informations transmises via le formulaire de contact (nom, adresse e-mail,
              message) sont utilisées uniquement pour répondre à votre demande. Elles ne sont
              ni conservées ni transmises à des tiers.
            </p>
            <p className="mt-2">
              Conformément au RGPD, vous disposez d&apos;un droit d&apos;accès, de rectification
              et de suppression de vos données en contactant directement l&apos;éditeur.
            </p>
          </section>

          {/* ── Politique de cookies ── */}
          <section>
            <h2 className="text-lg font-semibold text-white mb-3">Cookies</h2>
            <p>
              Ce site utilise le stockage local (<em>localStorage</em>) uniquement pour mémoriser
              votre préférence de langue (FR / EN). Aucun cookie publicitaire ni traceur tiers
              n&apos;est utilisé.
            </p>
          </section>

          {/* ── Responsabilité ── */}
          <section>
            <h2 className="text-lg font-semibold text-white mb-3">Responsabilité</h2>
            <p>
              L&apos;auteur s&apos;efforce de maintenir les informations de ce site à jour mais
              ne saurait être tenu responsable des erreurs ou omissions éventuelles.
            </p>
          </section>

        </div>

        {/* Date de dernière mise à jour */}
        <p className="mt-12 text-xs text-gray-500">
          Dernière mise à jour : février 2026
        </p>

      </div>
    </div>
  );
}
