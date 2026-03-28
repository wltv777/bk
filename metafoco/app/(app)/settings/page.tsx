'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { doc, updateDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { useAuth } from '@/hooks/useAuth';
import { useUserStore } from '@/store/userStore';
import { XPBar } from '@/components/gamification/XPBar';
import { BADGES } from '@/lib/gamification';
import { getActivityLabel, getGoalLabel } from '@/lib/utils';
import { LogOut, ChevronRight, Crown, Zap, Shield, Bell, CalendarDays, Droplets } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const router = useRouter();
  const { logout } = useAuth();
  const { profile, metrics, gamification, premium, notifications } = useUserStore();

  async function handleLogout() {
    await logout();
    router.replace('/login');
  }

  const unlockedBadges = gamification.badges;
  const totalBadges = Object.keys(BADGES).length;

  return (
    <div className="min-h-screen bg-black">
      <div className="px-5 pt-12 pb-4">
        <h1 className="section-title text-3xl mb-1">Perfil</h1>
        <p className="text-white/40 text-sm">Configurações e conquistas</p>
      </div>

      <div className="px-5 space-y-4 pb-6">
        {/* Profile card */}
        <div className="card-highlight flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center text-2xl font-display text-primary">
            {profile?.name.charAt(0).toUpperCase() ?? 'U'}
          </div>
          <div className="flex-1">
            <div className="font-bold text-white text-lg">{profile?.name}</div>
            <div className="text-white/40 text-sm">{profile?.email ?? auth.currentUser?.email}</div>
            {premium.active && (
              <div className="flex items-center gap-1 mt-1">
                <Crown className="w-3.5 h-3.5 text-primary fill-primary" />
                <span className="text-primary text-xs font-semibold">Premium</span>
              </div>
            )}
          </div>
        </div>

        {/* XP bar */}
        <XPBar xp={gamification.xp} />

        {/* Stats */}
        {metrics && (
          <div className="card">
            <h3 className="font-semibold text-white mb-3">Seus números</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              {[
                { label: 'Meta de calorias', value: `${metrics.targetCalories} kcal` },
                { label: 'Meta de proteína', value: `${metrics.targetProtein}g` },
                { label: 'Objetivo', value: getGoalLabel(profile?.goal ?? '') },
                { label: 'Atividade', value: getActivityLabel(profile?.activityLevel ?? '') },
                { label: 'Jejum', value: profile?.fastingProtocol },
                { label: 'TMB', value: `${metrics.bmr} kcal` },
              ].map(({ label, value }) => (
                <div key={label} className="bg-surface-2 rounded-xl p-3">
                  <div className="text-white/30 text-xs">{label}</div>
                  <div className="text-white font-semibold text-sm mt-0.5">{value}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Badges */}
        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-white">Conquistas</h3>
            <span className="text-white/40 text-xs">{unlockedBadges.length}/{totalBadges}</span>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {Object.entries(BADGES).map(([id, badge]) => {
              const unlocked = unlockedBadges.includes(id as any);
              return (
                <div
                  key={id}
                  title={badge.name}
                  className={cn(
                    'flex flex-col items-center gap-1 p-2 rounded-xl bg-surface-2',
                    unlocked ? 'badge-unlocked' : 'badge-locked'
                  )}
                >
                  <span className="text-2xl">{badge.emoji}</span>
                  <span className="text-[9px] text-white/40 text-center leading-tight">{badge.name}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Menu items */}
        <div className="card space-y-1">
          {[
            { icon: <Crown className="w-4 h-4 text-primary" />,        label: 'Assinar Premium',      href: '/premium',               highlight: !premium.active },
            { icon: <CalendarDays className="w-4 h-4 text-white/40" />, label: 'Planejamento Semanal', href: '/meal-plan',              highlight: false },
            { icon: <Droplets className="w-4 h-4 text-blue-400" />,   label: 'Calculadora de Água',  href: '/water',                 highlight: false },
            { icon: <Bell className="w-4 h-4 text-white/40" />,        label: 'Notificações',          href: '/settings/notifications', highlight: false },
            { icon: <Shield className="w-4 h-4 text-white/40" />,      label: 'Privacidade',           href: '/settings/privacy',       highlight: false },
          ].map(({ icon, label, href, highlight }) => (
            <Link key={href} href={href} className={cn(
              'flex items-center gap-3 py-3 px-2 rounded-xl hover:bg-white/5 transition-colors',
              highlight && 'text-primary'
            )}>
              {icon}
              <span className={cn('flex-1 text-sm', highlight ? 'text-primary font-semibold' : 'text-white/70')}>{label}</span>
              <ChevronRight className="w-4 h-4 text-white/20" />
            </Link>
          ))}
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border border-danger/30 text-danger hover:bg-danger/10 transition-colors text-sm font-semibold"
        >
          <LogOut className="w-4 h-4" />
          Sair da conta
        </button>

        <p className="text-center text-white/20 text-xs">METAFOCO v1.0.0 • Foco. Disciplina. Resultado.</p>
      </div>
    </div>
  );
}
