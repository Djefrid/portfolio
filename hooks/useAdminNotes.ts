"use client";

import { useEffect, useState } from 'react';
import { collection, onSnapshot, orderBy, query, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Note } from '@/lib/notes-service';

export function useAdminNotes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!db) {
      setLoading(false);
      return;
    }

    // Tri par date de modification (plus récente en haut) — index simple, pas composé
    const q = query(
      collection(db, 'adminNotes'),
      orderBy('updatedAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list: Note[] = snapshot.docs.map((doc) => {
        const d = doc.data();
        return {
          id: doc.id,
          title: d.title ?? '',
          content: d.content ?? '',
          pinned: d.pinned ?? false,
          createdAt: (d.createdAt as Timestamp)?.toDate() ?? new Date(),
          updatedAt: (d.updatedAt as Timestamp)?.toDate() ?? new Date(),
        };
      });

      // Pinned en haut, tri côté client (pas besoin d'index composé Firestore)
      list.sort((a, b) => {
        if (a.pinned && !b.pinned) return -1;
        if (!a.pinned && b.pinned) return 1;
        return b.updatedAt.getTime() - a.updatedAt.getTime();
      });

      setNotes(list);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { notes, loading };
}
