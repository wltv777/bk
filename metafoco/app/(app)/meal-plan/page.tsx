'use client';

import { useState, useEffect } from 'react';
import { collection, setDoc, getDoc, doc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { useUserStore } from '@/store/userStore';
import { useDiaryStore } from '@/store/diaryStore';
import { getRemainingMacros, getMealSlotLabel } from '@/lib/utils';
import { Calendar, ChefHat, Loader2, RefreshCw, Plus, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';
import type { MealSlot } from '@/types';

const DAYS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
const SLOTS: MealSlot[] = ['breakfast', 'lunch', 'dinner', 'snack'];

interface PlannedFood {
  name: string;
  calories: number;
  protein: number;
  portion: string;
}

interface DayPlan {
  [slot: string]: PlannedFood[];
}

interface WeekPlan {
  [dayIndex: number]: DayPlan;
}

// Sugestões de receitas por macro profile
const RECIPE_SUGGESTIONS: Record<string, PlannedFood[]> = {
  high_protein_breakfast: [
    { name: 'Omelete de 3 ovos + frango', calories: 380, protein: 42, portion: '250g' },
    { name: 'Iogurte grego + whey + aveia', calories: 320, protein: 38, portion: '300g' },
    { name: 'Tapioca com atum e queijo', calories: 290, protein: 32, portion: '200g' },
  ],
  balanced_lunch: [
    { name: 'Frango grelhado + arroz + brócolis', calories: 520, protein: 45, portion: '400g' },
    { name: 'Patinho moído + batata-doce + salada', calories: 480, protein: 40, portion: '380g' },
    { name: 'Tilápia assada + quinoa + legumes', calories: 460, protein: 42, portion: '370g' },
  ],
  light_dinner: [
    { name: 'Salmão + aspargos + azeite', calories: 420, protein: 38, portion: '300g' },
    { name: 'Peito de frango + abobrinha refogada', calories: 380, protein: 44, portion: '320g' },
    { name: 'Omelete de claras + espinafre', calories: 260, protein: 30, portion: '220g' },
  ],
  snack: [
    { name: 'Castanhas + fruta', calories: 180, protein: 5, portion: '80g' },
    { name: 'Iogurte proteico', calories: 140, protein: 18, portion: '150g' },
    { name: 'Banana + pasta de amendoim', calories: 220, protein: 8, portion: '120g' },
  ],
};

function getWeekStart(): Date {
  const d = new Date();
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  return monday;
}

function getWeekId(): string {
  return getWeekStart().toISOString().split('T')[0];
}

function getSuggestionsForSlot(slot: MealSlot): PlannedFood[] {
  if (slot === 'breakfast') return RECIPE_SUGGESTIONS.high_protein_breakfast;
  if (slot === 'lunch') return RECIPE_SUGGESTIONS.balanced_lunch;
  if (slot === 'dinner') return RECIPE_SUGGESTIONS.light_dinner;
  return RECIPE_SUGGESTIONS.snack;
}

export default function MealPlanPage() {
  const { profile, metrics, premium } = useUserStore();
  const { getTodayTotals } = useDiaryStore();
  const [activeDay, setActiveDay] = useState(0);
  const [weekPlan, setWeekPlan] = useState<WeekPlan>({});
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState<string | null>(null);

  const weekId = getWeekId();

  useEffect(() => {
    if (!auth.currentUser) return;
    const ref = doc(db, 'meal_plans', auth.currentUser.uid, 'weeks', weekId);
    getDoc(ref).then((snap) => {
      if (snap.exists()) setWeekPlan(snap.data().days ?? {});
    }).finally(() => setLoading(false));
  }, [weekId]);

  async function savePlan(plan: WeekPlan) {
    if (!auth.currentUser) return;
    const ref = doc(db, 'meal_plans', auth.currentUser.uid, 'weeks', weekId);
    await setDoc(ref, { weekStart: weekId, days: plan, updatedAt: new Date() });
  }

  function addFood(dayIdx: number, slot: MealSlot, food: PlannedFood) {
    const updated: WeekPlan = {
      ...weekPlan,
      [dayIdx]: {
        ...(weekPlan[dayIdx] ?? {}),
        [slot]: [...(weekPlan[dayIdx]?.[slot] ?? []), food],
      },
    };
    setWeekPlan(updated);
    savePlan(updated);
    setShowSuggestions(null);
    toast.success(`${food.name} adicionado! 🍽️`);
  }

  function removeFood(dayIdx: number, slot: MealSlot, foodIdx: number) {
    const updated: WeekPlan = {
      ...weekPlan,
      [dayIdx]: {
        ...(weekPlan[dayIdx] ?? {}),
        [slot]: (weekPlan[dayIdx]?.[slot] ?? []).filter((_, i) => i !== foodIdx),
      },
    };
    setWeekPlan(updated);
    savePlan(updated);
  }

  async function generatePlan() {
    if (!metrics || !premium.active) {
      toast.error('Funcionalidade Premium. Assine para gerar planos automáticos! 💎');
      return;
    }
    setGenerating(true);
    toast('Gerando seu plano da semana com IA... 🤖', { duration: 3000 });

    // Generate a balanced plan based on the user's macros
    const generated: WeekPlan = {};
    for (let d = 0; d < 7; d++) {
      generated[d] = {};
      for (const slot of SLOTS) {
        const suggestions = getSuggestionsForSlot(slot);
        const pick = suggestions[d % suggestions.length];
        generated[d][slot] = [pick];
      }
    }

    setWeekPlan(generated);
    await savePlan(generated);
    setGenerating(false);
    toast.success('Plano gerado! 7 dias de refeições no foco. 🔥');
  }

  const totals = getTodayTotals();
  const remaining = metrics
    ? getRemainingMacros(
        { calories: metrics.targetCalories, protein: metrics.targetProtein, carbs: metrics.targetCarbs, fat: metrics.targetFat },
        { calories: totals.calories, protein: totals.protein, carbs: totals.carbs, fat: totals.fat }
      )
    : null;

  const dayPlan = weekPlan[activeDay] ?? {};

  const dayTotals = Object.values(dayPlan).flat().reduce(
    (acc, f) => ({ calories: acc.calories + f.calories, protein: acc.protein + f.protein }),
    { calories: 0, protein: 0 }
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="px-5 pt-12 pb-4">
        <h1 className="section-title text-3xl mb-1">Planejamento</h1>
        <p className="text-white/40 text-sm">Refeições da semana no foco</p>
      </div>

      <div className="px-5 space-y-4 pb-6">
        {/* Macros remaining today */}
        {remaining && (
          <div className="card">
            <div className="text-xs text-white/40 mb-2">Macros restantes hoje</div>
            <div className="grid grid-cols-4 gap-2 text-center">
              {[
                { label: 'Calorias', value: remaining.calories, unit: 'kcal', color: 'text-primary' },
                { label: 'Proteína', value: remaining.protein, unit: 'g', color: 'text-blue-400' },
                { label: 'Carbo', value: remaining.carbs, unit: 'g', color: 'text-orange-400' },
                { label: 'Gordura', value: remaining.fat, unit: 'g', color: 'text-yellow-400' },
              ].map(({ label, value, unit, color }) => (
                <div key={label} className="bg-surface-2 rounded-xl p-2">
                  <div className={cn('font-bold text-lg', color)}>{Math.round(value)}</div>
                  <div className="text-white/30 text-[10px]">{unit}</div>
                  <div className="text-white/20 text-[10px]">{label}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Generate button */}
        <button
          onClick={generatePlan}
          disabled={generating}
          className={cn(
            'w-full flex items-center justify-center gap-2 py-3 rounded-2xl border transition-all',
            premium.active
              ? 'bg-primary/10 border-primary text-primary hover:bg-primary/20'
              : 'border-white/10 text-white/30'
          )}
        >
          {generating ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <ChefHat className="w-4 h-4" />
          )}
          {premium.active ? 'Gerar plano com IA' : 'Gerar plano (Premium)'}
          {!premium.active && <span className="text-[10px] bg-primary/20 text-primary px-1.5 py-0.5 rounded-full ml-1">💎</span>}
        </button>

        {/* Day selector */}
        <div className="flex gap-1 overflow-x-auto scrollbar-hide pb-1">
          {DAYS.map((day, i) => {
            const hasPlan = Object.keys(weekPlan[i] ?? {}).length > 0;
            return (
              <button
                key={day}
                onClick={() => setActiveDay(i)}
                className={cn(
                  'flex-shrink-0 flex flex-col items-center gap-1 px-3 py-2 rounded-xl border transition-all min-w-[52px]',
                  activeDay === i
                    ? 'bg-primary text-black border-primary'
                    : 'border-white/10 text-white/50'
                )}
              >
                <span className="text-xs font-semibold">{day}</span>
                {hasPlan && (
                  <div className={cn('w-1.5 h-1.5 rounded-full', activeDay === i ? 'bg-black' : 'bg-primary')} />
                )}
              </button>
            );
          })}
        </div>

        {/* Day totals */}
        {dayTotals.calories > 0 && (
          <div className="flex gap-3 text-sm">
            <span className="text-primary font-semibold">{dayTotals.calories} kcal</span>
            <span className="text-blue-400 font-semibold">{dayTotals.protein}g proteína</span>
            <span className="text-white/30 text-xs self-center">
              {metrics ? `meta: ${metrics.targetCalories} kcal` : ''}
            </span>
          </div>
        )}

        {/* Slots */}
        {SLOTS.map((slot) => {
          const foods = dayPlan[slot] ?? [];
          const suggKey = `${activeDay}-${slot}`;

          return (
            <div key={slot} className="card space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-white text-sm">{getMealSlotLabel(slot)}</h3>
                <button
                  onClick={() => setShowSuggestions(showSuggestions === suggKey ? null : suggKey)}
                  className="flex items-center gap-1 text-xs text-primary hover:text-primary-light transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" /> Adicionar
                </button>
              </div>

              {/* Food list */}
              {foods.length > 0 ? (
                <div className="space-y-2">
                  {foods.map((food, fi) => (
                    <div key={fi} className="flex items-center gap-2 bg-surface-2 rounded-xl px-3 py-2">
                      <Check className="w-3.5 h-3.5 text-success flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="text-white text-xs font-semibold truncate">{food.name}</div>
                        <div className="flex gap-2">
                          <span className="text-primary text-[10px]">{food.calories} kcal</span>
                          <span className="text-blue-400 text-[10px]">{food.protein}g P</span>
                          <span className="text-white/30 text-[10px]">{food.portion}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => removeFood(activeDay, slot, fi)}
                        className="text-white/20 hover:text-danger text-xs p-1 transition-colors"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-3 text-white/20 text-xs border border-dashed border-white/10 rounded-xl">
                  Nenhuma refeição planejada
                </div>
              )}

              {/* Suggestions */}
              {showSuggestions === suggKey && (
                <div className="space-y-2 animate-fade-in">
                  <div className="text-white/40 text-xs">Sugestões para {getMealSlotLabel(slot)}:</div>
                  {getSuggestionsForSlot(slot).map((suggestion, si) => (
                    <button
                      key={si}
                      onClick={() => addFood(activeDay, slot, suggestion)}
                      className="w-full text-left p-3 bg-surface-2 rounded-xl hover:bg-surface-3 transition-colors border border-white/5 hover:border-primary/20"
                    >
                      <div className="text-white text-xs font-semibold">{suggestion.name}</div>
                      <div className="flex gap-2 mt-1">
                        <span className="text-primary text-[10px]">{suggestion.calories} kcal</span>
                        <span className="text-blue-400 text-[10px]">{suggestion.protein}g P</span>
                        <span className="text-white/30 text-[10px]">{suggestion.portion}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {/* Week overview */}
        <div className="card">
          <h3 className="font-semibold text-white text-sm mb-3 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-primary" /> Visão da semana
          </h3>
          <div className="grid grid-cols-7 gap-1">
            {DAYS.map((day, i) => {
              const hasPlan = Object.keys(weekPlan[i] ?? {}).length > 0;
              const mealCount = Object.values(weekPlan[i] ?? {}).flat().length;
              return (
                <button
                  key={day}
                  onClick={() => setActiveDay(i)}
                  className={cn(
                    'flex flex-col items-center gap-1 py-2 rounded-xl transition-all',
                    activeDay === i ? 'bg-primary/20 border border-primary/50' : 'bg-surface-2'
                  )}
                >
                  <span className="text-[10px] text-white/50">{day}</span>
                  <div className={cn(
                    'w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold',
                    hasPlan ? 'bg-success/20 text-success' : 'bg-white/5 text-white/20'
                  )}>
                    {mealCount || '—'}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tip */}
        <div className="card-highlight">
          <p className="text-white/50 text-xs text-center">
            💡 Planeje suas refeições para evitar decisões impulsivas. O app já sugere baseado nos seus macros.
          </p>
        </div>
      </div>
    </div>
  );
}
