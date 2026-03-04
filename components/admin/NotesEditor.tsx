"use client";

import {
  useState, useEffect, useRef, useCallback, useMemo,
} from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Pin, Trash2, Search, StickyNote, FolderPlus,
  Hash, MoreHorizontal, FolderOpen, Folder, ArrowLeft,
  ChevronRight, X, RotateCcw, ArrowUpDown, Zap, Image as ImageIcon,
  Bold, Italic, Underline as UnderlineIcon, Strikethrough,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  List, ListOrdered, ListChecks,
  Quote, Minus, Code2, Link as LinkIcon,
  Table as TableIcon, Highlighter,
  Subscript as SubIcon, Superscript as SupIcon,
  Undo2, Redo2, FileUp, Maximize2, Minimize2, Download, FileText,
} from 'lucide-react';
import { useEditor, EditorContent } from '@tiptap/react';
import { BubbleMenu } from '@tiptap/react/menus';
import type { Editor } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { all, createLowlight } from 'lowlight';
import ImageExtension from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableHeader } from '@tiptap/extension-table-header';
import { TableCell } from '@tiptap/extension-table-cell';
import TextAlign from '@tiptap/extension-text-align';
import Highlight from '@tiptap/extension-highlight';
import { TextStyle } from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import Superscript from '@tiptap/extension-superscript';
import Subscript from '@tiptap/extension-subscript';
import CharacterCount from '@tiptap/extension-character-count';
import { uploadNoteImage, uploadNoteFile } from '@/lib/upload-image';
import { useAdminNotes } from '@/hooks/useAdminNotes';
import {
  createNote, updateNote, deleteNote, moveNote,
  permanentlyDeleteNote, recoverNote, silentlyDeleteNote,
  createFolder, createSmartFolder, updateFolder, updateSmartFolderFilters, deleteFolder,
  createTag, deleteTag,
  Note, Folder as FolderType, SmartFolderFilter,
} from '@/lib/notes-service';

// ── Lowlight instance (module-level pour éviter recréation) ───────────────────
const lowlight = createLowlight(all);

// ── Slash commands ────────────────────────────────────────────────────────────
const SLASH_CMDS = [
  { id: 'h1',    label: 'Titre 1',         desc: 'Grand titre',          apply: (e: Editor) => e.chain().focus().toggleHeading({ level: 1 }).run() },
  { id: 'h2',    label: 'Titre 2',         desc: 'Titre moyen',          apply: (e: Editor) => e.chain().focus().toggleHeading({ level: 2 }).run() },
  { id: 'h3',    label: 'Titre 3',         desc: 'Sous-titre',           apply: (e: Editor) => e.chain().focus().toggleHeading({ level: 3 }).run() },
  { id: 'ul',    label: 'Liste à puces',   desc: 'Liste non ordonnée',   apply: (e: Editor) => e.chain().focus().toggleBulletList().run() },
  { id: 'ol',    label: 'Liste numérotée', desc: 'Liste ordonnée',       apply: (e: Editor) => e.chain().focus().toggleOrderedList().run() },
  { id: 'todo',  label: 'Tâches',          desc: 'Cases à cocher',       apply: (e: Editor) => e.chain().focus().toggleTaskList().run() },
  { id: 'quote', label: 'Citation',        desc: 'Bloc de citation',     apply: (e: Editor) => e.chain().focus().toggleBlockquote().run() },
  { id: 'code',  label: 'Bloc de code',    desc: 'Code avec coloration', apply: (e: Editor) => e.chain().focus().toggleCodeBlock().run() },
  { id: 'table', label: 'Tableau',         desc: 'Tableau 3×3',          apply: (e: Editor) => e.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run() },
  { id: 'hr',    label: 'Séparateur',      desc: 'Ligne horizontale',    apply: (e: Editor) => e.chain().focus().setHorizontalRule().run() },
] as const;

// ── Langages pour code blocks ─────────────────────────────────────────────────
const LANGUAGES = [
  { value: 'auto',       label: 'Auto' },
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'python',     label: 'Python' },
  { value: 'java',       label: 'Java' },
  { value: 'c',          label: 'C' },
  { value: 'cpp',        label: 'C++' },
  { value: 'csharp',     label: 'C#' },
  { value: 'go',         label: 'Go' },
  { value: 'rust',       label: 'Rust' },
  { value: 'php',        label: 'PHP' },
  { value: 'ruby',       label: 'Ruby' },
  { value: 'swift',      label: 'Swift' },
  { value: 'kotlin',     label: 'Kotlin' },
  { value: 'html',       label: 'HTML' },
  { value: 'css',        label: 'CSS' },
  { value: 'json',       label: 'JSON' },
  { value: 'yaml',       label: 'YAML' },
  { value: 'sql',        label: 'SQL' },
  { value: 'bash',       label: 'Bash' },
  { value: 'markdown',   label: 'Markdown' },
] as const;

// ── Types ────────────────────────────────────────────────────────────────────

type ViewFilter =
  | 'all'
  | 'pinned'
  | 'inbox'
  | 'trash'
  | { type: 'folder'; id: string }
  | { type: 'tag';    tag: string };

type SortBy      = 'dateModified' | 'dateCreated' | 'title';
type SaveStatus  = 'saved' | 'saving' | 'unsaved' | 'error';
type MobilePanel = 'sidebar' | 'list' | 'editor';

// ── Helpers ──────────────────────────────────────────────────────────────────

function viewEq(a: ViewFilter, b: ViewFilter) {
  return JSON.stringify(a) === JSON.stringify(b);
}

function fmtDate(d: Date): string {
  const diff = Date.now() - d.getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'Auj.';
  if (days === 1) return 'Hier';
  if (days < 7)   return `${days}j`;
  return d.toLocaleDateString('fr-CA', { day: 'numeric', month: 'short' });
}

function daysUntilPurge(deletedAt: Date): number {
  const diff = 30 - Math.floor((Date.now() - deletedAt.getTime()) / 86400000);
  return Math.max(0, diff);
}

/** Retire les balises HTML — compatible plain text ET contenu HTML de TipTap. */
function stripHtml(html: string): string {
  return html
    .replace(/<\/?(p|div|br|h[1-6]|li|ul|ol)[^>]*>/gi, ' ')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();
}

function viewLabel(view: ViewFilter, folders: FolderType[]): string {
  if (view === 'all')    return 'Toutes les notes';
  if (view === 'pinned') return 'Épinglées';
  if (view === 'inbox')  return 'Toutes mes notes';
  if (view === 'trash')  return 'Corbeille';
  if (typeof view === 'object' && view.type === 'folder')
    return folders.find(f => f.id === view.id)?.name ?? 'Dossier';
  if (typeof view === 'object' && view.type === 'tag')
    return `#${view.tag}`;
  return '';
}

function applySmartFilters(notes: Note[], filters: SmartFolderFilter): Note[] {
  let result = [...notes];
  if (filters.tags && filters.tags.length > 0) {
    result = filters.tagLogic === 'and'
      ? result.filter(n => filters.tags!.every(t => n.tags.includes(t)))
      : result.filter(n => filters.tags!.some(t => n.tags.includes(t)));
  }
  if (filters.pinned !== undefined) {
    result = result.filter(n => n.pinned === filters.pinned);
  }
  if (filters.createdWithinDays) {
    const cutoff = new Date(Date.now() - filters.createdWithinDays * 86400000);
    result = result.filter(n => n.createdAt >= cutoff);
  }
  if (filters.modifiedWithinDays) {
    const cutoff = new Date(Date.now() - filters.modifiedWithinDays * 86400000);
    result = result.filter(n => n.updatedAt >= cutoff);
  }
  return result;
}

// ── Arbre de dossiers ─────────────────────────────────────────────────────────

interface FolderNode extends FolderType { children: FolderNode[]; }

function buildFolderTree(folders: FolderType[]): FolderNode[] {
  const regular = folders.filter(f => !f.isSmart);
  const map = new Map<string, FolderNode>();
  regular.forEach(f => map.set(f.id, { ...f, children: [] }));
  const roots: FolderNode[] = [];
  regular.forEach(f => {
    const node = map.get(f.id)!;
    if (f.parentId && map.has(f.parentId)) map.get(f.parentId)!.children.push(node);
    else roots.push(node);
  });
  const sort = (nodes: FolderNode[]) => {
    nodes.sort((a, b) => a.order - b.order);
    nodes.forEach(n => sort(n.children));
  };
  sort(roots);
  return roots;
}

// ── SmartFolderModal ──────────────────────────────────────────────────────────

function SmartFolderModal({
  allTags,
  initial,
  onConfirm,
  onCancel,
}: {
  allTags:   string[];
  initial?:  { name: string; filters: SmartFolderFilter };
  onConfirm: (name: string, filters: SmartFolderFilter) => void;
  onCancel:  () => void;
}) {
  const [name,            setName]            = useState(initial?.name ?? 'Dossier intelligent');
  const [useTags,         setUseTags]         = useState(!!(initial?.filters?.tags?.length));
  const [selectedTags,    setSelectedTags]    = useState<string[]>(initial?.filters?.tags ?? []);
  const [tagLogic,        setTagLogic]        = useState<'and' | 'or'>(initial?.filters?.tagLogic ?? 'or');
  const [usePinned,       setUsePinned]       = useState(initial?.filters?.pinned !== undefined);
  const [useCreatedDays,  setUseCreatedDays]  = useState(!!(initial?.filters?.createdWithinDays));
  const [createdDays,     setCreatedDays]     = useState(initial?.filters?.createdWithinDays ?? 7);
  const [useModifiedDays, setUseModifiedDays] = useState(!!(initial?.filters?.modifiedWithinDays));
  const [modifiedDays,    setModifiedDays]    = useState(initial?.filters?.modifiedWithinDays ?? 7);

  const handleSubmit = () => {
    const filters: SmartFolderFilter = {};
    if (useTags && selectedTags.length > 0) {
      filters.tags     = selectedTags;
      filters.tagLogic = tagLogic;
    }
    if (usePinned) filters.pinned = true;
    if (useCreatedDays  && createdDays  > 0) filters.createdWithinDays  = createdDays;
    if (useModifiedDays && modifiedDays > 0) filters.modifiedWithinDays = modifiedDays;
    onConfirm(name.trim() || 'Dossier intelligent', filters);
  };

  const toggleTag = (t: string) =>
    setSelectedTags(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
      onClick={onCancel}
    >
      <div
        className="bg-dark-900 border border-dark-700 rounded-xl w-full max-w-md mx-4 shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="px-5 py-4 border-b border-dark-700 flex items-center gap-2">
          <Zap size={15} className="text-yellow-400" />
          <h2 className="text-sm font-semibold text-white">
            {initial ? 'Modifier le dossier intelligent' : 'Nouveau dossier intelligent'}
          </h2>
        </div>
        <div className="px-5 py-4 space-y-4 max-h-[60vh] overflow-y-auto">
          <div>
            <label className="text-xs text-gray-400 mb-1.5 block">Nom</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              className="w-full px-3 py-2 bg-dark-800 border border-dark-700 rounded-lg text-sm text-white focus:outline-none focus:ring-1 focus:ring-yellow-500/50"
              autoFocus
            />
          </div>
          <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest pt-1">Filtres</div>
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer select-none">
              <input type="checkbox" checked={useTags} onChange={e => setUseTags(e.target.checked)} className="accent-yellow-500 w-3.5 h-3.5" />
              Par tags
            </label>
            {useTags && (
              <div className="ml-5 space-y-2">
                {allTags.length === 0 ? (
                  <p className="text-xs text-gray-500">Aucun tag existant dans tes notes</p>
                ) : (
                  <div className="flex flex-wrap gap-1">
                    {allTags.map(t => (
                      <button key={t} type="button" onClick={() => toggleTag(t)}
                        className={`text-xs px-2 py-0.5 rounded-full border transition-colors ${
                          selectedTags.includes(t)
                            ? 'bg-yellow-500/25 text-yellow-300 border-yellow-500/50'
                            : 'bg-dark-800 text-gray-400 border-dark-600 hover:border-yellow-500/30 hover:text-gray-300'
                        }`}
                      >#{t}</button>
                    ))}
                  </div>
                )}
                <div className="flex gap-4 mt-1">
                  <label className="flex items-center gap-1.5 text-xs text-gray-400 cursor-pointer">
                    <input type="radio" name="tagLogic" checked={tagLogic === 'or'}  onChange={() => setTagLogic('or')}  className="accent-yellow-500" />Au moins un
                  </label>
                  <label className="flex items-center gap-1.5 text-xs text-gray-400 cursor-pointer">
                    <input type="radio" name="tagLogic" checked={tagLogic === 'and'} onChange={() => setTagLogic('and')} className="accent-yellow-500" />Tous les tags
                  </label>
                </div>
              </div>
            )}
          </div>
          <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer select-none">
            <input type="checkbox" checked={usePinned} onChange={e => setUsePinned(e.target.checked)} className="accent-yellow-500 w-3.5 h-3.5" />
            Épinglées uniquement
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer select-none flex-wrap">
            <input type="checkbox" checked={useCreatedDays} onChange={e => setUseCreatedDays(e.target.checked)} className="accent-yellow-500 w-3.5 h-3.5" />
            Créées dans les
            {useCreatedDays && (
              <input type="number" min={1} max={365} value={createdDays}
                onChange={e => setCreatedDays(Math.max(1, Number(e.target.value)))}
                onClick={e => e.stopPropagation()}
                className="w-14 px-2 py-0.5 bg-dark-700 border border-dark-600 rounded text-xs text-white focus:outline-none focus:ring-1 focus:ring-yellow-500/50 text-center"
              />
            )}
            derniers jours
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer select-none flex-wrap">
            <input type="checkbox" checked={useModifiedDays} onChange={e => setUseModifiedDays(e.target.checked)} className="accent-yellow-500 w-3.5 h-3.5" />
            Modifiées dans les
            {useModifiedDays && (
              <input type="number" min={1} max={365} value={modifiedDays}
                onChange={e => setModifiedDays(Math.max(1, Number(e.target.value)))}
                onClick={e => e.stopPropagation()}
                className="w-14 px-2 py-0.5 bg-dark-700 border border-dark-600 rounded text-xs text-white focus:outline-none focus:ring-1 focus:ring-yellow-500/50 text-center"
              />
            )}
            derniers jours
          </label>
        </div>
        <div className="px-5 py-3 border-t border-dark-700 flex justify-end gap-2">
          <button type="button" onClick={onCancel} className="px-3 py-1.5 text-sm text-gray-400 hover:text-white transition-colors">Annuler</button>
          <button type="button" onClick={handleSubmit} className="px-4 py-1.5 text-sm bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30 rounded-lg transition-colors flex items-center gap-1.5">
            <Zap size={12} />{initial ? 'Enregistrer' : 'Créer'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── FolderTreeItem ────────────────────────────────────────────────────────────

function FolderTreeItem({
  node, depth, view, onSelectView,
  editingId, editingName, setEditingId, setEditingName, commitRename,
  menuId, setMenuId, counts,
  onDeleteFolder, onCreateSubfolder,
  expandedIds, toggleExpand,
}: {
  node:              FolderNode;
  depth:             number;
  view:              ViewFilter;
  onSelectView:      (v: ViewFilter) => void;
  editingId:         string | null;
  editingName:       string;
  setEditingId:      (id: string | null) => void;
  setEditingName:    (name: string) => void;
  commitRename:      (id: string) => void;
  menuId:            string | null;
  setMenuId:         (id: string | null) => void;
  counts:            { byFolder: Record<string, number> };
  onDeleteFolder:    (id: string) => void;
  onCreateSubfolder: (parentId: string) => void;
  expandedIds:       Record<string, boolean>;
  toggleExpand:      (id: string) => void;
}) {
  const isActive    = viewEq(view, { type: 'folder', id: node.id });
  const hasChildren = node.children.length > 0;
  const isExpanded  = expandedIds[node.id] ?? true;

  const rowCls = `w-full flex items-center justify-between rounded-lg text-sm transition-colors ${
    isActive
      ? 'bg-yellow-500/15 text-yellow-300 font-medium'
      : 'text-gray-400 hover:text-white hover:bg-dark-700'
  }`;

  return (
    <div>
      <div className="relative group px-2" style={{ paddingLeft: 8 + depth * 12 }}>
        {editingId === node.id ? (
          <input
            aria-label="Nom du dossier"
            autoFocus
            value={editingName}
            onChange={e => setEditingName(e.target.value)}
            onBlur={() => commitRename(node.id)}
            onKeyDown={e => {
              if (e.key === 'Enter')  commitRename(node.id);
              if (e.key === 'Escape') setEditingId(null);
            }}
            className="w-full px-2 py-1.5 text-sm bg-dark-700 border border-yellow-500/50 rounded-lg text-white focus:outline-none my-0.5"
          />
        ) : (
          <button
            type="button"
            title={node.name}
            className={`${rowCls} px-1.5 py-1.5`}
            onClick={() => onSelectView({ type: 'folder', id: node.id })}
          >
            <span className="flex items-center gap-1 truncate min-w-0">
              <button
                type="button"
                onClick={e => { e.stopPropagation(); if (hasChildren) toggleExpand(node.id); }}
                className={`shrink-0 transition-transform ${hasChildren ? 'opacity-60 hover:opacity-100' : 'opacity-0 pointer-events-none'}`}
                style={{ width: 12 }}
              >
                <ChevronRight size={10} className={`transition-transform duration-150 ${isExpanded ? 'rotate-90' : ''}`} />
              </button>
              <FolderOpen size={13} className="shrink-0" />
              <span className="truncate">{node.name}</span>
            </span>
            <span className="flex items-center gap-1 shrink-0">
              <span className="text-xs opacity-50">{counts.byFolder[node.id] ?? 0}</span>
              <button
                type="button"
                title="Options"
                onClick={e => { e.stopPropagation(); setMenuId(menuId === node.id ? null : node.id); }}
                className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-dark-600 transition-opacity"
              >
                <MoreHorizontal size={11} />
              </button>
            </span>
          </button>
        )}

        {menuId === node.id && (
          <div
            className="absolute right-0 top-full z-50 mt-1 bg-dark-800 border border-dark-600 rounded-lg shadow-2xl overflow-hidden w-48"
            onClick={e => e.stopPropagation()}
          >
            <button type="button" onClick={() => { setEditingId(node.id); setEditingName(node.name); setMenuId(null); }}
              className="w-full px-3 py-2 text-sm text-left text-gray-300 hover:bg-dark-700">
              Renommer
            </button>
            <button type="button" onClick={() => { onCreateSubfolder(node.id); setMenuId(null); }}
              className="w-full px-3 py-2 text-sm text-left text-gray-300 hover:bg-dark-700 flex items-center gap-2">
              <FolderPlus size={12} /> Nouveau sous-dossier
            </button>
            <button type="button" onClick={() => { onDeleteFolder(node.id); setMenuId(null); }}
              className="w-full px-3 py-2 text-sm text-left text-red-400 hover:bg-dark-700">
              Supprimer
            </button>
          </div>
        )}
      </div>

      {hasChildren && isExpanded && (
        <div>
          {node.children.map(child => (
            <FolderTreeItem
              key={child.id}
              node={child}
              depth={depth + 1}
              view={view}
              onSelectView={onSelectView}
              editingId={editingId}
              editingName={editingName}
              setEditingId={setEditingId}
              setEditingName={setEditingName}
              commitRename={commitRename}
              menuId={menuId}
              setMenuId={setMenuId}
              counts={counts}
              onDeleteFolder={onDeleteFolder}
              onCreateSubfolder={onCreateSubfolder}
              expandedIds={expandedIds}
              toggleExpand={toggleExpand}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ── EditorToolbar ─────────────────────────────────────────────────────────────

function EditorToolbar({ editor, onImageClick, onFileClick, uploadProgress, focusMode, onFocusToggle, onExportMd, onExportPdf }: {
  editor:         Editor | null;
  onImageClick:   () => void;
  onFileClick:    () => void;
  uploadProgress: number | null;
  focusMode:      boolean;
  onFocusToggle:  () => void;
  onExportMd:     () => void;
  onExportPdf:    () => void;
}) {
  const [linkOpen, setLinkOpen] = useState(false);
  const [linkVal,  setLinkVal]  = useState('');

  if (!editor) return null;

  const TB = (
    active:   boolean,
    title:    string,
    onClick:  () => void,
    icon:     React.ReactNode,
    disabled?: boolean
  ) => (
    <button
      type="button" title={title} onClick={onClick} disabled={disabled}
      className={`p-1.5 rounded transition-colors ${
        active ? 'bg-yellow-500/20 text-yellow-400' : 'text-gray-500 hover:text-gray-300 hover:bg-dark-700'
      } disabled:opacity-30 disabled:cursor-not-allowed`}
    >{icon}</button>
  );

  const SEP = () => <div className="w-px h-4 bg-dark-700 mx-0.5 shrink-0" />;

  const [textColorOpen, setTextColorOpen] = useState(false);
  const [highlightOpen, setHighlightOpen] = useState(false);
  const [lastTextColor, setLastTextColor] = useState('#f9fafb');
  const [lastHighlight,  setLastHighlight]  = useState('#fef08a');
  const textColorRef = useRef<HTMLDivElement>(null);
  const highlightRef  = useRef<HTMLDivElement>(null);
  const [tableOpen,  setTableOpen]  = useState(false);
  const [tableHover, setTableHover] = useState({ r: 0, c: 0 });
  const tableRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (textColorRef.current && !textColorRef.current.contains(e.target as Node)) setTextColorOpen(false);
      if (highlightRef.current  && !highlightRef.current.contains(e.target as Node))  setHighlightOpen(false);
      if (tableRef.current      && !tableRef.current.contains(e.target as Node))      { setTableOpen(false); setTableHover({ r: 0, c: 0 }); }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Grille 6×10 couleurs — style Word (Noir → gris → blanc + palettes chromatiques)
  const COLOR_GRID = [
    ['#000000','#1a1a1a','#333333','#4d4d4d','#666666','#808080','#999999','#b3b3b3','#cccccc','#ffffff'],
    ['#1e3a5f','#1e40af','#1d4ed8','#2563eb','#3b82f6','#60a5fa','#93c5fd','#bfdbfe','#dbeafe','#eff6ff'],
    ['#14532d','#166534','#15803d','#16a34a','#22c55e','#4ade80','#86efac','#bbf7d0','#dcfce7','#f0fdf4'],
    ['#7f1d1d','#991b1b','#b91c1c','#dc2626','#ef4444','#f87171','#fca5a5','#fecaca','#fee2e2','#fff1f2'],
    ['#7c2d12','#c2410c','#ea580c','#f97316','#fb923c','#fdba74','#fcd34d','#fef08a','#fef9c3','#fffbeb'],
    ['#4c1d95','#6d28d9','#7c3aed','#8b5cf6','#a78bfa','#c4b5fd','#be185d','#ec4899','#fbcfe8','#fdf4ff'],
  ];

  // Palette surbrillance (couleurs vives / pastels)
  const HIGHLIGHT_COLORS = [
    '#fef08a','#fde68a','#fcd34d','#fbbf24',
    '#bbf7d0','#86efac','#4ade80','#22c55e',
    '#bfdbfe','#93c5fd','#60a5fa','#3b82f6',
    '#fecaca','#fca5a5','#f87171','#ef4444',
    '#e9d5ff','#c4b5fd','#a78bfa','#8b5cf6',
    '#fbcfe8','#f9a8d4','#f472b6','#ec4899',
    '#fed7aa','#fdba74','#fb923c','#f97316',
  ];

  const handleSetLink = () => {
    if (!linkVal.trim()) {
      editor.chain().focus().unsetLink().run();
    } else {
      const href = linkVal.startsWith('http') ? linkVal : `https://${linkVal}`;
      editor.chain().focus().setLink({ href }).run();
    }
    setLinkOpen(false);
    setLinkVal('');
  };

  return (
    <div className="border-b border-dark-800 shrink-0 select-none">
      {/* Ligne 1 — Police (ordre Word : Historique → Style → Formatage → Couleurs) */}
      <div className="flex items-center flex-wrap gap-0.5 px-2 py-1.5">
        {/* Groupe Historique */}
        {TB(false, 'Annuler (Ctrl+Z)', () => editor.chain().focus().undo().run(), <Undo2 size={13} />, !editor.can().undo())}
        {TB(false, 'Refaire (Ctrl+Y)', () => editor.chain().focus().redo().run(), <Redo2 size={13} />, !editor.can().redo())}
        <SEP />
        {/* Groupe Style */}
        <select
          title="Style de paragraphe"
          value={
            editor.isActive('heading', { level: 1 }) ? '1' :
            editor.isActive('heading', { level: 2 }) ? '2' :
            editor.isActive('heading', { level: 3 }) ? '3' : '0'
          }
          onChange={e => {
            const v = Number(e.target.value);
            if (v === 0) editor.chain().focus().setParagraph().run();
            else editor.chain().focus().toggleHeading({ level: v as 1|2|3 }).run();
          }}
          className="text-[11px] bg-dark-800 border border-dark-700 text-gray-400 rounded px-1.5 py-1 focus:outline-none cursor-pointer"
        >
          <option value="0">Normal</option>
          <option value="1">Titre 1</option>
          <option value="2">Titre 2</option>
          <option value="3">Titre 3</option>
        </select>
        <SEP />
        {/* Groupe Formatage caractère */}
        {TB(editor.isActive('bold'),        'Gras (Ctrl+B)',      () => editor.chain().focus().toggleBold().run(),        <Bold size={13} />)}
        {TB(editor.isActive('italic'),      'Italique (Ctrl+I)',  () => editor.chain().focus().toggleItalic().run(),      <Italic size={13} />)}
        {TB(editor.isActive('underline'),   'Souligné (Ctrl+U)', () => editor.chain().focus().toggleUnderline().run(),   <UnderlineIcon size={13} />)}
        {TB(editor.isActive('strike'),      'Barré',             () => editor.chain().focus().toggleStrike().run(),      <Strikethrough size={13} />)}
        {TB(editor.isActive('superscript'), 'Exposant',          () => editor.chain().focus().toggleSuperscript().run(), <SupIcon size={13} />)}
        {TB(editor.isActive('subscript'),   'Indice',            () => editor.chain().focus().toggleSubscript().run(),   <SubIcon size={13} />)}
        <SEP />
        {/* Groupe Couleurs — Surbrillance + Texte côte à côte, sans séparateur entre eux */}
        {/* Surbrillance — Word-style dropdown */}
        <div className="relative shrink-0" ref={highlightRef}>
          <button type="button" title="Surbrillance"
            onClick={() => { setHighlightOpen(o => !o); setTextColorOpen(false); }}
            className="flex flex-col items-center p-1 rounded hover:bg-dark-700 transition-colors">
            <Highlighter size={12} className="text-gray-300" />
            <div className="w-3.5 h-[3px] rounded-full mt-0.5 border border-dark-600" style={{ background: lastHighlight }} />
          </button>
          {highlightOpen && (
            <div className="absolute top-full left-0 mt-1 z-50 bg-dark-800 border border-dark-600 rounded-lg shadow-2xl p-2.5 min-w-max"
              onMouseDown={e => e.stopPropagation()}>
              <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Surbrillance</p>
              <div className="grid grid-cols-4 gap-1">
                {HIGHLIGHT_COLORS.map(c => (
                  <button key={c} type="button" title={c}
                    onClick={() => { editor.chain().focus().toggleHighlight({ color: c }).run(); setLastHighlight(c); setHighlightOpen(false); }}
                    style={{ background: c }}
                    className="w-5 h-5 rounded border border-dark-600 hover:scale-110 transition-transform"
                  />
                ))}
              </div>
              <button type="button"
                onClick={() => { editor.chain().focus().unsetHighlight().run(); setHighlightOpen(false); }}
                className="mt-2 w-full text-[10px] text-gray-400 hover:text-gray-200 py-1 border-t border-dark-700 hover:bg-dark-700 rounded transition-colors">
                ✕ Aucune surbrillance
              </button>
            </div>
          )}
        </div>
        <SEP />
        {/* Couleur du texte — Word-style dropdown avec grille 6×10 */}
        <div className="relative shrink-0" ref={textColorRef}>
          <button type="button" title="Couleur du texte"
            onClick={() => { setTextColorOpen(o => !o); setHighlightOpen(false); }}
            className="flex flex-col items-center p-1 rounded hover:bg-dark-700 transition-colors">
            <span className="text-[13px] font-bold text-gray-300 leading-none">A</span>
            <div className="w-3.5 h-[3px] rounded-full mt-0.5 border border-dark-600" style={{ background: lastTextColor }} />
          </button>
          {textColorOpen && (
            <div className="absolute top-full left-0 mt-1 z-50 bg-dark-800 border border-dark-600 rounded-lg shadow-2xl p-2.5 min-w-max"
              onMouseDown={e => e.stopPropagation()}>
              <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Couleur du texte</p>
              <div className="grid grid-cols-10 gap-0.5">
                {COLOR_GRID.flat().map(c => (
                  <button key={c} type="button" title={c}
                    onClick={() => { editor.chain().focus().setColor(c).run(); setLastTextColor(c); setTextColorOpen(false); }}
                    style={{ background: c }}
                    className="w-5 h-5 rounded-sm border border-dark-600 hover:scale-110 transition-transform hover:border-gray-400"
                  />
                ))}
              </div>
              <div className="flex items-center justify-between gap-2 mt-2 pt-1.5 border-t border-dark-700">
                <label className="flex items-center gap-1.5 text-[10px] text-gray-400 cursor-pointer hover:text-gray-200 transition-colors">
                  <div className="w-5 h-5 rounded-sm border border-dark-500 bg-gradient-to-br from-red-400 via-yellow-400 to-blue-400 relative overflow-hidden shrink-0">
                    <input type="color" aria-label="Couleur personnalisée du texte"
                      className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                      onChange={e => { editor.chain().focus().setColor(e.target.value).run(); setLastTextColor(e.target.value); }} />
                  </div>
                  Personnalisée
                </label>
                <button type="button"
                  onClick={() => { editor.chain().focus().unsetColor().run(); setTextColorOpen(false); }}
                  className="text-[10px] text-gray-400 hover:text-gray-200 px-1.5 py-0.5 rounded hover:bg-dark-700 transition-colors">
                  ✕ Réinitialiser
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Ligne 2 — Paragraphe + Insertion + Vue (ordre Word) */}
      <div className="flex items-center flex-wrap gap-0.5 px-2 py-1 border-t border-dark-900">
        {TB(editor.isActive({ textAlign: 'left' }),    'Aligner gauche', () => editor.chain().focus().setTextAlign('left').run(),    <AlignLeft size={13} />)}
        {TB(editor.isActive({ textAlign: 'center' }),  'Centrer',        () => editor.chain().focus().setTextAlign('center').run(),  <AlignCenter size={13} />)}
        {TB(editor.isActive({ textAlign: 'right' }),   'Aligner droite', () => editor.chain().focus().setTextAlign('right').run(),   <AlignRight size={13} />)}
        {TB(editor.isActive({ textAlign: 'justify' }), 'Justifier',      () => editor.chain().focus().setTextAlign('justify').run(), <AlignJustify size={13} />)}
        <SEP />
        {TB(editor.isActive('bulletList'),  'Liste à puces',   () => editor.chain().focus().toggleBulletList().run(),  <List size={13} />)}
        {TB(editor.isActive('orderedList'), 'Liste numérotée', () => editor.chain().focus().toggleOrderedList().run(), <ListOrdered size={13} />)}
        {TB(editor.isActive('taskList'),    'Liste de tâches', () => editor.chain().focus().toggleTaskList().run(),    <ListChecks size={13} />)}
        <SEP />
        {TB(editor.isActive('blockquote'), 'Citation',              () => editor.chain().focus().toggleBlockquote().run(), <Quote size={13} />)}
        {TB(editor.isActive('codeBlock'),  'Bloc de code',          () => editor.chain().focus().toggleCodeBlock().run(),  <Code2 size={13} />)}
        {TB(false,                         'Séparateur horizontal', () => editor.chain().focus().setHorizontalRule().run(), <Minus size={13} />)}
        {/* Grid picker tableau — style Word/Google Docs */}
        <div className="relative" ref={tableRef}>
          <button
            type="button"
            title="Insérer un tableau"
            onClick={() => setTableOpen(o => !o)}
            className={`p-1.5 rounded transition-colors ${tableOpen ? 'bg-yellow-500/20 text-yellow-400' : 'text-gray-500 hover:text-gray-300 hover:bg-dark-700'}`}
          >
            <TableIcon size={13} />
          </button>
          {tableOpen && (
            <div className="absolute top-full left-0 mt-1 z-50 bg-dark-800 border border-dark-700 rounded-lg p-2.5 shadow-2xl select-none"
              onMouseLeave={() => setTableHover({ r: 0, c: 0 })}>
              <div className="flex flex-col gap-0.5 mb-2">
                {Array.from({ length: 8 }).map((_, ri) => (
                  <div key={ri} className="flex gap-0.5">
                    {Array.from({ length: 8 }).map((_, ci) => (
                      <div
                        key={ci}
                        className={`w-5 h-5 border rounded-sm cursor-pointer transition-colors ${
                          ri < tableHover.r && ci < tableHover.c
                            ? 'bg-yellow-500/30 border-yellow-500/60'
                            : 'bg-dark-700 border-dark-600 hover:bg-dark-600'
                        }`}
                        onMouseEnter={() => setTableHover({ r: ri + 1, c: ci + 1 })}
                        onClick={() => {
                          editor.chain().focus().insertTable({ rows: tableHover.r, cols: tableHover.c, withHeaderRow: true }).run();
                          setTableOpen(false);
                          setTableHover({ r: 0, c: 0 });
                        }}
                      />
                    ))}
                  </div>
                ))}
              </div>
              <p className="text-center text-xs text-gray-400 min-h-[1rem]">
                {tableHover.r > 0 && tableHover.c > 0
                  ? `${tableHover.r} × ${tableHover.c} tableau`
                  : 'Survoler pour choisir'}
              </p>
            </div>
          )}
        </div>
        <SEP />
        {/* Groupe Insertion — Lien + Image + Fichier côte à côte */}
        <div className="relative">
          {TB(editor.isActive('link'), 'Lien hypertexte', () => {
            if (editor.isActive('link')) { editor.chain().focus().unsetLink().run(); setLinkOpen(false); }
            else { setLinkVal(editor.getAttributes('link').href || ''); setLinkOpen(o => !o); }
          }, <LinkIcon size={13} />)}
          {linkOpen && (
            <div className="absolute top-full left-0 mt-1 z-50 bg-dark-800 border border-dark-600 rounded-lg p-2 shadow-xl flex gap-1.5 min-w-[210px]"
              onMouseDown={e => e.stopPropagation()}>
              <input autoFocus value={linkVal} onChange={e => setLinkVal(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleSetLink(); if (e.key === 'Escape') setLinkOpen(false); }}
                placeholder="https://..."
                className="flex-1 text-xs bg-dark-700 border border-dark-600 rounded px-2 py-1 text-gray-300 focus:outline-none focus:border-yellow-500/50"
              />
              <button type="button" onClick={handleSetLink}
                className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded hover:bg-yellow-500/30">OK</button>
            </div>
          )}
        </div>
        {TB(false, 'Insérer une image',  onImageClick, <ImageIcon size={13} />)}
        {TB(false, 'Joindre un fichier', onFileClick,  <FileUp size={13} />)}
        {uploadProgress !== null && (
          <div className="flex items-center gap-1.5 text-xs text-gray-500 ml-1">
            <div className="w-16 h-1 bg-dark-700 rounded-full overflow-hidden">
              <div className="h-full bg-yellow-500 transition-all duration-200" style={{ width: `${uploadProgress}%` }} />
            </div>
            <span>{uploadProgress}%</span>
          </div>
        )}
        {/* Groupe Vue — poussé à droite comme dans Word */}
        <div className="ml-auto flex items-center gap-0.5">
          <SEP />
          {TB(false, 'Exporter en Markdown', onExportMd,  <FileText size={13} />)}
          {TB(false, 'Imprimer / PDF',       onExportPdf, <Download size={13} />)}
          {TB(focusMode, focusMode ? 'Quitter le mode focus' : 'Mode focus (plein écran)', onFocusToggle,
            focusMode ? <Minimize2 size={13} /> : <Maximize2 size={13} />)}
        </div>
      </div>
    </div>
  );
}

// ── Sidebar ──────────────────────────────────────────────────────────────────

function NotesSidebar({
  notes, deletedNotes, folders, manualTags, view, onSelectView,
  newFolderPendingId, onFolderCreated, onEditSmartFolder,
  onCreateTag, onDeleteTag, trashBtnRef, trashShake, onCreateSubfolder,
}: {
  notes:              Note[];
  deletedNotes:       Note[];
  folders:            FolderType[];
  manualTags:         string[];
  view:               ViewFilter;
  onSelectView:       (v: ViewFilter) => void;
  newFolderPendingId: string | null;
  onFolderCreated:    () => void;
  onEditSmartFolder:  (id: string) => void;
  onCreateTag:        (name: string) => void;
  onDeleteTag:        (name: string) => void;
  trashBtnRef:        React.RefObject<HTMLButtonElement>;
  trashShake:         boolean;
  onCreateSubfolder:  (parentId: string) => void;
}) {
  const [editingId,       setEditingId]       = useState<string | null>(null);
  const [editingName,     setEditingName]     = useState('');
  const [menuId,          setMenuId]          = useState<string | null>(null);
  const [showNewTag,      setShowNewTag]      = useState(false);
  const [newTagInput,     setNewTagInput]     = useState('');
  const [tagInputSuggs,   setTagInputSuggs]   = useState<string[]>([]);
  const [tagInputSuggIdx, setTagInputSuggIdx] = useState(-1);
  const [expandedIds,     setExpandedIds]     = useState<Record<string, boolean>>({});
  const toggleExpand = useCallback((id: string) => {
    setExpandedIds(prev => ({ ...prev, [id]: !(prev[id] ?? true) }));
  }, []);
  const folderTree   = useMemo(() => buildFolderTree(folders), [folders]);
  const smartFolders = useMemo(() => folders.filter(f => f.isSmart), [folders]);

  useEffect(() => {
    if (newFolderPendingId && folders.find(f => f.id === newFolderPendingId)) {
      setEditingId(newFolderPendingId);
      setEditingName(folders.find(f => f.id === newFolderPendingId)!.name);
      onFolderCreated();
    }
  }, [newFolderPendingId, folders, onFolderCreated]);

  const counts = useMemo(() => {
    const byFolder: Record<string, number> = {};
    const byTag:    Record<string, number> = {};
    let inbox = 0, pinned = 0;
    notes.forEach(n => {
      if (n.pinned)    pinned++;
      if (!n.folderId) inbox++;
      if (n.folderId)  byFolder[n.folderId] = (byFolder[n.folderId] ?? 0) + 1;
      n.tags.forEach(t => { byTag[t] = (byTag[t] ?? 0) + 1; });
    });
    return { all: notes.length, inbox, pinned, byFolder, byTag };
  }, [notes]);

  // Union tags manuels + tags extraits des notes, triés par count desc puis alpha
  const allDisplayTags = useMemo(() => {
    const all = new Set([...manualTags, ...Object.keys(counts.byTag)]);
    return Array.from(all).sort((a, b) => {
      const ca = counts.byTag[a] ?? 0;
      const cb = counts.byTag[b] ?? 0;
      if (cb !== ca) return cb - ca;
      return a.localeCompare(b, 'fr');
    });
  }, [manualTags, counts.byTag]);

  const row = (v: ViewFilter) =>
    `w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-sm transition-colors ${
      viewEq(view, v)
        ? 'bg-yellow-500/15 text-yellow-300 font-medium'
        : 'text-gray-400 hover:text-white hover:bg-dark-700'
    }`;

  const commitRename = async (id: string) => {
    if (editingName.trim()) await updateFolder(id, { name: editingName.trim() });
    setEditingId(null);
  };

  const handleDeleteFolder = async (id: string) => {
    await deleteFolder(id);
    if (viewEq(view, { type: 'folder', id })) onSelectView('inbox');
    setMenuId(null);
  };

  const handleTagInputChange = (v: string) => {
    setNewTagInput(v);
    setTagInputSuggIdx(-1);
    if (v.trim()) {
      const lower = v.toLowerCase();
      setTagInputSuggs(allDisplayTags.filter(t => t.includes(lower) && t !== lower).slice(0, 5));
    } else {
      setTagInputSuggs(allDisplayTags.slice(0, 5)); // montre les tags existants quand vide
    }
  };

  const applyTagInputSugg = (tag: string) => {
    onCreateTag(tag);
    setNewTagInput(''); setShowNewTag(false); setTagInputSuggs([]); setTagInputSuggIdx(-1);
  };

  const commitNewTag = () => {
    const v = newTagInput.trim();
    if (v) onCreateTag(v);
    setNewTagInput(''); setShowNewTag(false); setTagInputSuggs([]); setTagInputSuggIdx(-1);
  };

  const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (tagInputSuggs.length > 0) {
      if (e.key === 'ArrowDown') { e.preventDefault(); setTagInputSuggIdx(i => Math.min(i + 1, tagInputSuggs.length - 1)); return; }
      if (e.key === 'ArrowUp')   { e.preventDefault(); setTagInputSuggIdx(i => Math.max(i - 1, -1)); return; }
      if (e.key === 'Tab')       { e.preventDefault(); applyTagInputSugg(tagInputSuggs[tagInputSuggIdx >= 0 ? tagInputSuggIdx : 0]); return; }
      if (e.key === 'Enter' && tagInputSuggIdx >= 0) { e.preventDefault(); applyTagInputSugg(tagInputSuggs[tagInputSuggIdx]); return; }
    }
    if (e.key === 'Enter')  commitNewTag();
    if (e.key === 'Escape') { setNewTagInput(''); setShowNewTag(false); setTagInputSuggs([]); }
  };

  return (
    <div
      className="flex flex-col h-full overflow-y-auto select-none"
      onClick={() => setMenuId(null)}
    >
      {/* Smart views */}
      <div className="px-2 pt-3 pb-2 space-y-0.5">
        {folders.length > 0 && (
          <button type="button" className={row('all')} onClick={() => onSelectView('all')}>
            <span className="flex items-center gap-2"><StickyNote size={13} />Toutes</span>
            <span className="text-xs opacity-50">{counts.all}</span>
          </button>
        )}
        {counts.pinned > 0 && (
          <button type="button" className={row('pinned')} onClick={() => onSelectView('pinned')}>
            <span className="flex items-center gap-2"><Pin size={13} />Épinglées</span>
            <span className="text-xs opacity-50">{counts.pinned}</span>
          </button>
        )}
        <button type="button" className={row('inbox')} onClick={() => onSelectView('inbox')}>
          <span className="flex items-center gap-2"><Folder size={13} />Toutes mes notes</span>
          <span className="text-xs opacity-50">{counts.inbox}</span>
        </button>
      </div>

      <div className="mx-2 border-t border-dark-700" />

      {/* Dossiers normaux — arbre récursif */}
      {folderTree.length > 0 && (
        <div className="pt-1 pb-1">
          <div className="px-3 mb-1">
            <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest">Dossiers</span>
          </div>
          {folderTree.map(node => (
            <FolderTreeItem
              key={node.id}
              node={node}
              depth={0}
              view={view}
              onSelectView={onSelectView}
              editingId={editingId}
              editingName={editingName}
              setEditingId={setEditingId}
              setEditingName={setEditingName}
              commitRename={commitRename}
              menuId={menuId}
              setMenuId={setMenuId}
              counts={counts}
              onDeleteFolder={handleDeleteFolder}
              onCreateSubfolder={onCreateSubfolder}
              expandedIds={expandedIds}
              toggleExpand={toggleExpand}
            />
          ))}
        </div>
      )}

      {/* Dossiers intelligents — liste plate */}
      {smartFolders.length > 0 && (
        <div className="pt-1 pb-1">
          <div className="px-3 mb-1">
            <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest">Intelligents</span>
          </div>
          <div className="space-y-0.5 px-2">
            {smartFolders.map(f => (
              <div key={f.id} className="relative group">
                {editingId === f.id ? (
                  <input
                    aria-label="Nom du dossier"
                    autoFocus
                    value={editingName}
                    onChange={e => setEditingName(e.target.value)}
                    onBlur={() => commitRename(f.id)}
                    onKeyDown={e => {
                      if (e.key === 'Enter')  commitRename(f.id);
                      if (e.key === 'Escape') setEditingId(null);
                    }}
                    className="w-full px-2 py-1.5 text-sm bg-dark-700 border border-yellow-500/50 rounded-lg text-white focus:outline-none"
                  />
                ) : (
                  <button
                    type="button"
                    className={row({ type: 'folder', id: f.id })}
                    onClick={() => onSelectView({ type: 'folder', id: f.id })}
                  >
                    <span className="flex items-center gap-2 truncate min-w-0">
                      <Zap size={12} className="text-yellow-400 shrink-0" />
                      <span className="truncate">{f.name}</span>
                    </span>
                    <span className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        title="Options du dossier"
                        onClick={e => { e.stopPropagation(); setMenuId(menuId === f.id ? null : f.id); }}
                        className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-dark-600 transition-opacity"
                      >
                        <MoreHorizontal size={11} />
                      </button>
                    </span>
                  </button>
                )}
                {menuId === f.id && (
                  <div
                    className="absolute right-0 top-full z-50 mt-1 bg-dark-800 border border-dark-600 rounded-lg shadow-2xl overflow-hidden w-44"
                    onClick={e => e.stopPropagation()}
                  >
                    <button
                      type="button"
                      onClick={() => { onEditSmartFolder(f.id); setMenuId(null); }}
                      className="w-full px-3 py-2 text-sm text-left text-gray-300 hover:bg-dark-700 flex items-center gap-2"
                    >
                      <Zap size={12} className="text-yellow-400" /> Modifier les filtres
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteFolder(f.id)}
                      className="w-full px-3 py-2 text-sm text-left text-red-400 hover:bg-dark-700"
                    >
                      Supprimer
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mx-2 border-t border-dark-700" />

      {/* Tags — toujours visible avec bouton "+" pour créer */}
      <div className="px-2 pt-2 pb-2">
        <div className="px-1 mb-1 flex items-center justify-between">
          <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest">Tags</span>
          <button
            type="button"
            title="Nouveau tag"
            onClick={e => { e.stopPropagation(); setShowNewTag(true); }}
            className="text-gray-500 hover:text-yellow-400 transition-colors p-0.5 rounded"
          >
            <Plus size={11} />
          </button>
        </div>

        {/* Champ de création inline + suggestions */}
        {showNewTag && (
          <div className="mb-1 relative">
            <input
              aria-label="Nouveau tag"
              type="text"
              autoFocus
              placeholder="mon-tag"
              value={newTagInput}
              onChange={e => handleTagInputChange(e.target.value)}
              onKeyDown={handleTagInputKeyDown}
              onBlur={() => setTimeout(commitNewTag, 150)}
              onFocus={() => handleTagInputChange(newTagInput)}
              className="w-full px-2 py-1 text-xs bg-dark-700 border border-yellow-500/50 rounded text-white focus:outline-none placeholder-gray-600"
            />
            {tagInputSuggs.length > 0 && (
              <div className="absolute left-0 top-full z-50 w-full mt-0.5 bg-dark-800 border border-dark-600 rounded-lg shadow-2xl overflow-hidden">
                {tagInputSuggs.map((t, i) => (
                  <button key={t} type="button"
                    onMouseDown={e => { e.preventDefault(); applyTagInputSugg(t); }}
                    className={`w-full px-2 py-1 text-xs text-left flex items-center gap-1.5 transition-colors ${
                      i === tagInputSuggIdx ? 'bg-yellow-500/20 text-yellow-300' : 'text-gray-300 hover:bg-dark-700'
                    }`}
                  ><Hash size={10} />#{t}</button>
                ))}
              </div>
            )}
          </div>
        )}

        {allDisplayTags.length === 0 && !showNewTag && (
          <p className="text-[11px] text-gray-600 px-1 py-1">
            Aucun tag — utilise #tag dans tes notes ou crée-en un avec +
          </p>
        )}

        <div className="space-y-0.5">
          {allDisplayTags.map(tag => (
            <div key={tag} className="group relative">
              <button
                type="button"
                className={row({ type: 'tag', tag })}
                onClick={() => onSelectView({ type: 'tag', tag })}
              >
                <span className="flex items-center gap-2">
                  <Hash size={12} /><span className="truncate">{tag}</span>
                </span>
                <span className="flex items-center gap-1 shrink-0">
                  <span className="text-xs opacity-50">{counts.byTag[tag] ?? 0}</span>
                  {/* Bouton supprimer uniquement sur les tags manuels */}
                  {manualTags.includes(tag) && (
                    <button
                      type="button"
                      title="Supprimer le tag"
                      onClick={e => { e.stopPropagation(); onDeleteTag(tag); }}
                      className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:text-red-400 transition-opacity"
                    >
                      <X size={10} />
                    </button>
                  )}
                </span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Corbeille — toujours visible */}
      <div className="mx-2 border-t border-dark-700 mt-auto" />
      <div className="px-2 py-2">
        <motion.button
          ref={trashBtnRef}
          type="button"
          className={row('trash')}
          onClick={() => onSelectView('trash')}
          animate={trashShake
            ? { x: [-4, 4, -4, 4, 0], rotate: [-10, 10, -10, 10, 0] }
            : { x: 0, rotate: 0 }}
          transition={{ duration: 0.4 }}
        >
          <span className="flex items-center gap-2"><Trash2 size={13} />Corbeille</span>
          {deletedNotes.length > 0 && (
            <span className="text-xs opacity-50">{deletedNotes.length}</span>
          )}
        </motion.button>
      </div>
    </div>
  );
}

// ── Main Component ───────────────────────────────────────────────────────────

export default function NotesEditor() {
  const { notes, deletedNotes, folders, manualTags, loading } = useAdminNotes();

  const [view,        setView]        = useState<ViewFilter>('inbox');
  const [selectedId,  setSelectedId]  = useState<string | null>(null);
  const [mobilePanel, setMobilePanel] = useState<MobilePanel>('list');

  const [title,        setTitle]        = useState('');
  const [content,      setContent]      = useState('');
  const [saveStatus,   setSaveStatus]   = useState<SaveStatus>('saved');
  const [lastSaved,    setLastSaved]    = useState<Date | null>(null);
  const [confirmDel,   setConfirmDel]   = useState(false);
  const [showMoveMenu, setShowMoveMenu] = useState(false);
  const [showSortMenu, setShowSortMenu] = useState(false);

  const [sortBy, setSortBy] = useState<SortBy>('dateModified');

  const [suggestions,     setSuggestions]     = useState<string[]>([]);
  const [suggestionIdx,   setSuggestionIdx]   = useState(-1);
  const [suggestionType,  setSuggestionType]  = useState<'tag' | 'word'>('tag');
  const [titleSuggs,      setTitleSuggs]      = useState<string[]>([]);
  const [titleSuggIdx,    setTitleSuggIdx]    = useState(-1);
  const [titleSuggType,   setTitleSuggType]   = useState<'tag' | 'word' | 'title'>('title');
  const titleRef        = useRef<HTMLInputElement>(null);
  const searchRef       = useRef<HTMLInputElement>(null);
  const trashBtnRef     = useRef<HTMLButtonElement>(null);
  const imageInputRef   = useRef<HTMLInputElement>(null);
  const fileInputRef    = useRef<HTMLInputElement>(null);
  const detectAtCursorRef = useRef<() => void>(() => {});
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

  const [search,         setSearch]         = useState('');
  const [trashShake,     setTrashShake]     = useState(false);
  const [focusMode,      setFocusMode]      = useState(false);
  const [bubbleLinkOpen, setBubbleLinkOpen] = useState(false);
  const [bubbleLinkVal,  setBubbleLinkVal]  = useState('');
  const [codeCopied,     setCodeCopied]     = useState(false);

  // Slash commands
  const [slashMenu,   setSlashMenu]   = useState(false);
  const [slashFilter, setSlashFilter] = useState('');
  const [slashIdx,    setSlashIdx]    = useState(0);
  const slashMenuRef  = useRef(false);
  const slashIdxRef   = useRef(0);
  const applySlashRef = useRef<(idx: number) => void>(() => {});
  useEffect(() => { slashMenuRef.current = slashMenu; }, [slashMenu]);
  useEffect(() => { slashIdxRef.current  = slashIdx;  }, [slashIdx]);
  const [flyItem, setFlyItem] = useState<{
    x: number; y: number; w: number; h: number;
    tx: number; ty: number; label: string;
  } | null>(null);

  // ── Persistance localStorage ─────────────────────────────────────────────
  const hasRestoredRef = useRef(false);
  // Restaurer la vue au premier rendu côté client (après hydration SSR)
  useEffect(() => {
    try {
      const v = localStorage.getItem('notes_view');
      if (v) setView(JSON.parse(v) as ViewFilter);
    } catch { /* ignore */ }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  // Sauvegarder view à chaque changement
  useEffect(() => {
    try { localStorage.setItem('notes_view', JSON.stringify(view)); } catch { /* ignore */ }
  }, [view]);
  // Sauvegarder selectedId à chaque changement
  useEffect(() => {
    try {
      if (selectedId) localStorage.setItem('notes_selectedId', selectedId);
      else            localStorage.removeItem('notes_selectedId');
    } catch { /* ignore */ }
  }, [selectedId]);

  // Ctrl+F / Cmd+F → focus barre de recherche
  useEffect(() => {
    const handleGlobalKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        setMobilePanel('list');
        setTimeout(() => searchRef.current?.focus(), 50);
      }
    };
    window.addEventListener('keydown', handleGlobalKey);
    return () => window.removeEventListener('keydown', handleGlobalKey);
  }, []);

  const [newFolderPendingId, setNewFolderPendingId] = useState<string | null>(null);
  const [showNewFolderMenu,  setShowNewFolderMenu]  = useState(false);
  const [showSmartModal,     setShowSmartModal]     = useState(false);
  const [editingSmartId,     setEditingSmartId]     = useState<string | null>(null);

  const prevSelectedId = useRef<string | null>(null);
  const prevTitle      = useRef('');
  const prevContent    = useRef('');
  const saveTimer      = useRef<ReturnType<typeof setTimeout>>();

  const selectedNote = notes.find(n => n.id === selectedId)
    ?? deletedNotes.find(n => n.id === selectedId)
    ?? null;

  const isTrash    = view === 'trash';
  const isReadOnly = selectedNote ? !!selectedNote.deletedAt : false;

  const currentFolder = useMemo(() =>
    typeof view === 'object' && view.type === 'folder'
      ? folders.find(f => f.id === view.id) ?? null
      : null,
    [view, folders]
  );

  // Tous les tags connus (union notes + manuels) pour l'autocomplétion
  const allTags = useMemo(() => {
    const set = new Set<string>([...manualTags]);
    notes.forEach(n => n.tags.forEach(t => set.add(t)));
    return Array.from(set);
  }, [notes, manualTags]);

  // Index de tous les mots (≥ 4 lettres) présents dans toutes les notes
  const wordIndex = useMemo(() => {
    const words = new Set<string>();
    notes.forEach(n => {
      const text = `${n.title} ${stripHtml(n.content)}`;
      const matches = text.match(/[a-zA-Z\u00C0-\u024F]{4,}/g);
      matches?.forEach(w => words.add(w.toLowerCase()));
    });
    return Array.from(words);
  }, [notes]);

  const smartModalInitial = useMemo(() => {
    if (!editingSmartId) return undefined;
    const f = folders.find(x => x.id === editingSmartId);
    if (!f?.isSmart) return undefined;
    return { name: f.name, filters: f.filters ?? {} };
  }, [editingSmartId, folders]);

  // ── Nettoyage notes vides au changement de sélection ─────────────────────
  useEffect(() => {
    const oldId      = prevSelectedId.current;
    const oldTitle   = prevTitle.current;
    const oldContent = prevContent.current;
    if (oldId && oldId !== selectedId) {
      if (!oldTitle.trim() && !stripHtml(oldContent).trim()) silentlyDeleteNote(oldId);
    }
    prevSelectedId.current = selectedId;
    prevTitle.current      = title;
    prevContent.current    = content;
    clearTimeout(saveTimer.current);
    setConfirmDel(false);
    setShowMoveMenu(false);
    setSaveStatus('saved');
    setLastSaved(null);
    setSuggestions([]);
  }, [selectedId]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Sync temps réel multi-appareil ───────────────────────────────────────
  // Si la note ouverte est modifiée depuis un autre appareil et qu'on n'est
  // pas en train d'éditer, on met à jour l'éditeur automatiquement.
  useEffect(() => {
    if (!selectedId || saveStatus !== 'saved') return;
    const note = notes.find(n => n.id === selectedId);
    if (!note) return;
    if (note.title !== title || note.content !== content) {
      setTitle(note.title);
      setContent(note.content);
      prevTitle.current   = note.title;
      prevContent.current = note.content;
      if (editor && !editor.isDestroyed) {
        editor.commands.setContent(note.content);
      }
    }
  }, [notes]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Notes filtrées et triées ──────────────────────────────────────────────
  const filteredNotes = useMemo(() => {
    let list = isTrash ? [...deletedNotes] : [...notes];
    if (!isTrash) {
      if (view === 'pinned') {
        list = list.filter(n => n.pinned);
      } else if (view === 'inbox') {
        list = list.filter(n => !n.folderId);
      } else if (typeof view === 'object' && view.type === 'folder') {
        const folder = folders.find(f => f.id === view.id);
        if (folder?.isSmart && folder.filters) {
          list = applySmartFilters(list, folder.filters);
        } else {
          list = list.filter(n => n.folderId === view.id);
        }
      } else if (typeof view === 'object' && view.type === 'tag') {
        list = list.filter(n => n.tags.includes(view.tag));
      }
    }
    if (search.trim()) {
      const s = search.toLowerCase();
      list = list.filter(n =>
        n.title.toLowerCase().includes(s) || stripHtml(n.content).toLowerCase().includes(s)
      );
    }
    if (!isTrash) {
      const pinned   = list.filter(n => n.pinned);
      const unpinned = list.filter(n => !n.pinned);
      const sort = (arr: Note[]) => arr.sort((a, b) => {
        if (sortBy === 'dateModified') return b.updatedAt.getTime() - a.updatedAt.getTime();
        if (sortBy === 'dateCreated')  return b.createdAt.getTime() - a.createdAt.getTime();
        return a.title.localeCompare(b.title, 'fr');
      });
      return [...pinned, ...sort(unpinned)];
    }
    return list.sort((a, b) =>
      (b.deletedAt?.getTime() ?? 0) - (a.deletedAt?.getTime() ?? 0)
    );
  }, [notes, deletedNotes, view, search, sortBy, isTrash, folders]);

  // ── Autosave ──────────────────────────────────────────────────────────────
  const scheduleAutoSave = useCallback((t: string, c: string) => {
    if (!selectedId || isReadOnly) return;
    prevTitle.current   = t;
    prevContent.current = c;
    setSaveStatus('unsaved');
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      setSaveStatus('saving');
      try {
        await updateNote(selectedId, { title: t, content: c });
        setLastSaved(new Date());
        setSaveStatus('saved');
      } catch {
        setSaveStatus('error');
      }
    }, 1000);
  }, [selectedId, isReadOnly]);

  // Reset de l'index de sélection quand les suggestions changent
  useEffect(() => { setSuggestionIdx(-1); }, [suggestions]);

  // ── Autocomplétion contenu (tags + mots) ─────────────────────────────────
  const detectAtCursor = useCallback(() => {
    if (!editor || editor.isDestroyed) return;
    const { $from } = editor.state.selection;
    const textBefore = $from.parent.textContent.slice(0, $from.parentOffset);

    // Priorité 0 : slash command — "/" ou "/partial" en début de paragraphe
    const slashMatch = textBefore.match(/^\/([a-zA-Z]*)$/);
    if (slashMatch) {
      setSlashFilter(slashMatch[1].toLowerCase());
      setSlashMenu(true);
      setSlashIdx(0);
      return;
    }
    if (slashMenuRef.current) setSlashMenu(false);

    // Priorité 1 : hashtag (#tag ou # seul)
    const tagMatch = textBefore.match(/#([a-zA-Z\u00C0-\u024F][a-zA-Z0-9\u00C0-\u024F_-]*)?$/);
    if (tagMatch) {
      const partial = (tagMatch[1] ?? '').toLowerCase();
      const filtered = partial
        ? allTags.filter(t => t.includes(partial) && t !== partial) // fuzzy
        : allTags;
      setSuggestions(filtered.slice(0, 6));
      setSuggestionType('tag');
      return;
    }

    // Priorité 2 : mot ordinaire (≥ 3 lettres)
    const wordMatch = textBefore.match(/[a-zA-Z\u00C0-\u024F]{3,}$/);
    if (wordMatch) {
      const partial = wordMatch[0].toLowerCase();
      const matches = wordIndex
        .filter(w => w.startsWith(partial) && w !== partial)
        .slice(0, 6);
      if (matches.length > 0) {
        setSuggestions(matches);
        setSuggestionType('word');
        return;
      }
    }

    setSuggestions([]);
  }, [allTags, wordIndex]); // eslint-disable-line react-hooks/exhaustive-deps

  // Garde la ref à jour pour éviter les dépendances circulaires avec useEditor
  useEffect(() => { detectAtCursorRef.current = detectAtCursor; }, [detectAtCursor]);

  const applySuggestion = (item: string) => {
    if (!editor) return;
    const { state } = editor;
    const { from }  = state.selection;
    const textBefore = state.selection.$from.parent.textContent.slice(0, state.selection.$from.parentOffset);
    if (suggestionType === 'tag') {
      const m = textBefore.match(/#([a-zA-Z\u00C0-\u024F][a-zA-Z0-9\u00C0-\u024F_-]*)?$/);
      if (m) editor.chain().focus().deleteRange({ from: from - m[0].length, to: from }).insertContent(`#${item} `).run();
    } else {
      const m = textBefore.match(/[a-zA-Z\u00C0-\u024F]{3,}$/);
      if (m) editor.chain().focus().deleteRange({ from: from - m[0].length, to: from }).insertContent(item).run();
    }
    setSuggestions([]);
  };

  // ── TipTap editor ─────────────────────────────────────────────────────────
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ codeBlock: false }),
      CodeBlockLowlight.configure({ lowlight }),
      ImageExtension.configure({ inline: true, allowBase64: true }),
      Placeholder.configure({
        placeholder: 'Commence à écrire...\n\nUtilise #tag pour créer des tags automatiquement.',
      }),
      Underline,
      Link.configure({ openOnClick: false, HTMLAttributes: { rel: 'noopener noreferrer' } }),
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Highlight.configure({ multicolor: true }),
      TextStyle,
      Color,
      TaskList,
      TaskItem.configure({ nested: true }),
      Superscript,
      Subscript,
      CharacterCount,
    ],
    editorProps: {
      attributes: { class: 'tiptap-editor' },
      handlePaste(view, event) {
        const items = Array.from(event.clipboardData?.items ?? []);

        // 1. Image binaire (copier une image → coller) → upload Firebase
        const imgItem = items.find(i => i.type.startsWith('image/'));
        if (imgItem && selectedId) {
          event.preventDefault();
          const file = imgItem.getAsFile();
          if (file) handleImageInsertRef.current(file);
          return true;
        }

        // 2. HTML collé depuis une page web contenant des <img> → afficher inline
        const htmlItem = items.find(i => i.type === 'text/html');
        if (htmlItem) {
          htmlItem.getAsString(html => {
            const doc = new DOMParser().parseFromString(html, 'text/html');
            const imgs = Array.from(doc.querySelectorAll('img'));
            if (imgs.length > 0) {
              // Injecter les images depuis leurs URLs d'origine (pas d'upload)
              imgs.forEach(img => {
                const src = img.getAttribute('src');
                if (src && !src.startsWith('data:')) {
                  view.dispatch(
                    view.state.tr.replaceSelectionWith(
                      view.state.schema.nodes.image.create({ src, alt: img.getAttribute('alt') ?? '' })
                    )
                  );
                }
              });
            }
          });
          // Laisser aussi TipTap gérer le texte du HTML collé
          return false;
        }

        return false; // TipTap gère le reste (texte brut, etc.)
      },
      handleDrop(_, event) {
        // Intercepte les images glissées-déposées
        const files = Array.from(event.dataTransfer?.files ?? []);
        const img = files.find(f => f.type.startsWith('image/'));
        if (img && selectedId) {
          event.preventDefault();
          handleImageInsertRef.current(img);
          return true;
        }
        return false;
      },
      handleKeyDown(_, event) {
        // Navigation dans le menu slash commands
        if (slashMenuRef.current) {
          const cmds = SLASH_CMDS.filter(c =>
            !slashFilter || c.id.startsWith(slashFilter) || c.label.toLowerCase().startsWith(slashFilter)
          );
          if (event.key === 'ArrowDown') {
            setSlashIdx(i => Math.min(i + 1, cmds.length - 1));
            return true;
          }
          if (event.key === 'ArrowUp') {
            setSlashIdx(i => Math.max(i - 1, 0));
            return true;
          }
          if (event.key === 'Enter' || event.key === 'Tab') {
            applySlashRef.current(slashIdxRef.current);
            return true;
          }
          if (event.key === 'Escape') {
            setSlashMenu(false);
            return true;
          }
          // Fermer si l'utilisateur tape espace ou backspace efface tout
          if (event.key === ' ') { setSlashMenu(false); return false; }
        }

        // Navigation dans les suggestions d'autocomplétion
        if (suggestionsRef.current.length === 0) return false;
        if (event.key === 'ArrowDown') {
          setSuggestionIdx(i => Math.min(i + 1, suggestionsRef.current.length - 1));
          return true;
        }
        if (event.key === 'ArrowUp') {
          setSuggestionIdx(i => Math.max(i - 1, -1));
          return true;
        }
        if ((event.key === 'Enter' || event.key === 'Tab') && suggestionIdxRef.current >= 0) {
          applySuggestionRef.current(suggestionsRef.current[suggestionIdxRef.current]);
          return true;
        }
        if (event.key === 'Tab' && suggestionIdxRef.current === -1 && suggestionsRef.current.length > 0) {
          applySuggestionRef.current(suggestionsRef.current[0]);
          return true;
        }
        if (event.key === 'Escape') { setSuggestions([]); return true; }
        return false;
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      setContent(html);
      scheduleAutoSaveRef.current(titleRef.current?.value ?? '', html);
      setTimeout(() => detectAtCursorRef.current(), 0);
    },
    onSelectionUpdate: () => setTimeout(() => detectAtCursorRef.current(), 0),
    editable: true,
  });

  // Refs anti-stale-closure (valeurs utilisées dans les editorProps de useEditor)
  const suggestionsRef       = useRef<string[]>([]);
  const suggestionIdxRef     = useRef(-1);
  const applySuggestionRef   = useRef<(item: string) => void>(() => {});
  const handleImageInsertRef = useRef<(file: File) => void>(() => {});
  const scheduleAutoSaveRef  = useRef<(t: string, c: string) => void>(() => {});
  useEffect(() => { suggestionsRef.current    = suggestions;    }, [suggestions]);
  useEffect(() => { suggestionIdxRef.current  = suggestionIdx;  }, [suggestionIdx]);
  useEffect(() => { scheduleAutoSaveRef.current = scheduleAutoSave; }, [scheduleAutoSave]);

  // Restauration post-chargement — exécuté une seule fois quand Firestore ET l'éditeur sont prêts
  useEffect(() => {
    if (loading || !editor || editor.isDestroyed || hasRestoredRef.current) return;
    hasRestoredRef.current = true;
    try {
      const savedId = localStorage.getItem('notes_selectedId');
      if (!savedId) return;
      const note = [...notes, ...deletedNotes].find(n => n.id === savedId);
      if (!note) return;
      // Écrire le vrai contenu dans les refs AVANT de changer selectedId
      // pour que l'effet de nettoyage des notes vides ne voie jamais '' comme contenu
      prevTitle.current   = note.title;
      prevContent.current = note.content;
      setSelectedId(savedId);
      setTitle(note.title);
      setContent(note.content);
      editor.commands.setContent(note.content);
      setMobilePanel('editor');
    } catch { /* ignore */ }
  }, [loading, editor]); // eslint-disable-line react-hooks/exhaustive-deps

  // Sync editor ↔ isReadOnly
  useEffect(() => {
    if (!editor) return;
    editor.setEditable(!isReadOnly);
  }, [editor, isReadOnly]);

  // ── Upload image (paste / drag-drop / bouton) ─────────────────────────────
  const handleImageInsert = useCallback(async (file: File) => {
    if (!editor || !selectedId) return;
    try {
      setUploadProgress(0);
      const url = await uploadNoteImage(file, selectedId, pct => setUploadProgress(pct));
      editor.chain().focus().setImage({ src: url, alt: file.name }).run();
      // Force autosave immédiat après l'insertion
      const html = editor.getHTML();
      setContent(html);
      scheduleAutoSave(title, html);
    } catch (err) {
      console.error('Upload image:', err);
    } finally {
      setUploadProgress(null);
    }
  }, [editor, selectedId, title, scheduleAutoSave]);
  useEffect(() => { handleImageInsertRef.current = handleImageInsert; }, [handleImageInsert]);
  useEffect(() => { applySuggestionRef.current   = applySuggestion;   }, [applySuggestion]);

  // ── Upload fichier joint ───────────────────────────────────────────────────
  const handleFileInsert = useCallback(async (file: File) => {
    if (!editor || !selectedId) return;
    try {
      setUploadProgress(0);
      const { url, name } = await uploadNoteFile(file, selectedId, pct => setUploadProgress(pct));
      editor.chain().focus().insertContent(
        `<a href="${url}" target="_blank" rel="noopener noreferrer">${name}</a> `
      ).run();
      const html = editor.getHTML();
      setContent(html);
      scheduleAutoSave(title, html);
    } catch (err) {
      console.error('Upload fichier:', err);
    } finally {
      setUploadProgress(null);
    }
  }, [editor, selectedId, title, scheduleAutoSave]);

  // ── Apply slash command ────────────────────────────────────────────────────
  const applySlashCommand = useCallback((idx: number) => {
    if (!editor) return;
    const filteredCmds = SLASH_CMDS.filter(c =>
      !slashFilter || c.id.startsWith(slashFilter) || c.label.toLowerCase().startsWith(slashFilter)
    );
    const cmd = filteredCmds[idx];
    if (!cmd) { setSlashMenu(false); return; }
    // Supprimer le "/" et le texte du filtre
    const { state } = editor;
    const { from, $from } = state.selection;
    const blockStart = from - $from.parentOffset;
    editor.chain().focus().deleteRange({ from: blockStart, to: from }).run();
    cmd.apply(editor);
    setSlashMenu(false);
  }, [editor, slashFilter]);
  useEffect(() => { applySlashRef.current = applySlashCommand; }, [applySlashCommand]);

  // ── Export Markdown ────────────────────────────────────────────────────────
  const handleExportMarkdown = useCallback(async () => {
    if (!editor || !selectedNote) return;
    // Import dynamique pour éviter les problèmes SSR
    const TurndownService = (await import('turndown')).default;
    const td = new TurndownService({ headingStyle: 'atx', codeBlockStyle: 'fenced' });
    const md = `# ${title}\n\n${td.turndown(editor.getHTML())}`;
    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `${title || 'note'}.md`;
    a.click(); URL.revokeObjectURL(url);
  }, [editor, title, selectedNote]);

  // ── Export PDF ─────────────────────────────────────────────────────────────
  const handleExportPDF = useCallback(() => {
    if (!editor || !selectedNote) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`<!DOCTYPE html><html><head>
      <meta charset="utf-8">
      <title>${title || 'Note'}</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 800px; margin: 40px auto; padding: 0 20px; color: #111; line-height: 1.6; }
        h1 { font-size: 2em; border-bottom: 1px solid #eee; padding-bottom: .3em; }
        h2 { font-size: 1.5em; } h3 { font-size: 1.25em; }
        pre { background: #f6f8fa; border-radius: 6px; padding: 16px; overflow: auto; }
        code { background: #f6f8fa; border-radius: 3px; padding: .2em .4em; font-size: .9em; }
        blockquote { border-left: 4px solid #ddd; margin: 0; padding-left: 16px; color: #666; }
        table { border-collapse: collapse; width: 100%; }
        td, th { border: 1px solid #ddd; padding: 8px 12px; }
        th { background: #f6f8fa; font-weight: 600; }
        img { max-width: 100%; }
        ul[data-type="taskList"] { list-style: none; padding: 0; }
        li[data-type="taskItem"] > label { display: flex; gap: 8px; }
        a { color: #0366d6; }
        @media print { body { margin: 0; } }
      </style>
    </head><body>
      <h1>${title || 'Sans titre'}</h1>
      ${editor.getHTML()}
    </body></html>`);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => { printWindow.print(); printWindow.close(); }, 300);
  }, [editor, title, selectedNote]);

  // ── Autocomplétion titre ──────────────────────────────────────────────────
  const applyTitleSugg = useCallback((item: string) => {
    const el = titleRef.current;
    if (!el) return;
    const cursor = el.selectionStart ?? title.length;

    if (titleSuggType === 'title') {
      setTitle(item);
      scheduleAutoSave(item, content);
    } else if (titleSuggType === 'tag') {
      const textBefore = title.slice(0, cursor);
      const tagMatch = textBefore.match(/#([a-zA-Z\u00C0-\u024F][a-zA-Z0-9\u00C0-\u024F_-]*)?$/);
      if (tagMatch) {
        const start = cursor - tagMatch[0].length;
        const newTitle = title.slice(0, start) + '#' + item + ' ' + title.slice(cursor);
        setTitle(newTitle);
        scheduleAutoSave(newTitle, content);
        setTimeout(() => { const p = start + item.length + 2; el.setSelectionRange(p, p); }, 0);
      }
    } else if (titleSuggType === 'word') {
      const textBefore = title.slice(0, cursor);
      const wordMatch = textBefore.match(/[a-zA-Z\u00C0-\u024F]{3,}$/);
      if (wordMatch) {
        const start = cursor - wordMatch[0].length;
        const newTitle = title.slice(0, start) + item + title.slice(cursor);
        setTitle(newTitle);
        scheduleAutoSave(newTitle, content);
        setTimeout(() => { const p = start + item.length; el.setSelectionRange(p, p); }, 0);
      }
    }

    setTitleSuggs([]); setTitleSuggIdx(-1);
  }, [title, content, titleSuggType, scheduleAutoSave]);

  const handleTitleSuggKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (titleSuggs.length === 0) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); setTitleSuggIdx(i => Math.min(i + 1, titleSuggs.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setTitleSuggIdx(i => Math.max(i - 1, -1)); }
    else if ((e.key === 'Tab' || e.key === 'Enter') && titleSuggIdx >= 0) {
      e.preventDefault(); applyTitleSugg(titleSuggs[titleSuggIdx]);
    } else if (e.key === 'Tab' && titleSuggIdx === -1 && titleSuggs.length > 0) {
      e.preventDefault(); applyTitleSugg(titleSuggs[0]);
    } else if (e.key === 'Escape') { setTitleSuggs([]); }
  };

  // ── Handlers éditeur ─────────────────────────────────────────────────────
  const handleTitleChange = (v: string) => {
    setTitle(v);
    scheduleAutoSave(v, content);

    const el = titleRef.current;
    const cursor = el?.selectionStart ?? v.length;
    const textBefore = v.slice(0, cursor);

    // Priorité 1 : hashtag → suggestions de tags
    const tagMatch = textBefore.match(/#([a-zA-Z\u00C0-\u024F][a-zA-Z0-9\u00C0-\u024F_-]*)?$/);
    if (tagMatch) {
      const partial = (tagMatch[1] ?? '').toLowerCase();
      const filtered = partial ? allTags.filter(t => t.includes(partial) && t !== partial) : allTags;
      if (filtered.length > 0) {
        setTitleSuggs(filtered.slice(0, 6)); setTitleSuggType('tag'); setTitleSuggIdx(-1); return;
      }
    }

    // Priorité 2 : mot ≥ 3 lettres → complétion depuis l'index
    const wordMatch = textBefore.match(/[a-zA-Z\u00C0-\u024F]{3,}$/);
    if (wordMatch) {
      const partial = wordMatch[0].toLowerCase();
      const matches = wordIndex.filter(w => w.startsWith(partial) && w !== partial).slice(0, 6);
      if (matches.length > 0) {
        setTitleSuggs(matches); setTitleSuggType('word'); setTitleSuggIdx(-1); return;
      }
    }

    // Priorité 3 : titres similaires existants
    if (v.trim().length >= 2) {
      const lower = v.toLowerCase();
      const matches = notes
        .filter(n => n.id !== selectedId && n.title.toLowerCase().includes(lower))
        .map(n => n.title)
        .slice(0, 5);
      if (matches.length > 0) {
        setTitleSuggs(matches); setTitleSuggType('title'); setTitleSuggIdx(-1); return;
      }
    }

    setTitleSuggs([]);
  };
  const handleNewNote = async () => {
    const folderId = (currentFolder && !currentFolder.isSmart) ? currentFolder.id : null;
    const id = await createNote(folderId);
    setSelectedId(id); setTitle(''); setContent(''); setSaveStatus('saved');
    editor?.commands.setContent('');
    setMobilePanel('editor');
  };

  const handleSelectNote = (note: Note) => {
    setSelectedId(note.id); setTitle(note.title); setContent(note.content);
    editor?.commands.setContent(note.content);
    setSaveStatus('saved'); setMobilePanel('editor');
  };

  const handlePin = async () => {
    if (!selectedNote || isReadOnly) return;
    await updateNote(selectedNote.id, { pinned: !selectedNote.pinned });
  };

  const triggerFlyToTrash = useCallback((noteId: string, label: string) => {
    const cardEl  = document.querySelector(`[data-note-id="${noteId}"]`);
    const trashEl = trashBtnRef.current;
    if (!cardEl || !trashEl) return;
    const from = cardEl.getBoundingClientRect();
    const to   = trashEl.getBoundingClientRect();
    setFlyItem({
      x: from.left, y: from.top, w: from.width, h: from.height,
      tx: to.left + to.width  / 2 - from.width  / 4,
      ty: to.top  + to.height / 2 - from.height / 4,
      label,
    });
    // Corbeille tremble quand le fantôme arrive (~350ms)
    setTimeout(() => {
      setTrashShake(true);
      setTimeout(() => { setTrashShake(false); setFlyItem(null); }, 460);
    }, 340);
  }, []);

  const handleDelete = async () => {
    if (!selectedId) return;
    if (!confirmDel) { setConfirmDel(true); return; }
    triggerFlyToTrash(selectedId, title || 'Sans titre');
    await deleteNote(selectedId);
    setSelectedId(null); setTitle(''); setContent('');
    setMobilePanel('list'); setConfirmDel(false);
  };

  const handleRecover = async () => {
    if (!selectedId) return;
    await recoverNote(selectedId);
    setSelectedId(null); setTitle(''); setContent('');
    setView('inbox'); setMobilePanel('list');
  };

  const handlePermanentDelete = async () => {
    if (!selectedId) return;
    if (!confirmDel) { setConfirmDel(true); return; }
    await permanentlyDeleteNote(selectedId);
    setSelectedId(null); setTitle(''); setContent('');
    setMobilePanel('list'); setConfirmDel(false);
  };

  const handleMove = async (folderId: string | null) => {
    if (!selectedId) return;
    await moveNote(selectedId, folderId);
    setShowMoveMenu(false);
  };

  const handleCreateRegularFolder = async () => {
    const id = await createFolder('Nouveau dossier', folders.length);
    setNewFolderPendingId(id); setMobilePanel('sidebar');
  };

  const handleCreateSubfolder = async (parentId: string) => {
    const id = await createFolder('Nouveau dossier', folders.length, parentId);
    setNewFolderPendingId(id); setMobilePanel('sidebar');
  };

  const handleCreateSmartFolder = async (name: string, filters: SmartFolderFilter) => {
    const id = await createSmartFolder(name, folders.length, filters);
    setView({ type: 'folder', id }); setShowSmartModal(false);
  };

  const handleUpdateSmartFolder = async (name: string, filters: SmartFolderFilter) => {
    if (!editingSmartId) return;
    await updateSmartFolderFilters(editingSmartId, name, filters);
    setShowSmartModal(false); setEditingSmartId(null);
  };

  const handleEditSmartFolder = (id: string) => { setEditingSmartId(id); setShowSmartModal(true); };

  const handleCreateTag = async (name: string) => { await createTag(name); };
  const handleDeleteTag = async (name: string) => { await deleteTag(name); };

  const saveLabel = () => {
    if (saveStatus === 'saving')  return 'Sauvegarde...';
    if (saveStatus === 'unsaved') return 'Non sauvegardé';
    if (saveStatus === 'error')   return 'Erreur';
    if (lastSaved) return `Sauvegardé ${lastSaved.toLocaleTimeString('fr-CA', { hour: '2-digit', minute: '2-digit' })}`;
    return '';
  };

  const saveColor =
    saveStatus === 'error'   ? 'text-red-400' :
    saveStatus === 'unsaved' ? 'text-yellow-400' :
    saveStatus === 'saving'  ? 'text-gray-400' : 'text-gray-500';

  const hasPinnedSection =
    !isTrash && view !== 'pinned' &&
    filteredNotes.some(n => n.pinned) && filteredNotes.some(n => !n.pinned);

  const pinnedNotes   = hasPinnedSection ? filteredNotes.filter(n => n.pinned)  : [];
  const unpinnedNotes = hasPinnedSection ? filteredNotes.filter(n => !n.pinned) : filteredNotes;
  const regularFolders = folders.filter(f => !f.isSmart);

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      {showSmartModal && (
        <SmartFolderModal
          allTags={allTags}
          initial={smartModalInitial}
          onConfirm={editingSmartId ? handleUpdateSmartFolder : handleCreateSmartFolder}
          onCancel={() => { setShowSmartModal(false); setEditingSmartId(null); }}
        />
      )}

      {/* ── Overlay fantôme "fly to trash" ──────────────────────────────────── */}
      <AnimatePresence>
        {flyItem && (
          <motion.div
            key="fly-ghost"
            initial={{ x: flyItem.x, y: flyItem.y, opacity: 0.85, scale: 1 }}
            animate={{
              x: flyItem.tx, y: flyItem.ty,
              opacity: 0, scale: 0.35,
            }}
            transition={{ duration: 0.38, ease: 'easeIn' }}
            style={{
              position: 'fixed',
              width: flyItem.w,
              height: Math.min(flyItem.h, 44),
              zIndex: 9999,
              pointerEvents: 'none',
              top: 0, left: 0,
            }}
            className="bg-dark-800 border border-yellow-500/40 rounded-lg shadow-2xl flex items-center gap-2 px-3 py-1 overflow-hidden"
          >
            <StickyNote size={11} className="text-yellow-400 shrink-0" />
            <span className="text-xs text-gray-300 truncate">{flyItem.label}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div
        className="flex h-[calc(100vh-260px)] min-h-[540px] overflow-hidden -m-6 rounded-xl"
        onClick={() => {
          setShowMoveMenu(false); setShowSortMenu(false);
          setSuggestions([]); setShowNewFolderMenu(false);
        }}
      >
        {/* ══ SIDEBAR ══════════════════════════════════════════════════════════ */}
        <div className={`
          ${mobilePanel === 'sidebar' ? 'flex' : 'hidden'} md:flex
          w-full md:w-48 shrink-0 flex-col bg-dark-950 border-r border-dark-700
        `}>
          <div className="md:hidden flex items-center justify-between px-3 py-2 border-b border-dark-700">
            <span className="text-sm font-semibold text-white">Notes</span>
            <button type="button" title="Voir la liste" onClick={() => setMobilePanel('list')} className="text-gray-400 hover:text-white">
              <ChevronRight size={16} />
            </button>
          </div>
          <div className="px-2 pt-3 pb-1 flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-400">Notes</span>
            <div className="relative">
              <button
                type="button"
                onClick={e => { e.stopPropagation(); setShowNewFolderMenu(!showNewFolderMenu); }}
                title="Nouveau dossier"
                className="text-gray-500 hover:text-yellow-400 transition-colors p-1 rounded"
              >
                <FolderPlus size={13} />
              </button>
              {showNewFolderMenu && (
                <div
                  className="absolute right-0 top-full z-50 mt-1 bg-dark-800 border border-dark-600 rounded-lg shadow-2xl overflow-hidden w-48"
                  onClick={e => e.stopPropagation()}
                >
                  <button
                    type="button"
                    onClick={() => { handleCreateRegularFolder(); setShowNewFolderMenu(false); }}
                    className="w-full px-3 py-2 text-sm text-left text-gray-300 hover:bg-dark-700 flex items-center gap-2"
                  >
                    <FolderPlus size={13} /> Nouveau dossier
                  </button>
                  <button
                    type="button"
                    onClick={() => { setEditingSmartId(null); setShowSmartModal(true); setShowNewFolderMenu(false); }}
                    className="w-full px-3 py-2 text-sm text-left text-gray-300 hover:bg-dark-700 flex items-center gap-2"
                  >
                    <Zap size={13} className="text-yellow-400" /> Dossier intelligent
                  </button>
                </div>
              )}
            </div>
          </div>
          <NotesSidebar
            notes={notes}
            deletedNotes={deletedNotes}
            folders={folders}
            manualTags={manualTags}
            view={view}
            onSelectView={v => { setView(v); setMobilePanel('list'); }}
            newFolderPendingId={newFolderPendingId}
            onFolderCreated={() => setNewFolderPendingId(null)}
            onEditSmartFolder={handleEditSmartFolder}
            onCreateTag={handleCreateTag}
            onDeleteTag={handleDeleteTag}
            trashBtnRef={trashBtnRef}
            trashShake={trashShake}
            onCreateSubfolder={handleCreateSubfolder}
          />
        </div>

        {/* ══ NOTE LIST ════════════════════════════════════════════════════════ */}
        <div className={`
          ${mobilePanel === 'list' ? 'flex' : 'hidden'} md:flex
          w-full md:w-64 shrink-0 flex-col bg-dark-900 border-r border-dark-700
        `}>
          <div className="px-3 pt-3 pb-2 border-b border-dark-700">
            <div className="md:hidden flex items-center gap-2 mb-2">
              <button type="button" onClick={() => setMobilePanel('sidebar')} className="flex items-center gap-1 text-xs text-gray-400 hover:text-white">
                <ArrowLeft size={13} />{viewLabel(view, folders)}
              </button>
            </div>
            <div className="flex items-center justify-between mb-2">
              <span className="flex items-center gap-1.5 text-sm font-semibold text-white truncate">
                {currentFolder?.isSmart && <Zap size={12} className="text-yellow-400 shrink-0" />}
                {viewLabel(view, folders)}
              </span>
              <div className="flex items-center gap-1">
                {!isTrash && (
                  <div className="relative">
                    <button type="button" title="Trier"
                      onClick={e => { e.stopPropagation(); setShowSortMenu(!showSortMenu); }}
                      className="p-1 rounded text-gray-500 hover:text-white hover:bg-dark-700 transition-colors"
                    >
                      <ArrowUpDown size={12} />
                    </button>
                    {showSortMenu && (
                      <div className="absolute right-0 top-full z-50 mt-1 bg-dark-800 border border-dark-600 rounded-lg shadow-2xl overflow-hidden w-44" onClick={e => e.stopPropagation()}>
                        <p className="px-3 pt-2 pb-1 text-[10px] font-semibold text-gray-500 uppercase tracking-wide">Trier par</p>
                        {([
                          ['dateModified', 'Date de modification'],
                          ['dateCreated',  'Date de création'],
                          ['title',        'Titre'],
                        ] as [SortBy, string][]).map(([val, label]) => (
                          <button key={val} type="button"
                            onClick={() => { setSortBy(val); setShowSortMenu(false); }}
                            className={`w-full px-3 py-1.5 text-sm text-left transition-colors ${sortBy === val ? 'text-yellow-400 bg-yellow-500/10' : 'text-gray-300 hover:bg-dark-700'}`}
                          >{label}</button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                {!isTrash && (
                  <button type="button" onClick={handleNewNote} title="Nouvelle note" className="p-1.5 rounded-lg bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30 transition-colors">
                    <Plus size={14} />
                  </button>
                )}
                {isTrash && deletedNotes.length > 0 && (
                  <button type="button" title="Vider la corbeille"
                    onClick={() => { if (confirm('Supprimer définitivement toutes les notes ?')) deletedNotes.forEach(n => permanentlyDeleteNote(n.id)); }}
                    className="text-xs text-red-400 hover:text-red-300 px-2 py-1 rounded hover:bg-red-500/10 transition-colors"
                  >Vider</button>
                )}
              </div>
            </div>
            <div className="relative">
              <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                ref={searchRef}
                type="text"
                placeholder="Rechercher… (Ctrl+F)"
                value={search}
                onChange={e => setSearch(e.target.value)}
                onKeyDown={e => { if (e.key === 'Escape') { setSearch(''); searchRef.current?.blur(); } }}
                className="w-full pl-7 pr-7 py-1.5 bg-dark-800 border border-dark-700 rounded-lg text-xs text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-yellow-500/50"
              />
              {search && (
                <button type="button" title="Effacer" onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white">
                  <X size={11} />
                </button>
              )}
            </div>
            {search && (
              <p className="text-[10px] text-gray-500 mt-1 text-right">
                {filteredNotes.length} résultat{filteredNotes.length !== 1 ? 's' : ''}
              </p>
            )}
          </div>

          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <p className="text-center text-gray-500 text-xs mt-10">Chargement...</p>
            ) : filteredNotes.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 text-gray-600">
                <StickyNote size={28} className="mb-2 opacity-30" />
                <p className="text-xs">{search ? 'Aucun résultat' : isTrash ? 'Corbeille vide' : 'Aucune note'}</p>
              </div>
            ) : (
              <AnimatePresence mode="popLayout">
                {hasPinnedSection && (
                  <div key="pinned-header" className="px-3 py-1 text-[10px] font-semibold text-gray-500 uppercase tracking-widest bg-dark-900 sticky top-0 z-10">Épinglées</div>
                )}
                {hasPinnedSection && pinnedNotes.map(note => (
                  <NoteCard key={note.id} note={note} selected={selectedId === note.id} onSelect={handleSelectNote} />
                ))}
                {hasPinnedSection && (
                  <div key="unpinned-header" className="px-3 py-1 text-[10px] font-semibold text-gray-500 uppercase tracking-widest bg-dark-900 sticky top-6 z-10">Notes</div>
                )}
                {unpinnedNotes.map(note => (
                  <NoteCard key={note.id} note={note} selected={selectedId === note.id} onSelect={handleSelectNote}
                    trashInfo={isTrash && note.deletedAt ? daysUntilPurge(note.deletedAt) : undefined}
                  />
                ))}
              </AnimatePresence>
            )}
          </div>
        </div>

        {/* ══ EDITOR ═══════════════════════════════════════════════════════════ */}
        <div
          className={focusMode
            ? 'fixed inset-0 z-50 bg-dark-950 flex flex-col'
            : `${mobilePanel === 'editor' ? 'flex' : 'hidden'} md:flex flex-1 flex-col bg-dark-900 min-w-0`}
          onClick={e => e.stopPropagation()}
        >
          {!selectedNote ? (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-600 gap-3">
              <StickyNote size={48} className="opacity-20" />
              <p className="text-sm">{isTrash ? 'Sélectionne une note à récupérer' : 'Sélectionne une note ou'}</p>
              {!isTrash && (
                <button type="button" onClick={handleNewNote} className="flex items-center gap-2 px-4 py-2 bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30 rounded-lg text-sm transition-colors">
                  <Plus size={14} /> Nouvelle note
                </button>
              )}
            </div>
          ) : (
            <>
              {/* Toolbar */}
              <div className="flex items-center px-4 py-2 border-b border-dark-700 gap-2">
                <button type="button" title="Retour à la liste" onClick={() => setMobilePanel('list')} className="md:hidden text-gray-400 hover:text-white mr-1">
                  <ArrowLeft size={15} />
                </button>
                {isReadOnly && (
                  <span className="text-[10px] text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded-full">Lecture seule</span>
                )}
                <span className={`text-xs ${saveColor} mr-auto`}>{!isReadOnly && saveLabel()}</span>

                {isReadOnly && (
                  <>
                    <button type="button" onClick={handleRecover} className="flex items-center gap-1.5 px-3 py-1.5 bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30 rounded-lg text-xs transition-colors">
                      <RotateCcw size={12} /> Récupérer
                    </button>
                    <div className="flex items-center gap-1">
                      <button type="button" onClick={handlePermanentDelete} title="Supprimer définitivement"
                        className={`p-1.5 rounded transition-colors ${confirmDel ? 'bg-red-500/20 text-red-400' : 'text-gray-500 hover:text-red-400 hover:bg-dark-700'}`}
                      ><Trash2 size={14} /></button>
                      {confirmDel && <span className="text-[10px] text-red-400">Cliquer encore</span>}
                    </div>
                    {selectedNote.deletedAt && (
                      <span className="text-[10px] text-gray-500 ml-1">{daysUntilPurge(selectedNote.deletedAt)}j restants</span>
                    )}
                  </>
                )}

                {!isReadOnly && (
                  <>
                    <div className="relative">
                      <button type="button" onClick={e => { e.stopPropagation(); setShowMoveMenu(!showMoveMenu); }} title="Déplacer vers"
                        className="p-1.5 rounded text-gray-500 hover:text-white hover:bg-dark-700 transition-colors"
                      ><FolderOpen size={14} /></button>
                      {showMoveMenu && (
                        <div className="absolute right-0 top-full z-50 mt-1 bg-dark-800 border border-dark-600 rounded-lg shadow-2xl overflow-hidden w-44" onClick={e => e.stopPropagation()}>
                          <p className="px-3 pt-2 pb-1 text-[10px] font-semibold text-gray-500 uppercase tracking-wide">Déplacer vers</p>
                          <button type="button" onClick={() => handleMove(null)} className={`w-full px-3 py-1.5 text-sm text-left transition-colors ${!selectedNote.folderId ? 'text-yellow-400 bg-yellow-500/10' : 'text-gray-300 hover:bg-dark-700'}`}>Toutes mes notes</button>
                          {regularFolders.map(f => (
                            <button key={f.id} type="button" onClick={() => handleMove(f.id)} className={`w-full px-3 py-1.5 text-sm text-left transition-colors ${selectedNote.folderId === f.id ? 'text-yellow-400 bg-yellow-500/10' : 'text-gray-300 hover:bg-dark-700'}`}>{f.name}</button>
                          ))}
                          <div className="border-t border-dark-700 mt-1">
                            <button type="button" onClick={async () => { setShowMoveMenu(false); await handleCreateRegularFolder(); }} className="w-full px-3 py-1.5 text-sm text-left text-gray-400 hover:text-white hover:bg-dark-700 flex items-center gap-2">
                              <Plus size={12} /> Nouveau dossier
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                    <button type="button" onClick={handlePin} title={selectedNote.pinned ? 'Désépingler' : 'Épingler'}
                      className={`p-1.5 rounded transition-colors ${selectedNote.pinned ? 'text-yellow-400 bg-yellow-500/15' : 'text-gray-500 hover:text-white hover:bg-dark-700'}`}
                    ><Pin size={14} /></button>
                    <div className="flex items-center gap-1">
                      <button type="button" onClick={handleDelete} title="Mettre à la corbeille"
                        className={`p-1.5 rounded transition-colors ${confirmDel ? 'bg-red-500/20 text-red-400' : 'text-gray-500 hover:text-red-400 hover:bg-dark-700'}`}
                      ><Trash2 size={14} /></button>
                      {confirmDel && <span className="text-[10px] text-red-400 whitespace-nowrap">Cliquer encore</span>}
                    </div>
                  </>
                )}
              </div>

              {/* Barre d'outils rich text + éditeur TipTap */}
              <div className="relative flex-1 flex flex-col overflow-hidden">
                {!isReadOnly && (
                  <EditorToolbar
                    editor={editor}
                    onImageClick={() => imageInputRef.current?.click()}
                    onFileClick={() => fileInputRef.current?.click()}
                    uploadProgress={uploadProgress}
                    focusMode={focusMode}
                    onFocusToggle={() => setFocusMode(f => !f)}
                    onExportMd={handleExportMarkdown}
                    onExportPdf={handleExportPDF}
                  />
                )}

                {/* Titre + autocomplete */}
                <div className="relative">
                  <input
                    ref={titleRef}
                    type="text" value={title} onChange={e => handleTitleChange(e.target.value)}
                    onKeyDown={handleTitleSuggKey}
                    onBlur={() => setTimeout(() => setTitleSuggs([]), 150)}
                    placeholder="Titre" readOnly={isReadOnly} aria-label="Titre de la note"
                    className={`w-full px-6 pt-4 pb-1 bg-transparent text-xl font-bold text-white placeholder-gray-600 focus:outline-none ${isReadOnly ? 'cursor-default' : ''}`}
                  />
                  {titleSuggs.length > 0 && (
                    <div className="absolute left-6 top-full z-50 mt-1 bg-dark-800 border border-dark-600 rounded-lg shadow-2xl overflow-hidden min-w-[220px]" onClick={e => e.stopPropagation()}>
                      <p className="px-3 pt-1.5 pb-0.5 text-[10px] font-semibold text-gray-500 uppercase tracking-wide">
                        {titleSuggType === 'tag' ? 'Tags' : titleSuggType === 'word' ? 'Mots' : 'Titres similaires'}
                      </p>
                      {titleSuggs.map((t, i) => (
                        <button key={t} type="button"
                          onMouseDown={e => { e.preventDefault(); applyTitleSugg(t); }}
                          className={`w-full px-3 py-1.5 text-sm text-left transition-colors truncate flex items-center gap-2 ${
                            i === titleSuggIdx
                              ? 'bg-yellow-500/20 text-yellow-300'
                              : titleSuggType === 'tag' ? 'text-yellow-400 hover:bg-dark-700' : 'text-gray-300 hover:bg-dark-700'
                          }`}
                        >
                          {titleSuggType === 'tag' ? <><Hash size={11} />#{t}</> : t}
                        </button>
                      ))}
                      <p className="px-3 py-1 text-[10px] text-gray-600">↑↓ · Tab/Enter · Esc</p>
                    </div>
                  )}
                </div>

                {selectedNote.folderId && (
                  <div className="px-6 pb-1">
                    <span className="flex items-center gap-1 text-xs text-gray-500">
                      <FolderOpen size={11} />{folders.find(f => f.id === selectedNote.folderId)?.name ?? 'Dossier'}
                    </span>
                  </div>
                )}
                {/* Inputs fichiers cachés */}
                <input ref={imageInputRef} type="file" accept="image/*" className="hidden"
                  aria-label="Insérer une image"
                  onChange={e => { const f = e.target.files?.[0]; if (f) handleImageInsert(f); e.target.value = ''; }} />
                <input ref={fileInputRef} type="file" className="hidden"
                  aria-label="Joindre un fichier"
                  onChange={e => { const f = e.target.files?.[0]; if (f) handleFileInsert(f); e.target.value = ''; }} />
                {/* BubbleMenu code block — apparaît au-dessus du bloc de code actif */}
                {editor && !isReadOnly && (
                  <BubbleMenu
                    editor={editor}
                    options={{ placement: 'top-start' }}
                    shouldShow={({ editor: e }) => e.isActive('codeBlock')}
                    className="flex items-center gap-1 bg-dark-800 border border-dark-700 rounded-lg px-1.5 py-1 shadow-2xl z-50"
                  >
                    <select
                      title="Langage du bloc de code"
                      value={editor.getAttributes('codeBlock').language ?? 'auto'}
                      onChange={e => {
                        const lang = e.target.value;
                        editor.chain().focus().updateAttributes('codeBlock', {
                          language: lang === 'auto' ? null : lang,
                        }).run();
                      }}
                      className="text-xs bg-dark-700 text-gray-300 border border-dark-600 rounded px-1.5 py-0.5 focus:outline-none focus:border-yellow-500/50 cursor-pointer"
                    >
                      {LANGUAGES.map(l => (
                        <option key={l.value} value={l.value}>{l.label}</option>
                      ))}
                    </select>
                    <div className="w-px h-4 bg-dark-700 mx-0.5" />
                    <button
                      type="button"
                      title="Copier le code"
                      onClick={() => {
                        const { $from } = editor.state.selection;
                        // Remonter jusqu'au noeud codeBlock pour récupérer tout le texte
                        let node = $from.node();
                        if (node.type.name !== 'codeBlock') {
                          const depth = $from.depth;
                          for (let d = depth; d >= 0; d--) {
                            const n = $from.node(d);
                            if (n.type.name === 'codeBlock') { node = n; break; }
                          }
                        }
                        navigator.clipboard.writeText(node.textContent).then(() => {
                          setCodeCopied(true);
                          setTimeout(() => setCodeCopied(false), 1500);
                        });
                      }}
                      className="flex items-center gap-1 text-xs px-2 py-0.5 rounded transition-colors text-gray-400 hover:text-white hover:bg-dark-700"
                    >
                      {codeCopied ? (
                        <span className="text-green-400">✓ Copié</span>
                      ) : (
                        <span>Copier</span>
                      )}
                    </button>
                  </BubbleMenu>
                )}
                {/* BubbleMenu tableau — outils contextuels (apparaît quand curseur dans une cellule) */}
                {editor && !isReadOnly && (
                  <BubbleMenu
                    editor={editor}
                    options={{ placement: 'top' }}
                    shouldShow={({ editor: e }) => e.isActive('tableCell') || e.isActive('tableHeader')}
                    className="flex items-center gap-0.5 flex-wrap bg-dark-800 border border-dark-700 rounded-lg px-1.5 py-1 shadow-2xl z-50 max-w-sm"
                  >
                    {/* Lignes */}
                    <button type="button" title="Ajouter une ligne au-dessus"
                      onClick={() => editor.chain().focus().addRowBefore().run()}
                      className="text-xs px-1.5 py-0.5 rounded text-gray-400 hover:text-white hover:bg-dark-700 transition-colors whitespace-nowrap">
                      ↑ Ligne
                    </button>
                    <button type="button" title="Ajouter une ligne en-dessous"
                      onClick={() => editor.chain().focus().addRowAfter().run()}
                      className="text-xs px-1.5 py-0.5 rounded text-gray-400 hover:text-white hover:bg-dark-700 transition-colors whitespace-nowrap">
                      ↓ Ligne
                    </button>
                    <button type="button" title="Supprimer la ligne"
                      onClick={() => editor.chain().focus().deleteRow().run()}
                      className="text-xs px-1.5 py-0.5 rounded text-red-400/70 hover:text-red-400 hover:bg-dark-700 transition-colors whitespace-nowrap">
                      ✕ Ligne
                    </button>
                    <div className="w-px h-4 bg-dark-700 mx-0.5 shrink-0" />
                    {/* Colonnes */}
                    <button type="button" title="Ajouter une colonne à gauche"
                      onClick={() => editor.chain().focus().addColumnBefore().run()}
                      className="text-xs px-1.5 py-0.5 rounded text-gray-400 hover:text-white hover:bg-dark-700 transition-colors whitespace-nowrap">
                      ← Col.
                    </button>
                    <button type="button" title="Ajouter une colonne à droite"
                      onClick={() => editor.chain().focus().addColumnAfter().run()}
                      className="text-xs px-1.5 py-0.5 rounded text-gray-400 hover:text-white hover:bg-dark-700 transition-colors whitespace-nowrap">
                      → Col.
                    </button>
                    <button type="button" title="Supprimer la colonne"
                      onClick={() => editor.chain().focus().deleteColumn().run()}
                      className="text-xs px-1.5 py-0.5 rounded text-red-400/70 hover:text-red-400 hover:bg-dark-700 transition-colors whitespace-nowrap">
                      ✕ Col.
                    </button>
                    <div className="w-px h-4 bg-dark-700 mx-0.5 shrink-0" />
                    {/* Fusion / Scission */}
                    <button type="button" title="Fusionner les cellules sélectionnées"
                      onClick={() => editor.chain().focus().mergeCells().run()}
                      disabled={!editor.can().mergeCells()}
                      className="text-xs px-1.5 py-0.5 rounded text-gray-400 hover:text-white hover:bg-dark-700 transition-colors disabled:opacity-30 disabled:cursor-not-allowed whitespace-nowrap">
                      Fusionner
                    </button>
                    <button type="button" title="Scinder la cellule"
                      onClick={() => editor.chain().focus().splitCell().run()}
                      disabled={!editor.can().splitCell()}
                      className="text-xs px-1.5 py-0.5 rounded text-gray-400 hover:text-white hover:bg-dark-700 transition-colors disabled:opacity-30 disabled:cursor-not-allowed whitespace-nowrap">
                      Scinder
                    </button>
                    <div className="w-px h-4 bg-dark-700 mx-0.5 shrink-0" />
                    {/* En-tête */}
                    <button type="button" title="Basculer la ligne en en-tête"
                      onClick={() => editor.chain().focus().toggleHeaderRow().run()}
                      className={`text-xs px-1.5 py-0.5 rounded transition-colors whitespace-nowrap ${
                        editor.isActive('tableHeader') ? 'bg-yellow-500/20 text-yellow-400' : 'text-gray-400 hover:text-white hover:bg-dark-700'
                      }`}>
                      En-tête
                    </button>
                    <div className="w-px h-4 bg-dark-700 mx-0.5 shrink-0" />
                    {/* Supprimer le tableau */}
                    <button type="button" title="Supprimer le tableau"
                      onClick={() => editor.chain().focus().deleteTable().run()}
                      className="text-xs px-1.5 py-0.5 rounded text-red-400/70 hover:text-red-400 hover:bg-dark-700 transition-colors whitespace-nowrap">
                      ✕ Tableau
                    </button>
                  </BubbleMenu>
                )}
                {/* BubbleMenu — formatage rapide à la sélection (apparaît sous le texte) */}
                {editor && !isReadOnly && (
                  <BubbleMenu editor={editor} options={{ placement: 'bottom' }}
                    className="flex items-center gap-0.5 bg-dark-800 border border-dark-700 rounded-lg p-1 shadow-2xl z-50">
                    <button type="button" title="Gras (Ctrl+B)"
                      onClick={() => editor.chain().focus().toggleBold().run()}
                      className={`p-1.5 rounded transition-colors ${editor.isActive('bold') ? 'bg-yellow-500/20 text-yellow-400' : 'text-gray-400 hover:text-white hover:bg-dark-700'}`}>
                      <Bold size={12} />
                    </button>
                    <button type="button" title="Italique (Ctrl+I)"
                      onClick={() => editor.chain().focus().toggleItalic().run()}
                      className={`p-1.5 rounded transition-colors ${editor.isActive('italic') ? 'bg-yellow-500/20 text-yellow-400' : 'text-gray-400 hover:text-white hover:bg-dark-700'}`}>
                      <Italic size={12} />
                    </button>
                    <div className="w-px h-4 bg-dark-700 mx-0.5" />
                    <div className="relative">
                      <button type="button" title="Lien hypertexte"
                        onClick={() => {
                          if (editor.isActive('link')) {
                            editor.chain().focus().unsetLink().run();
                            setBubbleLinkOpen(false);
                          } else {
                            setBubbleLinkVal(editor.getAttributes('link').href || '');
                            setBubbleLinkOpen(o => !o);
                          }
                        }}
                        className={`p-1.5 rounded transition-colors ${editor.isActive('link') ? 'bg-yellow-500/20 text-yellow-400' : 'text-gray-400 hover:text-white hover:bg-dark-700'}`}>
                        <LinkIcon size={12} />
                      </button>
                      {bubbleLinkOpen && (
                        <div
                          className="absolute top-full left-1/2 -translate-x-1/2 mt-1 z-50 bg-dark-800 border border-dark-600 rounded-lg p-2 shadow-xl flex gap-1.5 min-w-[200px]"
                          onMouseDown={e => e.stopPropagation()}>
                          <input
                            autoFocus
                            value={bubbleLinkVal}
                            onChange={e => setBubbleLinkVal(e.target.value)}
                            onKeyDown={e => {
                              if (e.key === 'Enter') {
                                const href = bubbleLinkVal.trim();
                                if (!href) editor.chain().focus().unsetLink().run();
                                else editor.chain().focus().setLink({ href: href.startsWith('http') ? href : `https://${href}` }).run();
                                setBubbleLinkOpen(false); setBubbleLinkVal('');
                              }
                              if (e.key === 'Escape') { setBubbleLinkOpen(false); setBubbleLinkVal(''); }
                            }}
                            placeholder="https://..."
                            className="flex-1 text-xs bg-dark-700 text-gray-200 placeholder-gray-500 rounded px-2 py-1 focus:outline-none border border-dark-600 focus:border-yellow-500/50"
                          />
                          <button type="button"
                            onMouseDown={e => {
                              e.preventDefault();
                              const href = bubbleLinkVal.trim();
                              if (!href) editor.chain().focus().unsetLink().run();
                              else editor.chain().focus().setLink({ href: href.startsWith('http') ? href : `https://${href}` }).run();
                              setBubbleLinkOpen(false); setBubbleLinkVal('');
                            }}
                            className="text-xs px-2 py-1 bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30 rounded transition-colors">
                            OK
                          </button>
                        </div>
                      )}
                    </div>
                  </BubbleMenu>
                )}
                <EditorContent
                  editor={editor}
                  className="flex-1 px-6 py-2 overflow-y-auto min-h-0"
                />
                {/* Slash command menu */}
                {slashMenu && (() => {
                  const cmds = SLASH_CMDS.filter(c =>
                    !slashFilter || c.id.startsWith(slashFilter) || c.label.toLowerCase().startsWith(slashFilter)
                  );
                  if (cmds.length === 0) return null;
                  return (
                    <div className="absolute left-6 top-16 z-50 bg-dark-800 border border-dark-600 rounded-xl shadow-2xl overflow-hidden w-64"
                      onClick={e => e.stopPropagation()}>
                      <p className="px-3 pt-2 pb-1 text-[10px] font-semibold text-gray-500 uppercase tracking-widest">
                        Commandes — tapez pour filtrer
                      </p>
                      {cmds.map((c, i) => (
                        <button key={c.id} type="button"
                          onMouseDown={e => { e.preventDefault(); applySlashCommand(i); }}
                          className={`w-full px-3 py-2 text-sm text-left flex items-center gap-3 transition-colors ${
                            i === slashIdx ? 'bg-yellow-500/15 text-yellow-300' : 'text-gray-300 hover:bg-dark-700'
                          }`}
                        >
                          <span className="font-medium text-sm w-24 shrink-0">{c.label}</span>
                          <span className="text-xs text-gray-500 truncate">{c.desc}</span>
                        </button>
                      ))}
                      <p className="px-3 py-1.5 text-[10px] text-gray-600 border-t border-dark-700">↑↓ · Enter · Esc</p>
                    </div>
                  );
                })()}

                {suggestions.length > 0 && (
                  <div className="absolute left-6 bottom-4 z-50 bg-dark-800 border border-dark-600 rounded-lg shadow-2xl overflow-hidden min-w-[160px]" onClick={e => e.stopPropagation()}>
                    <p className="px-3 pt-1.5 pb-0.5 text-[10px] font-semibold text-gray-500 uppercase tracking-wide">
                      {suggestionType === 'tag' ? 'Tags' : 'Mots'}
                    </p>
                    {suggestions.map((item, i) => (
                      <button key={item} type="button" onClick={() => applySuggestion(item)}
                        className={`w-full px-3 py-1.5 text-sm text-left flex items-center gap-2 transition-colors ${
                          i === suggestionIdx
                            ? 'bg-yellow-500/20 text-yellow-300'
                            : suggestionType === 'tag' ? 'text-yellow-400 hover:bg-dark-700' : 'text-gray-300 hover:bg-dark-700'
                        }`}
                      >
                        {suggestionType === 'tag' ? <><Hash size={11} />#{item}</> : item}
                      </button>
                    ))}
                    <p className="px-3 py-1 text-[10px] text-gray-600">↑↓ · Tab/Enter · Esc</p>
                  </div>
                )}
                {/* Compteur mots / caractères */}
                {editor && (
                  <div className="px-6 py-1 border-t border-dark-900 flex justify-end shrink-0">
                    <span className="text-[10px] text-gray-600">
                      {editor.storage.characterCount?.words?.() ?? 0} mots
                      · {editor.storage.characterCount?.characters?.() ?? 0} car.
                    </span>
                  </div>
                )}
              </div>

              {selectedNote.tags.length > 0 && (
                <div className="px-6 py-2.5 border-t border-dark-800 flex items-center gap-1.5 flex-wrap">
                  <Hash size={11} className="text-gray-600" />
                  {selectedNote.tags.map(t => (
                    <span key={t}
                      onClick={() => { if (!isTrash) setView({ type: 'tag', tag: t }); }}
                      className={`text-xs text-yellow-500 bg-yellow-500/10 px-2 py-0.5 rounded-full transition-colors ${!isTrash ? 'cursor-pointer hover:bg-yellow-500/20' : ''}`}
                    >#{t}</span>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}

// ── NoteCard ─────────────────────────────────────────────────────────────────

function NoteCard({ note, selected, onSelect, trashInfo }: {
  note:       Note;
  selected:   boolean;
  onSelect:   (n: Note) => void;
  trashInfo?: number;
}) {
  return (
    <motion.div
      data-note-id={note.id}
      layout
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, x: -24, scale: 0.88, transition: { duration: 0.28, ease: 'easeIn' } }}
    >
      <button
        type="button"
        onClick={() => onSelect(note)}
        className={`w-full text-left px-3 py-2.5 border-b border-dark-800 transition-colors ${
          selected ? 'bg-yellow-500/10 border-l-2 border-l-yellow-400' : 'hover:bg-dark-800'
        }`}
      >
        <div className="flex items-center gap-1.5 mb-0.5">
          {note.pinned && <Pin size={9} className="text-yellow-400 shrink-0" />}
          <span className="text-xs font-semibold text-white truncate">{note.title || 'Sans titre'}</span>
        </div>
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs text-gray-500 truncate flex-1">
            {stripHtml(note.content).replace(/#\w+/g, '').trim() || 'Aucun contenu'}
          </p>
          <span className="text-[10px] text-gray-600 shrink-0">
            {trashInfo !== undefined ? <span className="text-orange-500">{trashInfo}j</span> : fmtDate(note.updatedAt)}
          </span>
        </div>
        {note.tags.length > 0 && (
          <div className="flex gap-1 mt-1 flex-wrap">
            {note.tags.slice(0, 3).map(t => (
              <span key={t} className="text-[10px] text-yellow-600 bg-yellow-500/10 px-1 rounded">#{t}</span>
            ))}
            {note.tags.length > 3 && <span className="text-[10px] text-gray-600">+{note.tags.length - 3}</span>}
          </div>
        )}
      </button>
    </motion.div>
  );
}
