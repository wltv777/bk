'use client';

import { useState, useEffect } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
  type User,
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { useUserStore } from '@/store/userStore';
import { calculateUserMetrics } from '@/lib/calculations';
import { updateStreak } from '@/lib/gamification';
import type { UserProfile } from '@/types';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { setProfile, setMetrics, setPremium, setGamification, clearUser } = useUserStore();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        await loadUserData(firebaseUser.uid);
        await updateStreak(firebaseUser.uid);
      } else {
        clearUser();
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  async function loadUserData(uid: string) {
    const ref = doc(db, 'users', uid);
    const snap = await getDoc(ref);
    if (!snap.exists()) return;

    const data = snap.data();
    if (data.profile) {
      const profile = { ...data.profile, uid } as UserProfile;
      setProfile(profile);
      setMetrics(calculateUserMetrics(profile));
    }
    if (data.premium) setPremium(data.premium);
    if (data.gamification) setGamification(data.gamification);
  }

  async function login(email: string, password: string) {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    return cred.user;
  }

  async function signup(email: string, password: string, name: string) {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(cred.user, { displayName: name });

    // Init Firestore document
    await setDoc(doc(db, 'users', cred.user.uid), {
      profile: null,
      premium: { active: false, plan: null },
      gamification: {
        xp: 0, level: 1, levelName: 'Iniciante Corajoso',
        streak: 0, lastLoginDate: '', badges: [],
      },
      createdAt: serverTimestamp(),
    });

    return cred.user;
  }

  async function logout() {
    await signOut(auth);
    clearUser();
  }

  return { user, loading, login, signup, logout };
}
