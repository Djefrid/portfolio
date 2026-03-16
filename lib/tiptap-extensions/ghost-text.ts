/**
 * ============================================================================
 * EXTENSION TIPTAP — lib/tiptap-extensions/ghost-text.ts
 * ============================================================================
 *
 * Extension de texte fantôme (ghost text / autosuggestion inline) pour TipTap.
 * Affiche une suggestion grisée après le curseur, acceptée par Tab.
 *
 * Fonctionnement :
 *   1. À chaque changement de document ou de sélection, `getSuggestion(textBefore)`
 *      est appelé avec le texte du paragraphe courant avant le curseur
 *   2. Si une suggestion est retournée, elle est stockée dans le state ProseMirror
 *      via `tr.setMeta(GHOST_KEY, { suggestion, pos })`
 *   3. Un `Decoration.widget` ProseMirror affiche un `<span class="ghost-text-suggestion">`
 *      après le curseur — purement visuel, pas dans le document réel
 *   4. Tab → insère le texte suggéré à la position du curseur
 *   5. Escape ou toute autre touche → efface la suggestion
 *
 * Debounce (`debounceMs`) :
 *   Permet de délayer l'appel à `getSuggestion` pour éviter des calculs
 *   trop fréquents (ex: appels réseau). Défaut : 0 (immédiat).
 *
 * Plugin ProseMirror (bas niveau) :
 *   - `state.apply(tr)` : gère les transitions d'état du plugin
 *     (meta = nouvelle suggestion, docChanged = efface la suggestion)
 *   - `view()` : démarre le watcher sur les changements doc/sélection
 *   - `props.decorations` : calcule les décorations à chaque rendu
 *   - `props.handleKeyDown` : intercepte Tab/Escape avant TipTap
 *
 * Note : Cette extension est définie mais n'est plus utilisée dans l'éditeur
 * (supprimée au profit du correcteur natif du navigateur + autocomplétion #tags).
 * Elle reste disponible pour usage futur si besoin de suggestions IA.
 * ============================================================================
 */

import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from 'prosemirror-state';
import { Decoration, DecorationSet } from 'prosemirror-view';

/** Clé unique du plugin ProseMirror — identifie le state du ghost text */
const GHOST_KEY = new PluginKey<{ suggestion: string; pos: number }>('ghostText');

interface GhostTextOptions {
  /** Appelé avec le texte avant le curseur — retourne une suggestion ou '' */
  getSuggestion: (textBefore: string) => string;
  /** Nombre de ms avant d'afficher la suggestion (défaut : 0 = immédiat) */
  debounceMs?: number;
}

export const GhostTextExtension = Extension.create<GhostTextOptions>({
  name: 'ghostText',

  addOptions() {
    return { getSuggestion: () => '', debounceMs: 0 };
  },

  addProseMirrorPlugins() {
    const opts = this.options;
    let debounceTimer: ReturnType<typeof setTimeout>;

    return [
      new Plugin({
        key: GHOST_KEY,

        /**
         * State du plugin :
         * - init : suggestion vide au départ
         * - apply :
         *   - si meta (résultat async de getSuggestion) → met à jour la suggestion
         *   - si docChanged → efface la suggestion (le curseur a bougé)
         *   - sinon → conserve l'état actuel
         */
        state: {
          init: () => ({ suggestion: '', pos: 0 }),
          apply(tr, state) {
            const meta = tr.getMeta(GHOST_KEY);
            if (meta !== undefined) return meta;
            // Si le doc change, effacer la suggestion
            if (tr.docChanged) return { suggestion: '', pos: 0 };
            return state;
          },
        },

        /**
         * Vue du plugin : s'abonne aux mises à jour de l'éditeur.
         * Ne recalcule la suggestion que si le doc ou la sélection a changé.
         */
        view(editorView) {
          const update = () => {
            const { state } = editorView;
            const { $from } = state.selection;

            // Texte du paragraphe courant avant le curseur
            const textBefore = $from.parent.textContent.slice(0, $from.parentOffset);

            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
              const suggestion = opts.getSuggestion(textBefore);
              const pos = $from.pos;

              if (suggestion) {
                editorView.dispatch(
                  editorView.state.tr.setMeta(GHOST_KEY, { suggestion, pos })
                );
              }
            }, opts.debounceMs ?? 0);
          };

          return {
            update(view, prevState) {
              // Déclencher uniquement quand le doc ou la sélection change
              if (
                view.state.doc === prevState.doc &&
                view.state.selection.eq(prevState.selection)
              ) return;
              update();
            },
          };
        },

        props: {
          /**
           * Rendu des décorations : affiche le ghost text via un widget.
           * `side: 1` place le widget APRÈS le curseur (pas avant).
           * Le span reçoit `className='ghost-text-suggestion'` pour le CSS.
           */
          decorations(state) {
            const { suggestion, pos } = GHOST_KEY.getState(state) ?? { suggestion: '', pos: 0 };
            if (!suggestion) return DecorationSet.empty;

            const widget = Decoration.widget(
              pos,
              () => {
                const span = document.createElement('span');
                span.textContent = suggestion;
                span.className   = 'ghost-text-suggestion';
                return span;
              },
              { side: 1, key: 'ghost-suggestion' }
            );
            return DecorationSet.create(state.doc, [widget]);
          },

          /**
           * Gestion des touches :
           * - Tab     → accepte la suggestion (insère le texte, efface le widget)
           * - Escape  → efface la suggestion sans bloquer la touche
           * - Autre   → efface la suggestion (pour ne pas bloquer la frappe)
           */
          handleKeyDown(view, event) {
            const { suggestion, pos } = GHOST_KEY.getState(view.state) ?? { suggestion: '', pos: 0 };
            if (!suggestion) return false;

            if (event.key === 'Tab') {
              event.preventDefault();
              // Insérer le texte suggéré à la position du curseur
              view.dispatch(
                view.state.tr
                  .insertText(suggestion, pos)
                  .setMeta(GHOST_KEY, { suggestion: '', pos: 0 })
              );
              return true;
            }

            if (event.key === 'Escape') {
              view.dispatch(view.state.tr.setMeta(GHOST_KEY, { suggestion: '', pos: 0 }));
              return false;
            }

            // Toute autre touche efface la suggestion (sans bloquer la frappe)
            view.dispatch(view.state.tr.setMeta(GHOST_KEY, { suggestion: '', pos: 0 }));
            return false;
          },
        },
      }),
    ];
  },
});
