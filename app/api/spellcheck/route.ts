/**
 * ============================================================================
 * API CORRECTEUR ORTHOGRAPHIQUE — app/api/spellcheck/route.ts
 * ============================================================================
 *
 * Route API Next.js (POST) qui sert de proxy vers l'API publique LanguageTool.
 * Utilisée par l'extension SpellCheckExtension de l'éditeur TipTap.
 *
 * Pourquoi un proxy côté serveur ?
 *   - LanguageTool ne supporte pas les requêtes CORS depuis le navigateur
 *   - Centralise la configuration (langue, niveau de vérification)
 *   - Permet d'ajouter un cache ou une limitation de débit si nécessaire
 *
 * Configuration :
 *   - Langue : fr-FR (français de France)
 *   - Niveau : 'picky' (corrections stylistiques et orthographiques)
 *   - Timeout : 8 secondes (AbortSignal.timeout)
 *
 * Entrée : { text: string }
 * Sortie : { matches: LTMatch[] } — tableau de suggestions de correction
 *
 * En cas d'erreur (réseau, timeout, API down) → retourne { matches: [] }
 * pour ne pas bloquer l'éditeur.
 *
 * Note : Ce fichier est conservé dans le projet mais SpellCheckExtension
 * n'est plus utilisée (supprimée au profit du correcteur natif du navigateur
 * via spellcheck="true" sur l'éditeur TipTap).
 * ============================================================================
 */

import { NextRequest, NextResponse } from 'next/server';

/** URL de l'API publique LanguageTool v2 */
const LT_API = 'https://api.languagetool.org/v2/check';

/**
 * Gestionnaire POST — vérifie l'orthographe d'un texte via LanguageTool.
 *
 * @param req - Requête contenant { text: string } en JSON
 * @returns JSON { matches: LTMatch[] } — liste des erreurs trouvées
 */
export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json() as { text: string };

    // Ignore les textes trop courts (moins de 2 caractères non vides)
    if (!text || text.trim().length < 2) return NextResponse.json({ matches: [] });

    // Formate le corps de la requête en application/x-www-form-urlencoded
    // (format requis par l'API LanguageTool)
    const body = new URLSearchParams({
      text,
      language:    'fr-FR',       // Langue de vérification
      enabledOnly: 'false',        // Toutes les règles activées (pas seulement les actives par défaut)
      level:       'picky',        // Niveau picky = corrections stylistiques incluses
    });

    const res = await fetch(LT_API, {
      method:  'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
      },
      body,
      // Abandonne la requête après 8 secondes pour ne pas bloquer l'éditeur
      signal: AbortSignal.timeout(8000),
    });

    // Si l'API retourne une erreur HTTP → retourne un tableau vide silencieusement
    if (!res.ok) return NextResponse.json({ matches: [] });

    const data = await res.json();
    return NextResponse.json({ matches: data.matches ?? [] });

  } catch {
    // Erreur réseau, timeout, JSON invalide → retourne silencieusement un tableau vide
    return NextResponse.json({ matches: [] });
  }
}
