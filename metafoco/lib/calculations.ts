import type { Sex, ActivityLevel, Goal, FastingProtocol, UserProfile, UserMetrics } from '@/types';

// ─── TMB — Harris-Benedict revisado (Mifflin-St Jeor) ────────
export function calculateBMR(sex: Sex, weight: number, height: number, age: number): number {
  if (sex === 'male') {
    return Math.round(10 * weight + 6.25 * height - 5 * age + 5);
  }
  return Math.round(10 * weight + 6.25 * height - 5 * age - 161);
}

// ─── TDEE — Gasto calórico total diário ──────────────────────
const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
};

export function calculateTDEE(bmr: number, activityLevel: ActivityLevel): number {
  return Math.round(bmr * ACTIVITY_MULTIPLIERS[activityLevel]);
}

// ─── Calorias alvo por objetivo ──────────────────────────────
export function calculateTargetCalories(tdee: number, goal: Goal): number {
  switch (goal) {
    case 'lose':     return Math.round(tdee - 500);   // déficit -500 kcal
    case 'gain':     return Math.round(tdee + 300);   // superávit +300 kcal
    case 'maintain': return tdee;
  }
}

// ─── Macros alvo ─────────────────────────────────────────────
export function calculateMacros(targetCalories: number, weight: number, goal: Goal) {
  // Proteína: 2g/kg para ganho/perda, 1.6g/kg para manutenção
  const proteinMultiplier = goal === 'maintain' ? 1.6 : 2.0;
  const targetProtein = Math.round(weight * proteinMultiplier);

  // Gordura: 25-30% das calorias
  const fatCalories = targetCalories * 0.27;
  const targetFat = Math.round(fatCalories / 9);

  // Carboidratos: o restante
  const proteinCalories = targetProtein * 4;
  const remainingCalories = targetCalories - proteinCalories - fatCalories;
  const targetCarbs = Math.round(Math.max(remainingCalories, 50 * 4) / 4);

  return { targetProtein, targetFat, targetCarbs };
}

// ─── Água diária recomendada ──────────────────────────────────
export function calculateWaterTarget(weight: number, activityLevel: ActivityLevel): number {
  const base = weight * 35; // ml
  const activityBonus: Record<ActivityLevel, number> = {
    sedentary: 0,
    light: 200,
    moderate: 400,
    active: 600,
    very_active: 800,
  };
  return Math.round(base + activityBonus[activityLevel]);
}

// ─── Sugestão de protocolo de jejum ──────────────────────────
export function suggestFastingProtocol(goal: Goal, activityLevel: ActivityLevel): FastingProtocol {
  if (goal === 'lose') {
    if (activityLevel === 'sedentary' || activityLevel === 'light') return '16:8';
    return '14:10';
  }
  if (goal === 'gain') return '14:10';
  return '16:8';
}

// ─── Cálculo completo de métricas do usuário ─────────────────
export function calculateUserMetrics(profile: UserProfile): UserMetrics {
  const bmr = calculateBMR(profile.sex, profile.weight, profile.height, profile.age);
  const tdee = calculateTDEE(bmr, profile.activityLevel);
  const targetCalories = calculateTargetCalories(tdee, profile.goal);
  const { targetProtein, targetFat, targetCarbs } = calculateMacros(targetCalories, profile.weight, profile.goal);
  const targetWater = calculateWaterTarget(profile.weight, profile.activityLevel);

  return { bmr, tdee, targetCalories, targetProtein, targetFat, targetCarbs, targetWater };
}

// ─── IMC ─────────────────────────────────────────────────────
export function calculateBMI(weight: number, height: number): number {
  return parseFloat((weight / Math.pow(height / 100, 2)).toFixed(1));
}

export function bmiLabel(bmi: number): string {
  if (bmi < 18.5) return 'Abaixo do peso';
  if (bmi < 25)   return 'Peso normal';
  if (bmi < 30)   return 'Sobrepeso';
  if (bmi < 35)   return 'Obesidade I';
  if (bmi < 40)   return 'Obesidade II';
  return 'Obesidade III';
}

// ─── Percentual de gordura ideal ─────────────────────────────
export function isBodyFatHealthy(bodyFatPercent: number, sex: Sex): boolean {
  if (sex === 'male') return bodyFatPercent >= 10 && bodyFatPercent <= 20;
  return bodyFatPercent >= 18 && bodyFatPercent <= 28;
}

// ─── Estimativa de tempo para alcançar meta ──────────────────
export function estimateWeeksToGoal(currentWeight: number, targetWeight: number, weeklyDeficit: number = 3500): number {
  const totalWeightDiff = Math.abs(currentWeight - targetWeight);
  const kgPerWeek = (weeklyDeficit * 7) / 7700; // ~0.5kg/semana com 500 kcal/dia déficit
  return Math.ceil(totalWeightDiff / kgPerWeek);
}

// ─── XP por ação ─────────────────────────────────────────────
export const XP_REWARDS = {
  meal_logged: 10,
  fast_completed: 50,
  workout_completed: 30,
  weight_logged: 20,
  bioimpedance_logged: 25,
  scan_used: 5,
  daily_streak: 15,
  water_goal: 10,
} as const;

// ─── Nomes de nível por XP ───────────────────────────────────
export function getLevelInfo(xp: number): { level: number; name: string; nextLevelXP: number } {
  const levels = [
    { min: 0,    name: 'Iniciante Corajoso' },
    { min: 100,  name: 'Guerreiro da Dieta' },
    { min: 300,  name: 'Atleta em Formação' },
    { min: 600,  name: 'Máquina de Foco' },
    { min: 1000, name: 'Lenda do Jejum' },
    { min: 1500, name: 'Mestre dos Macros' },
    { min: 2200, name: 'Elite Metabólico' },
    { min: 3000, name: 'Trincado de Fato' },
    { min: 4000, name: 'Deus do Déficit' },
    { min: 5500, name: 'Metamorfose Completa' },
  ];

  let level = 1;
  let levelName = levels[0].name;
  let nextLevelXP = levels[1].min;

  for (let i = 0; i < levels.length; i++) {
    if (xp >= levels[i].min) {
      level = i + 1;
      levelName = levels[i].name;
      nextLevelXP = i + 1 < levels.length ? levels[i + 1].min : levels[i].min + 2000;
    }
  }

  return { level, name: levelName, nextLevelXP };
}
