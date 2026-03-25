'use client';

import { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { addXP } from '@/lib/gamification';
import { useUserStore } from '@/store/userStore';
import { calculateBMI, bmiLabel } from '@/lib/calculations';
import { Scale, TrendingDown, TrendingUp, Minus, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';
import type { BioimpedanceLog } from '@/types';

export default function BioimpedancePage() {
  const { profile, updateWeight } = useUserStore();
  const [logs, setLogs] = useState<BioimpedanceLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    weight: profile?.weight ?? 0,
    bodyFatPercent: 20,
    muscleMass: 60,
    visceralFat: 5,
    waterPercent: 55,
    metabolicAge: profile?.age ?? 25,
    bmr: 1600,
  });

  useEffect(() => {
    if (!auth.currentUser) return;
    getDocs(
      query(collection(db, 'bioimpedance_logs', auth.currentUser.uid, 'logs'), orderBy('date', 'desc'), limit(10))
    ).then((snap) => {
      setLogs(snap.docs.map((d) => ({ id: d.id, ...d.data() })) as BioimpedanceLog[]);
    });
  }, []);

  function update(key: keyof typeof form, val: number) {
    setForm((f) => ({ ...f, [key]: val }));
  }

  function interpretBodyFat(percent: number, sex: string): { label: string; color: string } {
    if (sex === 'male') {
      if (percent < 6)  return { label: 'Essencial', color: 'text-blue-400' };
      if (percent < 14) return { label: 'Atlético', color: 'text-success' };
      if (percent < 18) return { label: 'Boa forma', color: 'text-primary' };
      if (percent < 25) return { label: 'Aceitável', color: 'text-orange-400' };
      return { label: 'Obeso', color: 'text-danger' };
    }
    if (percent < 14) return { label: 'Essencial', color: 'text-blue-400' };
    if (percent < 21) return { label: 'Atlético', color: 'text-success' };
    if (percent < 25) return { label: 'Boa forma', color: 'text-primary' };
    if (percent < 32) return { label: 'Aceitável', color: 'text-orange-400' };
    return { label: 'Obeso', color: 'text-danger' };
  }

  async function saveLog() {
    if (!auth.currentUser) return;
    setLoading(true);
    const today = new Date().toISOString().split('T')[0];
    const log = {
      userId: auth.currentUser.uid,
      date: today,
      ...form,
      source: 'manual' as const,
      createdAt: new Date(),
    };
    try {
      const ref = await addDoc(collection(db, 'bioimpedance_logs', auth.currentUser.uid, 'logs'), log);
      setLogs((prev) => [{ ...log, id: ref.id }, ...prev]);
      updateWeight(form.weight);
      await addXP(auth.currentUser.uid, 'bioimpedance_logged');
      toast.success('Medidas salvas! +25 XP 📊');
    } catch {
      toast.error('Erro ao salvar medidas.');
    } finally {
      setLoading(false);
    }
  }

  const latest = logs[0];
  const previous = logs[1];
  const bmi = calculateBMI(form.weight, profile?.height ?? 170);
  const fatInfo = interpretBodyFat(form.bodyFatPercent, profile?.sex ?? 'male');

  function getDiff(current: number, prev: number | undefined) {
    if (!prev) return null;
    return Math.round((current - prev) * 10) / 10;
  }

  const fields = [
    { key: 'weight',        label: 'Peso',               unit: 'kg',    min: 30,   max: 300, step: 0.1 },
    { key: 'bodyFatPercent',label: 'Gordura corporal',   unit: '%',     min: 3,    max: 60,  step: 0.1 },
    { key: 'muscleMass',    label: 'Massa muscular',     unit: 'kg',    min: 10,   max: 120, step: 0.1 },
    { key: 'visceralFat',   label: 'Gordura visceral',   unit: 'nível', min: 1,    max: 20,  step: 1   },
    { key: 'waterPercent',  label: 'Água corporal',      unit: '%',     min: 30,   max: 80,  step: 0.1 },
    { key: 'metabolicAge',  label: 'Idade metabólica',   unit: 'anos',  min: 10,   max: 100, step: 1   },
    { key: 'bmr',           label: 'Taxa metabólica',    unit: 'kcal',  min: 800,  max: 5000,step: 10  },
  ] as const;

  return (
    <div className="min-h-screen bg-black">
      <div className="px-5 pt-12 pb-4">
        <h1 className="section-title text-3xl mb-1">Bioimpedância</h1>
        <p className="text-white/40 text-sm">Composição corporal detalhada</p>
      </div>

      <div className="px-5 space-y-4 pb-6">
        {/* Summary cards */}
        <div className="grid grid-cols-2 gap-3">
          <div className="card">
            <div className="text-xs text-white/40 mb-1">IMC</div>
            <div className="text-2xl font-bold text-white">{bmi}</div>
            <div className="text-xs text-white/50">{bmiLabel(bmi)}</div>
          </div>
          <div className="card">
            <div className="text-xs text-white/40 mb-1">Gordura</div>
            <div className={cn('text-2xl font-bold', fatInfo.color)}>{form.bodyFatPercent}%</div>
            <div className={cn('text-xs', fatInfo.color)}>{fatInfo.label}</div>
          </div>
        </div>

        {/* Form */}
        <div className="card-highlight space-y-3">
          <h3 className="font-semibold text-white flex items-center gap-2">
            <Scale className="w-4 h-4 text-primary" />
            Registrar medidas
          </h3>

          {fields.map(({ key, label, unit, min, max, step }) => (
            <div key={key} className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="text-white/50 text-xs">{label}</label>
                {latest && previous && (
                  <DiffBadge diff={getDiff(form[key], previous[key as keyof BioimpedanceLog] as number)} unit={unit} />
                )}
              </div>
              <div className="relative">
                <input
                  type="number"
                  value={form[key]}
                  onChange={(e) => update(key, Number(e.target.value))}
                  min={min}
                  max={max}
                  step={step}
                  className="input pr-14"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 text-sm">{unit}</span>
              </div>
            </div>
          ))}

          <button
            onClick={saveLog}
            disabled={loading}
            className={cn('btn-primary w-full flex items-center justify-center gap-2', loading && 'opacity-60')}
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
            ) : (
              <><Activity className="w-5 h-5" /> SALVAR MEDIDAS</>
            )}
          </button>
        </div>

        {/* History */}
        {logs.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-white/60 text-sm font-semibold">Histórico</h3>
            {logs.map((log, i) => (
              <div key={log.id} className="card flex items-center gap-3">
                <div className="text-center">
                  <div className="text-primary font-bold">{log.weight}kg</div>
                  <div className="text-white/30 text-xs">{new Date(log.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}</div>
                </div>
                <div className="flex-1 grid grid-cols-3 gap-1 text-center">
                  <div>
                    <div className="text-orange-400 text-sm font-semibold">{log.bodyFatPercent}%</div>
                    <div className="text-white/30 text-[10px]">gordura</div>
                  </div>
                  <div>
                    <div className="text-blue-400 text-sm font-semibold">{log.muscleMass}kg</div>
                    <div className="text-white/30 text-[10px]">músculo</div>
                  </div>
                  <div>
                    <div className="text-cyan-400 text-sm font-semibold">{log.waterPercent}%</div>
                    <div className="text-white/30 text-[10px]">água</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function DiffBadge({ diff, unit }: { diff: number | null; unit: string }) {
  if (diff === null || diff === 0) return null;
  const isPositive = diff > 0;
  return (
    <span className={cn('text-xs font-semibold flex items-center gap-0.5', isPositive ? 'text-danger' : 'text-success')}>
      {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
      {isPositive ? '+' : ''}{diff}{unit}
    </span>
  );
}
