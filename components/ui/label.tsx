/**
 * ============================================================================
 * COMPOSANT LABEL — components/ui/label.tsx
 * ============================================================================
 *
 * Composant Label généré par shadcn/ui.
 * Étiquette de formulaire accessible construite sur @radix-ui/react-label.
 *
 * Pourquoi Radix et pas un simple `<label>` ?
 *   Radix `LabelPrimitive` gère automatiquement l'association avec le contrôle
 *   cible via `htmlFor`, et désactive visuellement le label quand son contrôle
 *   associé est désactivé (`peer-disabled` Tailwind).
 *
 * Comportement `peer-disabled` :
 *   Quand l'input associé est `disabled`, le label passe en opacité 70%
 *   et affiche un curseur `not-allowed` — feedback visuel cohérent.
 *
 * Utilisation :
 *   <Label htmlFor="email">Adresse email</Label>
 *   <Input id="email" type="email" />
 *
 * Client Component requis car Radix utilise des hooks React.
 * ============================================================================
 */

"use client"

import * as React from "react"
import * as LabelPrimitive from "@radix-ui/react-label"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/**
 * Variantes de style du Label via `cva`.
 * Une seule variante actuellement : texte sm, medium, leading-none.
 */
const labelVariants = cva(
  "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
)

/**
 * Étiquette de formulaire accessible.
 * `forwardRef` permet de passer une ref à l'élément Radix sous-jacent.
 * `displayName` est copié depuis Radix pour un meilleur DX dans DevTools.
 */
const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> &
    VariantProps<typeof labelVariants>
>(({ className, ...props }, ref) => (
  <LabelPrimitive.Root
    ref={ref}
    className={cn(labelVariants(), className)}
    {...props}
  />
))
Label.displayName = LabelPrimitive.Root.displayName

export { Label }
