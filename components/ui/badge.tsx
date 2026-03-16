/**
 * ============================================================================
 * COMPOSANT BADGE — components/ui/badge.tsx
 * ============================================================================
 *
 * Composant Badge généré par shadcn/ui.
 * Affiche une étiquette colorée inline (ex : "Open to Work", tags de stack).
 *
 * Variantes disponibles (via `cva`) :
 *   - default     : fond primaire avec ombre
 *   - secondary   : fond secondaire (moins accentué)
 *   - destructive : fond rouge (erreurs, suppressions)
 *   - outline     : transparent avec bordure et texte coloré
 *
 * Utilisation :
 *   <Badge>Open to Work</Badge>
 *   <Badge variant="outline">TypeScript</Badge>
 *
 * Basé sur un simple <div> (pas de composant Radix) —
 * utilise `cva` (class-variance-authority) pour gérer les variantes
 * et `cn` pour fusionner les classes Tailwind.
 * ============================================================================
 */

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/**
 * Définition des variantes de style du Badge via `cva`.
 * Les classes de base s'appliquent à toutes les variantes.
 */
const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground shadow hover:bg-destructive/80",
        outline: "text-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

/** Props du Badge : toutes les props d'un div + la prop `variant` de cva. */
export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

/**
 * Badge coloré inline.
 * @param variant - Style visuel du badge (default | secondary | destructive | outline)
 * @param className - Classes Tailwind supplémentaires (fusionnées avec twMerge)
 */
function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
