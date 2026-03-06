import { Extension } from '@tiptap/core';
import type { EditorState } from '@tiptap/pm/state';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    indent: {
      indent: () => ReturnType;
      outdent: () => ReturnType;
    };
  }
}

const INDENT_STEP = 40; // px par niveau
const MAX_INDENT  = 280;

// Nœuds de type liste — Tab leur appartient (sink/lift list item)
const LIST_TYPES = ['listItem', 'taskItem'];
// Nœuds qui acceptent l'indent custom (margin-left)
const BLOCK_TYPES = ['paragraph', 'heading', 'blockquote'];

/** Vérifie si la sélection est entièrement dans une liste */
function isInList(state: EditorState): boolean {
  const { $from } = state.selection;
  for (let d = $from.depth; d > 0; d--) {
    const node = $from.node(d);
    if (LIST_TYPES.includes(node.type.name)) return true;
  }
  return false;
}

export const Indent = Extension.create({
  name: 'indent',

  // Priorité basse pour que Tab soit d'abord traité par les extensions de listes
  priority: 100,

  addOptions() {
    return { types: [...BLOCK_TYPES] };
  },

  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          indent: {
            default: 0,
            parseHTML: element => {
              const ml = parseInt(element.style.marginLeft || '0', 10);
              return isNaN(ml) ? 0 : ml;
            },
            renderHTML: attributes => {
              if (!attributes.indent) return {};
              return { style: `margin-left: ${attributes.indent}px` };
            },
          },
        },
      },
    ];
  },

  addCommands() {
    return {
      indent: () => ({ tr, state, dispatch }) => {
        const { from, to } = state.selection;
        let changed = false;
        state.doc.nodesBetween(from, to, (node, pos) => {
          if (this.options.types.includes(node.type.name)) {
            const current = (node.attrs.indent as number) || 0;
            const next    = Math.min(current + INDENT_STEP, MAX_INDENT);
            if (next !== current) {
              tr.setNodeMarkup(pos, undefined, { ...node.attrs, indent: next });
              changed = true;
            }
          }
        });
        if (changed && dispatch) dispatch(tr);
        return changed;
      },

      outdent: () => ({ tr, state, dispatch }) => {
        const { from, to } = state.selection;
        let changed = false;
        state.doc.nodesBetween(from, to, (node, pos) => {
          if (this.options.types.includes(node.type.name)) {
            const current = (node.attrs.indent as number) || 0;
            const next    = Math.max(current - INDENT_STEP, 0);
            if (next !== current) {
              tr.setNodeMarkup(pos, undefined, { ...node.attrs, indent: next });
              changed = true;
            }
          }
        });
        if (changed && dispatch) dispatch(tr);
        return changed;
      },
    };
  },

  addKeyboardShortcuts() {
    return {
      // Tab : uniquement hors liste (dans les listes, StarterKit gère sink/lift)
      Tab: ({ editor }) => {
        if (isInList(editor.state)) return false; // laisse passer aux extensions de liste
        return editor.commands.indent();
      },
      'Shift-Tab': ({ editor }) => {
        if (isInList(editor.state)) return false;
        return editor.commands.outdent();
      },
    };
  },
});
