/**
 * ============================================================================
 * COMPOSANT FADEIN SECTION — components/ui/FadeInSection.tsx
 * ============================================================================
 *
 * Composant d'animation générique qui fait apparaître son contenu avec un
 * effet de fondu + glissement vers le haut lors du scroll.
 *
 * Utilisation :
 *   Envelopper n'importe quel bloc JSX dans <FadeInSection> pour lui
 *   appliquer l'animation d'entrée au scroll.
 *
 *   <FadeInSection delay={0.2}>
 *     <MonComposant />
 *   </FadeInSection>
 *
 * Paramètres :
 *   - children  : le contenu à animer (obligatoire)
 *   - delay     : délai avant le début de l'animation en secondes (défaut: 0)
 *                 Permet de créer des animations en cascade dans une section
 *   - className : classes Tailwind supplémentaires sur le wrapper div
 *
 * Comportement :
 *   - État initial : invisible (opacity: 0) et décalé vers le bas (y: 30)
 *   - Quand la div entre dans le viewport (à -80px du bord) : animation vers
 *     opacity: 1 et y: 0 (durée 0.6s, easing easeOut)
 *   - once: false → l'animation se rejoue si l'élément quitte puis re-entre
 *     dans le viewport (scroll vers le bas puis vers le haut)
 *
 * Note technique :
 *   useInView de Framer Motion utilise en interne IntersectionObserver.
 *   margin: "-80px" signifie que l'animation se déclenche 80px avant que
 *   l'élément n'atteigne le bord de la viewport (effet d'anticipation).
 * ============================================================================
 */

"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

/**
 * Props du composant FadeInSection.
 */
interface FadeInSectionProps {
  /** Contenu à animer */
  children: React.ReactNode;
  /** Délai en secondes avant le début de l'animation (défaut : 0) */
  delay?: number;
  /** Classes CSS Tailwind supplémentaires appliquées au wrapper motion.div */
  className?: string;
}

/**
 * Composant d'animation d'entrée au scroll.
 * Anime les enfants avec un fondu + glissement vers le haut quand ils
 * entrent dans le viewport.
 *
 * @param children  - Contenu à animer
 * @param delay     - Délai en secondes (défaut : 0)
 * @param className - Classes Tailwind supplémentaires
 */
export function FadeInSection({ children, delay = 0, className }: FadeInSectionProps) {
  /** Ref attachée au motion.div pour que useInView puisse l'observer */
  const ref = useRef(null);

  /**
   * useInView observe le ref via IntersectionObserver.
   * - once: false → se réactive à chaque nouvelle entrée dans le viewport
   * - margin: "-80px" → déclenche 80px avant le bord bas du viewport
   *   (l'animation commence avant que l'élément soit complètement visible)
   */
  const isInView = useInView(ref, { once: false, margin: "-80px" });

  return (
    <motion.div
      ref={ref}
      /* État initial : invisible et décalé vers le bas */
      initial={{ opacity: 0, y: 30 }}
      /* État cible : selon visibilité — animé si visible, réinitialisé sinon */
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.6, delay, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
