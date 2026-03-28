'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Toaster } from 'react-hot-toast';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { useUserStore } from '@/store/userStore';
import { calculateUserMetrics } from '@/lib/calculations';
import { updateStreak } from '@/lib/gamification';
import { BottomNav } from '@/components/shared/BottomNav';
import { FAB } from '@/components/shared/FAB';
import type { UserProfile } from '@/types';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { profile, setProfile, setMetrics, setPremium, setGamification, clearUser } = useUserStore();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        clearUser();
        router.replace('/login');
        return;
      }
      // Only fetch from Firestore if store is empty (e.g. new device / cleared cache)
      if (!profile) {
        try {
          const snap = await getDoc(doc(db, 'users', user.uid));
          if (snap.exists()) {
            const data = snap.data();
            if (data.profile) {
              const p = { ...data.profile, uid: user.uid } as UserProfile;
              setProfile(p);
              setMetrics(calculateUserMetrics(p));
            }
            if (data.premium) setPremium(data.premium);
            if (data.gamification) setGamification(data.gamification);
          } else {
            // No profile doc yet — send to onboarding
            router.replace('/onboarding');
            return;
          }
          await updateStreak(user.uid);
        } catch {
          // Firestore error — stay in app with whatever is in the store
        }
      }
    });
    return unsub;
  }, [router]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="min-h-screen bg-black flex flex-col">
      <main className="flex-1 pb-20 overflow-y-auto">
        {children}
      </main>
      <FAB />
      <BottomNav />
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#1A1A1A',
            color: '#fff',
            border: '1px solid rgba(255,215,0,0.2)',
            borderRadius: '16px',
            fontSize: '14px',
          },
          success: { iconTheme: { primary: '#FFD700', secondary: '#000' } },
          error:   { iconTheme: { primary: '#FF3B30', secondary: '#fff' } },
        }}
      />
    </div>
  );
}
