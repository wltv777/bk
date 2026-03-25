import { db } from './firebase';
import { doc, updateDoc, getDoc, arrayUnion } from 'firebase/firestore';
import { getLevelInfo, XP_REWARDS } from './calculations';
import type { BadgeId } from '@/types';

type XPAction = keyof typeof XP_REWARDS;

export async function addXP(userId: string, action: XPAction): Promise<{ newXP: number; levelUp: boolean; newLevel: number }> {
  const ref = doc(db, 'users', userId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return { newXP: 0, levelUp: false, newLevel: 1 };

  const data = snap.data();
  const currentXP: number = data.gamification?.xp ?? 0;
  const earnedXP = XP_REWARDS[action];
  const newXP = currentXP + earnedXP;

  const { level: oldLevel } = getLevelInfo(currentXP);
  const { level: newLevel } = getLevelInfo(newXP);
  const levelUp = newLevel > oldLevel;

  await updateDoc(ref, {
    'gamification.xp': newXP,
    'gamification.level': newLevel,
    'gamification.levelName': getLevelInfo(newXP).name,
  });

  return { newXP, levelUp, newLevel };
}

export async function unlockBadge(userId: string, badgeId: BadgeId): Promise<boolean> {
  const ref = doc(db, 'users', userId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return false;

  const existing: BadgeId[] = snap.data().gamification?.badges ?? [];
  if (existing.includes(badgeId)) return false;

  await updateDoc(ref, {
    'gamification.badges': arrayUnion(badgeId),
  });

  await addXP(userId, 'meal_logged'); // bonus XP for badge
  return true;
}

export async function updateStreak(userId: string): Promise<number> {
  const ref = doc(db, 'users', userId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return 0;

  const today = new Date().toISOString().split('T')[0];
  const data = snap.data();
  const lastLogin: string = data.gamification?.lastLoginDate ?? '';
  let streak: number = data.gamification?.streak ?? 0;

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  if (lastLogin === today) return streak;
  if (lastLogin === yesterdayStr) {
    streak += 1;
  } else {
    streak = 1; // reset streak
  }

  await updateDoc(ref, {
    'gamification.streak': streak,
    'gamification.lastLoginDate': today,
  });

  return streak;
}

export const BADGES: Record<BadgeId, { name: string; description: string; emoji: string; xpReward: number }> = {
  first_log:       { name: 'Primeira Refeição', description: 'Registrou sua primeira refeição', emoji: '🍽️', xpReward: 50 },
  first_fast:      { name: 'Primeiro Jejum',    description: 'Completou seu primeiro jejum',   emoji: '⏱️', xpReward: 100 },
  fast_7days:      { name: '7 Dias de Jejum',   description: 'Completou 7 jejuns',              emoji: '🔥', xpReward: 200 },
  protein_week:    { name: 'Semana Proteica',   description: 'Bateu proteína 7 dias seguidos',  emoji: '💪', xpReward: 150 },
  scanner_addict:  { name: 'Scanner Viciado',   description: 'Usou o scanner 20 vezes',         emoji: '📸', xpReward: 75 },
  weight_loss_1kg: { name: 'Primeiro Quilo',    description: 'Perdeu 1kg',                      emoji: '📉', xpReward: 100 },
  weight_loss_5kg: { name: '5 Quilos Abaixo',   description: 'Perdeu 5kg',                      emoji: '🏆', xpReward: 500 },
  streak_7:        { name: '7 Dias no Foco',    description: '7 dias consecutivos de uso',      emoji: '⚡', xpReward: 150 },
  streak_30:       { name: '30 Dias Imparável', description: '30 dias consecutivos',             emoji: '👑', xpReward: 600 },
  workout_10:      { name: '10 Treinos',        description: 'Completou 10 treinos',             emoji: '🏋️', xpReward: 200 },
  clean_week:      { name: 'Semana Limpa',      description: 'Ficou dentro das calorias 7 dias', emoji: '✅', xpReward: 175 },
};
