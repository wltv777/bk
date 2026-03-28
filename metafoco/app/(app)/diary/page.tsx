'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { collection, addDoc, getDocs, query, where, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { useDiaryStore } from '@/store/diaryStore';
import { useUserStore } from '@/store/userStore';
import { MacroBar } from '@/components/shared/MacroBar';
import { ProgressRing } from '@/components/shared/ProgressRing';
import { addXP } from '@/lib/gamification';
import { formatPercent, getMealSlotLabel, todayString } from '@/lib/utils';
import { Search, Plus, Trash2, ChevronDown, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';
import type { MealEntry, MealSlot } from '@/types';

interface SearchResult {
  id: string;
  name: string;
  brand?: string;
  calories_100g: number;
  proteins_100g: number;
  carbohydrates_100g: number;
  fat_100g: number;
  fiber_100g?: number;
}

function DiaryContent() {
  const { entries, getTodayTotals, addEntry, removeEntry, setEntries } = useDiaryStore();
  const { metrics } = useUserStore();
  const searchParams = useSearchParams();
  const [showAdd, setShowAdd] = useState(searchParams.get('action') === 'add');
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<MealSlot>('lunch');
  const [quantity, setQuantity] = useState(100);
  const [selectedFood, setSelectedFood] = useState<SearchResult | null>(null);
  const [saving, setSaving] = useState(false);

  const totals = getTodayTotals();
  const today = todayString();

  useEffect(() => {
    if (!auth.currentUser) return;
    getDocs(
      query(collection(db, 'meals', auth.currentUser.uid, 'entries'), where('date', '==', today))
    ).then((snap) => {
      setEntries(snap.docs.map((d) => ({ id: d.id, ...d.data() })) as MealEntry[]);
    });
  }, [today, setEntries]);

  async function searchFood(q: string) {
    if (q.length < 2) { setResults([]); return; }
    setSearching(true);
    try {
      const res = await fetch(
        `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(q)}&search_simple=1&action=process&json=1&page_size=10&lc=pt`
      );
      const data = await res.json();
      const products: SearchResult[] = (data.products ?? [])
        .filter((p: any) => p.product_name && p.nutriments?.energy_100g)
        .slice(0, 8)
        .map((p: any) => ({
          id: p.id,
          name: p.product_name || p.product_name_pt || 'Alimento',
          brand: p.brands,
          calories_100g: Math.round((p.nutriments?.['energy-kcal_100g'] ?? p.nutriments?.energy_100g / 4.184) || 0),
          proteins_100g: parseFloat(p.nutriments?.proteins_100g ?? 0),
          carbohydrates_100g: parseFloat(p.nutriments?.carbohydrates_100g ?? 0),
          fat_100g: parseFloat(p.nutriments?.fat_100g ?? 0),
          fiber_100g: parseFloat(p.nutriments?.fiber_100g ?? 0),
        }));
      setResults(products);
    } catch {
      toast.error('Erro ao buscar. Tente novamente.');
    } finally {
      setSearching(false);
    }
  }

  useEffect(() => {
    const t = setTimeout(() => searchFood(searchQuery), 400);
    return () => clearTimeout(t);
  }, [searchQuery]);

  async function saveEntry() {
    if (!selectedFood || !auth.currentUser) return;
    setSaving(true);
    const factor = quantity / 100;
    const entry = {
      userId: auth.currentUser.uid,
      date: today,
      slot: selectedSlot,
      foodName: selectedFood.name,
      quantity,
      quantityUnit: 'g',
      calories: Math.round(selectedFood.calories_100g * factor),
      protein:  Math.round(selectedFood.proteins_100g * factor * 10) / 10,
      carbs:    Math.round(selectedFood.carbohydrates_100g * factor * 10) / 10,
      fat:      Math.round(selectedFood.fat_100g * factor * 10) / 10,
      fiber:    Math.round((selectedFood.fiber_100g ?? 0) * factor * 10) / 10,
      source: 'manual' as const,
      createdAt: new Date(),
    };

    try {
      const ref = await addDoc(collection(db, 'meals', auth.currentUser.uid, 'entries'), entry);
      addEntry({ ...entry, id: ref.id });
      await addXP(auth.currentUser.uid, 'meal_logged');
      toast.success(`${selectedFood.name} adicionado! 🍽️`);
      setSelectedFood(null);
      setSearchQuery('');
      setResults([]);
      setShowAdd(false);
    } catch {
      toast.error('Erro ao salvar. Tente novamente.');
    } finally {
      setSaving(false);
    }
  }

  async function deleteEntry(id: string) {
    if (!auth.currentUser) return;
    await deleteDoc(doc(db, 'meals', auth.currentUser.uid, 'entries', id));
    removeEntry(id);
    toast.success('Removido.');
  }

  const todayEntries = entries.filter((e) => e.date === today);
  const slots: MealSlot[] = ['breakfast', 'lunch', 'dinner', 'snack', 'pre_workout', 'post_workout'];

  return (
    <div className="min-h-screen bg-black">
      <div className="px-5 pt-12 pb-6">
        <h1 className="section-title text-3xl mb-1">Diário</h1>
        <p className="text-white/40 text-sm">O que você comeu hoje?</p>
      </div>

      {/* Totals summary */}
      {metrics && (
        <div className="px-5 mb-4">
          <div className="card space-y-3">
            <div className="flex items-center gap-4">
              <ProgressRing value={formatPercent(totals.calories, metrics.targetCalories)} size={80} strokeWidth={8} label={`${formatPercent(totals.calories, metrics.targetCalories)}%`} sublabel="" />
              <div className="flex-1 space-y-2">
                <MacroBar label="Proteína" consumed={totals.protein} target={metrics.targetProtein} color="#3B82F6" bgColor="bg-blue-500" textColor="text-blue-400" />
                <MacroBar label="Carbo" consumed={totals.carbs} target={metrics.targetCarbs} color="#F97316" bgColor="bg-orange-500" textColor="text-orange-400" />
                <MacroBar label="Gordura" consumed={totals.fat} target={metrics.targetFat} color="#EAB308" bgColor="bg-yellow-500" textColor="text-yellow-400" />
              </div>
            </div>
            <div className="text-center text-white/40 text-xs">
              {Math.round(totals.calories)} / {metrics.targetCalories} kcal consumidas
            </div>
          </div>
        </div>
      )}

      {/* Add food button */}
      <div className="px-5 mb-4">
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="btn-primary w-full flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" />
          ADICIONAR REFEIÇÃO
        </button>
      </div>

      {/* Add food panel */}
      {showAdd && (
        <div className="px-5 mb-4 space-y-3">
          <div className="card-highlight space-y-3">
            {/* Slot selector */}
            <div className="space-y-1">
              <label className="text-white/50 text-xs">Refeição</label>
              <div className="relative">
                <select
                  value={selectedSlot}
                  onChange={(e) => setSelectedSlot(e.target.value as MealSlot)}
                  className="input appearance-none pr-8"
                >
                  {slots.map((s) => (
                    <option key={s} value={s} className="bg-surface">{getMealSlotLabel(s)}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 w-4 h-4 pointer-events-none" />
              </div>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 w-4 h-4" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar alimento..."
                className="input pl-10"
                autoFocus
              />
              {searching && (
                <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 text-primary w-4 h-4 animate-spin" />
              )}
            </div>

            {/* Results */}
            {results.length > 0 && !selectedFood && (
              <div className="space-y-1 max-h-60 overflow-y-auto">
                {results.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => setSelectedFood(r)}
                    className="w-full text-left p-3 rounded-xl bg-surface hover:bg-surface-2 transition-colors"
                  >
                    <div className="font-semibold text-sm text-white truncate">{r.name}</div>
                    {r.brand && <div className="text-xs text-white/30">{r.brand}</div>}
                    <div className="flex gap-3 mt-1">
                      <span className="text-xs text-primary">{r.calories_100g} kcal</span>
                      <span className="text-xs text-blue-400">{r.proteins_100g}g prot</span>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Selected food */}
            {selectedFood && (
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-bold text-white text-sm">{selectedFood.name}</div>
                    <div className="flex gap-2 mt-1">
                      <span className="macro-badge macro-cal">{Math.round(selectedFood.calories_100g * quantity / 100)} kcal</span>
                      <span className="macro-badge macro-protein">{(selectedFood.proteins_100g * quantity / 100).toFixed(1)}g P</span>
                    </div>
                  </div>
                  <button onClick={() => setSelectedFood(null)} className="text-white/30 text-xs">Trocar</button>
                </div>

                <div className="space-y-1">
                  <label className="text-white/50 text-xs">Quantidade (gramas)</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={quantity}
                      onChange={(e) => setQuantity(Number(e.target.value))}
                      min={1}
                      max={2000}
                      className="input pr-8"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 text-sm">g</span>
                  </div>
                </div>

                <button
                  onClick={saveEntry}
                  disabled={saving}
                  className={cn('btn-primary w-full flex items-center justify-center gap-2', saving && 'opacity-60 pointer-events-none')}
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'SALVAR'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Entries by slot */}
      <div className="px-5 space-y-6 pb-6">
        {slots
          .filter((slot) => todayEntries.some((e) => e.slot === slot))
          .map((slot) => {
            const slotEntries = todayEntries.filter((e) => e.slot === slot);
            const slotCals = slotEntries.reduce((acc, e) => acc + e.calories, 0);
            return (
              <div key={slot}>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-white/80">{getMealSlotLabel(slot)}</h3>
                  <span className="text-xs text-white/30">{slotCals} kcal</span>
                </div>
                <div className="space-y-2">
                  {slotEntries.map((entry) => (
                    <div key={entry.id} className="card flex items-center gap-3">
                      <div className="flex-1">
                        <div className="text-sm font-semibold text-white">{entry.foodName}</div>
                        <div className="flex gap-2 mt-1">
                          <span className="text-xs text-white/30">{entry.quantity}g</span>
                          <span className="text-xs text-primary">{entry.calories} kcal</span>
                          <span className="text-xs text-blue-400">{entry.protein}g P</span>
                          <span className="text-xs text-orange-400">{entry.carbs}g C</span>
                        </div>
                      </div>
                      <button
                        onClick={() => deleteEntry(entry.id)}
                        className="p-2 rounded-lg bg-white/5 hover:bg-danger/20 text-white/30 hover:text-danger transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

        {todayEntries.length === 0 && (
          <div className="text-center py-12">
            <div className="text-4xl mb-3">🍽️</div>
            <p className="text-white/40 text-sm">Nenhuma refeição registrada hoje.</p>
            <p className="text-white/20 text-xs mt-1">Use o botão + para adicionar.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function DiaryPage() {
  return <Suspense fallback={<div className="min-h-screen bg-black" />}><DiaryContent /></Suspense>;
}
