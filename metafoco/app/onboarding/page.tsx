'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { doc, updateDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { useUserStore } from '@/store/userStore';
import { calculateUserMetrics, calculateBMR, calculateTDEE, suggestFastingProtocol } from '@/lib/calculations';
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
  const [data, setData] = useState<OnboardingData>(defaultData);
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

  function next() {
    if (step < TOTAL_STEPS - 1) setStep((s) => s + 1);
  }
  function back() {
    if (step > 0) setStep((s) => s - 1);
  }

  async function finish() {
    const uid = auth.currentUser?.uid;
    if (!uid) return;
    setLoading(true);
    try {
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

      await updateDoc(doc(db, 'users', uid), { profile, metrics });

      setProfile(profile);
      setMetrics(metrics);

      toast.success('Perfil criado! Hora de focar. 🔥');
      router.replace('/dashboard');
    } catch {
      toast.error('Erro ao salvar perfil. Tente novamente.');
    } finally {
      setLoading(false);
    }
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
      <div className="fixed top-0 left-0 right-0 z-50 safe-top">
        <div className="h-1 bg-white/10">
          <motion.div
            className="h-full bg-primary"
            initial={false}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>
      </div>

      <div className="flex-1 flex flex-col px-6 pt-10 pb-8 max-w-md mx-auto w-full">
        {/* Step indicator */}
        <div className="flex items-center justify-between mb-6 mt-4">
          <Logo size="sm" />
          <span className="text-white/30 text-sm font-mono">{step + 1}/{TOTAL_STEPS}</span>
        </div>

        {/* Step content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
            className="flex-1"
          >
            {steps[step]}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex gap-3 mt-8">
          {step > 0 && (
            <button onClick={back} className="btn-outline flex items-center gap-1 px-4">
              <ChevronLeft className="w-4 h-4" /> Voltar
            </button>
          )}
          <button
            onClick={step === TOTAL_STEPS - 1 ? finish : next}
            disabled={loading}
            className={cn(
              'btn-primary flex-1 flex items-center justify-center gap-2',
              loading && 'opacity-60 pointer-events-none'
            )}
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
            ) : step === TOTAL_STEPS - 1 ? (
              <><Check className="w-5 h-5" /> COMEÇAR</>
            ) : (
              <>PRÓXIMO <ChevronRight className="w-4 h-4" /></>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Step Components ──────────────────────────────────────────

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
    </div>
  );
}

function StepBodyBasics({ data, update }: { data: OnboardingData; update: any }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="section-title text-3xl">Seu corpo</h2>
        <p className="text-white/40 text-sm mt-1">Precisamos dos dados para calcular seus macros.</p>
      </div>

      {/* Sex */}
      <div className="space-y-2">
        <label className="text-white/60 text-sm">Sexo biológico</label>
        <div className="grid grid-cols-2 gap-2">
          {(['male', 'female'] as Sex[]).map((s) => (
            <button
              key={s}
              onClick={() => update('sex', s)}
              className={cn(
                'py-3 rounded-xl font-semibold transition-all border',
                data.sex === s
                  ? 'bg-primary text-black border-primary'
                  : 'bg-surface border-white/10 text-white/60'
              )}
            >
              {s === 'male' ? 'Masculino' : 'Feminino'}
            </button>
          ))}
        </div>
      </div>

      {/* Age, Height, Weight, Target */}
      {([
        { key: 'age',          label: 'Idade',          unit: 'anos', min: 12, max: 80 },
        { key: 'height',       label: 'Altura',          unit: 'cm',   min: 140, max: 220 },
        { key: 'weight',       label: 'Peso atual',      unit: 'kg',   min: 30, max: 300 },
        { key: 'targetWeight', label: 'Peso desejado',   unit: 'kg',   min: 30, max: 300 },
      ] as const).map(({ key, label, unit, min, max }) => (
        <div key={key} className="space-y-1">
          <label className="text-white/60 text-sm">{label}</label>
          <div className="relative">
            <input
              type="number"
              value={data[key]}
              onChange={(e) => update(key, Number(e.target.value))}
              min={min}
              max={max}
              className="input pr-12"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 text-sm">{unit}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function StepGoal({ data, update }: { data: OnboardingData; update: any }) {
  const goals: { value: Goal; label: string; emoji: string; desc: string }[] = [
    { value: 'lose',     label: 'Secar',         emoji: '🔥', desc: 'Reduzir gordura e definir' },
    { value: 'gain',     label: 'Ganhar massa',   emoji: '💪', desc: 'Aumentar músculo e força' },
    { value: 'maintain', label: 'Manter',         emoji: '⚖️', desc: 'Equilibrar peso e composição' },
  ];
  return (
    <div className="space-y-6">
      <div>
        <h2 className="section-title text-3xl">Seu objetivo</h2>
        <p className="text-white/40 text-sm mt-1">O app vai ajustar tudo baseado nisso.</p>
      </div>
      <div className="space-y-3">
        {goals.map((g) => (
          <button
            key={g.value}
            onClick={() => update('goal', g.value)}
            className={cn(
              'w-full p-4 rounded-2xl flex items-center gap-4 transition-all border text-left',
              data.goal === g.value
                ? 'bg-primary/10 border-primary text-white'
                : 'bg-surface border-white/10 text-white/60'
            )}
          >
            <span className="text-3xl">{g.emoji}</span>
            <div>
              <div className="font-bold text-lg">{g.label}</div>
              <div className="text-sm opacity-60">{g.desc}</div>
            </div>
            {data.goal === g.value && (
              <Check className="w-5 h-5 text-primary ml-auto" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

function StepActivity({ data, update }: { data: OnboardingData; update: any }) {
  const levels: { value: ActivityLevel; label: string; desc: string }[] = [
    { value: 'sedentary',   label: 'Sedentário',         desc: 'Trabalho sentado, sem exercícios' },
    { value: 'light',       label: 'Levemente ativo',    desc: '1-3x por semana' },
    { value: 'moderate',    label: 'Moderado',           desc: '3-5x por semana' },
    { value: 'active',      label: 'Muito ativo',        desc: '6-7x por semana' },
    { value: 'very_active', label: 'Extremamente ativo', desc: '2x ao dia ou trabalho pesado' },
  ];
  return (
    <div className="space-y-6">
      <div>
        <h2 className="section-title text-3xl">Nível de atividade</h2>
        <p className="text-white/40 text-sm mt-1">Seja honesto. Isso impacta suas calorias.</p>
      </div>
      <div className="space-y-2">
        {levels.map((l) => (
          <button
            key={l.value}
            onClick={() => update('activityLevel', l.value)}
            className={cn(
              'w-full p-3 rounded-xl flex items-center gap-3 transition-all border text-left',
              data.activityLevel === l.value
                ? 'bg-primary/10 border-primary text-white'
                : 'bg-surface border-white/10 text-white/60'
            )}
          >
            <div className="flex-1">
              <div className="font-semibold">{l.label}</div>
              <div className="text-xs opacity-50">{l.desc}</div>
            </div>
            {data.activityLevel === l.value && <Check className="w-4 h-4 text-primary" />}
          </button>
        ))}
      </div>
    </div>
  );
}

function StepRestrictions({ data, toggleRestriction }: { data: OnboardingData; toggleRestriction: (r: string) => void }) {
  const options = ['Vegetariano', 'Vegano', 'Sem glúten', 'Sem lactose', 'Low carb', 'Diabético', 'Nenhuma'];
  return (
    <div className="space-y-6">
      <div>
        <h2 className="section-title text-3xl">Restrições</h2>
        <p className="text-white/40 text-sm mt-1">Selecione as que se aplicam a você.</p>
      </div>
      <div className="flex flex-wrap gap-2">
        {options.map((r) => (
          <button
            key={r}
            onClick={() => toggleRestriction(r)}
            className={cn(
              'px-4 py-2 rounded-full border text-sm font-medium transition-all',
              data.restrictions.includes(r)
                ? 'bg-primary text-black border-primary'
                : 'bg-surface border-white/20 text-white/60'
            )}
          >
            {r}
          </button>
        ))}
      </div>
    </div>
  );
}

function StepProtocol({ data, update }: { data: OnboardingData; update: any }) {
  const suggested = suggestFastingProtocol(data.goal, data.activityLevel);
  const protocols: { value: FastingProtocol; label: string; desc: string }[] = [
    { value: '14:10', label: '14:10', desc: 'Jejum 14h — ideal para iniciantes' },
    { value: '16:8',  label: '16:8',  desc: 'Jejum 16h — o mais popular' },
    { value: '18:6',  label: '18:6',  desc: 'Jejum 18h — avançado' },
    { value: '20:4',  label: '20:4',  desc: 'Jejum 20h — guerreiro' },
  ];
  return (
    <div className="space-y-6">
      <div>
        <h2 className="section-title text-3xl">Protocolo de jejum</h2>
        <p className="text-white/40 text-sm mt-1">
          Recomendamos o <span className="text-primary font-bold">{suggested}</span> para você.
        </p>
      </div>
      <div className="space-y-2">
        {protocols.map((p) => (
          <button
            key={p.value}
            onClick={() => update('fastingProtocol', p.value)}
            className={cn(
              'w-full p-3 rounded-xl flex items-center gap-3 transition-all border text-left',
              data.fastingProtocol === p.value
                ? 'bg-primary/10 border-primary text-white'
                : 'bg-surface border-white/10 text-white/60',
              p.value === suggested && data.fastingProtocol !== p.value && 'border-primary/30'
            )}
          >
            <span className="font-display text-2xl text-primary">{p.label}</span>
            <div className="flex-1">
              <div className="text-sm">{p.desc}</div>
              {p.value === suggested && (
                <span className="text-xs text-primary">Recomendado pra você</span>
              )}
            </div>
            {data.fastingProtocol === p.value && <Check className="w-4 h-4 text-primary" />}
          </button>
        ))}
      </div>
    </div>
  );
}

function StepSummary({ data }: { data: OnboardingData }) {
  const profile = { ...data, uid: '', email: '', createdAt: new Date(), updatedAt: new Date() } as UserProfile;
  const metrics = calculateUserMetrics(profile);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="section-title text-3xl">Tudo pronto,</h2>
        <p className="text-primary text-2xl font-display">{data.name || 'Guerreiro'}!</p>
        <p className="text-white/40 text-sm mt-1">Aqui estão seus números:</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {[
          { label: 'Calorias/dia',  value: `${metrics.targetCalories} kcal`, emoji: '🔥' },
          { label: 'Proteína/dia',  value: `${metrics.targetProtein}g`,      emoji: '💪' },
          { label: 'Carbs/dia',     value: `${metrics.targetCarbs}g`,        emoji: '🍚' },
          { label: 'Gordura/dia',   value: `${metrics.targetFat}g`,          emoji: '🥑' },
          { label: 'TMB',           value: `${metrics.bmr} kcal`,            emoji: '⚡' },
          { label: 'Jejum',         value: data.fastingProtocol,             emoji: '⏱️' },
        ].map((item) => (
          <div key={item.label} className="card text-center">
            <div className="text-2xl mb-1">{item.emoji}</div>
            <div className="text-primary font-bold text-lg">{item.value}</div>
            <div className="text-white/40 text-xs">{item.label}</div>
          </div>
        ))}
      </div>

      <div className="card-highlight mt-2">
        <p className="text-white/70 text-sm text-center italic">
          "Não precisa ser perfeito. Só consistente." 🎯
        </p>
      </div>
    </div>
  );
}
