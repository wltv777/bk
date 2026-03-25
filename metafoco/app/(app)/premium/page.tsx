'use client';

import { useState } from 'react';
import { Crown, Check, Zap, Camera, MessageCircle, TrendingUp, FileText, Users } from 'lucide-react';
import { useUserStore } from '@/store/userStore';
import Link from 'next/link';
import { cn } from '@/lib/utils';

const FEATURES_FREE = [
  'Jejum básico',
  'Diário manual',
  'Peso e IMC',
  '3 scans por dia',
  '10 msgs coach/dia',
];

const FEATURES_PREMIUM = [
  { icon: <Camera className="w-4 h-4" />, label: 'Scanner IA ilimitado' },
  { icon: <MessageCircle className="w-4 h-4" />, label: 'IA Coach 24h ilimitado' },
  { icon: <TrendingUp className="w-4 h-4" />, label: 'Relatórios de bioimpedância' },
  { icon: <Zap className="w-4 h-4" />, label: 'Jejum inteligente automático' },
  { icon: <FileText className="w-4 h-4" />, label: 'Exportar PDF completo' },
  { icon: <Users className="w-4 h-4" />, label: 'Acesso ao ranking premium' },
];

export default function PremiumPage() {
  const { premium } = useUserStore();
  const [plan, setPlan] = useState<'monthly' | 'yearly'>('monthly');

  if (premium.active) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center px-5 text-center">
        <Crown className="w-16 h-16 text-primary fill-primary mb-4" />
        <h1 className="section-title text-4xl mb-2">Você é Premium</h1>
        <p className="text-white/40 text-sm">Todos os recursos desbloqueados. Continue no foco!</p>
        <Link href="/dashboard" className="btn-primary mt-6 inline-flex items-center gap-2">
          Ir para o App
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="px-5 pt-12 pb-4">
        <h1 className="section-title text-3xl mb-1 flex items-center gap-2">
          <Crown className="w-7 h-7 text-primary fill-primary" />
          Premium
        </h1>
        <p className="text-white/40 text-sm">Destrave o potencial completo</p>
      </div>

      <div className="px-5 space-y-4 pb-6">
        {/* Hero */}
        <div className="rounded-3xl p-6 text-center"
          style={{ background: 'linear-gradient(135deg, #1a1400 0%, #0d0900 100%)', border: '1px solid rgba(255,215,0,0.3)' }}>
          <div className="text-5xl mb-2">💎</div>
          <h2 className="text-white font-bold text-xl mb-1">Você não paga caro.</h2>
          <p className="text-white/60 text-sm">Você investe pra nunca mais desistir.</p>
        </div>

        {/* Plan toggle */}
        <div className="flex bg-surface rounded-2xl p-1">
          {(['monthly', 'yearly'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPlan(p)}
              className={cn(
                'flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all relative',
                plan === p ? 'bg-primary text-black' : 'text-white/50'
              )}
            >
              {p === 'monthly' ? 'Mensal' : 'Anual'}
              {p === 'yearly' && (
                <span className="absolute -top-2 -right-1 bg-success text-black text-[9px] px-1.5 py-0.5 rounded-full font-bold">
                  -40%
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Price card */}
        <div className="card-highlight text-center py-6">
          <div className="text-primary font-display text-5xl">
            {plan === 'monthly' ? 'R$19,90' : 'R$11,90'}
          </div>
          <div className="text-white/40 text-sm">
            {plan === 'monthly' ? 'por mês' : 'por mês (cobrado anualmente)'}
          </div>
          {plan === 'yearly' && (
            <div className="text-success text-xs mt-1 font-semibold">Economize R$96/ano 🎉</div>
          )}
        </div>

        {/* Features */}
        <div className="card space-y-3">
          <h3 className="font-semibold text-white">O que você ganha:</h3>
          {FEATURES_PREMIUM.map(({ icon, label }) => (
            <div key={label} className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary flex-shrink-0">
                {icon}
              </div>
              <span className="text-white/80 text-sm">{label}</span>
              <Check className="w-4 h-4 text-success ml-auto" />
            </div>
          ))}
        </div>

        {/* CTA */}
        <button className="btn-primary w-full text-lg py-4 flex items-center justify-center gap-2">
          <Crown className="w-5 h-5 fill-black" />
          ASSINAR AGORA
        </button>

        <p className="text-white/20 text-xs text-center">
          Cancele quando quiser. Sem fidelidade. 7 dias de garantia.
        </p>

        {/* Free features comparison */}
        <div className="card space-y-2">
          <h3 className="text-white/40 text-sm">Plano Gratuito inclui:</h3>
          {FEATURES_FREE.map((f) => (
            <div key={f} className="flex items-center gap-2 text-white/30 text-sm">
              <Check className="w-3.5 h-3.5" />
              {f}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
