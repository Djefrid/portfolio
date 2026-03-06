import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from 'prosemirror-state';
import { Decoration, DecorationSet } from 'prosemirror-view';

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
          // Afficher le ghost text via une décoration widget
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

          // Tab = accepter, Escape = effacer
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
