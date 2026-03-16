/**
 * ============================================================================
 * LAYOUT PRINCIPAL DU PORTFOLIO — app/(main)/layout.tsx
 * ============================================================================
 *
 * Layout partagé par toutes les pages du groupe de routes "(main)".
 * Les parenthèses dans "(main)" sont une convention Next.js App Router :
 * le dossier est un "route group" (regroupement logique sans impact sur l'URL).
 *
 * Ce layout ajoute systématiquement le Header et le Footer autour du contenu
 * de chaque page du site public (uniquement "/" actuellement).
 *
 * Structure résultante :
 *   RootLayout (app/layout.tsx)
 *     └── MainLayout (app/(main)/layout.tsx)
 *           ├── Header  ← navbar fixe
 *           ├── <main>  ← contenu de la page (ex: PortfolioWrapper)
 *           └── Footer  ← pied de page
 * ============================================================================
 */

import Header from "@/components/Header";
import Footer from "@/components/Footer";

/**
 * Layout du site public.
 * Enveloppe le contenu avec la navigation et le pied de page.
 *
 * @param children - Le contenu de la page (Server ou Client Component)
 */
export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* Barre de navigation fixe en haut de page */}
      <Header />

      {/* Zone de contenu principal — reçoit les pages enfants */}
      <main>{children}</main>

      {/* Pied de page avec copyright, liens sociaux et mentions légales */}
      <Footer />
    </>
  );
}
