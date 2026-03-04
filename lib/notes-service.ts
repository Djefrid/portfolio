import { db, storage } from '@/lib/firebase/config';
import {
  collection, addDoc, updateDoc, deleteDoc, setDoc, getDoc,
  doc, serverTimestamp, writeBatch, getDocs, query, where,
} from 'firebase/firestore';
import { ref as storageRef, deleteObject } from 'firebase/storage';

// ── Types ────────────────────────────────────────────────────────────────────

export interface Note {
  id: string;
  title: string;
  content: string;
  pinned: boolean;
  folderId: string | null; // null = Inbox
  tags: string[];          // auto-extraits du contenu (#tag)
  deletedAt: Date | null;  // null = active, Date = dans la corbeille
  createdAt: Date;
  updatedAt: Date;
}

export interface SmartFolderFilter {
  tags?: string[];             // filtrer par tags
  tagLogic?: 'and' | 'or';    // 'or' par défaut
  pinned?: boolean;            // épinglées uniquement
  createdWithinDays?: number;  // créées dans les N derniers jours
  modifiedWithinDays?: number; // modifiées dans les N derniers jours
}

export interface Folder {
  id: string;
  name: string;
  order: number;
  parentId: string | null;  // null = dossier racine
  isSmart?: boolean;
  filters?: SmartFolderFilter;
  createdAt: Date;
  updatedAt: Date;
}

export interface Tag {
  name: string;    // = doc ID dans adminTags
  createdAt: Date;
}

// ── Extraction automatique des hashtags ──────────────────────────────────────

/** Supprime les balises HTML — compatible plain text ET HTML TipTap. */
function stripHtml(html: string): string {
  return html
    .replace(/<\/?(p|div|br|h[1-6]|li|ul|ol)[^>]*>/gi, ' ')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

export function extractHashtags(content: string): string[] {
  // Travaille sur le texte pur (compatible plain text ET HTML TipTap)
  const text  = stripHtml(content);
  // Match #tag — exclut les titres markdown (# Titre) et les URLs
  const regex = /(?<![/#\w])#([a-zA-Z\u00C0-\u024F][a-zA-Z0-9\u00C0-\u024F_-]*)/g;
  const tags = new Set<string>();
  let match: RegExpExecArray | null;
  while ((match = regex.exec(text)) !== null) {
    tags.add(match[1].toLowerCase());
  }
  return Array.from(tags);
}

// ── Nettoyage Firebase Storage ────────────────────────────────────────────────

/** Extrait toutes les URLs Firebase Storage présentes dans le HTML d'une note (img + fichiers joints). */
function extractStorageUrls(html: string): string[] {
  if (!html) return [];
  const regex = /https:\/\/firebasestorage\.googleapis\.com\/[^"'\s>)]+/g;
  const urls: string[] = [];
  let m: RegExpExecArray | null;
  while ((m = regex.exec(html)) !== null) urls.push(m[0]);
  return urls;
}

/** Supprime tous les fichiers Storage liés au contenu d'une note avant sa suppression définitive. */
async function deleteNoteStorageFiles(content: string): Promise<void> {
  if (!storage) return;
  const urls = extractStorageUrls(content);
  if (urls.length === 0) return;
  // allSettled : ne bloque pas si un fichier a déjà été supprimé manuellement
  await Promise.allSettled(
    urls.map(url => deleteObject(storageRef(storage!, url)))
  );
}

// ── Notes CRUD ───────────────────────────────────────────────────────────────

export async function createNote(folderId: string | null = null): Promise<string> {
  if (!db) throw new Error('Firebase non configuré');
  const ref = await addDoc(collection(db, 'adminNotes'), {
    title: '',
    content: '',
    pinned: false,
    folderId,
    tags: [],
    deletedAt: null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateNote(
  id: string,
  data: Partial<Pick<Note, 'title' | 'content' | 'pinned' | 'folderId'>>
): Promise<void> {
  if (!db) throw new Error('Firebase non configuré');
  const _db = db; // capture référence non-null pour les callbacks
  const payload: Record<string, unknown> = { ...data, updatedAt: serverTimestamp() };
  if (typeof data.content === 'string') {
    const newTags = extractHashtags(data.content);
    payload.tags = newTags;
    // Sync automatique des nouveaux tags vers la bibliothèque adminTags
    if (newTags.length > 0) {
      const batch = writeBatch(_db);
      newTags.forEach(tag => {
        batch.set(doc(_db, 'adminTags', tag), { name: tag, createdAt: serverTimestamp() }, { merge: true });
      });
      await batch.commit();
    }
    // Nettoyage Storage : supprimer les images/fichiers retirés du contenu
    if (storage) {
      const snap = await getDoc(doc(_db, 'adminNotes', id));
      if (snap.exists()) {
        const oldUrls = extractStorageUrls(snap.data().content ?? '');
        const newUrls = extractStorageUrls(data.content);
        const newUrlSet = new Set(newUrls);
        const removed = oldUrls.filter(u => !newUrlSet.has(u));
        if (removed.length > 0) {
          await Promise.allSettled(
            removed.map(url => deleteObject(storageRef(storage!, url)))
          );
        }
      }
    }
  }
  await updateDoc(doc(_db, 'adminNotes', id), payload);
}

// Soft delete — va dans la Corbeille (récupérable 30 jours)
export async function deleteNote(id: string): Promise<void> {
  if (!db) throw new Error('Firebase non configuré');
  await updateDoc(doc(db, 'adminNotes', id), {
    deletedAt: serverTimestamp(),
    pinned: false,
  });
}

// Suppression définitive — irréversible + nettoyage Storage automatique
export async function permanentlyDeleteNote(id: string): Promise<void> {
  if (!db) throw new Error('Firebase non configuré');
  const snap = await getDoc(doc(db, 'adminNotes', id));
  if (snap.exists()) {
    await deleteNoteStorageFiles(snap.data().content ?? '');
  }
  await deleteDoc(doc(db, 'adminNotes', id));
}

// Récupération depuis la Corbeille → retour dans le dossier d'origine (folderId conservé)
export async function recoverNote(id: string): Promise<void> {
  if (!db) throw new Error('Firebase non configuré');
  await updateDoc(doc(db, 'adminNotes', id), {
    deletedAt: null,
    updatedAt: serverTimestamp(),
  });
}

// Suppression silencieuse d'une note vide (pas de corbeille, Apple Notes behavior)
export async function silentlyDeleteNote(id: string): Promise<void> {
  if (!db) throw new Error('Firebase non configuré');
  const snap = await getDoc(doc(db, 'adminNotes', id));
  if (snap.exists()) {
    await deleteNoteStorageFiles(snap.data().content ?? '');
  }
  await deleteDoc(doc(db, 'adminNotes', id));
}

export async function moveNote(noteId: string, folderId: string | null): Promise<void> {
  if (!db) throw new Error('Firebase non configuré');
  await updateDoc(doc(db, 'adminNotes', noteId), {
    folderId,
    updatedAt: serverTimestamp(),
  });
}

// ── Tags CRUD ─────────────────────────────────────────────────────────────────
// Le nom du tag sert de doc ID → upsert idempotent, pas de doublons possibles

export async function createTag(name: string): Promise<void> {
  if (!db) throw new Error('Firebase non configuré');
  const normalized = name.toLowerCase().trim().replace(/[^a-zA-Z0-9\u00C0-\u024F_-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
  if (!normalized) return;
  await setDoc(doc(db, 'adminTags', normalized), {
    name: normalized,
    createdAt: serverTimestamp(),
  }, { merge: true });
}

export async function deleteTag(name: string): Promise<void> {
  if (!db) throw new Error('Firebase non configuré');
  await deleteDoc(doc(db, 'adminTags', name));
}

// ── Folders CRUD ─────────────────────────────────────────────────────────────

export async function createFolder(
  name: string,
  order: number,
  parentId: string | null = null
): Promise<string> {
  if (!db) throw new Error('Firebase non configuré');
  const ref = await addDoc(collection(db, 'adminFolders'), {
    name,
    order,
    parentId,
    isSmart: false,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function createSmartFolder(
  name: string,
  order: number,
  filters: SmartFolderFilter
): Promise<string> {
  if (!db) throw new Error('Firebase non configuré');
  const ref = await addDoc(collection(db, 'adminFolders'), {
    name,
    order,
    isSmart: true,
    filters,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateFolder(
  id: string,
  data: Partial<Pick<Folder, 'name' | 'order'>>
): Promise<void> {
  if (!db) throw new Error('Firebase non configuré');
  await updateDoc(doc(db, 'adminFolders', id), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

// Met à jour le nom et les filtres d'un dossier intelligent
export async function updateSmartFolderFilters(
  id: string,
  name: string,
  filters: SmartFolderFilter
): Promise<void> {
  if (!db) throw new Error('Firebase non configuré');
  await updateDoc(doc(db, 'adminFolders', id), {
    name,
    filters,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteFolder(id: string): Promise<void> {
  if (!db) throw new Error('Firebase non configuré');
  // Lire le parentId du dossier supprimé pour re-parenter ses sous-dossiers
  const folderDoc = await getDoc(doc(db, 'adminFolders', id));
  const grandParentId: string | null = folderDoc.exists()
    ? (folderDoc.data().parentId ?? null)
    : null;
  const batch = writeBatch(db);
  // Notes directes → inbox
  const noteSnap = await getDocs(
    query(collection(db, 'adminNotes'), where('folderId', '==', id))
  );
  noteSnap.docs.forEach((d) =>
    batch.update(d.ref, { folderId: null, updatedAt: serverTimestamp() })
  );
  // Sous-dossiers directs → grand-parent (ou racine si null)
  const subSnap = await getDocs(
    query(collection(db, 'adminFolders'), where('parentId', '==', id))
  );
  subSnap.docs.forEach((d) =>
    batch.update(d.ref, { parentId: grandParentId, updatedAt: serverTimestamp() })
  );
  batch.delete(doc(db, 'adminFolders', id));
  await batch.commit();
}
