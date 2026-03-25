'use client';

import { useEffect, useState } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { useUserStore } from '@/store/userStore';
import { useDiaryStore } from '@/store/diaryStore';
import { useFastingStore } from '@/store/fastingStore';
import { ProgressRing } from '@/components/shared/ProgressRing';
import { MacroBar } from '@/components/shared/MacroBar';
import { FastingTimer } from '@/components/dashboard/FastingTimer';
import { MissionCard } from '@/components/dashboard/MissionCard';
import { XPBar } from '@/components/gamification/XPBar';
import { Logo } from '@/components/logo/Logo';
import { formatPercent, formatCalories, getGreeting, todayString } from '@/lib/utils';
import { Bell, Flame, Droplets, Scale } from 'lucide-react';
import Link from 'next/link';
import type { MealEntry } from '@/types';

export default function DashboardPage() {
  const { profile, metrics, gamification, premium } = useUserStore();
  const { getTodayTotals, setEntries } = useDiaryStore();
  const { activeSession } = useFastingStore();
  const [missionDone, setMissionDone] = useState(false);

  const totals = getTodayTotals();

  useEffect(() => {
    if (!auth.currentUser) return;
    const uid = auth.currentUser.uid;
    const today = todayString();
    getDocs(
      query(collection(db, 'meals', uid, 'entries'), where('date', '==', today))
    ).then((snap) => {
      const entries = snap.docs.map((d) => ({ id: d.id, ...d.data() })) as MealEntry[];
      setEntries(entries);
    });
  }, [setEntries]);

  if (!profile || !metrics) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const calPercent = formatPercent(totals.calories, metrics.targetCalories);
  const remaining = Math.max(metrics.targetCalories - totals.calories, 0);

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="px-5 pt-12 pb-4 flex items-center justify-between">
        <div>
          <p className="text-white/40 text-sm">{getGreeting()},</p>
          <h1 className="text-white font-bold text-xl">{profile.name.split(' ')[0]} 👊</h1>
        </div>
        <div className="flex items-center gap-3">
          <LogoIcon />
          <Link href="/settings" className="relative">
            <Bell className="w-5 h-5 text-white/40" />
          </Link>
        </div>
      </div>

      <div className="px-5 space-y-4 pb-6">
        {/* Streak + XP */}
        {gamification.xp > 0 && (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 bg-orange-500/20 px-3 py-1.5 rounded-full">
              <Flame className="w-3.5 h-3.5 text-orange-400 fill-orange-400" />
              <span className="text-xs text-orange-400 font-semibold">{gamification.streak} dias</span>
            </div>
            <div className="flex-1">
              <XPBar xp={gamification.xp} compact />
            </div>
          </div>
        )}

        {/* Calorie Ring + Macros */}
        <div className="card">
          <div className="flex items-center gap-6">
            <ProgressRing
              value={calPercent}
              size={120}
              strokeWidth={10}
              color={calPercent > 100 ? '#FF3B30' : '#FFD700'}
              label={`${calPercent}%`}
              sublabel="calorias"
            />
            <div className="flex-1 space-y-3">
              <div className="text-center">
                <div className="text-2xl font-bold text-white font-display">{formatCalories(totals.calories)}</div>
                <div className="text-xs text-white/40">de {formatCalories(metrics.targetCalories)} kcal</div>
              </div>
              <div className="text-center bg-surface-2 rounded-xl px-3 py-2">
                <div className="text-primary font-bold">{formatCalories(remaining)}</div>
                <div className="text-xs text-white/30">restando</div>
              </div>
            </div>
          </div>

          <div className="mt-4 space-y-2">
            <MacroBar label="Proteína" consumed={totals.protein} target={metrics.targetProtein} color="#3B82F6" bgColor="bg-blue-500" textColor="text-blue-400" />
            <MacroBar label="Carboidrato" consumed={totals.carbs} target={metrics.targetCarbs} color="#F97316" bgColor="bg-orange-500" textColor="text-orange-400" />
            <MacroBar label="Gordura" consumed={totals.fat} target={metrics.targetFat} color="#EAB308" bgColor="bg-yellow-500" textColor="text-yellow-400" />
          </div>
        </div>

        {/* Fasting Timer */}
        <FastingTimer protocol={profile.fastingProtocol} compact />

        {/* Mission */}
        <MissionCard completed={missionDone} onComplete={() => setMissionDone(true)} />

        {/* Quick Actions */}
        <div className="grid grid-cols-3 gap-3">
          <QuickCard icon={<Droplets className="w-5 h-5 text-blue-400" />} label="Água" href="/settings?tab=water" value="💧" />
          <QuickCard icon={<Scale className="w-5 h-5 text-primary" />} label="Peso" href="/bioimpedance" value={`${profile.weight}kg`} />
          <QuickCard icon={<Flame className="w-5 h-5 text-orange-400" />} label="Treinos" href="/workout" value="Ver" />
        </div>

        {/* Premium CTA */}
        {!premium.active && (
          <Link href="/premium" className="block">
            <div className="rounded-2xl p-4 flex items-center gap-3"
              style={{ background: 'linear-gradient(135deg, #1a1400 0%, #1a0800 100%)', border: '1px solid rgba(255,215,0,0.2)' }}>
              <span className="text-2xl">💎</span>
              <div>
                <div className="text-primary font-bold text-sm">Desbloqueie o Premium</div>
                <div className="text-white/40 text-xs">Scanner ilimitado, IA Coach 24h e +</div>
              </div>
              <span className="ml-auto text-primary text-sm font-bold">R$19,90→</span>
            </div>
          </Link>
        )}
      </div>
    </div>
  );
}

function QuickCard({ icon, label, href, value }: { icon: React.ReactNode; label: string; href: string; value: string }) {
  return (
    <Link href={href} className="card flex flex-col items-center gap-2 py-3 hover:border-primary/30 transition-colors">
      {icon}
      <span className="text-white/80 text-sm font-semibold">{value}</span>
      <span className="text-white/30 text-xs">{label}</span>
    </Link>
  );
}

function LogoIcon() {
  return (
    <div className="text-lg font-display logo-text">MF</div>
  );
}
