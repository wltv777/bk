'use client';

import { useEffect, useState, useCallback } from 'react';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { useUserStore } from '@/store/userStore';
import { useDiaryStore } from '@/store/diaryStore';
import { calculateUserMetrics } from '@/lib/calculations';
import { ProgressRing } from '@/components/shared/ProgressRing';
import { MacroBar } from '@/components/shared/MacroBar';
import { XPBar } from '@/components/gamification/XPBar';
import { formatPercent, formatCalories, getGreeting, todayString } from '@/lib/utils';
import { Bell, Flame, Droplets, Scale, Utensils, ChevronRight, Dumbbell, TrendingUp, Plus, Minus } from 'lucide-react';
import Link from 'next/link';
import type { MealEntry, UserProfile } from '@/types';

const WATER_STEP = 250; // ml

export default function DashboardPage() {
  const { profile, metrics, gamification, premium, setProfile, setMetrics, setPremium, setGamification } = useUserStore();
  const { getTodayTotals, setEntries } = useDiaryStore();
  const [water, setWater] = useState(0);
  const [loadingEntries, setLoadingEntries] = useState(true);
  const [loadingProfile, setLoadingProfile] = useState(!profile);

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

  const goalLabels: Record<string, string> = {
    lose_weight: 'Emagrecimento',
    gain_muscle: 'Ganho de Massa',
    maintain: 'Manutenção',
    recomp: 'Recomposição',
    performance: 'Performance',
  };

  return (
    <div className="min-h-screen bg-black pb-24">
      {/* Header */}
      <div className="px-5 pt-12 pb-4 flex items-center justify-between">
        <div>
          <p className="text-white/40 text-xs uppercase tracking-widest">{getGreeting()}</p>
          <h1 className="text-white font-bold text-2xl font-display mt-0.5">{firstName} 👊</h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-sm font-display logo-text">MF</div>
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

        {/* Goal badge */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-primary/10 border border-primary/20 px-3 py-1 rounded-full">
            <TrendingUp className="w-3 h-3 text-primary" />
            <span className="text-xs text-primary font-semibold">{goalLabels[profile.goal] || 'Objetivo'}</span>
          </div>
          <span className="text-white/20 text-xs">•</span>
          <span className="text-white/30 text-xs">Meta: {metrics.targetCalories} kcal/dia</span>
        </div>

        {/* Calories card */}
        <div className="card">
          <div className="flex items-center gap-5">
            <ProgressRing
              value={calPercent}
              size={110}
              strokeWidth={10}
              color={calPercent > 100 ? '#FF3B30' : '#FFD700'}
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

          <Link href="/diary?action=add" className="mt-4 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-primary/10 border border-primary/20 hover:bg-primary/20 transition-colors">
            <Utensils className="w-4 h-4 text-primary" />
            <span className="text-primary text-sm font-semibold">Registrar refeição</span>
          </Link>
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

          {/* Progress bar */}
          <div className="h-2 bg-surface-2 rounded-full mb-3 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${waterPercent}%`, background: 'linear-gradient(90deg, #60A5FA, #3B82F6)' }}
            />
          </div>

          {/* Water bubbles */}
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

        {/* Quick stats row */}
        <div className="grid grid-cols-3 gap-3">
          <Link href="/bioimpedance" className="card flex flex-col items-center gap-1.5 py-4 hover:border-primary/30 transition-colors text-center">
            <Scale className="w-5 h-5 text-primary" />
            <span className="text-white font-bold text-sm">{profile.weight}kg</span>
            <span className="text-white/30 text-xs">Peso</span>
          </Link>
          <Link href="/workout" className="card flex flex-col items-center gap-1.5 py-4 hover:border-primary/30 transition-colors text-center">
            <Dumbbell className="w-5 h-5 text-orange-400" />
            <span className="text-white font-bold text-sm">Treino</span>
            <span className="text-white/30 text-xs">Ver plano</span>
          </Link>
          <Link href="/progress" className="card flex flex-col items-center gap-1.5 py-4 hover:border-primary/30 transition-colors text-center">
            <TrendingUp className="w-5 h-5 text-green-400" />
            <span className="text-white font-bold text-sm">Progresso</span>
            <span className="text-white/30 text-xs">Fotos & peso</span>
          </Link>
        </div>

        {/* Today's meals summary */}
        <Link href="/diary" className="card flex items-center gap-3 hover:border-primary/20 transition-colors">
          <div className="p-2 rounded-xl bg-primary/10">
            <Utensils className="w-4 h-4 text-primary" />
          </div>
          <div className="flex-1">
            <div className="text-white text-sm font-semibold">Diário alimentar</div>
            <div className="text-white/40 text-xs mt-0.5">
              {loadingEntries ? 'Carregando...' : `${Math.round(totals.calories)} kcal hoje`}
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-white/20" />
        </Link>

        {/* Plan shortcut */}
        <Link href="/meal-plan" className="card flex items-center gap-3 hover:border-primary/20 transition-colors">
          <div className="p-2 rounded-xl bg-green-500/10">
            <TrendingUp className="w-4 h-4 text-green-400" />
          </div>
          <div className="flex-1">
            <div className="text-white text-sm font-semibold">Plano semanal</div>
            <div className="text-white/40 text-xs mt-0.5">Treinos e alimentação</div>
          </div>
          <ChevronRight className="w-4 h-4 text-white/20" />
        </Link>

        {/* Premium CTA */}
        {!premium.active && (
          <Link href="/premium" className="block">
            <div
              className="rounded-2xl p-4 flex items-center gap-3"
              style={{
                background: 'linear-gradient(135deg, #1a1400 0%, #1a0800 100%)',
                border: '1px solid rgba(255,215,0,0.2)',
              }}
            >
              <span className="text-2xl">💎</span>
              <div className="flex-1">
                <div className="text-primary font-bold text-sm">Desbloqueie o Premium</div>
                <div className="text-white/40 text-xs">Scanner ilimitado, IA Coach 24h e mais</div>
              </div>
              <ChevronRight className="w-4 h-4 text-primary" />
            </div>
          </Link>
        )}
      </div>
    </div>
  );
}
