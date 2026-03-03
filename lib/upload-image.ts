import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from '@/lib/firebase/config';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10 Mo

/**
 * Upload une image vers Firebase Storage dans le dossier notes/{noteId}/
 * Retourne l'URL publique de téléchargement.
 */
export async function uploadNoteImage(
  file: File,
  noteId: string,
  onProgress?: (percent: number) => void
): Promise<string> {
  if (!storage) throw new Error('Firebase Storage non configuré');
  if (!ALLOWED_TYPES.includes(file.type)) throw new Error('Format non supporté (jpg, png, gif, webp)');
  if (file.size > MAX_SIZE_BYTES) throw new Error('Image trop grande (max 10 Mo)');

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const path     = `notes/${noteId}/${Date.now()}_${safeName}`;
  const storageRef = ref(storage, path);
  const task       = uploadBytesResumable(storageRef, file);

  return new Promise((resolve, reject) => {
    task.on(
      'state_changed',
      (snapshot) => {
        const pct = Math.round(snapshot.bytesTransferred / snapshot.totalBytes * 100);
        onProgress?.(pct);
      },
      reject,
      async () => {
        const url = await getDownloadURL(task.snapshot.ref);
        resolve(url);
      }
    );
  });
}
