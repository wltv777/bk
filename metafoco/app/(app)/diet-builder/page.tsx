'use client';

import { useState } from 'react';
import { useUserStore } from '@/store/userStore';
import {
  ChevronRight, ChevronLeft, Flame, Scale, Dumbbell, RefreshCw,
  Loader2, ShoppingCart, Lightbulb, ChevronDown, ChevronUp
} from 'lucide-react';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

// ─── Types ─────────────────────────────────────────────────────
type GoalType = 'lose_fat' | 'maintain' | 'gain_muscle' | 'recomp';
type DietTypeOption = 'Onívoro' | 'Vegetariano' | 'Vegano' | 'Low Carb' | 'Cetogênica' | 'Paleo' | 'Mediterrânea';
type AllergyOption = 'Glúten' | 'Lactose' | 'Frutos do Mar' | 'Amendoim' | 'Ovo' | 'Soja' | 'Nenhuma';

interface FormData {
  // Step 1
  weight: number;
  height: number;
  age: number;
  sex: 'male' | 'female';
  activity: string;
  // Step 2
  bodyFat: string;
  leanMass: string;
  visceralFat: string;
  waterPct: string;
  metabolicAge: string;
  bmr: string;
  // Step 3
  goal: GoalType;
  // Step 4
  dietType: DietTypeOption[];
  allergies: AllergyOption[];
  mealsPerDay: number;
}

interface MealFood { name: string; portion: string; kcal: number; }
interface Meal { name: string; time: string; foods: MealFood[]; totalKcal: number; }
interface DayPlan { day: string; totalCalories: number; totalProtein: number; meals: Meal[]; }
interface DietPlan {
  targetCalories: number;
  targetProtein: number;
  targetCarbs: number;
  targetFat: number;
  days: DayPlan[];
  shoppingList: string[];
  tips: string[];
}

// ─── Constants ─────────────────────────────────────────────────
const ACTIVITY_OPTIONS = [
  { value: 'sedentary',   label: '🪑 Sedentário (sem exercício)' },
  { value: 'light',       label: '🚶 Leve (1-3x/semana)' },
  { value: 'moderate',    label: '🏃 Moderado (3-5x/semana)' },
  { value: 'active',      label: '💪 Ativo (6-7x/semana)' },
  { value: 'very_active', label: '🔥 Extremamente ativo (atleta)' },
];

const GOAL_OPTIONS = [
  { id: 'lose_fat',     icon: '🔥', label: 'Perder Gordura',   sub: 'Déficit de 500 kcal/dia',  color: '#E8541A' },
  { id: 'maintain',     icon: '⚖️', label: 'Manutenção',       sub: 'Manter peso atual',         color: '#3498DB' },
  { id: 'gain_muscle',  icon: '💪', label: 'Ganhar Músculo',   sub: 'Superávit de 300 kcal/dia', color: '#2ECC71' },
  { id: 'recomp',       icon: '🔄', label: 'Recomposição',     sub: 'Déficit leve -200 kcal',    color: '#9B59B6' },
] as const;

const DIET_TYPES: DietTypeOption[] = ['Onívoro', 'Vegetariano', 'Vegano', 'Low Carb', 'Cetogênica', 'Paleo', 'Mediterrânea'];
const ALLERGY_OPTIONS: AllergyOption[] = ['Glúten', 'Lactose', 'Frutos do Mar', 'Amendoim', 'Ovo', 'Soja', 'Nenhuma'];

const STEPS = ['Seus Dados', 'Bioimpedância', 'Objetivo', 'Preferências'];

// ─── Components ────────────────────────────────────────────────
function NumberField({ label, value, onChange, unit, min = 0, max = 999, step = 1 }: {
  label: string; value: string | number; onChange: (v: string) => void;
  unit?: string; min?: number; max?: number; step?: number;
}) {
  return (
    <div className="space-y-1">
      <label className="text-white/50 text-xs">{label}</label>
      <div className="relative">
        <input
          type="number" value={value} min={min} max={max} step={step}
          onChange={(e) => onChange(e.target.value)}
          className="input pr-14"
        />
        {unit && <span className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 text-sm">{unit}</span>}
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────
export default function DietBuilderPage() {
  const { profile } = useUserStore();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<DietPlan | null>(null);
  const [expandedDay, setExpandedDay] = useState<number | null>(0);
  const [showShopping, setShowShopping] = useState(false);

  const [form, setForm] = useState<FormData>({
    weight:      profile?.weight  ?? 70,
    height:      profile?.height  ?? 170,
    age:         profile?.age     ?? 25,
    sex:         (profile?.sex === 'female' ? 'female' : 'male') as 'male' | 'female',
    activity:    'moderate',
    bodyFat:     '',
    leanMass:    '',
    visceralFat: '',
    waterPct:    '',
    metabolicAge:'',
    bmr:         '',
    goal:        'lose_fat',
    dietType:    ['Onívoro'],
    allergies:   ['Nenhuma'],
    mealsPerDay: 5,
  });

  function set<K extends keyof FormData>(key: K, val: FormData[K]) {
    setForm((p) => ({ ...p, [key]: val }));
  }

  function toggleArr<T>(arr: T[], val: T): T[] {
    return arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val];
  }

  async function generatePlan() {
    setLoading(true);
    try {
      const res = await fetch('/api/diet-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setPlan(data);
    } catch {
      toast.error('Erro ao gerar plano. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  // ── Plan result view ──
  if (plan) {
    return (
      <div className="min-h-screen bg-black pb-24">
        <div className="px-5 pt-12 pb-4">
          <div className="flex items-center gap-3 mb-1">
            <button onClick={() => setPlan(null)} className="p-1.5 rounded-xl bg-white/5">
              <ChevronLeft className="w-5 h-5 text-white/60" />
            </button>
            <h1 className="section-title text-2xl">Seu Plano Alimentar</h1>
          </div>
          <p className="text-white/40 text-sm pl-10">Gerado pela IA com base nos seus dados</p>
        </div>

        <div className="px-5 space-y-4">
          {/* Macro targets */}
          <div className="grid grid-cols-4 gap-2">
            {[
              { label: 'Kcal',   value: plan.targetCalories, color: 'text-primary' },
              { label: 'Prot.',  value: `${plan.targetProtein}g`, color: 'text-blue-400' },
              { label: 'Carb.',  value: `${plan.targetCarbs}g`,  color: 'text-orange-400' },
              { label: 'Gord.', value: `${plan.targetFat}g`,    color: 'text-yellow-400' },
            ].map(({ label, value, color }) => (
              <div key={label} className="card text-center py-3">
                <div className={cn('font-bold text-sm', color)}>{value}</div>
                <div className="text-white/30 text-[10px] mt-0.5">{label}</div>
              </div>
            ))}
          </div>

          {/* Days */}
          {plan.days.map((day, i) => (
            <div key={i} className="card overflow-hidden">
              <button
                onClick={() => setExpandedDay(expandedDay === i ? null : i)}
                className="w-full flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-primary/15 flex items-center justify-center text-primary font-bold text-xs">
                    {i + 1}
                  </div>
                  <div className="text-left">
                    <div className="text-white font-semibold text-sm">{day.day}</div>
                    <div className="text-white/30 text-xs">{day.totalCalories} kcal · {day.totalProtein}g prot.</div>
                  </div>
                </div>
                {expandedDay === i ? (
                  <ChevronUp className="w-4 h-4 text-white/30" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-white/30" />
                )}
              </button>

              {expandedDay === i && (
                <div className="mt-3 space-y-2 border-t border-white/5 pt-3">
                  {day.meals.map((meal, j) => (
                    <div key={j} className="bg-surface-2 rounded-xl p-3">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-white font-semibold text-xs">{meal.name}</span>
                        <span className="text-primary text-xs font-bold">{meal.totalKcal} kcal</span>
                      </div>
                      {meal.foods.map((food, k) => (
                        <div key={k} className="flex items-center justify-between text-xs py-0.5">
                          <span className="text-white/60">{food.name}</span>
                          <div className="flex items-center gap-2 text-white/30">
                            <span>{food.portion}</span>
                            <span>{food.kcal} kcal</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}

          {/* Shopping list */}
          {plan.shoppingList?.length > 0 && (
            <div className="card">
              <button
                onClick={() => setShowShopping(!showShopping)}
                className="w-full flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <ShoppingCart className="w-4 h-4 text-primary" />
                  <span className="text-white font-semibold text-sm">Lista de Compras</span>
                </div>
                {showShopping ? <ChevronUp className="w-4 h-4 text-white/30" /> : <ChevronDown className="w-4 h-4 text-white/30" />}
              </button>
              {showShopping && (
                <div className="mt-3 grid grid-cols-2 gap-1.5 border-t border-white/5 pt-3">
                  {plan.shoppingList.map((item, i) => (
                    <div key={i} className="flex items-center gap-2 text-white/60 text-xs py-1">
                      <span className="text-primary">•</span>{item}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tips */}
          {plan.tips?.length > 0 && (
            <div className="card space-y-2">
              <div className="flex items-center gap-2 mb-1">
                <Lightbulb className="w-4 h-4 text-primary" />
                <span className="text-white font-semibold text-sm">Dicas Personalizadas</span>
              </div>
              {plan.tips.map((tip, i) => (
                <div key={i} className="flex items-start gap-2 text-white/60 text-xs leading-relaxed">
                  <span className="text-primary mt-0.5 shrink-0">•</span>{tip}
                </div>
              ))}
            </div>
          )}

          <button
            onClick={() => { setPlan(null); setStep(0); }}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border border-primary/30 text-primary text-sm font-semibold"
          >
            <RefreshCw className="w-4 h-4" /> Gerar novo plano
          </button>
        </div>
      </div>
    );
  }

  // ── Step progress bar ──
  const StepBar = () => (
    <div className="flex items-center gap-1 mb-6">
      {STEPS.map((s, i) => (
        <div key={i} className={cn(
          'flex-1 h-1 rounded-full transition-all duration-300',
          i <= step ? 'bg-primary' : 'bg-white/10'
        )} />
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-black pb-24">
      <div className="px-5 pt-12 pb-4">
        <h1 className="section-title text-2xl mb-0.5">Montar Dieta</h1>
        <p className="text-white/40 text-sm">Passo {step + 1} de {STEPS.length} — {STEPS[step]}</p>
      </div>

      <div className="px-5">
        <StepBar />

        {/* ── Step 1: Seus Dados ── */}
        {step === 0 && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <NumberField label="Peso (kg)" value={form.weight} onChange={(v) => set('weight', Number(v))} unit="kg" min={30} max={300} step={0.1} />
              <NumberField label="Altura (cm)" value={form.height} onChange={(v) => set('height', Number(v))} unit="cm" min={100} max={250} />
            </div>
            <NumberField label="Idade" value={form.age} onChange={(v) => set('age', Number(v))} unit="anos" min={10} max={99} />

            <div className="space-y-1">
              <label className="text-white/50 text-xs">Sexo</label>
              <div className="grid grid-cols-2 gap-2">
                {[['male', '♂ Masculino'], ['female', '♀ Feminino']].map(([val, lbl]) => (
                  <button
                    key={val}
                    onClick={() => set('sex', val as 'male' | 'female')}
                    className={cn(
                      'py-3 rounded-xl border text-sm font-semibold transition-all',
                      form.sex === val ? 'bg-primary/15 border-primary text-white' : 'border-white/10 text-white/40'
                    )}
                  >
                    {lbl}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-white/50 text-xs">Nível de atividade</label>
              {ACTIVITY_OPTIONS.map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => set('activity', value)}
                  className={cn(
                    'w-full text-left py-3 px-4 rounded-xl border text-sm transition-all',
                    form.activity === value ? 'bg-primary/10 border-primary text-white' : 'border-white/10 text-white/50'
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Step 2: Bioimpedância ── */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-3 text-xs text-white/50 leading-relaxed">
              💡 Insira os dados da sua balança inteligente (Xiaomi, Tanita, etc.). Todos os campos são <strong className="text-white/70">opcionais</strong> — quanto mais dados, mais preciso o plano.
            </div>
            <div className="grid grid-cols-2 gap-3">
              <NumberField label="% Gordura Corporal" value={form.bodyFat} onChange={(v) => set('bodyFat', v)} unit="%" min={3} max={60} step={0.1} />
              <NumberField label="Massa Magra (kg)" value={form.leanMass} onChange={(v) => set('leanMass', v)} unit="kg" min={10} max={120} step={0.1} />
              <NumberField label="Gordura Visceral" value={form.visceralFat} onChange={(v) => set('visceralFat', v)} unit="pts" min={1} max={30} />
              <NumberField label="% Água Corporal" value={form.waterPct} onChange={(v) => set('waterPct', v)} unit="%" min={30} max={80} step={0.1} />
              <NumberField label="Idade Metabólica" value={form.metabolicAge} onChange={(v) => set('metabolicAge', v)} unit="anos" min={10} max={99} />
              <NumberField label="TMB (kcal)" value={form.bmr} onChange={(v) => set('bmr', v)} unit="kcal" min={800} max={4000} step={10} />
            </div>
          </div>
        )}

        {/* ── Step 3: Objetivo ── */}
        {step === 2 && (
          <div className="space-y-3">
            {GOAL_OPTIONS.map(({ id, icon, label, sub, color }) => (
              <button
                key={id}
                onClick={() => set('goal', id as GoalType)}
                className={cn(
                  'w-full flex items-center gap-4 p-4 rounded-2xl border transition-all active:scale-98',
                  form.goal === id ? 'border-2' : 'border-white/10 bg-surface'
                )}
                style={form.goal === id ? {
                  borderColor: color,
                  background: `${color}15`,
                } : {}}
              >
                <span className="text-3xl">{icon}</span>
                <div className="flex-1 text-left">
                  <div className="text-white font-bold text-sm">{label}</div>
                  <div className="text-white/40 text-xs mt-0.5">{sub}</div>
                </div>
                {form.goal === id && (
                  <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: color }}>
                    <span className="text-white text-xs">✓</span>
                  </div>
                )}
              </button>
            ))}
          </div>
        )}

        {/* ── Step 4: Preferências ── */}
        {step === 3 && (
          <div className="space-y-5">
            <div className="space-y-2">
              <label className="text-white/50 text-xs">Tipo de dieta</label>
              <div className="flex flex-wrap gap-2">
                {DIET_TYPES.map((dt) => (
                  <button
                    key={dt}
                    onClick={() => set('dietType', toggleArr(form.dietType, dt) as DietTypeOption[])}
                    className={cn(
                      'px-3 py-1.5 rounded-full border text-xs font-semibold transition-all',
                      form.dietType.includes(dt)
                        ? 'bg-primary/15 border-primary text-primary'
                        : 'border-white/15 text-white/40'
                    )}
                  >
                    {dt}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-white/50 text-xs">Alergias / Intolerâncias</label>
              <div className="flex flex-wrap gap-2">
                {ALLERGY_OPTIONS.map((a) => (
                  <button
                    key={a}
                    onClick={() => set('allergies', toggleArr(form.allergies, a) as AllergyOption[])}
                    className={cn(
                      'px-3 py-1.5 rounded-full border text-xs font-semibold transition-all',
                      form.allergies.includes(a)
                        ? 'bg-danger/15 border-danger text-danger'
                        : 'border-white/15 text-white/40'
                    )}
                  >
                    {a}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-white/50 text-xs">Refeições por dia</label>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => set('mealsPerDay', Math.max(2, form.mealsPerDay - 1))}
                  className="w-10 h-10 rounded-xl bg-surface-2 flex items-center justify-center text-white text-xl active:scale-90 transition-transform"
                >
                  −
                </button>
                <span className="text-white font-bold text-2xl font-display flex-1 text-center">{form.mealsPerDay}</span>
                <button
                  onClick={() => set('mealsPerDay', Math.min(7, form.mealsPerDay + 1))}
                  className="w-10 h-10 rounded-xl bg-surface-2 flex items-center justify-center text-white text-xl active:scale-90 transition-transform"
                >
                  +
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Navigation ── */}
        <div className="flex gap-3 mt-8">
          {step > 0 && (
            <button
              onClick={() => setStep((s) => s - 1)}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl border border-white/20 text-white/60 text-sm font-semibold active:scale-95 transition-transform"
            >
              <ChevronLeft className="w-4 h-4" /> Voltar
            </button>
          )}
          {step < 3 ? (
            <button
              onClick={() => setStep((s) => s + 1)}
              className="flex-1 btn-primary flex items-center justify-center gap-2"
            >
              Próximo <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={generatePlan}
              disabled={loading}
              className="flex-1 btn-primary flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loading ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Gerando plano...</>
              ) : (
                <>🥗 GERAR MEU PLANO</>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
