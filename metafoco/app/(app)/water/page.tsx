'use client';

import { useState, useEffect } from 'react';
import { useUserStore } from '@/store/userStore';
import { Droplets, Sparkles, Loader2, Clock, Lightbulb, Apple } from 'lucide-react';
import { cn, todayString } from '@/lib/utils';
import toast from 'react-hot-toast';

type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
type Climate = 'mild' | 'hot' | 'tropical';

interface WaterPlan {
  dailyGoalMl: number;
  dailyGoalL: number;
  rationale: string;
  schedule: { time: string; ml: number; tip: string }[];
  tips: string[];
  foodsWithWater: string[];
  baselineEstimate: number;
}

const ACTIVITY_LABELS: Record<ActivityLevel, string> = {
  sedentary:   '🪑 Sedentário',
  light:       '🚶 Leve (1-2x/sem)',
  moderate:    '🏃 Moderado (3-4x/sem)',
  active:      '💪 Ativo (5-6x/sem)',
  very_active: '🔥 Muito ativo (diário)',
};

const CLIMATE_LABELS: Record<Climate, string> = {
  mild:     '🌤️ Ameno / frio',
  hot:      '☀️ Quente / seco',
  tropical: '🌴 Tropical / úmido',
};

const WATER_STEP = 250;

export default function WaterPage() {
  const { profile } = useUserStore();
  const [activity, setActivity] = useState<ActivityLevel>('moderate');
  const [climate, setClimate] = useState<Climate>('mild');
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<WaterPlan | null>(null);

  const today = todayString();
  const [consumed, setConsumed] = useState(0);

  useEffect(() => {
    const stored = localStorage.getItem(`water_${today}`);
    if (stored) setConsumed(Number(stored));
    const savedPlan = localStorage.getItem('water_plan');
    if (savedPlan) {
      try { setPlan(JSON.parse(savedPlan)); } catch { /* ignore */ }
    }
  }, [today]);

  async function calculate() {
    if (!profile) { toast.error('Complete seu perfil primeiro.'); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/water-calc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          weight: profile.weight,
          height: profile.height,
          age: profile.age,
          sex: profile.sex,
          activityLevel: activity,
          climate,
          goal: profile.goal,
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setPlan(data);
      localStorage.setItem('water_plan', JSON.stringify(data));
      toast.success(`Meta: ${data.dailyGoalL}L/dia 💧`);
    } catch {
      toast.error('Erro ao calcular. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  function addWater(ml = WATER_STEP) {
    const next = consumed + ml;
    setConsumed(next);
    localStorage.setItem(`water_${today}`, String(next));
    toast(`+${ml}ml 💧`, { duration: 1000 });
  }

  const goalMl = plan?.dailyGoalMl ?? 2000;
  const progress = Math.min(1, consumed / goalMl);
  const progressPct = Math.round(progress * 100);

  return (
    <div className="min-h-screen bg-black pb-24">
      <div className="px-5 pt-12 pb-4">
        <div className="flex items-center gap-2 mb-0.5">
          <Droplets className="w-5 h-5 text-blue-400" />
          <h1 className="section-title text-2xl">Hidratação</h1>
        </div>
        <p className="text-white/40 text-sm">Calculadora inteligente com IA</p>
      </div>

      <div className="px-5 space-y-4">
        {/* Daily tracker */}
        <div className="card text-center space-y-3">
          <div className="text-white/50 text-xs uppercase tracking-wider">Hoje</div>
          <div className="relative w-36 h-36 mx-auto">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10" />
              <circle
                cx="60" cy="60" r="50" fill="none"
                stroke="rgb(96,165,250)"
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={`${progress * 314} 314`}
                className="transition-all duration-500"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="text-2xl font-bold text-blue-400">{(consumed / 1000).toFixed(1)}L</div>
              <div className="text-white/40 text-xs">de {(goalMl / 1000).toFixed(1)}L</div>
              <div className="text-white/30 text-xs">{progressPct}%</div>
            </div>
          </div>

          {/* Quick add buttons */}
          <div className="flex gap-2 justify-center">
            {[150, 250, 350, 500].map((ml) => (
              <button
                key={ml}
                onClick={() => addWater(ml)}
                className="flex-1 py-2 rounded-xl bg-blue-400/10 border border-blue-400/20 text-blue-400 text-xs font-semibold active:scale-95 transition-transform"
              >
                +{ml}ml
              </button>
            ))}
          </div>

          {consumed > 0 && (
            <button
              onClick={() => {
                setConsumed(0);
                localStorage.setItem(`water_${today}`, '0');
              }}
              className="text-white/20 text-xs"
            >
              Zerar hoje
            </button>
          )}
        </div>

        {/* Calculator */}
        <div className="card space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-white font-semibold text-sm">Calcular com IA</span>
          </div>

          {profile && (
            <div className="bg-blue-400/5 border border-blue-400/10 rounded-xl p-3 text-xs text-white/50">
              {profile.weight}kg · {profile.height}cm · {profile.age} anos · {profile.sex === 'male' ? 'Masc.' : 'Fem.'}
            </div>
          )}

          <div className="space-y-2">
            <div className="text-white/50 text-xs">Nível de atividade</div>
            <div className="space-y-2">
              {(Object.entries(ACTIVITY_LABELS) as [ActivityLevel, string][]).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setActivity(key)}
                  className={cn(
                    'w-full text-left py-2.5 px-3 rounded-xl border text-sm transition-all',
                    activity === key
                      ? 'bg-primary/10 border-primary text-white'
                      : 'border-white/10 text-white/50'
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-white/50 text-xs">Clima onde você vive</div>
            <div className="grid grid-cols-3 gap-2">
              {(Object.entries(CLIMATE_LABELS) as [Climate, string][]).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setClimate(key)}
                  className={cn(
                    'py-2.5 px-2 rounded-xl border text-xs font-semibold transition-all',
                    climate === key
                      ? 'bg-blue-400/15 border-blue-400 text-blue-300'
                      : 'border-white/10 text-white/40'
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={calculate}
            disabled={loading || !profile}
            className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> Calculando...</>
            ) : (
              <><Sparkles className="w-5 h-5" /> CALCULAR META IDEAL</>
            )}
          </button>
        </div>

        {/* Plan results */}
        {plan && (
          <>
            <div className="card space-y-2" style={{ borderColor: 'rgba(96,165,250,0.2)', background: 'rgba(96,165,250,0.03)' }}>
              <div className="flex items-center gap-2">
                <Droplets className="w-4 h-4 text-blue-400" />
                <span className="text-white font-semibold text-sm">Sua meta: {plan.dailyGoalL}L/dia</span>
              </div>
              <p className="text-white/60 text-xs leading-relaxed">{plan.rationale}</p>
            </div>

            {/* Schedule */}
            <div className="card space-y-3">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" />
                <span className="text-white font-semibold text-sm">Cronograma do dia</span>
              </div>
              <div className="space-y-2">
                {plan.schedule.map((slot, i) => {
                  const slotHour = parseInt(slot.time.split(':')[0]);
                  const nowHour = new Date().getHours();
                  const isPast = slotHour < nowHour;
                  return (
                    <div
                      key={i}
                      className={cn(
                        'flex items-center gap-3 py-2 px-3 rounded-xl border',
                        isPast ? 'border-white/5 opacity-40' : 'border-blue-400/15 bg-blue-400/5'
                      )}
                    >
                      <span className="text-blue-400 font-bold text-sm w-12 shrink-0">{slot.time}</span>
                      <span className="text-white font-semibold text-sm w-14 shrink-0">{slot.ml}ml</span>
                      <span className="text-white/40 text-xs flex-1">{slot.tip}</span>
                      <button
                        onClick={() => addWater(slot.ml)}
                        className="shrink-0 bg-blue-400/10 text-blue-400 text-xs px-2 py-1 rounded-lg active:scale-95 transition-transform"
                      >
                        +
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Tips */}
            <div className="card space-y-3">
              <div className="flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-primary" />
                <span className="text-white font-semibold text-sm">Dicas personalizadas</span>
              </div>
              <ul className="space-y-2">
                {plan.tips.map((tip, i) => (
                  <li key={i} className="flex items-start gap-2 text-white/60 text-xs leading-relaxed">
                    <span className="text-primary mt-0.5">•</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>

            {/* Foods */}
            <div className="card space-y-3">
              <div className="flex items-center gap-2">
                <Apple className="w-4 h-4 text-success" />
                <span className="text-white font-semibold text-sm">Alimentos com alto teor de água</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {plan.foodsWithWater.map((food, i) => (
                  <span key={i} className="bg-success/10 border border-success/20 text-success text-xs px-3 py-1 rounded-full">
                    {food}
                  </span>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
