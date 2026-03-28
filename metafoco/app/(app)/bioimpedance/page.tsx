'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { collection, addDoc, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { addXP } from '@/lib/gamification';
import { useUserStore } from '@/store/userStore';
import { calculateBMI, bmiLabel } from '@/lib/calculations';
import { Scale, TrendingDown, TrendingUp, Activity, Brain, Camera, Loader2, Info, Sparkles, Plus, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';
import type { BioimpedanceLog } from '@/types';

// ─── Scientific Formulas ──────────────────────────────────────
// Deurenberg et al. (1991) — validated formula using BMI + age + sex
function deurenbergBodyFat(bmi: number, age: number, sex: string): number {
  const fat = sex === 'male'
    ? 1.2 * bmi + 0.23 * age - 16.2
    : 1.2 * bmi + 0.23 * age - 5.4;
  return Math.max(3, Math.min(60, Math.round(fat * 10) / 10));
}

// Navy circumference formula
function navyBodyFat(sex: string, height: number, waist: number, neck: number, hip = 0): number {
  if (sex === 'female' && hip > 0) {
    const val = 163.205 * Math.log10(waist + hip - neck) - 97.684 * Math.log10(height) - 78.387;
    return Math.max(5, Math.min(60, Math.round(val * 10) / 10));
  }
  const val = 86.010 * Math.log10(waist - neck) - 70.041 * Math.log10(height) + 36.76;
  return Math.max(3, Math.min(60, Math.round(val * 10) / 10));
}

// Boer lean body mass formula
function boerLBM(weight: number, height: number, sex: string): number {
  if (sex === 'male') return Math.round((0.407 * weight + 0.267 * height - 19.2) * 10) / 10;
  return Math.round((0.252 * weight + 0.473 * height - 48.3) * 10) / 10;
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

type Tab = 'formula' | 'photo' | 'history';
type Method = 'deurenberg' | 'navy' | 'manual';

interface FullBioEntry {
  weight: number;
  bodyFatPercent: number;
  muscleMass: number;
  visceralFat: number;
  waterPercent: number;
  boneMass: number;
  bmr: number;
  metabolicAge: number;
}

function NewBioModal({ onClose, onSave, defaultWeight, defaultAge, defaultLbm }: {
  onClose: () => void;
  onSave: (entry: FullBioEntry) => void;
  defaultWeight: number;
  defaultAge: number;
  defaultLbm: number;
}) {
  const [entry, setEntry] = useState<FullBioEntry>({
    weight: defaultWeight,
    bodyFatPercent: 20,
    muscleMass: defaultLbm,
    visceralFat: 8,
    waterPercent: 55,
    boneMass: Math.round(defaultWeight * 0.04 * 10) / 10,
    bmr: 0,
    metabolicAge: defaultAge,
  });
  const [saving, setSaving] = useState(false);

  function field(key: keyof FullBioEntry, label: string, unit: string, min: number, max: number, step = 0.1) {
    return (
      <div className="space-y-1">
        <label className="text-white/50 text-xs">{label}</label>
        <div className="relative">
          <input
            type="number"
            value={entry[key]}
            onChange={(e) => setEntry((p) => ({ ...p, [key]: Number(e.target.value) }))}
            min={min} max={max} step={step}
            className="input pr-14"
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 text-sm">{unit}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end">
      <div className="absolute inset-0 bg-black/80" onClick={onClose} />
      <div className="relative w-full bg-surface-2 rounded-t-3xl max-h-[90vh] overflow-y-auto pb-10">
        <div className="sticky top-0 bg-surface-2 px-5 pt-5 pb-3 flex items-center justify-between border-b border-white/5">
          <div>
            <h2 className="text-white font-bold text-lg">Nova Bioimpedância</h2>
            <p className="text-white/40 text-xs">Digite os dados da sua balança ou aparelho</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full bg-white/10">
            <X className="w-5 h-5 text-white/60" />
          </button>
        </div>

        <div className="px-5 pt-4 space-y-3">
          <div className="bg-primary/5 border border-primary/20 rounded-xl p-3 text-xs text-white/50 leading-relaxed">
            💡 Insira os dados da sua balança de bioimpedância (Xiaomi, Tanita, Withings, etc.) ou de um exame DEXA.
          </div>

          {field('weight',        '⚖️ Peso',               'kg',  30,  300, 0.1)}
          {field('bodyFatPercent','🔴 Gordura corporal',    '%',    3,   60, 0.1)}
          {field('muscleMass',    '💪 Massa muscular',      'kg',  10,  120, 0.1)}
          {field('boneMass',      '🦴 Massa óssea',         'kg',   1,   10, 0.1)}
          {field('waterPercent',  '💧 Água corporal',       '%',   30,   80, 0.1)}
          {field('visceralFat',   '🫀 Gordura visceral',   'pts',  1,   30, 1)}
          {field('bmr',           '🔥 TMB (kcal)',          'kcal', 800, 4000, 10)}
          {field('metabolicAge',  '🧬 Idade metabólica',   'anos', 10,   99, 1)}

          <button
            onClick={async () => {
              setSaving(true);
              try { await onSave(entry); onClose(); }
              catch { /* handled by parent */ }
              finally { setSaving(false); }
            }}
            disabled={saving}
            className="btn-primary w-full flex items-center justify-center gap-2 mt-4"
          >
            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Activity className="w-5 h-5" /> SALVAR ANÁLISE COMPLETA</>}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AnaliseCorpPage() {
  const { profile, updateWeight } = useUserStore();
  const [tab, setTab] = useState<Tab>('formula');
  const [logs, setLogs] = useState<BioimpedanceLog[]>([]);
  const [saving, setSaving] = useState(false);
  const [method, setMethod] = useState<Method>('deurenberg');
  const [showFullModal, setShowFullModal] = useState(false);

  // Measurements
  const [weight, setWeight] = useState(profile?.weight ?? 70);
  const [waist, setWaist] = useState(80);
  const [neck, setNeck] = useState(38);
  const [hip, setHip] = useState(95);
  const [bodyFatManual, setBodyFatManual] = useState(20);

  // Photo AI
  const fileRef = useRef<HTMLInputElement>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [aiResult, setAiResult] = useState<{
    estimatedBodyFat: number;
    confidence: string;
    category: string;
    observations: string;
    recommendation: string;
    deurenbergEstimate: number | null;
    bmi: string;
  } | null>(null);

  const sex    = profile?.sex    ?? 'male';
  const height = profile?.height ?? 170;
  const age    = profile?.age    ?? 25;

  useEffect(() => {
    if (!auth.currentUser) return;
    getDocs(
      query(collection(db, 'bioimpedance_logs', auth.currentUser.uid, 'logs'), orderBy('date', 'desc'), limit(10))
    ).then((snap) => setLogs(snap.docs.map((d) => ({ id: d.id, ...d.data() })) as BioimpedanceLog[]));
  }, []);

  const bmi = useMemo(() => calculateBMI(weight, height), [weight, height]);

  const estimatedFat = useMemo(() => {
    if (method === 'deurenberg') return deurenbergBodyFat(bmi, age, sex);
    if (method === 'navy' && waist > 0 && neck > 0) return navyBodyFat(sex, height, waist, neck, sex === 'female' ? hip : 0);
    return bodyFatManual;
  }, [method, bmi, age, sex, height, waist, neck, hip, bodyFatManual]);

  const lbm = useMemo(() => boerLBM(weight, height, sex), [weight, height, sex]);
  const fatMass = useMemo(() => Math.round((weight * estimatedFat / 100) * 10) / 10, [weight, estimatedFat]);
  const fatInfo = useMemo(() => interpretBodyFat(estimatedFat, sex), [estimatedFat, sex]);

  const latest = logs[0];
  const weightTrend = latest ? Math.round((weight - latest.weight) * 10) / 10 : null;
  const fatTrend    = latest ? Math.round((estimatedFat - latest.bodyFatPercent) * 10) / 10 : null;

  function getRecommendation(): string {
    const goal = profile?.goal ?? 'maintain';
    if (estimatedFat > (sex === 'male' ? 25 : 32)) {
      return goal === 'lose'
        ? `Com ${estimatedFat}% de gordura, você tem ~${fatMass}kg a reduzir. Déficit de 500 kcal/dia + treino de força 3x/semana é o caminho mais eficiente.`
        : 'Recomendamos focar em recomposição antes do ganho de massa pura.';
    }
    if (estimatedFat < (sex === 'male' ? 14 : 21)) {
      return 'Percentual atlético! Mantenha a proteína alta (2g/kg) e durma bem para preservar a massa magra.';
    }
    return 'Boa composição corporal. Continue consistente com alimentação e treinos. Monitore semanalmente.';
  }

  async function saveFullLog(entry: FullBioEntry) {
    if (!auth.currentUser) return;
    const today = new Date().toISOString().split('T')[0];
    const ref = await addDoc(collection(db, 'bioimpedance_logs', auth.currentUser.uid, 'logs'), {
      userId: auth.currentUser.uid,
      date: today,
      weight: entry.weight,
      bodyFatPercent: entry.bodyFatPercent,
      muscleMass: entry.muscleMass,
      visceralFat: entry.visceralFat,
      waterPercent: entry.waterPercent,
      metabolicAge: entry.metabolicAge,
      bmr: entry.bmr,
      source: 'manual' as const,
      createdAt: new Date(),
    });
    setLogs((prev) => [{
      id: ref.id,
      userId: auth.currentUser!.uid,
      date: today,
      weight: entry.weight,
      bodyFatPercent: entry.bodyFatPercent,
      muscleMass: entry.muscleMass,
      visceralFat: entry.visceralFat,
      waterPercent: entry.waterPercent,
      metabolicAge: entry.metabolicAge,
      bmr: entry.bmr,
      source: 'manual',
      createdAt: new Date(),
    }, ...prev]);
    updateWeight(entry.weight);
    await addXP(auth.currentUser.uid, 'bioimpedance_logged');
    toast.success('Bioimpedância completa salva! +25 XP 📊');
  }

  async function saveLog() {
    if (!auth.currentUser) return;
    setSaving(true);
    const today = new Date().toISOString().split('T')[0];
    try {
      const ref = await addDoc(collection(db, 'bioimpedance_logs', auth.currentUser.uid, 'logs'), {
        userId: auth.currentUser.uid,
        date: today,
        weight,
        bodyFatPercent: estimatedFat,
        muscleMass: lbm,
        visceralFat: 5,
        waterPercent: 55,
        metabolicAge: age,
        bmr: 0,
        source: 'manual' as const,
        createdAt: new Date(),
      });
      setLogs((prev) => [{ id: ref.id, userId: auth.currentUser!.uid, date: today, weight, bodyFatPercent: estimatedFat, muscleMass: lbm, visceralFat: 5, waterPercent: 55, metabolicAge: age, bmr: 0, source: 'manual', createdAt: new Date() }, ...prev]);
      updateWeight(weight);
      await addXP(auth.currentUser.uid, 'bioimpedance_logged');
      toast.success('Análise salva! +25 XP 📊');
    } catch {
      toast.error('Erro ao salvar.');
    } finally {
      setSaving(false);
    }
  }

  async function handlePhotoAnalysis(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setAnalyzing(true);
    setAiResult(null);

    const reader = new FileReader();
    reader.onload = async (ev) => {
      const dataUrl = ev.target?.result as string;
      setPhotoPreview(dataUrl);
      const base64 = dataUrl.split(',')[1];
      const mimeType = file.type;

      try {
        const res = await fetch('/api/analyze-body', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageBase64: base64, mimeType, weight, height, age, sex }),
        });
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        setAiResult(data);
        toast.success('Análise concluída pela IA! 🤖');
      } catch {
        // Fallback: use Deurenberg
        const fat = deurenbergBodyFat(bmi, age, sex);
        setAiResult({
          estimatedBodyFat: fat,
          confidence: 'medium',
          category: interpretBodyFat(fat, sex).label,
          observations: 'Análise baseada em dados corporais (fórmula Deurenberg).',
          recommendation: getRecommendation(),
          deurenbergEstimate: fat,
          bmi: String(bmi),
        });
        toast('Análise por dados corporais (IA indisponível).', { icon: 'ℹ️' });
      } finally {
        setAnalyzing(false);
      }
    };
    reader.readAsDataURL(file);
  }

  const TABS: { key: Tab; label: string; emoji: string }[] = [
    { key: 'formula', label: 'Fórmulas', emoji: '📐' },
    { key: 'photo',   label: 'Foto IA',   emoji: '📸' },
    { key: 'history', label: 'Histórico', emoji: '📈' },
  ];

  return (
    <div className="min-h-screen bg-black pb-24">
      {showFullModal && (
        <NewBioModal
          onClose={() => setShowFullModal(false)}
          onSave={saveFullLog}
          defaultWeight={weight}
          defaultAge={age}
          defaultLbm={lbm}
        />
      )}

      <div className="px-5 pt-12 pb-4">
        <div className="flex items-center justify-between mb-0.5">
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-primary" />
            <h1 className="section-title text-2xl">Análise Corporal</h1>
          </div>
          <button
            onClick={() => setShowFullModal(true)}
            className="flex items-center gap-1.5 bg-primary text-black text-xs font-bold px-3 py-2 rounded-xl active:scale-95 transition-transform"
          >
            <Plus className="w-4 h-4" /> Nova Análise
          </button>
        </div>
        <p className="text-white/40 text-sm">Cálculos científicos + IA visual</p>
      </div>

      {/* Tabs */}
      <div className="px-5 mb-4">
        <div className="flex bg-surface rounded-2xl p-1 gap-1">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={cn(
                'flex-1 py-2 rounded-xl text-xs font-semibold transition-all',
                tab === t.key ? 'bg-primary text-black' : 'text-white/40 hover:text-white/60'
              )}
            >
              {t.emoji} {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── FÓRMULAS TAB ── */}
      {tab === 'formula' && (
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
              <div className="text-xs text-white/40 mb-1">Massa magra (Boer)</div>
              <div className="text-2xl font-bold text-blue-400">{lbm}kg</div>
              <div className="text-xs text-white/40">músculo + osso + água</div>
            </div>
            <div className="card">
              <div className="text-xs text-white/40 mb-1">Massa gorda</div>
              <div className="text-2xl font-bold text-orange-400">{fatMass}kg</div>
              <div className="text-xs text-white/40">gordura total estimada</div>
            </div>
          </div>

          {/* Trends */}
          {latest && (
            <div className="card flex items-center gap-4">
              <TrendItem label="Peso" current={weight} diff={weightTrend} unit="kg" goodDown />
              <div className="w-px h-10 bg-white/10" />
              <TrendItem label="Gordura" current={estimatedFat} diff={fatTrend} unit="%" goodDown />
              <div className="w-px h-10 bg-white/10" />
              <TrendItem label="Magra" current={lbm} diff={latest ? Math.round((lbm - latest.muscleMass) * 10) / 10 : null} unit="kg" goodDown={false} />
            </div>
          )}

          {/* Method selector */}
          <div className="card space-y-3">
            <div className="flex items-center gap-2">
              <Scale className="w-4 h-4 text-primary" />
              <span className="text-white font-semibold text-sm">Método de cálculo</span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {([
                { key: 'deurenberg', label: 'IMC+Idade', emoji: '📊' },
                { key: 'navy',       label: 'Circunf.', emoji: '📏' },
                { key: 'manual',     label: 'Manual',    emoji: '✏️' },
              ] as { key: Method; label: string; emoji: string }[]).map((m) => (
                <button
                  key={m.key}
                  onClick={() => setMethod(m.key)}
                  className={cn(
                    'py-2 rounded-xl text-xs font-semibold border transition-all',
                    method === m.key ? 'bg-primary/15 border-primary text-primary' : 'border-white/10 text-white/40'
                  )}
                >
                  {m.emoji}<br />{m.label}
                </button>
              ))}
            </div>

            {/* Weight always shown */}
            <NumberInput label="Peso atual" value={weight} onChange={setWeight} unit="kg" min={30} max={300} step={0.1} />

            {/* Deurenberg: uses profile data (height, age, sex) — nothing extra needed */}
            {method === 'deurenberg' && (
              <div className="bg-primary/5 border border-primary/20 rounded-xl p-3 text-xs text-white/50 leading-relaxed">
                <strong className="text-white/70">Fórmula Deurenberg (1991)</strong><br />
                BF% = 1.2 × IMC + 0.23 × idade − {sex === 'male' ? '16.2' : '5.4'}<br />
                Usa seu IMC ({bmi}), idade ({age} anos) e sexo. Precisão ±3-5%.
              </div>
            )}

            {/* Navy: needs waist, neck (+ hip for female) */}
            {method === 'navy' && (
              <>
                <NumberInput label="Circunferência do pescoço" value={neck}  onChange={setNeck}  unit="cm" min={25} max={60}  step={0.5} />
                <NumberInput label="Circunferência da cintura" value={waist} onChange={setWaist} unit="cm" min={50} max={180} step={0.5} />
                {sex === 'female' && (
                  <NumberInput label="Circunferência do quadril" value={hip} onChange={setHip} unit="cm" min={60} max={180} step={0.5} />
                )}
                <div className="text-white/30 text-xs text-center">Meça na parte mais estreita (pescoço) e na altura do umbigo (cintura)</div>
              </>
            )}

            {method === 'manual' && (
              <NumberInput label="% Gordura corporal (balança/DEXA)" value={bodyFatManual} onChange={setBodyFatManual} unit="%" min={3} max={60} step={0.1} />
            )}

            <button
              onClick={saveLog}
              disabled={saving}
              className={cn('btn-primary w-full flex items-center justify-center gap-2', saving && 'opacity-60')}
            >
              {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Activity className="w-5 h-5" /> SALVAR ANÁLISE</>}
            </button>
          </div>

          {/* Recommendation */}
          <div className="card" style={{ borderColor: 'rgba(255,215,0,0.15)', background: 'rgba(255,215,0,0.03)' }}>
            <div className="flex items-start gap-3">
              <span className="text-xl mt-0.5">🤖</span>
              <div>
                <div className="text-primary text-xs font-bold uppercase tracking-wider mb-1">Recomendação</div>
                <p className="text-white/70 text-sm leading-relaxed">{getRecommendation()}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── FOTO IA TAB ── */}
      {tab === 'photo' && (
        <div className="px-5 space-y-4">
          <div className="card-highlight space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-white font-semibold text-sm">Análise visual por IA</span>
            </div>
            <p className="text-white/40 text-xs leading-relaxed">
              Envie uma foto sua (de frente ou lateral, roupa justa) e o Claude vai estimar a porcentagem de gordura corporal combinando a imagem com seus dados de altura, peso e idade.
            </p>

            <div className="bg-primary/5 border border-primary/20 rounded-xl p-3 text-xs text-white/50">
              Dados usados: {weight}kg · {height}cm · {age} anos · {sex === 'male' ? 'Masc.' : 'Fem.'} · IMC {bmi}
            </div>

            {/* Photo upload area */}
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoAnalysis} />

            {!photoPreview ? (
              <button
                onClick={() => fileRef.current?.click()}
                className="w-full border-2 border-dashed border-white/15 rounded-2xl py-12 flex flex-col items-center gap-3 hover:border-primary/40 transition-colors"
              >
                <Camera className="w-10 h-10 text-white/20" />
                <div className="text-white/40 text-sm">Toque para escolher foto</div>
                <div className="text-white/20 text-xs">JPG ou PNG</div>
              </button>
            ) : (
              <div className="relative rounded-2xl overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={photoPreview} alt="Sua foto" className="w-full max-h-72 object-cover" />
                {analyzing && (
                  <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center gap-3">
                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                    <p className="text-white text-sm">Analisando com IA...</p>
                  </div>
                )}
                {!analyzing && (
                  <button
                    onClick={() => { setPhotoPreview(null); setAiResult(null); }}
                    className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-lg"
                  >
                    Trocar foto
                  </button>
                )}
              </div>
            )}
          </div>

          {/* AI Result */}
          {aiResult && !analyzing && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="card text-center">
                  <div className="text-xs text-white/40 mb-1">Gordura estimada</div>
                  <div className={cn('text-3xl font-bold', interpretBodyFat(aiResult.estimatedBodyFat, sex).color)}>
                    {aiResult.estimatedBodyFat}%
                  </div>
                  <div className={cn('text-xs', interpretBodyFat(aiResult.estimatedBodyFat, sex).color)}>
                    {aiResult.category}
                  </div>
                </div>
                <div className="card text-center">
                  <div className="text-xs text-white/40 mb-1">Confiança</div>
                  <div className={cn('text-2xl font-bold', aiResult.confidence === 'high' ? 'text-success' : aiResult.confidence === 'medium' ? 'text-primary' : 'text-orange-400')}>
                    {aiResult.confidence === 'high' ? 'Alta' : aiResult.confidence === 'medium' ? 'Média' : 'Baixa'}
                  </div>
                  <div className="text-xs text-white/40">IMC: {aiResult.bmi}</div>
                </div>
              </div>

              <div className="card space-y-2">
                <div className="text-primary text-xs font-bold uppercase tracking-wider">Observações da IA</div>
                <p className="text-white/70 text-sm leading-relaxed">{aiResult.observations}</p>
              </div>

              <div className="card" style={{ borderColor: 'rgba(255,215,0,0.15)', background: 'rgba(255,215,0,0.03)' }}>
                <div className="text-primary text-xs font-bold uppercase tracking-wider mb-1">Recomendação</div>
                <p className="text-white/70 text-sm leading-relaxed">{aiResult.recommendation}</p>
              </div>

              <button
                onClick={async () => {
                  if (!auth.currentUser) return;
                  setSaving(true);
                  try {
                    const today = new Date().toISOString().split('T')[0];
                    const ref = await addDoc(collection(db, 'bioimpedance_logs', auth.currentUser.uid, 'logs'), {
                      userId: auth.currentUser.uid,
                      date: today,
                      weight,
                      bodyFatPercent: aiResult.estimatedBodyFat,
                      muscleMass: boerLBM(weight, height, sex),
                      visceralFat: 5,
                      waterPercent: 55,
                      metabolicAge: age,
                      bmr: 0,
                      source: 'manual' as const,
                      createdAt: new Date(),
                    });
                    updateWeight(weight);
                    await addXP(auth.currentUser.uid, 'bioimpedance_logged');
                    toast.success('Análise da IA salva! +25 XP 📊');
                  } catch { toast.error('Erro ao salvar.'); }
                  finally { setSaving(false); }
                }}
                disabled={saving}
                className={cn('btn-primary w-full flex items-center justify-center gap-2', saving && 'opacity-60')}
              >
                {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Activity className="w-5 h-5" /> SALVAR RESULTADO</>}
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── HISTÓRICO TAB ── */}
      {tab === 'history' && (
        <div className="px-5 space-y-3">
          {logs.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-4xl mb-3">📊</div>
              <p className="text-white/40 text-sm">Nenhum registro ainda.</p>
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
                    <div><div className="font-bold text-sm text-white">{log.weight}kg</div><div className="text-white/30 text-[10px]">Peso</div></div>
                    <div><div className="font-bold text-sm text-orange-400">{log.bodyFatPercent}%</div><div className="text-white/30 text-[10px]">Gordura</div></div>
                    <div><div className="font-bold text-sm text-blue-400">{log.muscleMass}kg</div><div className="text-white/30 text-[10px]">Magra</div></div>
                    <div><div className={cn('font-bold text-sm', bmiColor(calculateBMI(log.weight, height)))}>{calculateBMI(log.weight, height)}</div><div className="text-white/30 text-[10px]">IMC</div></div>
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
        <input type="number" value={value} onChange={(e) => onChange(Number(e.target.value))}
          min={min} max={max} step={step} className="input pr-14" />
        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 text-sm">{unit}</span>
      </div>
    </div>
  );
}

function TrendItem({ label, current, diff, unit, goodDown }: {
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
