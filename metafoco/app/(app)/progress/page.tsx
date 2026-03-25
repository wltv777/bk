'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { useUserStore } from '@/store/userStore';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingDown, TrendingUp, Camera, Download } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { BioimpedanceLog } from '@/types';

export default function ProgressPage() {
  const { profile } = useUserStore();
  const [logs, setLogs] = useState<BioimpedanceLog[]>([]);
  const [activeChart, setActiveChart] = useState<'weight' | 'fat' | 'muscle'>('weight');

  useEffect(() => {
    if (!auth.currentUser) return;
    getDocs(
      query(collection(db, 'bioimpedance_logs', auth.currentUser.uid, 'logs'), orderBy('date', 'asc'), limit(30))
    ).then((snap) => {
      setLogs(snap.docs.map((d) => ({ id: d.id, ...d.data() })) as BioimpedanceLog[]);
    });
  }, []);

  const chartData = logs.map((l) => ({
    date: new Date(l.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }),
    weight: l.weight,
    fat: l.bodyFatPercent,
    muscle: l.muscleMass,
  }));

  const first = logs[0];
  const last = logs[logs.length - 1];

  const weightDiff = last && first ? Math.round((last.weight - first.weight) * 10) / 10 : null;
  const fatDiff    = last && first ? Math.round((last.bodyFatPercent - first.bodyFatPercent) * 10) / 10 : null;
  const muscleDiff = last && first ? Math.round((last.muscleMass - first.muscleMass) * 10) / 10 : null;

  const charts = [
    { key: 'weight', label: 'Peso (kg)', color: '#FFD700',  diff: weightDiff, goodWhenDown: profile?.goal !== 'gain' },
    { key: 'fat',    label: 'Gordura %', color: '#FF6B35',  diff: fatDiff,    goodWhenDown: true },
    { key: 'muscle', label: 'Músculo kg', color: '#3B82F6', diff: muscleDiff, goodWhenDown: false },
  ] as const;

  return (
    <div className="min-h-screen bg-black">
      <div className="px-5 pt-12 pb-4">
        <h1 className="section-title text-3xl mb-1">Progresso</h1>
        <p className="text-white/40 text-sm">Sua evolução visual</p>
      </div>

      <div className="px-5 space-y-4 pb-6">
        {/* Summary cards */}
        <div className="grid grid-cols-3 gap-2">
          {charts.map(({ key, label, color, diff, goodWhenDown }) => {
            const isGood = diff !== null && (goodWhenDown ? diff < 0 : diff > 0);
            const isBad = diff !== null && (goodWhenDown ? diff > 0 : diff < 0);
            return (
              <button
                key={key}
                onClick={() => setActiveChart(key as any)}
                className={cn(
                  'card text-center py-3 transition-all border',
                  activeChart === key ? 'border-primary/60' : 'border-transparent'
                )}
              >
                <div className="text-lg font-bold" style={{ color }}>
                  {diff !== null ? (diff > 0 ? `+${diff}` : diff) : '--'}
                </div>
                <div className="text-white/30 text-[10px]">{label}</div>
                {diff !== null && (
                  isGood ? <TrendingDown className="w-3 h-3 text-success mx-auto mt-1" />
                  : isBad ? <TrendingUp className="w-3 h-3 text-danger mx-auto mt-1" />
                  : null
                )}
              </button>
            );
          })}
        </div>

        {/* Chart */}
        {chartData.length > 1 ? (
          <div className="card">
            <h3 className="text-white/60 text-sm mb-4">
              {charts.find((c) => c.key === activeChart)?.label}
            </h3>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={charts.find((c) => c.key === activeChart)?.color} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={charts.find((c) => c.key === activeChart)?.color} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" tick={{ fill: '#888', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis hide domain={['auto', 'auto']} />
                <Tooltip
                  contentStyle={{ background: '#1A1A1A', border: '1px solid rgba(255,215,0,0.2)', borderRadius: 12 }}
                  labelStyle={{ color: '#888' }}
                  itemStyle={{ color: '#FFD700' }}
                />
                <Area
                  type="monotone"
                  dataKey={activeChart}
                  stroke={charts.find((c) => c.key === activeChart)?.color}
                  strokeWidth={2}
                  fill="url(#grad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="card text-center py-10">
            <div className="text-4xl mb-2">📈</div>
            <p className="text-white/40 text-sm">Registre suas medidas em Bioimpedância para ver os gráficos.</p>
          </div>
        )}

        {/* Motivational insight */}
        {weightDiff !== null && (
          <div className={cn(
            'card-highlight rounded-2xl p-4',
            weightDiff < 0 ? 'border-success/30' : weightDiff > 0 ? 'border-warning/20' : ''
          )}>
            <p className="text-white/70 text-sm">
              {weightDiff < 0
                ? `📉 Você perdeu ${Math.abs(weightDiff)}kg desde o início. Evolução limpa. Continua.`
                : weightDiff > 0
                ? `⚠️ Peso subiu ${weightDiff}kg. Pode ser retenção. Checa a água e o sódio.`
                : `✅ Peso estável. Foco na composição corporal.`}
            </p>
          </div>
        )}

        {/* Photo comparison placeholder */}
        <div className="card">
          <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
            <Camera className="w-4 h-4 text-primary" />
            Fotos antes/depois
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {['Antes', 'Depois'].map((label) => (
              <div key={label} className="bg-surface-2 rounded-xl aspect-square flex flex-col items-center justify-center gap-2 border border-dashed border-white/10">
                <Camera className="w-6 h-6 text-white/20" />
                <span className="text-white/20 text-xs">{label}</span>
              </div>
            ))}
          </div>
          <button className="btn-outline w-full mt-3 text-sm flex items-center justify-center gap-2">
            <Download className="w-4 h-4" /> Exportar progress card (Premium)
          </button>
        </div>
      </div>
    </div>
  );
}
