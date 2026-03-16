/**
 * ============================================================================
 * COMPOSANT TEXTAREA — components/ui/textarea.tsx
 * ============================================================================
 *
 * Composant Textarea généré par shadcn/ui.
 * Zone de saisie multiligne stylisée, compatible avec les formulaires React.
 *
 * Caractéristiques :
 *   - Basé sur un `<textarea>` natif via `React.forwardRef`
 *     (nécessaire pour react-hook-form et le focus programmatique)
 *   - Hauteur minimale de 60px (`min-h-[60px]`)
 *   - Stylisé avec Tailwind : bordure, fond transparent, états focus/disabled
 *   - Placeholder atténué, ring de focus jaune sur focus-visible
 *
 * Utilisation :
 *   <Textarea placeholder="Votre message..." />
 *   <Textarea rows={4} ref={textareaRef} />
 *
 * Utilisé dans la section Contact (champ message du formulaire)
 * et dans les éditeurs admin (descriptions des projets, etc.).
 * ============================================================================
 */

import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * Zone de saisie multiligne HTML stylisée.
 * `forwardRef` permet de passer une ref depuis le composant parent.
 */
const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<"textarea">
>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        "flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        className
      )}
      ref={ref}
      {...props}
    />
  )
})
Textarea.displayName = "Textarea"

export { Textarea }
