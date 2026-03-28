'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { Logo } from '@/components/logo/Logo';
import Link from 'next/link';

const LOADING_PHRASES = [
  'Calculando seus macros...',
  'Verificando seu perfil...',
  'Carregando o foco...',
  'Preparando seu plano...',
  'Quase lá...',
];

export default function RootPage() {
  const router = useRouter();
  const [phraseIndex, setPhraseIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setPhraseIndex((i) => (i + 1) % LOADING_PHRASES.length);
    }, 1200);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Unregister stale service workers that may cache old versions
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then((regs) => {
        regs.forEach((r) => r.update());
      });
    }

    // Safety timeout — 3s max, never leave user stuck
    const timeout = setTimeout(() => {
      router.replace('/login');
    }, 3000);

    const unsub = onAuthStateChanged(auth, async (user) => {
      clearTimeout(timeout);
      if (!user) {
        router.replace('/login');
        return;
      }
      try {
        const snap = await getDoc(doc(db, 'users', user.uid));
        const hasProfile = snap.exists() && snap.data()?.profile != null;
        router.replace(hasProfile ? '/dashboard' : '/onboarding');
      } catch {
        router.replace('/dashboard');
      }
    });

    return () => {
      clearTimeout(timeout);
      unsub();
    };
  }, [router]);

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-8 animate-fade-in">
      {/* Glow background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-primary/5 blur-3xl" />
      </div>

      {/* Logo with glow */}
      <div className="relative">
        <div className="absolute inset-0 blur-2xl opacity-30 logo-text font-display text-7xl leading-none text-center">
          METAFOCO
        </div>
        <Logo size="xl" showTagline />
      </div>

      {/* Animated dots */}
      <div className="flex gap-2">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="w-2 h-2 rounded-full bg-primary animate-bounce"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>

      {/* Rotating loading phrase */}
      <p
        key={phraseIndex}
        className="text-white/30 text-xs tracking-widest animate-fade-in"
      >
        {LOADING_PHRASES[phraseIndex]}
      </p>

      {/* Escape hatch if stuck */}
      <Link href="/login" className="text-white/10 text-xs hover:text-white/30 transition-colors mt-4">
        Entrar manualmente →
      </Link>
    </div>
  );
}
