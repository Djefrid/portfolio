/**
 * ============================================================================
 * COMPOSANT INPUT — components/ui/input.tsx
 * ============================================================================
 *
 * Composant Input généré par shadcn/ui.
 * Champ de saisie texte stylisé, compatible avec les formulaires React.
 *
 * Caractéristiques :
 *   - Basé sur un `<input>` natif via `React.forwardRef` pour la compatibilité
 *     avec les libs de formulaire (react-hook-form, etc.) qui nécessitent une ref
 *   - Gère tous les types HTML (`text`, `email`, `password`, `url`, `number`, etc.)
 *   - Stylisé avec Tailwind : bordure, fond transparent, états focus/disabled
 *   - Supporte les fichiers (`type="file"`) via des classes spécifiques (`file:*`)
 *
 * Utilisation :
 *   <Input type="email" placeholder="Votre email" />
 *   <Input type="text" ref={inputRef} />
 * ============================================================================
 */

import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * Champ de saisie HTML stylisé.
 * `forwardRef` permet de passer une ref depuis le composant parent
 * (nécessaire pour react-hook-form et le focus programmatique).
 */
const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
