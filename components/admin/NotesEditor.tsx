"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Plus, Pin, Trash2, Search, ArrowLeft, StickyNote } from 'lucide-react';
import { useAdminNotes } from '@/hooks/useAdminNotes';
import { createNote, updateNote, deleteNote, Note } from '@/lib/notes-service';

type SaveStatus = 'saved' | 'saving' | 'unsaved' | 'error';

function formatDate(date: Date): string {
  const diff = Date.now() - date.getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Aujourd'hui";
  if (days === 1) return 'Hier';
  if (days < 7) return `Il y a ${days} j`;
  return date.toLocaleDateString('fr-CA', { day: 'numeric', month: 'short' });
}

export default function NotesEditor() {
  const { notes, loading } = useAdminNotes();

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('saved');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [search, setSearch] = useState('');
  const [showList, setShowList] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const saveTimer = useRef<ReturnType<typeof setTimeout>>();

  const selectedNote = notes.find((n) => n.id === selectedId) ?? null;

  // Nettoie le timer au changement de note
  useEffect(() => {
    clearTimeout(saveTimer.current);
    setSaveStatus('saved');
    setLastSaved(null);
    setConfirmDelete(false);
  }, [selectedId]);

  // Autosave avec debounce 1000ms
  const scheduleAutoSave = useCallback(
    (newTitle: string, newContent: string) => {
      if (!selectedId) return;
      setSaveStatus('unsaved');
      clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(async () => {
        setSaveStatus('saving');
        try {
          await updateNote(selectedId, { title: newTitle, content: newContent });
          setLastSaved(new Date());
          setSaveStatus('saved');
        } catch {
          setSaveStatus('error');
        }
      }, 1000);
    },
    [selectedId]
  );

  const handleTitleChange = (val: string) => {
    setTitle(val);
    scheduleAutoSave(val, content);
  };

  const handleContentChange = (val: string) => {
    setContent(val);
    scheduleAutoSave(title, val);
  };

  const handleNewNote = async () => {
    try {
      const id = await createNote();
      setTitle('Nouvelle note');
      setContent('');
      setSaveStatus('saved');
      setSelectedId(id);
      setShowList(false);
    } catch (e) {
      console.error('Erreur création note:', e);
    }
  };

  const handleSelectNote = (note: Note) => {
    setSelectedId(note.id);
    setTitle(note.title);
    setContent(note.content);
    setSaveStatus('saved');
    setShowList(false);
  };

  const handlePin = async () => {
    if (!selectedNote) return;
    await updateNote(selectedNote.id, { pinned: !selectedNote.pinned });
  };

  const handleDelete = async () => {
    if (!selectedId) return;
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    try {
      await deleteNote(selectedId);
      setSelectedId(null);
      setTitle('');
      setContent('');
      setShowList(true);
      setConfirmDelete(false);
    } catch (e) {
      console.error('Erreur suppression note:', e);
    }
  };

  const filteredNotes = useMemo(() => {
    if (!search.trim()) return notes;
    const s = search.toLowerCase();
    return notes.filter(
      (n) =>
        n.title.toLowerCase().includes(s) ||
        n.content.toLowerCase().includes(s)
    );
  }, [notes, search]);

  const saveLabel = () => {
    if (saveStatus === 'saving') return 'Sauvegarde...';
    if (saveStatus === 'unsaved') return 'Non sauvegardé';
    if (saveStatus === 'error') return 'Erreur de sauvegarde';
    if (saveStatus === 'saved' && lastSaved)
      return `Sauvegardé à ${lastSaved.toLocaleTimeString('fr-CA', { hour: '2-digit', minute: '2-digit' })}`;
    return 'Sauvegardé';
  };

  const saveColor =
    saveStatus === 'error'
      ? 'text-red-400'
      : saveStatus === 'unsaved'
      ? 'text-yellow-400'
      : 'text-gray-500';

  return (
    <div className="flex h-[72vh] overflow-hidden rounded-lg border border-dark-700">

      {/* ── PANNEAU GAUCHE : liste ── */}
      <div
        className={`${
          showList ? 'flex' : 'hidden md:flex'
        } w-full md:w-72 shrink-0 flex-col border-r border-dark-700 bg-dark-950`}
      >
        {/* Bouton + recherche */}
        <div className="p-3 border-b border-dark-700 space-y-2">
          <button
            onClick={handleNewNote}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <Plus size={15} />
            Nouvelle note
          </button>
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder="Rechercher..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-dark-800 border border-dark-700 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
          </div>
        </div>

        {/* Liste */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <p className="text-center text-gray-500 text-sm mt-10">Chargement...</p>
          ) : filteredNotes.length === 0 ? (
            <p className="text-center text-gray-500 text-sm mt-10">
              {search ? 'Aucun résultat' : 'Aucune note'}
            </p>
          ) : (
            filteredNotes.map((note) => (
              <button
                key={note.id}
                onClick={() => handleSelectNote(note)}
                className={`w-full text-left px-3 py-3 border-b border-dark-800 hover:bg-dark-800 transition-colors ${
                  selectedId === note.id
                    ? 'bg-dark-800 border-l-2 border-l-primary-500'
                    : ''
                }`}
              >
                <div className="flex items-center gap-1.5">
                  {note.pinned && (
                    <Pin size={10} className="text-primary-400 shrink-0" />
                  )}
                  <span className="text-sm font-medium text-white truncate">
                    {note.title || 'Sans titre'}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5 truncate">
                  {note.content || 'Aucun contenu'}
                </p>
                <p className="text-xs text-gray-600 mt-0.5">
                  {formatDate(note.updatedAt)}
                </p>
              </button>
            ))
          )}
        </div>
      </div>

      {/* ── PANNEAU DROIT : éditeur ── */}
      <div
        className={`${
          !showList ? 'flex' : 'hidden md:flex'
        } flex-1 flex-col bg-dark-900 min-w-0`}
      >
        {!selectedNote ? (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-600">
            <StickyNote size={44} className="mb-3 opacity-25" />
            <p className="text-sm">Sélectionne une note ou crée-en une</p>
          </div>
        ) : (
          <>
            {/* Barre d'outils */}
            <div className="flex items-center px-4 py-2 border-b border-dark-700 gap-2">
              {/* Retour mobile */}
              <button
                onClick={() => setShowList(true)}
                className="md:hidden flex items-center gap-1 text-sm text-gray-400 hover:text-white mr-2"
              >
                <ArrowLeft size={15} />
                Notes
              </button>

              {/* Statut de sauvegarde */}
              <span className={`text-xs ${saveColor} ml-auto`}>{saveLabel()}</span>

              {/* Épingler */}
              <button
                onClick={handlePin}
                title={selectedNote.pinned ? 'Désépingler' : 'Épingler'}
                className={`p-1.5 rounded hover:bg-dark-700 transition-colors ${
                  selectedNote.pinned
                    ? 'text-primary-400'
                    : 'text-gray-500 hover:text-white'
                }`}
              >
                <Pin size={15} />
              </button>

              {/* Supprimer */}
              <button
                onClick={handleDelete}
                title="Supprimer"
                className={`p-1.5 rounded transition-colors ${
                  confirmDelete
                    ? 'bg-red-500/20 text-red-400'
                    : 'text-gray-500 hover:text-red-400 hover:bg-dark-700'
                }`}
              >
                <Trash2 size={15} />
              </button>
              {confirmDelete && (
                <span className="text-xs text-red-400">Clique encore pour confirmer</span>
              )}
            </div>

            {/* Titre */}
            <input
              type="text"
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="Titre de la note"
              className="w-full px-6 pt-5 pb-2 bg-transparent text-xl font-bold text-white placeholder-gray-600 focus:outline-none"
            />

            {/* Contenu */}
            <textarea
              value={content}
              onChange={(e) => handleContentChange(e.target.value)}
              placeholder="Commence à écrire..."
              className="flex-1 w-full px-6 py-2 bg-transparent text-gray-300 placeholder-gray-600 focus:outline-none resize-none leading-relaxed text-sm"
            />
          </>
        )}
      </div>
    </div>
  );
}
