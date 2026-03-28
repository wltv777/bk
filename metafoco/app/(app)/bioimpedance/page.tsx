'use client';

import { useState, useEffect, useMemo } from 'react';
import { collection, addDoc, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { addXP } from '@/lib/gamification';
import { useUserStore } from '@/store/userStore';
import { calculateBMI, bmiLabel } from '@/lib/calculations';
import { Scale, TrendingDown, TrendingUp, Activity, Brain, ChevronRight, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';
import type { BioimpedanceLog } from '@/types';

// ─── Navy circumference formula ───────────────────────────────
function estimateBodyFatNavy(sex: string, height: number, waist: number, neck: number, hip = 0): number {
  if (sex === 'female' && hip > 0) {
    const val = 163.205 * Math.log10(waist + hip - neck) - 97.684 * Math.log10(height) - 78.387;
    return Math.max(5, Math.min(60, Math.round(val * 10) / 10));
  }
  const val = 86.010 * Math.log10(waist - neck) - 70.041 * Math.log10(height) + 36.76;
  return Math.max(3, Math.min(60, Math.round(val * 10) / 10));
}

function interpretBodyFat(percent: number, sex: string): { label: string; color: string; emoji: string } {
  if (sex === 'male') {
    if (percent < 6)  return { label: 'Gordura essencial', color: 'text-blue-400',   emoji: '⚡' };
    if (percent < 14) return { label: 'Atlético',          color: 'text-success',    emoji: '💪' };
    if (percent < 18) return { label: 'Boa forma',         color: 'text-primary',    emoji: '✅' };
    if (percent < 25) return { label: 'Aceitável',         color: 'text-orange-400', emoji: '⚠️' };
    return               { label: 'Acima do ideal',        color: 'text-danger',     emoji: '🔴' };
  }
  if (percent < 14) return { label: 'Gordura essencial', color: 'text-blue-400',   emoji: '⚡' };
  if (percent < 21) return { label: 'Atlético',          color: 'text-success',    emoji: '💪' };
  if (percent < 25) return { label: 'Boa forma',         color: 'text-primary',    emoji: '✅' };
  if (percent < 32) return { label: 'Aceitável',         color: 'text-orange-400', emoji: '⚠️' };
  return               { label: 'Acima do ideal',        color: 'text-danger',     emoji: '🔴' };
}

function bmiColor(bmi: number): string {
  if (bmi < 18.5) return 'text-blue-400';
  if (bmi < 25)   return 'text-success';
  if (bmi < 30)   return 'text-orange-400';
  return 'text-danger';
}

type Tab = 'analysis' | 'history';

export default function AnaliseCorpPage() {
  const { profile, updateWeight } = useUserStore();
  const [tab, setTab] = useState<Tab>('analysis');
  const [logs, setLogs] = useState<BioimpedanceLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [showTip, setShowTip] = useState(false);

  // Measurements
  const [weight, setWeight] = useState(profile?.weight ?? 70);
  const [waist, setWaist] = useState(80);
  const [neck, setNeck] = useState(38);
  const [hip, setHip] = useState(95);   // only for female
  const [bodyFatManual, setBodyFatManual] = useState(20);
  const [useManual, setUseManual] = useState(false);

  const sex = profile?.sex ?? 'male';
  const height = profile?.height ?? 170;

  useEffect(() => {
    if (!auth.currentUser) return;
    getDocs(
      query(collection(db, 'bioimpedance_logs', auth.currentUser.uid, 'logs'), orderBy('date', 'desc'), limit(10))
    ).then((snap) => {
      setLogs(snap.docs.map((d) => ({ id: d.id, ...d.data() })) as BioimpedanceLog[]);
    });
  }, []);

  const estimatedFat = useMemo(() => {
    if (useManual) return bodyFatManual;
    if (waist > 0 && neck > 0 && height > 0) {
      return estimateBodyFatNavy(sex, height, waist, neck, sex === 'female' ? hip : 0);
    }
    return bodyFatManual;
  }, [useManual, bodyFatManual, sex, height, waist, neck, hip]);

  const leanMass = useMemo(() => {
    return Math.round((weight * (1 - estimatedFat / 100)) * 10) / 10;
  }, [weight, estimatedFat]);

  const fatMass = useMemo(() => {
    return Math.round((weight * estimatedFat / 100) * 10) / 10;
  }, [weight, estimatedFat]);

  const bmi = useMemo(() => calculateBMI(weight, height), [weight, height]);
  const fatInfo = useMemo(() => interpretBodyFat(estimatedFat, sex), [estimatedFat, sex]);

  const latest = logs[0];
  const weightTrend = latest ? Math.round((weight - latest.weight) * 10) / 10 : null;
  const fatTrend = latest ? Math.round((estimatedFat - latest.bodyFatPercent) * 10) / 10 : null;

  function getRecommendation(): string {
    const goal = profile?.goal ?? 'maintain';
    if (goal === 'lose') {
      if (estimatedFat > 25 && sex === 'male') return 'Foque em déficit calórico moderado (-300 a -500 kcal/dia) e priorize proteína (2g/kg) para preservar músculo.';
      if (estimatedFat > 32 && sex === 'female') return 'Déficit calórico gradual com alta proteína. Inclua 3x treino de força por semana para preservar massa magra.';
      return 'Você está indo bem! Mantenha o déficit e registre seu progresso semanalmente.';
    }
    if (goal === 'gain') {
      if (leanMass < weight * 0.75) return 'Priorize superávit calórico leve (+200 a +300 kcal) com proteína elevada. Foque em treino de força 4x/semana.';
      return 'Boa base muscular. Continue o superávit e foque em progressão de carga nos treinos.';
    }
    return 'Mantenha consistência com a alimentação e treinos. Pese-se semanalmente no mesmo horário.';
  }

  async function saveLog() {
    if (!auth.currentUser) return;
    setLoading(true);
    const today = new Date().toISOString().split('T')[0];
    const log = {
      userId: auth.currentUser.uid,
      date: today,
      weight,
      bodyFatPercent: estimatedFat,
      muscleMass: leanMass,
      visceralFat: 5,
      waterPercent: 55,
      metabolicAge: profile?.age ?? 25,
      bmr: 0,
      source: 'manual' as const,
      createdAt: new Date(),
    };
    try {
      const ref = await addDoc(collection(db, 'bioimpedance_logs', auth.currentUser.uid, 'logs'), log);
      setLogs((prev) => [{ ...log, id: ref.id }, ...prev]);
      updateWeight(weight);
      await addXP(auth.currentUser.uid, 'bioimpedance_logged');
      toast.success('Análise salva! +25 XP 📊');
    } catch {
      toast.error('Erro ao salvar análise.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-black pb-24">
      {/* Header */}
      <div className="px-5 pt-12 pb-4">
        <div className="flex items-center gap-2 mb-0.5">
          <Brain className="w-5 h-5 text-primary" />
          <h1 className="section-title text-2xl">Análise Corporal</h1>
        </div>
        <p className="text-white/40 text-sm">Estimativa inteligente da sua composição</p>
      </div>

      {/* Tabs */}
      <div className="px-5 mb-4">
        <div className="flex bg-surface rounded-2xl p-1 gap-1">
          {(['analysis', 'history'] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                'flex-1 py-2 rounded-xl text-sm font-semibold transition-all',
                tab === t ? 'bg-primary text-black' : 'text-white/40 hover:text-white/60'
              )}
            >
              {t === 'analysis' ? '📊 Análise' : '📈 Histórico'}
            </button>
          ))}
        </div>
      </div>

      {tab === 'analysis' && (
        <div className="px-5 space-y-4">
          {/* Summary cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="card">
              <div className="text-xs text-white/40 mb-1">IMC</div>
              <div className={cn('text-2xl font-bold', bmiColor(bmi))}>{bmi}</div>
              <div className={cn('text-xs', bmiColor(bmi))}>{bmiLabel(bmi)}</div>
            </div>
            <div className="card">
              <div className="text-xs text-white/40 mb-1">% Gordura</div>
              <div className={cn('text-2xl font-bold', fatInfo.color)}>{estimatedFat}%</div>
              <div className={cn('text-xs', fatInfo.color)}>{fatInfo.emoji} {fatInfo.label}</div>
            </div>
            <div className="card">
              <div className="text-xs text-white/40 mb-1">Massa magra</div>
              <div className="text-2xl font-bold text-blue-400">{leanMass}kg</div>
              <div className="text-xs text-white/40">músculo + osso</div>
            </div>
            <div className="card">
              <div className="text-xs text-white/40 mb-1">Massa gorda</div>
              <div className="text-2xl font-bold text-orange-400">{fatMass}kg</div>
              <div className="text-xs text-white/40">gordura total</div>
            </div>
          </div>

          {/* Trends */}
          {latest && (
            <div className="card flex items-center gap-4">
              <TrendChange label="Peso" current={weight} diff={weightTrend} unit="kg" goodDown />
              <div className="w-px h-10 bg-white/10" />
              <TrendChange label="Gordura" current={estimatedFat} diff={fatTrend} unit="%" goodDown />
              <div className="w-px h-10 bg-white/10" />
              <TrendChange label="Magra" current={leanMass} diff={latest ? Math.round((leanMass - latest.muscleMass) * 10) / 10 : null} unit="kg" goodDown={false} />
            </div>
          )}

          {/* Measurement form */}
          <div className="card-highlight space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-white flex items-center gap-2 text-sm">
                <Scale className="w-4 h-4 text-primary" />
                Suas medidas
              </h3>
              <button
                onClick={() => setShowTip(!showTip)}
                className="text-white/30 hover:text-white/60 transition-colors"
              >
                <Info className="w-4 h-4" />
              </button>
            </div>

            {showTip && (
              <div className="bg-primary/10 border border-primary/20 rounded-xl p-3 text-xs text-white/60 leading-relaxed">
                Usamos a <strong className="text-white/80">fórmula da Marinha dos EUA</strong> para estimar gordura corporal com base nas suas circunferências. Meça com fita métrica: <strong className="text-white/80">pescoço</strong> (parte mais estreita), <strong className="text-white/80">cintura</strong> (umbigo), e <strong className="text-white/80">quadril</strong> (para mulheres, parte mais larga).
              </div>
            )}

            <NumberInput label="Peso atual" value={weight} onChange={setWeight} unit="kg" min={30} max={300} step={0.1} />

            {!useManual && (
              <>
                <NumberInput label="Circunferência do pescoço" value={neck} onChange={setNeck} unit="cm" min={25} max={60} step={0.5} />
                <NumberInput label="Circunferência da cintura" value={waist} onChange={setWaist} unit="cm" min={50} max={180} step={0.5} />
                {sex === 'female' && (
                  <NumberInput label="Circunferência do quadril" value={hip} onChange={setHip} unit="cm" min={60} max={180} step={0.5} />
                )}
                <div className="text-center">
                  <button onClick={() => setUseManual(true)} className="text-white/30 text-xs hover:text-white/50 transition-colors underline">
                    Tenho aparelho — inserir gordura manualmente
                  </button>
                </div>
              </>
            )}

            {useManual && (
              <>
                <NumberInput label="% Gordura corporal (aparelho)" value={bodyFatManual} onChange={setBodyFatManual} unit="%" min={3} max={60} step={0.1} />
                <div className="text-center">
                  <button onClick={() => setUseManual(false)} className="text-white/30 text-xs hover:text-white/50 transition-colors underline">
                    Usar fórmula de circunferências
                  </button>
                </div>
              </>
            )}

            <button
              onClick={saveLog}
              disabled={loading}
              className={cn('btn-primary w-full flex items-center justify-center gap-2', loading && 'opacity-60')}
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
              ) : (
                <><Activity className="w-5 h-5" /> SALVAR ANÁLISE</>
              )}
            </button>
          </div>

          {/* Recommendation */}
          <div className="card" style={{ borderColor: 'rgba(255,215,0,0.15)', background: 'rgba(255,215,0,0.03)' }}>
            <div className="flex items-start gap-3">
              <span className="text-xl mt-0.5">🤖</span>
              <div>
                <div className="text-primary text-xs font-bold uppercase tracking-wider mb-1">Recomendação personalizada</div>
                <p className="text-white/70 text-sm leading-relaxed">{getRecommendation()}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === 'history' && (
        <div className="px-5 space-y-3">
          {logs.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-4xl mb-3">📊</div>
              <p className="text-white/40 text-sm">Nenhum registro ainda.</p>
              <p className="text-white/20 text-xs mt-1">Salve sua primeira análise na aba anterior.</p>
            </div>
          ) : (
            logs.map((log, i) => {
              const prev = logs[i + 1];
              return (
                <div key={log.id} className="card">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white/50 text-xs">
                      {new Date(log.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </span>
                    {prev && (
                      <span className={cn('text-xs font-semibold', log.weight < prev.weight ? 'text-success' : 'text-danger')}>
                        {log.weight < prev.weight ? '↓' : '↑'} {Math.abs(Math.round((log.weight - prev.weight) * 10) / 10)}kg
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-4 gap-2 text-center">
                    <HistStat label="Peso" value={`${log.weight}kg`} color="text-white" />
                    <HistStat label="Gordura" value={`${log.bodyFatPercent}%`} color="text-orange-400" />
                    <HistStat label="Magra" value={`${log.muscleMass}kg`} color="text-blue-400" />
                    <HistStat label="IMC" value={`${calculateBMI(log.weight, height)}`} color={bmiColor(calculateBMI(log.weight, height))} />
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

function NumberInput({ label, value, onChange, unit, min, max, step }: {
  label: string; value: number; onChange: (v: number) => void;
  unit: string; min: number; max: number; step: number;
}) {
  return (
    <div className="space-y-1">
      <label className="text-white/50 text-xs">{label}</label>
      <div className="relative">
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          min={min} max={max} step={step}
          className="input pr-14"
        />
        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 text-sm">{unit}</span>
      </div>
    </div>
  );
}

function TrendChange({ label, current, diff, unit, goodDown }: {
  label: string; current: number; diff: number | null; unit: string; goodDown: boolean;
}) {
  const isGood = diff !== null ? (goodDown ? diff <= 0 : diff >= 0) : null;
  return (
    <div className="flex-1 text-center">
      <div className="text-white/30 text-xs mb-1">{label}</div>
      <div className="text-white font-bold text-sm">{current}{unit}</div>
      {diff !== null && diff !== 0 && (
        <div className={cn('text-xs font-semibold flex items-center justify-center gap-0.5 mt-0.5', isGood ? 'text-success' : 'text-danger')}>
          {diff > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          {diff > 0 ? '+' : ''}{diff}{unit}
        </div>
      )}
    </div>
  );
}

function HistStat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div>
      <div className={cn('font-bold text-sm', color)}>{value}</div>
      <div className="text-white/30 text-[10px] mt-0.5">{label}</div>
    </div>
  );
}
