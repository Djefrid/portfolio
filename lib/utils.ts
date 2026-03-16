/**
 * ============================================================================
 * UTILITAIRE CSS — lib/utils.ts
 * ============================================================================
 *
 * Fournit la fonction `cn` — utilisée dans tout le projet pour fusionner
 * des classes Tailwind CSS en évitant les conflits.
 *
 * Fonctionnement :
 *   1. `clsx`      : combine et filtre les valeurs conditionnelles
 *                    (strings, tableaux, objets `{ 'class': condition }`)
 *   2. `twMerge`   : résout les conflits Tailwind
 *                    (ex : 'p-4 p-6' → 'p-6', 'bg-red-500 bg-blue-500' → 'bg-blue-500')
 *
 * Exemple :
 *   cn('px-4 py-2', isActive && 'bg-yellow-500', 'bg-red-500')
 *   → 'px-4 py-2 bg-red-500'  (bg-yellow-500 ignoré car bg-red-500 le remplace)
 * ============================================================================
 */

import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Fusionne des classes CSS Tailwind en résolvant les conflits.
 * Accepte strings, tableaux, objets conditionnels (via clsx).
 * twMerge garantit qu'une seule valeur est conservée par propriété CSS.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
