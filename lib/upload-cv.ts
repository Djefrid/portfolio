import { deleteObject, getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';
import { storage } from '@/lib/firebase/config';

const ALLOWED_TYPES = [
  'application/pdf',
];

const ALLOWED_EXTENSIONS = ['.pdf'];
const MAX_CV_BYTES = 10 * 1024 * 1024;

function hasAllowedExtension(fileName: string) {
  const lowerName = fileName.toLowerCase();
  return ALLOWED_EXTENSIONS.some((extension) => lowerName.endsWith(extension));
}

export async function uploadCvFile(
  file: File,
  onProgress?: (percent: number) => void
): Promise<{ url: string; path: string; name: string; size: number }> {
  if (!storage) throw new Error('Firebase Storage non configuré');

  const isAllowedType = ALLOWED_TYPES.includes(file.type) || hasAllowedExtension(file.name);
  if (!isAllowedType) throw new Error('Format non supporté (PDF uniquement)');
  if (file.size > MAX_CV_BYTES) throw new Error('Fichier trop grand (max 10 Mo)');

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const filePath = `cv/${Date.now()}_${safeName}`;
  const storageRef = ref(storage, filePath);
  const task = uploadBytesResumable(storageRef, file);

  return new Promise((resolve, reject) => {
    task.on(
      'state_changed',
      (snapshot) => {
        const percent = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
        onProgress?.(percent);
      },
      reject,
      async () => {
        const url = await getDownloadURL(task.snapshot.ref);
        resolve({ url, path: filePath, name: file.name, size: file.size });
      }
    );
  });
}

export function isFirebaseStorageUrl(url: string): boolean {
  return /firebasestorage\.googleapis\.com|storage\.googleapis\.com/.test(url);
}

export async function deleteCvFileByUrl(url: string): Promise<void> {
  if (!storage || !url || !isFirebaseStorageUrl(url)) return;
  await deleteObject(ref(storage, url));
}
