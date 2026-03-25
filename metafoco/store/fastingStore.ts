import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { FastingSession, FastingProtocol } from '@/types';

interface FastingState {
  activeSession: FastingSession | null;
  history: FastingSession[];
  startFast: (protocol: FastingProtocol, calsPreviousDay: number) => void;
  endFast: (completed?: boolean) => void;
  setHistory: (history: FastingSession[]) => void;
  getRemainingSeconds: () => number;
  getElapsedPercent: () => number;
}

export const useFastingStore = create<FastingState>()(
  persist(
    (set, get) => ({
      activeSession: null,
      history: [],

      startFast: (protocol, calsPreviousDay) => {
        const now = new Date();
        const hours = parseInt(protocol.split(':')[0]);
        const endsAt = new Date(now.getTime() + hours * 60 * 60 * 1000);
        const session: FastingSession = {
          id: `fast_${Date.now()}`,
          userId: '',
          protocol,
          startedAt: now,
          endsAt,
          completed: false,
          caloriesdayBefore: calsPreviousDay,
        };
        set({ activeSession: session });
      },

      endFast: (completed = false) => {
        const active = get().activeSession;
        if (!active) return;
        const ended: FastingSession = { ...active, endedAt: new Date(), completed };
        set((s) => ({
          activeSession: null,
          history: [ended, ...s.history].slice(0, 50),
        }));
      },

      setHistory: (history) => set({ history }),

      getRemainingSeconds: () => {
        const session = get().activeSession;
        if (!session) return 0;
        const remaining = session.endsAt.getTime() - Date.now();
        return Math.max(Math.floor(remaining / 1000), 0);
      },

      getElapsedPercent: () => {
        const session = get().activeSession;
        if (!session) return 0;
        const total = session.endsAt.getTime() - session.startedAt.getTime();
        const elapsed = Date.now() - session.startedAt.getTime();
        return Math.min(Math.round((elapsed / total) * 100), 100);
      },
    }),
    { name: 'metafoco-fasting' }
  )
);
