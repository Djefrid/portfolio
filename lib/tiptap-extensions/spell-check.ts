import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from 'prosemirror-state';
import { Decoration, DecorationSet } from 'prosemirror-view';

const SPELL_KEY = new PluginKey<DecorationSet>('spellCheck');

interface LTMatch {
  offset: number;
  length: number;
  message: string;
  replacements: { value: string }[];
  rule: { id: string; description: string };
}

// Debounce helper
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function debounce<T extends (...args: any[]) => void>(fn: T, ms: number): T {
  let timer: ReturnType<typeof setTimeout>;
  return ((...args: unknown[]) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  }) as T;
}

// Extraire le texte brut d'un document ProseMirror
function extractText(doc: Parameters<typeof DecorationSet.create>[0]): string {
  let text = '';
  doc.descendants(node => {
    if (node.isText) text += node.text;
    else if (node.isBlock) text += '\n';
  });
  return text;
}

export const SpellCheckExtension = Extension.create({
  name: 'spellCheck',

  addProseMirrorPlugins() {
    // Fonction qui appelle l'API et retourne les décorations
    const checkSpelling = debounce(async (text: string, dispatch: (decos: DecorationSet, doc: Parameters<typeof DecorationSet.create>[0]) => void, doc: Parameters<typeof DecorationSet.create>[0]) => {
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

        // Construire les décorations
        const decos: Decoration[] = [];
        let docOffset = 0;

        doc.descendants((node, pos) => {
          if (!node.isText || !node.text) return;

          for (const match of matches) {
            const start = match.offset;
            const end   = match.offset + match.length;

            if (start >= docOffset && end <= docOffset + node.text.length) {
              const from = pos + (start - docOffset);
              const to   = pos + (end   - docOffset);
              decos.push(
                Decoration.inline(from, to, {
                  class:           'spell-error',
                  'data-message':  match.message,
                  'data-fixes':    match.replacements.slice(0, 5).map(r => r.value).join('|'),
                })
              );
            }
          }
          docOffset += node.text.length;
        });

        dispatch(DecorationSet.create(doc, decos), doc);
      } catch { /* réseau indisponible — ignorer */ }
    }, 1200) as unknown as (text: string, dispatch: (decos: DecorationSet, doc: Parameters<typeof DecorationSet.create>[0]) => void, doc: Parameters<typeof DecorationSet.create>[0]) => void;

    let dispatchFn: ((decos: DecorationSet, doc: Parameters<typeof DecorationSet.create>[0]) => void) | null = null;

    return [
      new Plugin({
        key: SPELL_KEY,
        state: {
          init: () => DecorationSet.empty,
          apply(tr, decos) {
            if (tr.docChanged) {
              // Appel asynchrone déclenché par le changement
              const text = extractText(tr.doc);
              if (dispatchFn) checkSpelling(text, dispatchFn, tr.doc);
            }
            // Mise à jour des méta (résultat de l'API)
            const meta = tr.getMeta(SPELL_KEY);
            if (meta) return meta;
            // Mapper les décorations existantes si le doc a changé
            return tr.docChanged ? decos.map(tr.mapping, tr.doc) : decos;
          },
        },
        view(editorView) {
          // Stocker le dispatcher pour l'appel async
          dispatchFn = (decos: DecorationSet, _doc: Parameters<typeof DecorationSet.create>[0]) => {
            const tr = editorView.state.tr.setMeta(SPELL_KEY, decos);
            editorView.dispatch(tr);
          };
          return { destroy() { dispatchFn = null; } };
        },
        props: {
          decorations(state) { return SPELL_KEY.getState(state); },
        },
      }),
    ];
  },
});
