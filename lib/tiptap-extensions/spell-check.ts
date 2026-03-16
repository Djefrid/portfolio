/**
 * ============================================================================
 * EXTENSION TIPTAP — lib/tiptap-extensions/spell-check.ts
 * ============================================================================
 *
 * Extension de vérification orthographique via LanguageTool pour TipTap.
 * Souligne les erreurs détectées via l'API `/api/spellcheck` (proxy interne).
 *
 * Architecture :
 *   1. À chaque modification du document, le texte brut est extrait
 *      (via `extractText`) et envoyé à l'API LanguageTool (debounce 250ms)
 *   2. L'API retourne une liste de `matches` (erreurs avec position/longueur)
 *   3. Les erreurs non ignorées sont converties en `Decoration.inline`
 *      avec la classe CSS `spell-error` (soulignement rouge)
 *   4. Les décorations sont stockées dans le plugin state (`SPELL_KEY`)
 *      et mise à jour à chaque changement de document
 *
 * Gestion des mots ignorés :
 *   `getIgnored()` retourne la liste des mots à ne pas souligner
 *   (union de la liste de session + dictionnaire persistant).
 *
 * Données attachées aux décorations (data-* attributes) :
 *   - `data-message` : message d'erreur LanguageTool
 *   - `data-fixes`   : suggestions de correction séparées par `|`
 *   - `data-from/to` : positions ProseMirror (pour les corrections en 1 clic)
 *
 * Async dans un plugin ProseMirror :
 *   Le callback `checkSpelling` est async mais `apply()` doit être synchrone.
 *   Solution : `apply` démarre l'appel async en arrière-plan, et quand il
 *   se termine, il utilise `dispatchFn` (stocké dans `view()`) pour dispatcher
 *   une transaction avec les nouvelles décorations via `tr.setMeta(SPELL_KEY, decos)`.
 *
 * Note : Cette extension n'est plus utilisée dans l'éditeur (supprimée au profit
 * du correcteur natif du navigateur `spellcheck: 'true'` dans editorProps).
 * Elle reste disponible si le correcteur LanguageTool doit être réactivé.
 * ============================================================================
 */

import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from 'prosemirror-state';
import { Decoration, DecorationSet } from 'prosemirror-view';

/** Clé unique du plugin ProseMirror — identifie le state des décorations */
const SPELL_KEY = new PluginKey<DecorationSet>('spellCheck');

/** Format d'une erreur retournée par l'API LanguageTool */
interface LTMatch {
  offset: number;       // Position dans le texte (0-based)
  length: number;       // Longueur du mot/phrase erronée
  message: string;      // Description de l'erreur
  replacements: { value: string }[];  // Suggestions de correction
  rule: { id: string; description: string };
}

interface SpellCheckOptions {
  /** Retourne les mots ignorés (session + dictionnaire persistant) */
  getIgnored: () => string[];
}

/**
 * Helper debounce générique.
 * Retarde l'exécution de `fn` de `ms` millisecondes.
 * Tout appel pendant le délai réinitialise le timer.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function debounce<T extends (...args: any[]) => void>(fn: T, ms: number): T {
  let timer: ReturnType<typeof setTimeout>;
  return ((...args: unknown[]) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  }) as T;
}

/**
 * Extrait le texte brut d'un document ProseMirror.
 * Les nœuds de bloc sont séparés par un saut de ligne.
 * Nécessaire car LanguageTool travaille sur du texte brut (pas du HTML).
 */
function extractText(doc: Parameters<typeof DecorationSet.create>[0]): string {
  let text = '';
  doc.descendants(node => {
    if (node.isText) text += node.text;
    else if (node.isBlock) text += '\n';
  });
  return text;
}

export const SpellCheckExtension = Extension.create<SpellCheckOptions>({
  name: 'spellCheck',

  addOptions() {
    return { getIgnored: () => [] };
  },

  addProseMirrorPlugins() {
    const opts = this.options;

    /**
     * Fonction principale debounced :
     * 1. Appelle l'API /api/spellcheck avec le texte brut
     * 2. Filtre les mots ignorés
     * 3. Mappe les positions LanguageTool (texte brut) → positions ProseMirror
     * 4. Crée les décorations inline avec la classe 'spell-error'
     * 5. Dispatche les décorations via le dispatchFn (asynchrone)
     */
    const checkSpelling = debounce(async (
      text: string,
      dispatch: (decos: DecorationSet, doc: Parameters<typeof DecorationSet.create>[0]) => void,
      doc: Parameters<typeof DecorationSet.create>[0],
    ) => {
      if (text.trim().length < 5) {
        dispatch(DecorationSet.empty, doc);
        return;
      }
      try {
        const res = await fetch('/api/spellcheck', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ text }),
        });
        if (!res.ok) return;
        const { matches } = await res.json() as { matches: LTMatch[] };

        // Mots ignorés (session + dictionnaire persistant)
        const ignored = opts.getIgnored().map(w => w.toLowerCase());

        // Construire les décorations — mapping offset texte brut → pos ProseMirror
        const decos: Decoration[] = [];
        let docOffset = 0;

        doc.descendants((node, pos) => {
          if (!node.isText || !node.text) return;

          for (const match of matches) {
            const start = match.offset;
            const end   = match.offset + match.length;

            if (start >= docOffset && end <= docOffset + node.text.length) {
              const matchedWord = text.slice(start, end).toLowerCase();
              // Filtrer les mots ignorés
              if (ignored.includes(matchedWord)) continue;

              const from = pos + (start - docOffset);
              const to   = pos + (end   - docOffset);
              decos.push(
                Decoration.inline(from, to, {
                  class:          'spell-error',
                  'data-message': match.message,
                  // Jusqu'à 5 suggestions séparées par "|" (pour le menu contextuel)
                  'data-fixes':   match.replacements.slice(0, 5).map(r => r.value).join('|'),
                  'data-from':    String(from),
                  'data-to':      String(to),
                })
              );
            }
          }
          docOffset += node.text.length;
        });

        dispatch(DecorationSet.create(doc, decos), doc);
      } catch { /* réseau indisponible — ignorer silencieusement */ }
    }, 250) as unknown as (
      text: string,
      dispatch: (decos: DecorationSet, doc: Parameters<typeof DecorationSet.create>[0]) => void,
      doc: Parameters<typeof DecorationSet.create>[0],
    ) => void;

    /** Référence vers la fonction de dispatch (initialisée dans view()) */
    let dispatchFn: ((decos: DecorationSet, doc: Parameters<typeof DecorationSet.create>[0]) => void) | null = null;

    return [
      new Plugin({
        key: SPELL_KEY,
        state: {
          init: () => DecorationSet.empty,
          apply(tr, decos) {
            if (tr.docChanged) {
              // Lance la vérification async (non bloquante)
              const text = extractText(tr.doc);
              if (dispatchFn) checkSpelling(text, dispatchFn, tr.doc);
            }
            // Mise à jour via meta (résultat de l'API retourné de manière async)
            const meta = tr.getMeta(SPELL_KEY);
            if (meta) return meta;
            // Mapper les décorations existantes si le doc a changé (positions mises à jour)
            return tr.docChanged ? decos.map(tr.mapping, tr.doc) : decos;
          },
        },
        view(editorView) {
          // Stocke le dispatcher pour l'appel asynchrone de checkSpelling
          dispatchFn = (decos: DecorationSet, _doc: Parameters<typeof DecorationSet.create>[0]) => {
            const tr = editorView.state.tr.setMeta(SPELL_KEY, decos);
            editorView.dispatch(tr);
          };
          return { destroy() { dispatchFn = null; } };
        },
        props: {
          /** Expose les décorations du plugin pour le rendu ProseMirror */
          decorations(state) { return SPELL_KEY.getState(state); },
        },
      }),
    ];
  },
});
