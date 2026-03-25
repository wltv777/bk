import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserProfile, UserMetrics, PremiumStatus, GamificationData, NotificationConfig } from '@/types';

interface UserState {
  profile: UserProfile | null;
  metrics: UserMetrics | null;
  premium: PremiumStatus;
  gamification: GamificationData;
  notifications: NotificationConfig;
  setProfile: (profile: UserProfile) => void;
  setMetrics: (metrics: UserMetrics) => void;
  setPremium: (premium: PremiumStatus) => void;
  setGamification: (data: GamificationData) => void;
  updateWeight: (weight: number) => void;
  clearUser: () => void;
}

const defaultGamification: GamificationData = {
  xp: 0,
  level: 1,
  levelName: 'Iniciante Corajoso',
  streak: 0,
  lastLoginDate: '',
  badges: [],
};

const defaultNotifications: NotificationConfig = {
  waterReminder: true,
  waterReminderTimes: ['08:00', '12:00', '15:00', '18:00', '21:00'],
  weighInTime: '07:00',
  proteinAlert: true,
  workoutReminder: true,
  workoutTime: '18:00',
  fastingAlerts: true,
};

const defaultPremium: PremiumStatus = {
  active: false,
  plan: null,
};

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      profile: null,
      metrics: null,
      premium: defaultPremium,
      gamification: defaultGamification,
      notifications: defaultNotifications,

      setProfile: (profile) => set({ profile }),
      setMetrics: (metrics) => set({ metrics }),
      setPremium: (premium) => set({ premium }),
      setGamification: (gamification) => set({ gamification }),
      updateWeight: (weight) =>
        set((state) => ({
          profile: state.profile ? { ...state.profile, weight } : null,
        })),
      clearUser: () =>
        set({
          profile: null,
          metrics: null,
          premium: defaultPremium,
          gamification: defaultGamification,
        }),
    }),
    { name: 'metafoco-user' }
  )
);
