"use client";

import { useEffect, useState } from 'react';
import { collection, onSnapshot, orderBy, query, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Note, Folder, permanentlyDeleteNote } from '@/lib/notes-service';

const TRASH_RETENTION_DAYS = 30;

export function useAdminNotes() {
  const [notes,        setNotes]        = useState<Note[]>([]);   // notes actives
  const [deletedNotes, setDeletedNotes] = useState<Note[]>([]);   // corbeille
  const [folders,      setFolders]      = useState<Folder[]>([]);
  const [manualTags,   setManualTags]   = useState<string[]>([]);  // bibliothèque de tags
  const [loading,      setLoading]      = useState(true);

  // ── Écoute Firestore ────────────────────────────────────────────────────
  useEffect(() => {
    if (!db) { setLoading(false); return; }

    let notesReady = false, foldersReady = false, tagsReady = false;
    const checkReady = () => {
      if (notesReady && foldersReady && tagsReady) setLoading(false);
    };

    // Notes actives + corbeille
    const unsub1 = onSnapshot(
      query(collection(db, 'adminNotes'), orderBy('updatedAt', 'desc')),
      (snap) => {
        const all: Note[] = snap.docs.map((d) => {
          const v = d.data();
          return {
            id:        d.id,
            title:     v.title    ?? '',
            content:   v.content  ?? '',
            pinned:    v.pinned   ?? false,
            folderId:  v.folderId ?? null,
            tags:      v.tags     ?? [],
            deletedAt: (v.deletedAt as Timestamp)?.toDate() ?? null,
            createdAt: (v.createdAt as Timestamp)?.toDate() ?? new Date(),
            updatedAt: (v.updatedAt as Timestamp)?.toDate() ?? new Date(),
          } as Note;
        });
        setNotes(all.filter(n => !n.deletedAt));
        setDeletedNotes(all.filter(n => !!n.deletedAt));
        notesReady = true;
        checkReady();
      }
    );

    // Dossiers normaux + intelligents
    const unsub2 = onSnapshot(
      query(collection(db, 'adminFolders'), orderBy('order', 'asc')),
      (snap) => {
        setFolders(snap.docs.map((d) => {
          const v = d.data();
          return {
            id:        d.id,
            name:      v.name     ?? '',
            order:     v.order    ?? 0,
            parentId:  v.parentId ?? null,
            isSmart:   v.isSmart  ?? false,
            filters:   v.filters  ?? undefined,
            createdAt: (v.createdAt as Timestamp)?.toDate() ?? new Date(),
            updatedAt: (v.updatedAt as Timestamp)?.toDate() ?? new Date(),
          } as Folder;
        }));
        foldersReady = true;
        checkReady();
      }
    );

    // Bibliothèque de tags (créés manuellement ou auto-sync depuis les notes)
    const unsub3 = onSnapshot(
      collection(db, 'adminTags'),
      (snap) => {
        const names = snap.docs
          .map(d => (d.data().name as string) ?? d.id)
          .filter(Boolean)
          .sort((a, b) => a.localeCompare(b, 'fr'));
        setManualTags(names);
        tagsReady = true;
        checkReady();
      }
    );

    return () => { unsub1(); unsub2(); unsub3(); };
  }, []);

  // ── Auto-purge : supprime définitivement les notes > 30 jours ───────────
  useEffect(() => {
    const cutoff = new Date(Date.now() - TRASH_RETENTION_DAYS * 86400000);
    deletedNotes
      .filter(n => n.deletedAt && n.deletedAt < cutoff)
      .forEach(n => permanentlyDeleteNote(n.id));
  }, [deletedNotes]);

  return { notes, deletedNotes, folders, manualTags, loading };
}
