import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCalories(cal: number): string {
  return cal.toLocaleString('pt-BR');
}

export function formatMacro(g: number): string {
  return `${Math.round(g)}g`;
}

export function formatWeight(kg: number): string {
  return `${kg.toFixed(1)}kg`;
}

export function formatPercent(value: number, total: number): number {
  if (total === 0) return 0;
  return Math.min(Math.round((value / total) * 100), 100);
}

export function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}h ${m.toString().padStart(2, '0')}m`;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

export function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  if (hours > 0) return `${hours}h ${minutes}min`;
  return `${minutes}min`;
}

export function todayString(): string {
  return new Date().toISOString().split('T')[0];
}

export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Bom dia';
  if (hour < 18) return 'Boa tarde';
  return 'Boa noite';
}

export function getMealSlotLabel(slot: string): string {
  const labels: Record<string, string> = {
    breakfast: 'Café da manhã',
    lunch: 'Almoço',
    dinner: 'Jantar',
    snack: 'Lanche',
    pre_workout: 'Pré-treino',
    post_workout: 'Pós-treino',
  };
  return labels[slot] ?? slot;
}

export function getActivityLabel(level: string): string {
  const labels: Record<string, string> = {
    sedentary: 'Sedentário',
    light: 'Levemente ativo',
    moderate: 'Moderado',
    active: 'Muito ativo',
    very_active: 'Extremamente ativo',
  };
  return labels[level] ?? level;
}

export function getGoalLabel(goal: string): string {
  const labels: Record<string, string> = {
    lose: 'Perder peso',
    gain: 'Ganhar massa',
    maintain: 'Manter peso',
  };
  return labels[goal] ?? goal;
}

export function getFastingProtocolHours(protocol: string): { fast: number; eat: number } {
  const map: Record<string, { fast: number; eat: number }> = {
    '14:10': { fast: 14, eat: 10 },
    '16:8':  { fast: 16, eat: 8 },
    '18:6':  { fast: 18, eat: 6 },
    '20:4':  { fast: 20, eat: 4 },
  };
  return map[protocol] ?? { fast: 16, eat: 8 };
}

export function getRemainingMacros(
  target: { calories: number; protein: number; carbs: number; fat: number },
  consumed: { calories: number; protein: number; carbs: number; fat: number }
) {
  return {
    calories: Math.max(target.calories - consumed.calories, 0),
    protein:  Math.max(target.protein  - consumed.protein, 0),
    carbs:    Math.max(target.carbs    - consumed.carbs, 0),
    fat:      Math.max(target.fat      - consumed.fat, 0),
  };
}

export function coachTone(message: string): string {
  return message;
}

export function anonymousName(uid: string): string {
  const adjectives = ['Feroz', 'Focado', 'Bruto', 'Intenso', 'Implacável', 'Determinado', 'Trincado'];
  const nouns = ['Guerreiro', 'Atleta', 'Leão', 'Tigre', 'Campeão', 'Ninja', 'Viking'];
  const hash = uid.charCodeAt(0) + uid.charCodeAt(uid.length - 1);
  return `${adjectives[hash % adjectives.length]} ${nouns[(hash + 3) % nouns.length]}`;
}
