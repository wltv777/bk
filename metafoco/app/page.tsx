'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { Logo } from '@/components/logo/Logo';

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.replace('/login');
        return;
      }
      // Check if onboarding is complete
      const snap = await getDoc(doc(db, 'users', user.uid));
      const hasProfile = snap.exists() && snap.data()?.profile != null;
      router.replace(hasProfile ? '/dashboard' : '/onboarding');
    });
    return unsub;
  }, [router]);

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-6 animate-fade-in">
      <Logo size="xl" showTagline />
      <div className="flex gap-1.5 mt-4">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="w-2 h-2 rounded-full bg-primary animate-bounce"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
    </div>
  );
}
