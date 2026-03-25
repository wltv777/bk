import { create } from 'zustand';
import type { MealEntry, DailyStats } from '@/types';
import { todayString } from '@/lib/utils';

interface DiaryState {
  entries: MealEntry[];
  dailyStats: DailyStats | null;
  selectedDate: string;
  setEntries: (entries: MealEntry[]) => void;
  addEntry: (entry: MealEntry) => void;
  removeEntry: (id: string) => void;
  setDailyStats: (stats: DailyStats) => void;
  setSelectedDate: (date: string) => void;
  getTodayTotals: () => { calories: number; protein: number; carbs: number; fat: number };
}

export const useDiaryStore = create<DiaryState>()((set, get) => ({
  entries: [],
  dailyStats: null,
  selectedDate: todayString(),

  setEntries: (entries) => set({ entries }),
  addEntry: (entry) => set((s) => ({ entries: [...s.entries, entry] })),
  removeEntry: (id) => set((s) => ({ entries: s.entries.filter((e) => e.id !== id) })),
  setDailyStats: (dailyStats) => set({ dailyStats }),
  setSelectedDate: (selectedDate) => set({ selectedDate }),

  getTodayTotals: () => {
    const today = get().selectedDate;
    const entries = get().entries.filter((e) => e.date === today);
    return entries.reduce(
      (acc, e) => ({
        calories: acc.calories + e.calories,
        protein:  acc.protein  + e.protein,
        carbs:    acc.carbs    + e.carbs,
        fat:      acc.fat      + e.fat,
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );
  },
}));
