"use client";

import { useState, useEffect } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  User
} from 'firebase/auth';
import { auth, isFirebaseConfigured } from './config';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isFirebaseConfigured || !auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    if (!auth) {
      return { user: null, error: 'Firebase non configuré' };
    }
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      return { user: result.user, error: null };
    } catch (error) {
      return { user: null, error: (error as Error).message };
    }
  };

  const signOut = async () => {
    if (!auth) {
      return { error: 'Firebase non configuré' };
    }
    try {
      await firebaseSignOut(auth);
      return { error: null };
    } catch (error) {
      return { error: (error as Error).message };
    }
  };

  const isAdmin = user?.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL;

  return { user, loading, signIn, signOut, isAdmin };
}
