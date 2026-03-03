"use client";

import {
  useState, useEffect, useRef, useCallback, useMemo,
} from 'react';
import {
  Plus, Pin, Trash2, Search, StickyNote, FolderPlus,
  Hash, MoreHorizontal, FolderOpen, Folder, ArrowLeft,
  ChevronRight, X, RotateCcw, ArrowUpDown, Zap,
} from 'lucide-react';
import { useAdminNotes } from '@/hooks/useAdminNotes';
import {
  createNote, updateNote, deleteNote, moveNote,
  permanentlyDeleteNote, recoverNote, silentlyDeleteNote,
  createFolder, createSmartFolder, updateFolder, updateSmartFolderFilters, deleteFolder,
  createTag, deleteTag,
  Note, Folder as FolderType, SmartFolderFilter,
} from '@/lib/notes-service';

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

// ── Sidebar ──────────────────────────────────────────────────────────────────

function NotesSidebar({
  notes, deletedNotes, folders, manualTags, view, onSelectView,
  newFolderPendingId, onFolderCreated, onEditSmartFolder,
  onCreateTag, onDeleteTag,
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
}) {
  const [editingId,       setEditingId]       = useState<string | null>(null);
  const [editingName,     setEditingName]     = useState('');
  const [menuId,          setMenuId]          = useState<string | null>(null);
  const [showNewTag,      setShowNewTag]      = useState(false);
  const [newTagInput,     setNewTagInput]     = useState('');
  const [tagInputSuggs,   setTagInputSuggs]   = useState<string[]>([]);
  const [tagInputSuggIdx, setTagInputSuggIdx] = useState(-1);

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

      {/* Dossiers */}
      <div className="px-2 pt-2 pb-1">
        <div className="px-1 mb-1">
          <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest">Dossiers</span>
        </div>
        <div className="space-y-0.5">
          {folders.map(f => (
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
                    {f.isSmart
                      ? <Zap size={12} className="text-yellow-400 shrink-0" />
                      : <FolderOpen size={13} className="shrink-0" />
                    }
                    <span className="truncate">{f.name}</span>
                  </span>
                  <span className="flex items-center gap-1 shrink-0">
                    {!f.isSmart && <span className="text-xs opacity-50">{counts.byFolder[f.id] ?? 0}</span>}
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
                  {f.isSmart ? (
                    <button
                      type="button"
                      onClick={() => { onEditSmartFolder(f.id); setMenuId(null); }}
                      className="w-full px-3 py-2 text-sm text-left text-gray-300 hover:bg-dark-700 flex items-center gap-2"
                    >
                      <Zap size={12} className="text-yellow-400" /> Modifier les filtres
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => { setEditingId(f.id); setEditingName(f.name); setMenuId(null); }}
                      className="w-full px-3 py-2 text-sm text-left text-gray-300 hover:bg-dark-700"
                    >
                      Renommer
                    </button>
                  )}
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

      {/* Corbeille — uniquement si des notes s'y trouvent (Apple Notes rule) */}
      {deletedNotes.length > 0 && (
        <>
          <div className="mx-2 border-t border-dark-700 mt-auto" />
          <div className="px-2 py-2">
            <button
              type="button"
              className={row('trash')}
              onClick={() => onSelectView('trash')}
            >
              <span className="flex items-center gap-2"><Trash2 size={13} />Corbeille</span>
              <span className="text-xs opacity-50">{deletedNotes.length}</span>
            </button>
          </div>
        </>
      )}
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
  const contentRef = useRef<HTMLTextAreaElement>(null);

  const [search, setSearch] = useState('');

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
      const text = `${n.title} ${n.content}`;
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
      if (!oldTitle.trim() && !oldContent.trim()) silentlyDeleteNote(oldId);
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
        n.title.toLowerCase().includes(s) || n.content.toLowerCase().includes(s)
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
    const el = contentRef.current;
    if (!el) return;
    const textBefore = content.slice(0, el.selectionStart);

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
  }, [content, allTags, wordIndex]);

  const applySuggestion = (item: string) => {
    const el = contentRef.current;
    if (!el) return;
    const cursor     = el.selectionStart;
    const textBefore = content.slice(0, cursor);
    const textAfter  = content.slice(cursor);
    let newBefore: string;
    if (suggestionType === 'tag') {
      newBefore = textBefore.replace(/#([a-zA-Z\u00C0-\u024F][a-zA-Z0-9\u00C0-\u024F_-]*)?$/, `#${item} `);
    } else {
      newBefore = textBefore.replace(/[a-zA-Z\u00C0-\u024F]{3,}$/, item);
    }
    const newContent = newBefore + textAfter;
    setContent(newContent);
    scheduleAutoSave(title, newContent);
    setSuggestions([]);
    setTimeout(() => { el.focus(); el.setSelectionRange(newBefore.length, newBefore.length); }, 0);
  };

  // ── Navigation clavier autocomplete contenu ───────────────────────────────
  const handleContentKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (suggestions.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSuggestionIdx(i => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSuggestionIdx(i => Math.max(i - 1, -1));
    } else if ((e.key === 'Enter' || e.key === 'Tab') && suggestionIdx >= 0) {
      e.preventDefault();
      applySuggestion(suggestions[suggestionIdx]);
    } else if (e.key === 'Tab' && suggestionIdx === -1 && suggestions.length > 0) {
      e.preventDefault();
      applySuggestion(suggestions[0]);
    } else if (e.key === 'Escape') {
      setSuggestions([]);
    }
  };

  // ── Autocomplétion titre ──────────────────────────────────────────────────
  const handleTitleSuggKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (titleSuggs.length === 0) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); setTitleSuggIdx(i => Math.min(i + 1, titleSuggs.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setTitleSuggIdx(i => Math.max(i - 1, -1)); }
    else if ((e.key === 'Tab' || e.key === 'Enter') && titleSuggIdx >= 0) {
      e.preventDefault();
      setTitle(titleSuggs[titleSuggIdx]); scheduleAutoSave(titleSuggs[titleSuggIdx], content);
      setTitleSuggs([]); setTitleSuggIdx(-1);
    } else if (e.key === 'Escape') { setTitleSuggs([]); }
  };

  // ── Handlers éditeur ─────────────────────────────────────────────────────
  const handleTitleChange = (v: string) => {
    setTitle(v);
    scheduleAutoSave(v, content);
    // Suggestions de titres similaires existants
    if (v.trim().length >= 2) {
      const lower = v.toLowerCase();
      const matches = notes
        .filter(n => n.id !== selectedId && n.title.toLowerCase().includes(lower))
        .map(n => n.title)
        .slice(0, 5);
      setTitleSuggs(matches);
    } else {
      setTitleSuggs([]);
    }
  };
  const handleContentChange = (v: string) => {
    setContent(v);
    scheduleAutoSave(title, v);
    setTimeout(detectAtCursor, 0);
  };

  const handleNewNote = async () => {
    const folderId = (currentFolder && !currentFolder.isSmart) ? currentFolder.id : null;
    const id = await createNote(folderId);
    setSelectedId(id); setTitle(''); setContent(''); setSaveStatus('saved');
    setMobilePanel('editor');
  };

  const handleSelectNote = (note: Note) => {
    setSelectedId(note.id); setTitle(note.title); setContent(note.content);
    setSaveStatus('saved'); setMobilePanel('editor');
  };

  const handlePin = async () => {
    if (!selectedNote || isReadOnly) return;
    await updateNote(selectedNote.id, { pinned: !selectedNote.pinned });
  };

  const handleDelete = async () => {
    if (!selectedId) return;
    if (!confirmDel) { setConfirmDel(true); return; }
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
              <input type="text" placeholder="Rechercher..." value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-7 pr-3 py-1.5 bg-dark-800 border border-dark-700 rounded-lg text-xs text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-yellow-500/50"
              />
              {search && (
                <button type="button" title="Effacer" onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white">
                  <X size={11} />
                </button>
              )}
            </div>
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
              <>
                {hasPinnedSection && (
                  <>
                    <div className="px-3 py-1 text-[10px] font-semibold text-gray-500 uppercase tracking-widest bg-dark-900 sticky top-0 z-10">Épinglées</div>
                    {pinnedNotes.map(note => (
                      <NoteCard key={note.id} note={note} selected={selectedId === note.id} onSelect={handleSelectNote} />
                    ))}
                    <div className="px-3 py-1 text-[10px] font-semibold text-gray-500 uppercase tracking-widest bg-dark-900 sticky top-6 z-10">Notes</div>
                  </>
                )}
                {unpinnedNotes.map(note => (
                  <NoteCard key={note.id} note={note} selected={selectedId === note.id} onSelect={handleSelectNote}
                    trashInfo={isTrash && note.deletedAt ? daysUntilPurge(note.deletedAt) : undefined}
                  />
                ))}
              </>
            )}
          </div>
        </div>

        {/* ══ EDITOR ═══════════════════════════════════════════════════════════ */}
        <div
          className={`${mobilePanel === 'editor' ? 'flex' : 'hidden'} md:flex flex-1 flex-col bg-dark-900 min-w-0`}
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

              {/* Titre + autocomplete */}
              <div className="relative">
                <input type="text" value={title} onChange={e => handleTitleChange(e.target.value)}
                  onKeyDown={handleTitleSuggKey}
                  onBlur={() => setTimeout(() => setTitleSuggs([]), 150)}
                  placeholder="Titre" readOnly={isReadOnly} aria-label="Titre de la note"
                  className={`w-full px-6 pt-5 pb-1 bg-transparent text-xl font-bold text-white placeholder-gray-600 focus:outline-none ${isReadOnly ? 'cursor-default' : ''}`}
                />
                {titleSuggs.length > 0 && (
                  <div className="absolute left-6 top-full z-50 mt-1 bg-dark-800 border border-dark-600 rounded-lg shadow-2xl overflow-hidden min-w-[220px]" onClick={e => e.stopPropagation()}>
                    <p className="px-3 pt-1.5 pb-0.5 text-[10px] font-semibold text-gray-500 uppercase tracking-wide">Titres similaires</p>
                    {titleSuggs.map((t, i) => (
                      <button key={t} type="button"
                        onMouseDown={e => { e.preventDefault(); setTitle(t); scheduleAutoSave(t, content); setTitleSuggs([]); }}
                        className={`w-full px-3 py-1.5 text-sm text-left transition-colors truncate ${
                          i === titleSuggIdx ? 'bg-yellow-500/20 text-yellow-300' : 'text-gray-300 hover:bg-dark-700'
                        }`}
                      >{t}</button>
                    ))}
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

              {/* Contenu + autocomplétion */}
              <div className="relative flex-1 flex flex-col">
                <textarea
                  ref={contentRef}
                  value={content}
                  onChange={e => handleContentChange(e.target.value)}
                  onKeyDown={handleContentKeyDown}
                  onKeyUp={detectAtCursor}
                  onClick={detectAtCursor}
                  placeholder={isReadOnly ? '' : "Commence à écrire...\n\nUtilise #tag pour créer des tags automatiquement."}
                  readOnly={isReadOnly}
                  aria-label="Contenu de la note"
                  className={`flex-1 w-full px-6 py-2 bg-transparent text-gray-300 placeholder-gray-600 focus:outline-none resize-none leading-relaxed text-sm ${isReadOnly ? 'cursor-default' : ''}`}
                />
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
          {note.content.replace(/#\w+/g, '').trim() || 'Aucun contenu'}
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
  );
}
