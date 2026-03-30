'use client';

import { useEffect, useState, useCallback } from 'react';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { useUserStore } from '@/store/userStore';
import { useDiaryStore } from '@/store/diaryStore';
import { useFastingStore } from '@/store/fastingStore';
import { calculateUserMetrics } from '@/lib/calculations';
import { ProgressRing } from '@/components/shared/ProgressRing';
import { MacroBar } from '@/components/shared/MacroBar';
import { XPBar } from '@/components/gamification/XPBar';
import { formatPercent, formatCalories, getGreeting, todayString } from '@/lib/utils';
import { Bell, Flame, Droplets, Plus, Minus, Settings, Camera, ChefHat, Activity, CalendarDays, Zap } from 'lucide-react';
import Link from 'next/link';
import type { MealEntry, UserProfile } from '@/types';

const WATER_STEP = 250; // ml

export default function DashboardPage() {
  const { profile, metrics, gamification, premium, setProfile, setMetrics, setPremium, setGamification } = useUserStore();
  const { getTodayTotals, setEntries } = useDiaryStore();
  const { activeSession, getRemainingSeconds, getElapsedPercent } = useFastingStore();
  const [water, setWater] = useState(0);
  const [loadingEntries, setLoadingEntries] = useState(true);
  const [loadingProfile, setLoadingProfile] = useState(!profile);
  const [fastingRemaining, setFastingRemaining] = useState(0);

  const totals = getTodayTotals();
  const today = todayString();

  // Self-healing: load profile from Firestore if store is empty
  useEffect(() => {
    if (profile) { setLoadingProfile(false); return; }
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) return;
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
        }
      } catch { /* stay with empty state */ }
      setLoadingProfile(false);
    });
    return unsub;
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!auth.currentUser) return;
    const uid = auth.currentUser.uid;
    getDocs(
      query(collection(db, 'meals', uid, 'entries'), where('date', '==', today))
    ).then((snap) => {
      const entries = snap.docs.map((d) => ({ id: d.id, ...d.data() })) as MealEntry[];
      setEntries(entries);
    }).finally(() => setLoadingEntries(false));
  }, [setEntries, today]);

  // Load water from localStorage
  useEffect(() => {
    const key = `water_${today}`;
    const stored = localStorage.getItem(key);
    if (stored) setWater(Number(stored));
  }, [today]);

  // Fasting countdown
  useEffect(() => {
    if (!activeSession) return;
    const interval = setInterval(() => {
      setFastingRemaining(getRemainingSeconds());
    }, 1000);
    setFastingRemaining(getRemainingSeconds());
    return () => clearInterval(interval);
  }, [activeSession, getRemainingSeconds]);

  const addWater = useCallback(() => {
    setWater((prev) => {
      const next = prev + WATER_STEP;
      localStorage.setItem(`water_${today}`, String(next));
      return next;
    });
  }, [today]);

  const removeWater = useCallback(() => {
    setWater((prev) => {
      const next = Math.max(0, prev - WATER_STEP);
      localStorage.setItem(`water_${today}`, String(next));
      return next;
    });
  }, [today]);

  const formatFastingTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (loadingProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Profile not found even after fetch — user needs to complete onboarding
  if (!profile || !metrics) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-black gap-4 px-8 text-center">
        <div className="text-4xl">👋</div>
        <h2 className="text-white font-bold text-xl">Complete seu perfil</h2>
        <p className="text-white/40 text-sm">Precisamos de algumas informações para calcular seus macros.</p>
        <Link href="/onboarding" className="btn-primary mt-2">Começar agora</Link>
      </div>
    );
  }

  const calPercent = formatPercent(totals.calories, metrics.targetCalories);
  const remaining = Math.max(metrics.targetCalories - totals.calories, 0);
  const waterTarget = (metrics.targetWater || 2500);
  const waterPercent = Math.min(Math.round((water / waterTarget) * 100), 100);
  const firstName = profile.name.split(' ')[0];
  const fastingElapsed = getElapsedPercent();

  const quickActions = [
    {
      label: 'Scanner IA',
      sublabel: 'Analise sua refeição',
      href: '/scanner',
      icon: Camera,
      gradient: 'linear-gradient(135deg, #E8541A, #C0392B)',
      shadow: 'rgba(232,84,26,0.4)',
    },
    {
      label: 'Montar Dieta',
      sublabel: 'Plano personalizado',
      href: '/diet-builder',
      icon: ChefHat,
      gradient: 'linear-gradient(135deg, #2ECC71, #27AE60)',
      shadow: 'rgba(46,204,113,0.4)',
    },
    {
      label: 'Bioimpedância',
      sublabel: 'Análise corporal',
      href: '/bioimpedance',
      icon: Activity,
      gradient: 'linear-gradient(135deg, #3498DB, #2980B9)',
      shadow: 'rgba(52,152,219,0.4)',
    },
    {
      label: 'Plano Semanal',
      sublabel: 'Treinos e refeições',
      href: '/meal-plan',
      icon: CalendarDays,
      gradient: 'linear-gradient(135deg, #9B59B6, #8E44AD)',
      shadow: 'rgba(155,89,182,0.4)',
    },
  ];

  // suppress unused variable warning for loadingEntries
  void loadingEntries;

  return (
    <div className="min-h-screen bg-black pb-28">
      {/* Header */}
      <div className="px-5 pt-12 pb-4 flex items-center justify-between">
        <div>
          <p className="text-white/40 text-xs uppercase tracking-widest">{getGreeting()}</p>
          <h1 className="text-white font-bold text-2xl font-display mt-0.5">{firstName} 👊</h1>
          <p className="text-white/30 text-xs mt-0.5 capitalize">
            {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-black text-lg"
            style={{ background: 'linear-gradient(135deg, #F5A623, #E8541A)' }}
          >
            {firstName.charAt(0).toUpperCase()}
          </div>
          <Link href="/settings" className="p-2 rounded-full bg-white/5">
            <Bell className="w-4 h-4 text-white/40" />
          </Link>
        </div>
      </div>

      <div className="px-5 space-y-4">
        {/* XP / Streak strip */}
        {gamification.xp > 0 && (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 bg-orange-500/15 border border-orange-500/20 px-3 py-1.5 rounded-full">
              <Flame className="w-3.5 h-3.5 text-orange-400 fill-orange-400" />
              <span className="text-xs text-orange-400 font-bold">{gamification.streak}d</span>
            </div>
            <div className="flex-1">
              <XPBar xp={gamification.xp} compact />
            </div>
          </div>
        )}

        {/* Macro ring card */}
        <div className="card">
          <div className="flex items-center gap-5">
            <ProgressRing
              value={calPercent}
              size={110}
              strokeWidth={10}
              color={calPercent > 100 ? '#FF3B30' : '#F5A623'}
              label={`${calPercent}%`}
              sublabel="kcal"
            />
            <div className="flex-1 space-y-2">
              <div>
                <div className="text-3xl font-bold text-white font-display leading-none">
                  {formatCalories(totals.calories)}
                </div>
                <div className="text-white/30 text-xs mt-0.5">de {formatCalories(metrics.targetCalories)} kcal</div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="bg-surface-2 rounded-xl px-2 py-2">
                  <div className="text-primary font-bold text-sm">{formatCalories(remaining)}</div>
                  <div className="text-white/30 text-xs">restando</div>
                </div>
                <div className="bg-surface-2 rounded-xl px-2 py-2">
                  <div className="text-blue-400 font-bold text-sm">{totals.protein.toFixed(0)}g</div>
                  <div className="text-white/30 text-xs">proteína</div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 space-y-2.5">
            <MacroBar label="Proteína" consumed={totals.protein} target={metrics.targetProtein} color="#3B82F6" bgColor="bg-blue-500" textColor="text-blue-400" />
            <MacroBar label="Carboidrato" consumed={totals.carbs} target={metrics.targetCarbs} color="#F97316" bgColor="bg-orange-500" textColor="text-orange-400" />
            <MacroBar label="Gordura" consumed={totals.fat} target={metrics.targetFat} color="#EAB308" bgColor="bg-yellow-500" textColor="text-yellow-400" />
          </div>
        </div>

        {/* Fasting card */}
        <div className="card-highlight">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary" />
              <span className="text-white font-semibold text-sm">Jejum Intermitente</span>
            </div>
            {activeSession && (
              <span className="text-xs text-primary/70 font-semibold bg-primary/10 px-2 py-0.5 rounded-full">
                {activeSession.protocol}
              </span>
            )}
          </div>

          {activeSession ? (
            <div className="flex items-center gap-4">
              {/* Pulsing ring */}
              <div className="relative w-16 h-16 flex-shrink-0">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 64 64">
                  <circle cx="32" cy="32" r="28" fill="none" stroke="rgba(245,166,35,0.15)" strokeWidth="4" />
                  <circle
                    cx="32" cy="32" r="28"
                    fill="none"
                    stroke="#F5A623"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 28}`}
                    strokeDashoffset={`${2 * Math.PI * 28 * (1 - fastingElapsed / 100)}`}
                    className="fasting-active transition-all duration-1000"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Flame className="w-5 h-5 text-primary fill-primary/60" />
                </div>
              </div>
              <div className="flex-1">
                <div className="text-white font-bold text-xl font-display">
                  {formatFastingTime(fastingRemaining)}
                </div>
                <div className="text-white/40 text-xs">tempo restante</div>
                <div className="mt-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-1000"
                    style={{ width: `${fastingElapsed}%`, background: 'linear-gradient(90deg, #F5A623, #E8541A)' }}
                  />
                </div>
              </div>
              <Link href="/fasting" className="text-primary text-xs font-semibold">
                Ver →
              </Link>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/50 text-sm">Nenhum jejum ativo</p>
                <p className="text-white/30 text-xs">Iniciar protocolo de jejum</p>
              </div>
              <Link
                href="/fasting"
                className="px-4 py-2 rounded-xl text-black text-sm font-bold active:scale-95 transition-transform"
                style={{ background: 'linear-gradient(135deg, #F5A623, #E8541A)' }}
              >
                Iniciar Jejum
              </Link>
            </div>
          )}
        </div>

        {/* Quick actions 2x2 grid */}
        <div>
          <h2 className="text-white/60 text-xs uppercase tracking-widest mb-3">Ações Rápidas</h2>
          <div className="grid grid-cols-2 gap-3">
            {quickActions.map(({ label, sublabel, href, icon: Icon, gradient, shadow }) => (
              <Link
                key={href}
                href={href}
                className="rounded-2xl p-4 flex flex-col gap-2 active:scale-95 transition-transform"
                style={{
                  background: gradient,
                  boxShadow: `0 8px 24px ${shadow}`,
                }}
              >
                <Icon className="w-6 h-6 text-white" />
                <div>
                  <div className="text-white font-bold text-sm leading-tight">{label}</div>
                  <div className="text-white/70 text-xs mt-0.5">{sublabel}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Water tracker */}
        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Droplets className="w-4 h-4 text-blue-400" />
              <span className="text-white font-semibold text-sm">Água</span>
            </div>
            <span className="text-white/40 text-xs">{(water / 1000).toFixed(2)}L / {(waterTarget / 1000).toFixed(1)}L</span>
          </div>

          <div className="h-2 bg-surface-2 rounded-full mb-3 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${waterPercent}%`, background: 'linear-gradient(90deg, #60A5FA, #3B82F6)' }}
            />
          </div>

          <div className="flex gap-1.5 mb-3 flex-wrap">
            {Array.from({ length: Math.ceil(waterTarget / WATER_STEP) }).map((_, i) => (
              <div
                key={i}
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs transition-all duration-300 ${
                  i < Math.floor(water / WATER_STEP)
                    ? 'bg-blue-500 text-white'
                    : 'bg-surface-2 text-white/20'
                }`}
              >
                💧
              </div>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={removeWater}
              className="p-2 rounded-xl bg-surface-2 hover:bg-white/10 transition-colors"
            >
              <Minus className="w-4 h-4 text-white/40" />
            </button>
            <button
              onClick={addWater}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-blue-500/15 border border-blue-500/20 hover:bg-blue-500/25 transition-colors"
            >
              <Plus className="w-4 h-4 text-blue-400" />
              <span className="text-blue-400 text-sm font-semibold">+{WATER_STEP}ml</span>
            </button>
          </div>
        </div>

        {/* Premium CTA */}
        {!premium.active && (
          <Link href="/premium" className="block">
            <div
              className="rounded-2xl p-4 flex items-center gap-3"
              style={{
                background: 'linear-gradient(135deg, #1a1400 0%, #1a0800 100%)',
                border: '1px solid rgba(245,166,35,0.2)',
              }}
            >
              <span className="text-2xl">💎</span>
              <div className="flex-1">
                <div className="text-primary font-bold text-sm">Desbloqueie o Premium</div>
                <div className="text-white/40 text-xs">Scanner ilimitado, IA Coach 24h e mais</div>
              </div>
              <span className="text-primary text-sm">→</span>
            </div>
          </Link>
        )}
      </div>

      {/* Floating animated gear button */}
      <Link
        href="/settings"
        className="fixed bottom-24 right-4 z-50 w-14 h-14 rounded-full flex items-center justify-center gear-idle hover:rotate-45 transition-transform duration-300"
        style={{
          background: 'linear-gradient(135deg, #1A1A1A, #2A2A2A)',
          border: '2px solid rgba(245,166,35,0.5)',
        }}
      >
        <Settings className="w-6 h-6 text-primary" />
      </Link>
    </div>
  );
}
