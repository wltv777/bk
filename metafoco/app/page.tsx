'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    // Timeout: never get stuck — always go to login after 4s
    const timeout = setTimeout(() => router.replace('/login'), 4000);

    const unsub = onAuthStateChanged(auth, async (user) => {
      clearTimeout(timeout);
      if (!user) { router.replace('/login'); return; }
      try {
        const snap = await getDoc(doc(db, 'users', user.uid));
        const hasProfile = snap.exists() && snap.data()?.profile != null;
        router.replace(hasProfile ? '/dashboard' : '/onboarding');
      } catch {
        router.replace('/dashboard');
      }
    });

    return () => { clearTimeout(timeout); unsub(); };
  }, [router]);

  // Plain black screen — no Firebase-dependent content
  return <div className="min-h-screen bg-black" />;
}
