'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { useUserStore } from '@/store/userStore';
import { calculateUserMetrics, calculateBMI, bmiLabel } from '@/lib/calculations';
import { Logo } from '@/components/logo/Logo';
import { cn } from '@/lib/utils';
import { ChevronRight, ChevronLeft, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import type { Sex, Goal, ActivityLevel, DietProtocol, FastingProtocol, UserProfile } from '@/types';

const TOTAL_STEPS = 7;

interface OnboardingData {
  name: string;
  sex: Sex;
  age: number;
  height: number;
  weight: number;
  targetWeight: number;
  goal: Goal;
  activityLevel: ActivityLevel;
  restrictions: string[];
  dietProtocol: DietProtocol;
  fastingProtocol: FastingProtocol;
}

const defaultData: OnboardingData = {
  name: '',
  sex: 'male',
  age: 25,
  height: 170,
  weight: 75,
  targetWeight: 70,
  goal: 'lose',
  activityLevel: 'light',
  restrictions: [],
  dietProtocol: 'standard',
  fastingProtocol: '16:8',
};

export default function OnboardingPage() {
  const router = useRouter();
  const { setProfile, setMetrics } = useUserStore();
  const [step, setStep] = useState(0);
  const [data, setData] = useState<OnboardingData>({
    ...defaultData,
    name: auth.currentUser?.displayName ?? '',
  });
  const [loading, setLoading] = useState(false);

  const progress = ((step + 1) / TOTAL_STEPS) * 100;

  function update<K extends keyof OnboardingData>(key: K, value: OnboardingData[K]) {
    setData((prev) => ({ ...prev, [key]: value }));
  }

  function toggleRestriction(r: string) {
    setData((prev) => ({
      ...prev,
      restrictions: prev.restrictions.includes(r)
        ? prev.restrictions.filter((x) => x !== r)
        : [...prev.restrictions, r],
    }));
  }

  function next() { if (step < TOTAL_STEPS - 1) setStep((s) => s + 1); }
  function back() { if (step > 0) setStep((s) => s - 1); }

  async function finish() {
    const uid = auth.currentUser?.uid;
    if (!uid) {
      toast.error('Sessão expirada. Faça login novamente.');
      router.replace('/login');
      return;
    }
    setLoading(true);

    const profile: UserProfile = {
      uid,
      email: auth.currentUser?.email ?? '',
      name: data.name || auth.currentUser?.displayName || 'Usuário',
      sex: data.sex,
      age: data.age,
      height: data.height,
      weight: data.weight,
      targetWeight: data.targetWeight,
      goal: data.goal,
      activityLevel: data.activityLevel,
      restrictions: data.restrictions,
      dietProtocol: data.dietProtocol,
      fastingProtocol: data.fastingProtocol,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const metrics = calculateUserMetrics(profile);

    // Save to local store FIRST — user goes to dashboard regardless of network
    setProfile(profile);
    setMetrics(metrics);

    try {
      // setDoc with merge is safer than updateDoc (works even if doc doesn't exist)
      // 6s timeout — if Firestore is slow, proceed anyway
      await Promise.race([
        setDoc(doc(db, 'users', uid), { profile, metrics, updatedAt: new Date() }, { merge: true }),
        new Promise<void>((_, reject) => setTimeout(() => reject(new Error('timeout')), 6000)),
      ]);
    } catch {
      // Silently continue — data is already in local store
    }

    toast.success('Perfil criado! Hora de focar. 🔥');
    router.replace('/dashboard');
  }

  const steps = [
    <StepName key="name" data={data} update={update} />,
    <StepBodyBasics key="body" data={data} update={update} />,
    <StepGoal key="goal" data={data} update={update} />,
    <StepActivity key="activity" data={data} update={update} />,
    <StepRestrictions key="restrictions" data={data} toggleRestriction={toggleRestriction} />,
    <StepProtocol key="protocol" data={data} update={update} />,
    <StepSummary key="summary" data={data} />,
  ];

  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* Progress bar */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <div className="h-1 bg-white/10">
          <motion.div
            className="h-full bg-primary"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          />
        </div>
      </div>

      <div className="flex-1 flex flex-col px-6 pt-10 pb-8 max-w-md mx-auto w-full">
        <div className="flex items-center justify-between mb-6 mt-4">
          <Logo size="sm" />
          <span className="text-white/30 text-sm font-mono">{step + 1}/{TOTAL_STEPS}</span>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="flex-1"
          >
            {steps[step]}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex gap-3 mt-8">
          {step > 0 && (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={back}
              className="btn-outline flex items-center gap-1 px-4"
            >
              <ChevronLeft className="w-4 h-4" /> Voltar
            </motion.button>
          )}
          <motion.button
            whileTap={{ scale: loading ? 1 : 0.97 }}
            onClick={step === TOTAL_STEPS - 1 ? finish : next}
            disabled={loading}
            className={cn(
              'btn-primary flex-1 flex items-center justify-center gap-2',
              loading && 'opacity-70 pointer-events-none'
            )}
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
            ) : step === TOTAL_STEPS - 1 ? (
              <><Check className="w-5 h-5" /> COMEÇAR</>
            ) : (
              <>PRÓXIMO <ChevronRight className="w-4 h-4" /></>
            )}
          </motion.button>
        </div>
      </div>
    </div>
  );
}

// ─── Steps ────────────────────────────────────────────────────

function StepName({ data, update }: { data: OnboardingData; update: any }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="section-title text-3xl">Olá! Qual seu nome?</h2>
        <p className="text-white/40 text-sm mt-1">Vamos personalizar sua experiência.</p>
      </div>
      <input
        type="text"
        value={data.name}
        onChange={(e) => update('name', e.target.value)}
        placeholder="Seu nome"
        className="input text-lg"
        autoFocus
      />
      <div className="text-center text-5xl pt-4">👋</div>
    </div>
  );
}

function StepBodyBasics({ data, update }: { data: OnboardingData; update: any }) {
  const bmi = data.weight > 0 && data.height > 0 ? calculateBMI(data.weight, data.height) : null;
  const deficit = data.targetWeight < data.weight ? Math.round((data.weight - data.targetWeight) * 7700) : 0;
  const weeksToGoal = deficit > 0 ? Math.ceil(deficit / (500 * 7)) : 0;

  return (
    <div className="space-y-5">
      <div>
        <h2 className="section-title text-3xl">Seu corpo</h2>
        <p className="text-white/40 text-sm mt-1">Dados para calcular seus macros com precisão.</p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {(['male', 'female'] as Sex[]).map((s) => (
          <motion.button
            key={s}
            whileTap={{ scale: 0.95 }}
            onClick={() => update('sex', s)}
            className={cn(
              'py-3 rounded-xl font-semibold transition-all border text-sm',
              data.sex === s ? 'bg-primary text-black border-primary' : 'bg-surface border-white/10 text-white/60'
            )}
          >
            {s === 'male' ? '♂ Masculino' : '♀ Feminino'}
          </motion.button>
        ))}
      </div>

      {([
        { key: 'age',          label: 'Idade',         unit: 'anos', min: 12,  max: 80,  step: 1   },
        { key: 'height',       label: 'Altura',         unit: 'cm',   min: 140, max: 220, step: 1   },
        { key: 'weight',       label: 'Peso atual',     unit: 'kg',   min: 30,  max: 300, step: 0.1 },
        { key: 'targetWeight', label: 'Peso desejado',  unit: 'kg',   min: 30,  max: 300, step: 0.1 },
      ] as const).map(({ key, label, unit, min, max, step }) => (
        <div key={key} className="space-y-1">
          <label className="text-white/60 text-xs">{label}</label>
          <div className="relative">
            <input
              type="number"
              value={data[key]}
              onChange={(e) => update(key, Number(e.target.value))}
              min={min} max={max} step={step}
              className="input pr-12"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 text-sm">{unit}</span>
          </div>
        </div>
      ))}

      {bmi && (
        <div className="bg-surface rounded-xl p-3 flex items-center justify-between">
          <span className="text-white/40 text-sm">IMC estimado</span>
          <span className="text-primary font-bold">{bmi} — {bmiLabel(bmi)}</span>
        </div>
      )}

      {weeksToGoal > 0 && (
        <div className="bg-primary/10 border border-primary/20 rounded-xl p-3 text-center">
          <span className="text-primary text-sm font-semibold">
            Meta em ~{weeksToGoal} semanas com déficit de 500 kcal/dia 🎯
          </span>
        </div>
      )}
    </div>
  );
}

function StepGoal({ data, update }: { data: OnboardingData; update: any }) {
  const goals: { value: Goal; label: string; emoji: string; desc: string; color: string }[] = [
    { value: 'lose',     label: 'Déficit calórico',  emoji: '🔥', desc: 'Queimar mais do que consumir — secar e definir', color: 'border-orange-500/50 bg-orange-500/5' },
    { value: 'gain',     label: 'Superávit calórico', emoji: '💪', desc: 'Consumir mais para ganhar músculo e força',      color: 'border-blue-500/50 bg-blue-500/5' },
    { value: 'maintain', label: 'Manutenção',         emoji: '⚖️', desc: 'Equilibrar peso e melhorar composição corporal', color: 'border-green-500/50 bg-green-500/5' },
  ];
  return (
    <div className="space-y-6">
      <div>
        <h2 className="section-title text-3xl">Seu objetivo</h2>
        <p className="text-white/40 text-sm mt-1">Isso define suas calorias e macros.</p>
      </div>
      <div className="space-y-3">
        {goals.map((g) => (
          <motion.button
            key={g.value}
            whileTap={{ scale: 0.98 }}
            onClick={() => update('goal', g.value)}
            className={cn(
              'w-full p-4 rounded-2xl flex items-center gap-4 transition-all border text-left',
              data.goal === g.value ? g.color + ' border-opacity-100 text-white' : 'bg-surface border-white/10 text-white/60'
            )}
          >
            <span className="text-3xl">{g.emoji}</span>
            <div className="flex-1">
              <div className="font-bold">{g.label}</div>
              <div className="text-xs opacity-60 mt-0.5">{g.desc}</div>
            </div>
            {data.goal === g.value && <Check className="w-5 h-5 text-primary ml-auto flex-shrink-0" />}
          </motion.button>
        ))}
      </div>
    </div>
  );
}

function StepActivity({ data, update }: { data: OnboardingData; update: any }) {
  const levels: { value: ActivityLevel; label: string; desc: string; emoji: string }[] = [
    { value: 'sedentary',   label: 'Sedentário',          desc: 'Trabalho sentado, sem exercícios', emoji: '🪑' },
    { value: 'light',       label: 'Levemente ativo',     desc: '1–3x por semana',                  emoji: '🚶' },
    { value: 'moderate',    label: 'Moderado',            desc: '3–5x por semana',                  emoji: '🏃' },
    { value: 'active',      label: 'Muito ativo',         desc: '6–7x por semana',                  emoji: '🏋️' },
    { value: 'very_active', label: 'Extremamente ativo',  desc: '2x ao dia ou trabalho pesado',     emoji: '⚡' },
  ];
  return (
    <div className="space-y-6">
      <div>
        <h2 className="section-title text-3xl">Nível de atividade</h2>
        <p className="text-white/40 text-sm mt-1">Seja honesto. Isso impacta diretamente suas calorias.</p>
      </div>
      <div className="space-y-2">
        {levels.map((l) => (
          <motion.button
            key={l.value}
            whileTap={{ scale: 0.98 }}
            onClick={() => update('activityLevel', l.value)}
            className={cn(
              'w-full p-3 rounded-xl flex items-center gap-3 transition-all border text-left',
              data.activityLevel === l.value ? 'bg-primary/10 border-primary text-white' : 'bg-surface border-white/10 text-white/60'
            )}
          >
            <span className="text-xl">{l.emoji}</span>
            <div className="flex-1">
              <div className="font-semibold text-sm">{l.label}</div>
              <div className="text-xs opacity-50">{l.desc}</div>
            </div>
            {data.activityLevel === l.value && <Check className="w-4 h-4 text-primary" />}
          </motion.button>
        ))}
      </div>
    </div>
  );
}

function StepRestrictions({ data, toggleRestriction }: { data: OnboardingData; toggleRestriction: (r: string) => void }) {
  const options = [
    { label: 'Vegetariano', emoji: '🥦' },
    { label: 'Vegano', emoji: '🌱' },
    { label: 'Sem glúten', emoji: '🌾' },
    { label: 'Sem lactose', emoji: '🥛' },
    { label: 'Low carb', emoji: '📉' },
    { label: 'Diabético', emoji: '💉' },
    { label: 'Nenhuma', emoji: '✅' },
  ];
  return (
    <div className="space-y-6">
      <div>
        <h2 className="section-title text-3xl">Restrições</h2>
        <p className="text-white/40 text-sm mt-1">Selecione as que se aplicam a você.</p>
      </div>
      <div className="flex flex-wrap gap-2">
        {options.map(({ label, emoji }) => (
          <motion.button
            key={label}
            whileTap={{ scale: 0.93 }}
            onClick={() => toggleRestriction(label)}
            className={cn(
              'px-4 py-2 rounded-full border text-sm font-medium transition-all flex items-center gap-1.5',
              data.restrictions.includes(label) ? 'bg-primary text-black border-primary' : 'bg-surface border-white/20 text-white/60'
            )}
          >
            {emoji} {label}
          </motion.button>
        ))}
      </div>
    </div>
  );
}

function StepProtocol({ data, update }: { data: OnboardingData; update: any }) {
  const protocols: { value: FastingProtocol; label: string; desc: string; emoji: string }[] = [
    { value: '14:10', label: '14:10', desc: 'Jejum 14h — ideal para iniciantes', emoji: '🌙' },
    { value: '16:8',  label: '16:8',  desc: 'Jejum 16h — o mais popular',        emoji: '⭐' },
    { value: '18:6',  label: '18:6',  desc: 'Jejum 18h — avançado',              emoji: '🔥' },
    { value: '20:4',  label: '20:4',  desc: 'Jejum 20h — guerreiro',             emoji: '⚡' },
  ];
  return (
    <div className="space-y-6">
      <div>
        <h2 className="section-title text-3xl">Protocolo de jejum</h2>
        <p className="text-white/40 text-sm mt-1">Você pode mudar a qualquer momento.</p>
      </div>
      <div className="space-y-2">
        {protocols.map((p) => (
          <motion.button
            key={p.value}
            whileTap={{ scale: 0.98 }}
            onClick={() => update('fastingProtocol', p.value)}
            className={cn(
              'w-full p-3 rounded-xl flex items-center gap-3 transition-all border text-left',
              data.fastingProtocol === p.value ? 'bg-primary/10 border-primary text-white' : 'bg-surface border-white/10 text-white/60'
            )}
          >
            <span className="text-xl">{p.emoji}</span>
            <div className="flex-1">
              <span className="font-display text-xl text-primary font-bold">{p.label}</span>
              <div className="text-xs opacity-60 mt-0.5">{p.desc}</div>
            </div>
            {data.fastingProtocol === p.value && <Check className="w-4 h-4 text-primary" />}
          </motion.button>
        ))}
      </div>
    </div>
  );
}

function StepSummary({ data }: { data: OnboardingData }) {
  const profile = { ...data, uid: '', email: '', createdAt: new Date(), updatedAt: new Date() } as UserProfile;
  const metrics = calculateUserMetrics(profile);
  const bmi = calculateBMI(data.weight, data.height);
  const deficit = metrics.tdee - metrics.targetCalories;
  const goalLabels: Record<Goal, string> = { lose: 'Déficit calórico 🔥', gain: 'Superávit calórico 💪', maintain: 'Manutenção ⚖️' };

  const cards = [
    { label: 'Calorias/dia',  value: `${metrics.targetCalories}`, unit: 'kcal', emoji: '🔥', color: 'text-primary' },
    { label: 'Proteína/dia',  value: `${metrics.targetProtein}`,  unit: 'g',    emoji: '💪', color: 'text-blue-400' },
    { label: 'Carbs/dia',     value: `${metrics.targetCarbs}`,    unit: 'g',    emoji: '🍚', color: 'text-orange-400' },
    { label: 'Gordura/dia',   value: `${metrics.targetFat}`,      unit: 'g',    emoji: '🥑', color: 'text-yellow-400' },
    { label: 'TMB',           value: `${metrics.bmr}`,            unit: 'kcal', emoji: '⚡', color: 'text-green-400' },
    { label: 'IMC',           value: `${bmi}`,                    unit: '',     emoji: '📊', color: 'text-white' },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h2 className="section-title text-3xl">Tudo pronto,</h2>
        <p className="text-primary text-2xl font-display font-bold">{data.name || 'Guerreiro'}!</p>
        <p className="text-white/40 text-sm mt-1">Seus números personalizados:</p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {cards.map((item) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="card text-center py-3"
          >
            <div className="text-2xl mb-1">{item.emoji}</div>
            <div className={cn('font-bold text-lg leading-none', item.color)}>
              {item.value}<span className="text-xs font-normal text-white/30 ml-0.5">{item.unit}</span>
            </div>
            <div className="text-white/40 text-xs mt-0.5">{item.label}</div>
          </motion.div>
        ))}
      </div>

      <div className="card border-primary/20 bg-primary/5">
        <div className="text-center">
          <div className="text-primary font-bold text-sm">{goalLabels[data.goal]}</div>
          {deficit > 0 && (
            <div className="text-white/50 text-xs mt-0.5">
              {deficit} kcal/dia de déficit · meta: {data.targetWeight}kg
            </div>
          )}
          {deficit < 0 && (
            <div className="text-white/50 text-xs mt-0.5">
              {Math.abs(deficit)} kcal/dia de superávit · meta: {data.targetWeight}kg
            </div>
          )}
        </div>
      </div>

      <div className="card-highlight">
        <p className="text-white/70 text-sm text-center italic">
          "Não precisa ser perfeito. Só consistente." 🎯
        </p>
      </div>
    </div>
  );
}
