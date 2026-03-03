import { db } from '@/lib/firebase/config';
import {
  collection, addDoc, updateDoc, deleteDoc,
  doc, serverTimestamp,
} from 'firebase/firestore';

export interface Note {
  id: string;
  title: string;
  content: string;
  pinned: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export async function createNote(): Promise<string> {
  if (!db) throw new Error('Firebase non configuré');
  const ref = await addDoc(collection(db, 'adminNotes'), {
    title: 'Nouvelle note',
    content: '',
    pinned: false,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateNote(
  id: string,
  data: Partial<Pick<Note, 'title' | 'content' | 'pinned'>>
): Promise<void> {
  if (!db) throw new Error('Firebase non configuré');
  await updateDoc(doc(db, 'adminNotes', id), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteNote(id: string): Promise<void> {
  if (!db) throw new Error('Firebase non configuré');
  await deleteDoc(doc(db, 'adminNotes', id));
}
