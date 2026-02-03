"use client";

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { AuthProvider, useAuthContext } from '@/lib/firebase';

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuthContext();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user && pathname !== '/admin/login') {
      router.push('/admin/login');
    }
  }, [user, loading, router, pathname]);

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center">
        <div className="text-white">Chargement...</div>
      </div>
    );
  }

  // Allow access to login page without auth
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  // Protect other admin pages
  if (!user) {
    return null;
  }

  return <>{children}</>;
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-dark-950">
        <AdminLayoutContent>{children}</AdminLayoutContent>
      </div>
    </AuthProvider>
  );
}
