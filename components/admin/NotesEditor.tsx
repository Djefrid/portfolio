"use client";

import {
  useState, useEffect, useRef, useCallback, useMemo,
} from 'react';
import {
  Plus, Pin, Trash2, Search, StickyNote, FolderPlus,
  Hash, MoreHorizontal, FolderOpen, Folder, ArrowLeft,
  ChevronRight, X, RotateCcw, ArrowUpDown,
} from 'lucide-react';
import { useAdminNotes } from '@/hooks/useAdminNotes';
import {
  createNote, updateNote, deleteNote, moveNote,
  permanentlyDeleteNote, recoverNote, silentlyDeleteNote,
  createFolder, updateFolder, deleteFolder,
  Note, Folder as FolderType,
} from '@/lib/notes-service';

// ── Types ────────────────────────────────────────────────────────────────────

type ViewFilter =
  | 'all'
  | 'pinned'
  | 'inbox'
  | 'trash'
  | { type: 'folder'; id: string }
  | { type: 'tag';    tag: string };

type SortBy = 'dateModified' | 'dateCreated' | 'title';
type SaveStatus = 'saved' | 'saving' | 'unsaved' | 'error';
type MobilePanel = 'sidebar' | 'list' | 'editor';

// ── Helpers ──────────────────────────────────────────────────────────────────

function viewEq(a: ViewFilter, b: ViewFilter) {
  return JSON.stringify(a) === JSON.stringify(b);
}

function fmtDate(d: Date): string {
  const diff = Date.now() - d.getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Auj.";
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
  if (view === 'inbox')  return 'Inbox';
  if (view === 'trash')  return 'Corbeille';
  if (typeof view === 'object' && view.type === 'folder')
    return folders.find(f => f.id === view.id)?.name ?? 'Dossier';
  if (typeof view === 'object' && view.type === 'tag')
    return `#${view.tag}`;
  return '';
}

// ── Sidebar ──────────────────────────────────────────────────────────────────

function NotesSidebar({
  notes, deletedNotes, folders, view, onSelectView, newFolderPendingId, onFolderCreated,
}: {
  notes:              Note[];
  deletedNotes:       Note[];
  folders:            FolderType[];
  view:               ViewFilter;
  onSelectView:       (v: ViewFilter) => void;
  newFolderPendingId: string | null;
  onFolderCreated:    () => void;
}) {
  const [editingId,   setEditingId]   = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [menuId,      setMenuId]      = useState<string | null>(null);

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

  const allTags = useMemo(() =>
    Object.entries(counts.byTag).sort((a, b) => b[1] - a[1]).map(([t]) => t),
    [counts.byTag]
  );

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
    if (viewEq(view, { type: 'folder', id })) onSelectView('all');
    setMenuId(null);
  };

  return (
    <div
      className="flex flex-col h-full overflow-y-auto select-none"
      onClick={() => setMenuId(null)}
    >
      {/* Smart views */}
      <div className="px-2 pt-3 pb-2 space-y-0.5">
        {/* "Toutes" only when there are custom folders (Apple Notes rule) */}
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
          <span className="flex items-center gap-2"><Folder size={13} />Inbox</span>
          <span className="text-xs opacity-50">{counts.inbox}</span>
        </button>
      </div>

      <div className="mx-2 border-t border-dark-700" />

      {/* Folders */}
      <div className="px-2 pt-2 pb-1">
        <div className="px-1 mb-1">
          <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest">
            Dossiers
          </span>
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
                    if (e.key === 'Enter') commitRename(f.id);
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
                    <FolderOpen size={13} className="shrink-0" />
                    <span className="truncate">{f.name}</span>
                  </span>
                  <span className="flex items-center gap-1 shrink-0">
                    <span className="text-xs opacity-50">{counts.byFolder[f.id] ?? 0}</span>
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
                  className="absolute right-0 top-full z-50 mt-1 bg-dark-800 border border-dark-600 rounded-lg shadow-2xl overflow-hidden w-36"
                  onClick={e => e.stopPropagation()}
                >
                  <button
                    type="button"
                    onClick={() => { setEditingId(f.id); setEditingName(f.name); setMenuId(null); }}
                    className="w-full px-3 py-2 text-sm text-left text-gray-300 hover:bg-dark-700"
                  >
                    Renommer
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

      {/* Tags */}
      {allTags.length > 0 && (
        <>
          <div className="mx-2 border-t border-dark-700" />
          <div className="px-2 pt-2 pb-2">
            <div className="px-1 mb-1">
              <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest">Tags</span>
            </div>
            <div className="space-y-0.5">
              {allTags.map(tag => (
                <button
                  key={tag}
                  type="button"
                  className={row({ type: 'tag', tag })}
                  onClick={() => onSelectView({ type: 'tag', tag })}
                >
                  <span className="flex items-center gap-2">
                    <Hash size={12} /><span className="truncate">{tag}</span>
                  </span>
                  <span className="text-xs opacity-50">{counts.byTag[tag]}</span>
                </button>
              ))}
            </div>
          </div>
        </>
      )}

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
              <span className="flex items-center gap-2">
                <Trash2 size={13} />Corbeille
              </span>
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
  const { notes, deletedNotes, folders, loading } = useAdminNotes();

  const [view,        setView]        = useState<ViewFilter>('inbox');
  const [selectedId,  setSelectedId]  = useState<string | null>(null);
  const [mobilePanel, setMobilePanel] = useState<MobilePanel>('list');

  // Editor state
  const [title,        setTitle]        = useState('');
  const [content,      setContent]      = useState('');
  const [saveStatus,   setSaveStatus]   = useState<SaveStatus>('saved');
  const [lastSaved,    setLastSaved]    = useState<Date | null>(null);
  const [confirmDel,   setConfirmDel]   = useState(false);
  const [showMoveMenu, setShowMoveMenu] = useState(false);
  const [showSortMenu, setShowSortMenu] = useState(false);

  // Sort (Apple Notes: date modifiée par défaut)
  const [sortBy, setSortBy] = useState<SortBy>('dateModified');

  // Tag autocomplete
  const [tagSuggestions, setTagSuggestions] = useState<string[]>([]);
  const contentRef = useRef<HTMLTextAreaElement>(null);

  // Search
  const [search, setSearch] = useState('');

  // Folder creation
  const [newFolderPendingId, setNewFolderPendingId] = useState<string | null>(null);

  // Track previous selected note for empty-note cleanup
  const prevSelectedId = useRef<string | null>(null);
  const prevTitle      = useRef('');
  const prevContent    = useRef('');

  const saveTimer = useRef<ReturnType<typeof setTimeout>>();

  const selectedNote = notes.find(n => n.id === selectedId)
    ?? deletedNotes.find(n => n.id === selectedId)
    ?? null;

  const isTrash      = view === 'trash';
  const isReadOnly   = selectedNote ? !!selectedNote.deletedAt : false;

  // ── All tags (union across active notes) ──────────────────────────────────
  const allTags = useMemo(() => {
    const set = new Set<string>();
    notes.forEach(n => n.tags.forEach(t => set.add(t)));
    return Array.from(set);
  }, [notes]);

  // ── On note switch: cleanup empty notes (Apple Notes rule) ────────────────
  useEffect(() => {
    const oldId      = prevSelectedId.current;
    const oldTitle   = prevTitle.current;
    const oldContent = prevContent.current;

    if (oldId && oldId !== selectedId) {
      const isEmpty = !oldTitle.trim() && !oldContent.trim();
      if (isEmpty) silentlyDeleteNote(oldId); // no trash, silent (Apple rule)
    }

    prevSelectedId.current = selectedId;
    prevTitle.current      = title;
    prevContent.current    = content;

    clearTimeout(saveTimer.current);
    setConfirmDel(false);
    setShowMoveMenu(false);
    setSaveStatus('saved');
    setLastSaved(null);
    setTagSuggestions([]);
  }, [selectedId]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Filtered & sorted notes ───────────────────────────────────────────────
  const filteredNotes = useMemo(() => {
    // Source: active notes or trash
    let list = isTrash ? [...deletedNotes] : [...notes];

    if (!isTrash) {
      if (view === 'pinned') {
        list = list.filter(n => n.pinned);
      } else if (view === 'inbox') {
        list = list.filter(n => !n.folderId);
      } else if (typeof view === 'object' && view.type === 'folder') {
        list = list.filter(n => n.folderId === view.id);
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

    // Sort (Apple Notes: pinned = manual order = kept at top, rest by sort criteria)
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

    // Trash: always by deletion date desc
    return list.sort((a, b) =>
      (b.deletedAt?.getTime() ?? 0) - (a.deletedAt?.getTime() ?? 0)
    );
  }, [notes, deletedNotes, view, search, sortBy, isTrash]);

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

  // ── Tag autocomplete ──────────────────────────────────────────────────────
  const detectTagAtCursor = useCallback(() => {
    const el = contentRef.current;
    if (!el) return;
    const textBefore = content.slice(0, el.selectionStart);
    const match = textBefore.match(/#([a-zA-Z\u00C0-\u024F][a-zA-Z0-9\u00C0-\u024F_-]*)$/);
    if (match) {
      const partial = match[1].toLowerCase();
      setTagSuggestions(
        allTags.filter(t => t.startsWith(partial) && t !== partial).slice(0, 6)
      );
    } else {
      setTagSuggestions([]);
    }
  }, [content, allTags]);

  const applyTagSuggestion = (tag: string) => {
    const el = contentRef.current;
    if (!el) return;
    const cursor      = el.selectionStart;
    const textBefore  = content.slice(0, cursor);
    const textAfter   = content.slice(cursor);
    const newBefore   = textBefore.replace(/#([a-zA-Z\u00C0-\u024F][a-zA-Z0-9\u00C0-\u024F_-]*)$/, `#${tag} `);
    const newContent  = newBefore + textAfter;
    setContent(newContent);
    scheduleAutoSave(title, newContent);
    setTagSuggestions([]);
    setTimeout(() => { el.focus(); el.setSelectionRange(newBefore.length, newBefore.length); }, 0);
  };

  // ── Editor handlers ───────────────────────────────────────────────────────
  const handleTitleChange = (v: string) => {
    setTitle(v);
    scheduleAutoSave(v, content);
  };

  const handleContentChange = (v: string) => {
    setContent(v);
    scheduleAutoSave(title, v);
    setTimeout(detectTagAtCursor, 0);
  };

  const handleNewNote = async () => {
    const folderId =
      typeof view === 'object' && view.type === 'folder' ? view.id : null;
    const id = await createNote(folderId);
    setSelectedId(id);
    setTitle('');
    setContent('');
    setSaveStatus('saved');
    setMobilePanel('editor');
  };

  const handleSelectNote = (note: Note) => {
    setSelectedId(note.id);
    setTitle(note.title);
    setContent(note.content);
    setSaveStatus('saved');
    setMobilePanel('editor');
  };

  const handlePin = async () => {
    if (!selectedNote || isReadOnly) return;
    await updateNote(selectedNote.id, { pinned: !selectedNote.pinned });
  };

  // Delete → soft delete (corbeille)
  const handleDelete = async () => {
    if (!selectedId) return;
    if (!confirmDel) { setConfirmDel(true); return; }
    await deleteNote(selectedId);
    setSelectedId(null);
    setTitle('');
    setContent('');
    setMobilePanel('list');
    setConfirmDel(false);
  };

  // Recover from trash → Inbox
  const handleRecover = async () => {
    if (!selectedId) return;
    await recoverNote(selectedId);
    setSelectedId(null);
    setTitle('');
    setContent('');
    setView('inbox');
    setMobilePanel('list');
  };

  // Permanent delete
  const handlePermanentDelete = async () => {
    if (!selectedId) return;
    if (!confirmDel) { setConfirmDel(true); return; }
    await permanentlyDeleteNote(selectedId);
    setSelectedId(null);
    setTitle('');
    setContent('');
    setMobilePanel('list');
    setConfirmDel(false);
  };

  const handleMove = async (folderId: string | null) => {
    if (!selectedId) return;
    await moveNote(selectedId, folderId);
    setShowMoveMenu(false);
  };

  const handleCreateFolder = async () => {
    const id = await createFolder('Nouveau dossier', folders.length);
    setNewFolderPendingId(id);
    setMobilePanel('sidebar');
  };

  // Save status label
  const saveLabel = () => {
    if (saveStatus === 'saving')  return 'Sauvegarde...';
    if (saveStatus === 'unsaved') return 'Non sauvegardé';
    if (saveStatus === 'error')   return 'Erreur';
    if (lastSaved)
      return `Sauvegardé ${lastSaved.toLocaleTimeString('fr-CA', { hour: '2-digit', minute: '2-digit' })}`;
    return '';
  };

  const saveColor =
    saveStatus === 'error'   ? 'text-red-400' :
    saveStatus === 'unsaved' ? 'text-yellow-400' :
    saveStatus === 'saving'  ? 'text-gray-400' : 'text-gray-500';

  // Split for pinned section separator (Apple Notes rule)
  const hasPinnedSection =
    !isTrash &&
    view !== 'pinned' &&
    filteredNotes.some(n => n.pinned) &&
    filteredNotes.some(n => !n.pinned);

  const pinnedNotes   = hasPinnedSection ? filteredNotes.filter(n => n.pinned)  : [];
  const unpinnedNotes = hasPinnedSection ? filteredNotes.filter(n => !n.pinned) : filteredNotes;

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div
      className="flex h-[calc(100vh-260px)] min-h-[540px] overflow-hidden -m-6 rounded-xl"
      onClick={() => { setShowMoveMenu(false); setShowSortMenu(false); setTagSuggestions([]); }}
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
          <button type="button" onClick={handleCreateFolder} title="Nouveau dossier" className="text-gray-500 hover:text-yellow-400 transition-colors p-1 rounded">
            <FolderPlus size={13} />
          </button>
        </div>
        <NotesSidebar
          notes={notes}
          deletedNotes={deletedNotes}
          folders={folders}
          view={view}
          onSelectView={v => { setView(v); setMobilePanel('list'); }}
          newFolderPendingId={newFolderPendingId}
          onFolderCreated={() => setNewFolderPendingId(null)}
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
            <span className="text-sm font-semibold text-white truncate">{viewLabel(view, folders)}</span>
            <div className="flex items-center gap-1">
              {/* Sort menu */}
              {!isTrash && (
                <div className="relative">
                  <button
                    type="button"
                    title="Trier"
                    onClick={e => { e.stopPropagation(); setShowSortMenu(!showSortMenu); }}
                    className="p-1 rounded text-gray-500 hover:text-white hover:bg-dark-700 transition-colors"
                  >
                    <ArrowUpDown size={12} />
                  </button>
                  {showSortMenu && (
                    <div
                      className="absolute right-0 top-full z-50 mt-1 bg-dark-800 border border-dark-600 rounded-lg shadow-2xl overflow-hidden w-44"
                      onClick={e => e.stopPropagation()}
                    >
                      <p className="px-3 pt-2 pb-1 text-[10px] font-semibold text-gray-500 uppercase tracking-wide">Trier par</p>
                      {([
                        ['dateModified', 'Date de modification'],
                        ['dateCreated',  'Date de création'],
                        ['title',        'Titre'],
                      ] as [SortBy, string][]).map(([val, label]) => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => { setSortBy(val); setShowSortMenu(false); }}
                          className={`w-full px-3 py-1.5 text-sm text-left transition-colors ${
                            sortBy === val ? 'text-yellow-400 bg-yellow-500/10' : 'text-gray-300 hover:bg-dark-700'
                          }`}
                        >
                          {label}
                        </button>
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
                <button
                  type="button"
                  title="Vider la corbeille"
                  onClick={() => { if (confirm('Supprimer définitivement toutes les notes ?')) deletedNotes.forEach(n => permanentlyDeleteNote(n.id)); }}
                  className="text-xs text-red-400 hover:text-red-300 px-2 py-1 rounded hover:bg-red-500/10 transition-colors"
                >
                  Vider
                </button>
              )}
            </div>
          </div>
          <div className="relative">
            <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder="Rechercher..."
              value={search}
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

        {/* Note list with pinned section separator */}
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
              {/* Pinned section (Apple Notes: section separator) */}
              {hasPinnedSection && (
                <>
                  <div className="px-3 py-1 text-[10px] font-semibold text-gray-500 uppercase tracking-widest bg-dark-900 sticky top-0 z-10">
                    Épinglées
                  </div>
                  {pinnedNotes.map(note => (
                    <NoteCard
                      key={note.id}
                      note={note}
                      selected={selectedId === note.id}
                      onSelect={handleSelectNote}
                    />
                  ))}
                  <div className="px-3 py-1 text-[10px] font-semibold text-gray-500 uppercase tracking-widest bg-dark-900 sticky top-6 z-10">
                    Notes
                  </div>
                </>
              )}
              {unpinnedNotes.map(note => (
                <NoteCard
                  key={note.id}
                  note={note}
                  selected={selectedId === note.id}
                  onSelect={handleSelectNote}
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

              {/* Read-only badge */}
              {isReadOnly && (
                <span className="text-[10px] text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded-full">
                  Lecture seule
                </span>
              )}

              <span className={`text-xs ${saveColor} mr-auto`}>{!isReadOnly && saveLabel()}</span>

              {/* Trash actions */}
              {isReadOnly && (
                <>
                  <button type="button" onClick={handleRecover} className="flex items-center gap-1.5 px-3 py-1.5 bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30 rounded-lg text-xs transition-colors">
                    <RotateCcw size={12} /> Récupérer
                  </button>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={handlePermanentDelete}
                      title="Supprimer définitivement"
                      className={`p-1.5 rounded transition-colors ${confirmDel ? 'bg-red-500/20 text-red-400' : 'text-gray-500 hover:text-red-400 hover:bg-dark-700'}`}
                    >
                      <Trash2 size={14} />
                    </button>
                    {confirmDel && <span className="text-[10px] text-red-400">Cliquer encore</span>}
                  </div>
                  {selectedNote.deletedAt && (
                    <span className="text-[10px] text-gray-500 ml-1">
                      {daysUntilPurge(selectedNote.deletedAt)}j restants
                    </span>
                  )}
                </>
              )}

              {/* Active note actions */}
              {!isReadOnly && (
                <>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={e => { e.stopPropagation(); setShowMoveMenu(!showMoveMenu); }}
                      title="Déplacer vers"
                      className="p-1.5 rounded text-gray-500 hover:text-white hover:bg-dark-700 transition-colors"
                    >
                      <FolderOpen size={14} />
                    </button>
                    {showMoveMenu && (
                      <div className="absolute right-0 top-full z-50 mt-1 bg-dark-800 border border-dark-600 rounded-lg shadow-2xl overflow-hidden w-44" onClick={e => e.stopPropagation()}>
                        <p className="px-3 pt-2 pb-1 text-[10px] font-semibold text-gray-500 uppercase tracking-wide">Déplacer vers</p>
                        <button type="button" onClick={() => handleMove(null)} className={`w-full px-3 py-1.5 text-sm text-left transition-colors ${!selectedNote.folderId ? 'text-yellow-400 bg-yellow-500/10' : 'text-gray-300 hover:bg-dark-700'}`}>Inbox</button>
                        {folders.map(f => (
                          <button key={f.id} type="button" onClick={() => handleMove(f.id)} className={`w-full px-3 py-1.5 text-sm text-left transition-colors ${selectedNote.folderId === f.id ? 'text-yellow-400 bg-yellow-500/10' : 'text-gray-300 hover:bg-dark-700'}`}>{f.name}</button>
                        ))}
                        <div className="border-t border-dark-700 mt-1">
                          <button type="button" onClick={async () => { setShowMoveMenu(false); await handleCreateFolder(); }} className="w-full px-3 py-1.5 text-sm text-left text-gray-400 hover:text-white hover:bg-dark-700 flex items-center gap-2">
                            <Plus size={12} /> Nouveau dossier
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                  <button type="button" onClick={handlePin} title={selectedNote.pinned ? 'Désépingler' : 'Épingler'} className={`p-1.5 rounded transition-colors ${selectedNote.pinned ? 'text-yellow-400 bg-yellow-500/15' : 'text-gray-500 hover:text-white hover:bg-dark-700'}`}>
                    <Pin size={14} />
                  </button>
                  <div className="flex items-center gap-1">
                    <button type="button" onClick={handleDelete} title="Mettre à la corbeille" className={`p-1.5 rounded transition-colors ${confirmDel ? 'bg-red-500/20 text-red-400' : 'text-gray-500 hover:text-red-400 hover:bg-dark-700'}`}>
                      <Trash2 size={14} />
                    </button>
                    {confirmDel && <span className="text-[10px] text-red-400 whitespace-nowrap">Cliquer encore</span>}
                  </div>
                </>
              )}
            </div>

            {/* Title */}
            <input
              type="text"
              value={title}
              onChange={e => handleTitleChange(e.target.value)}
              placeholder="Titre"
              readOnly={isReadOnly}
              aria-label="Titre de la note"
              className={`w-full px-6 pt-5 pb-1 bg-transparent text-xl font-bold text-white placeholder-gray-600 focus:outline-none ${isReadOnly ? 'cursor-default' : ''}`}
            />

            {/* Folder breadcrumb */}
            {selectedNote.folderId && (
              <div className="px-6 pb-1">
                <span className="flex items-center gap-1 text-xs text-gray-500">
                  <FolderOpen size={11} />
                  {folders.find(f => f.id === selectedNote.folderId)?.name ?? 'Dossier'}
                </span>
              </div>
            )}

            {/* Content + tag autocomplete */}
            <div className="relative flex-1 flex flex-col">
              <textarea
                ref={contentRef}
                value={content}
                onChange={e => handleContentChange(e.target.value)}
                onKeyUp={detectTagAtCursor}
                onClick={detectTagAtCursor}
                placeholder={isReadOnly ? '' : "Commence à écrire...\n\nUtilise #tag pour créer des tags automatiquement."}
                readOnly={isReadOnly}
                aria-label="Contenu de la note"
                className={`flex-1 w-full px-6 py-2 bg-transparent text-gray-300 placeholder-gray-600 focus:outline-none resize-none leading-relaxed text-sm ${isReadOnly ? 'cursor-default' : ''}`}
              />
              {/* Tag autocomplete dropdown */}
              {tagSuggestions.length > 0 && (
                <div
                  className="absolute left-6 bottom-4 z-50 bg-dark-800 border border-dark-600 rounded-lg shadow-2xl overflow-hidden"
                  onClick={e => e.stopPropagation()}
                >
                  {tagSuggestions.map(tag => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => applyTagSuggestion(tag)}
                      className="w-full px-3 py-1.5 text-sm text-left text-yellow-400 hover:bg-dark-700 flex items-center gap-2"
                    >
                      <Hash size={11} />#{tag}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Tags footer */}
            {selectedNote.tags.length > 0 && (
              <div className="px-6 py-2.5 border-t border-dark-800 flex items-center gap-1.5 flex-wrap">
                <Hash size={11} className="text-gray-600" />
                {selectedNote.tags.map(t => (
                  <span
                    key={t}
                    onClick={() => { if (!isTrash) setView({ type: 'tag', tag: t }); }}
                    className={`text-xs text-yellow-500 bg-yellow-500/10 px-2 py-0.5 rounded-full transition-colors ${!isTrash ? 'cursor-pointer hover:bg-yellow-500/20' : ''}`}
                  >
                    #{t}
                  </span>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ── NoteCard sub-component ───────────────────────────────────────────────────

function NoteCard({
  note, selected, onSelect, trashInfo,
}: {
  note:      Note;
  selected:  boolean;
  onSelect:  (n: Note) => void;
  trashInfo?: number; // days until purge
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
        <span className="text-xs font-semibold text-white truncate">
          {note.title || 'Sans titre'}
        </span>
      </div>
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs text-gray-500 truncate flex-1">
          {note.content.replace(/#\w+/g, '').trim() || 'Aucun contenu'}
        </p>
        <span className="text-[10px] text-gray-600 shrink-0">
          {trashInfo !== undefined
            ? <span className="text-orange-500">{trashInfo}j</span>
            : fmtDate(note.updatedAt)
          }
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
