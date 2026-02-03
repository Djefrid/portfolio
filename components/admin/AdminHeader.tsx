"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '@/lib/firebase';

export default function AdminHeader() {
  const { signOut } = useAuthContext();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push('/admin/login');
  };

  return (
    <header className="bg-dark-900 border-b border-dark-800">
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="text-xl font-bold text-white">
              Admin
            </Link>
            <Link
              href="/"
              target="_blank"
              className="text-sm text-gray-400 hover:text-primary-400 transition-colors"
            >
              Voir le site
            </Link>
          </div>

          <button
            onClick={handleSignOut}
            className="px-4 py-2 text-sm text-gray-400 hover:text-white hover:bg-dark-800 rounded-lg transition-colors"
          >
            Déconnexion
          </button>
        </div>
      </div>
    </header>
  );
}
