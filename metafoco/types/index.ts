// ============================================================
// METAFOCO — Core TypeScript Types
// ============================================================

export type Sex = 'male' | 'female' | 'other';
export type Goal = 'lose' | 'gain' | 'maintain';
export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
export type DietProtocol = 'fasting' | 'standard' | 'high_protein' | 'keto' | 'vegan';
export type FastingProtocol = '14:10' | '16:8' | '18:6' | '20:4';
export type MealSlot = 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'pre_workout' | 'post_workout';
export type PremiumPlan = 'monthly' | 'yearly' | null;

// ─── User ────────────────────────────────────────────────────
export interface UserProfile {
  uid: string;
  email: string;
  name: string;
  avatarUrl?: string;
  sex: Sex;
  age: number;
  height: number;       // cm
  weight: number;       // kg
  targetWeight: number; // kg
  goal: Goal;
  activityLevel: ActivityLevel;
  dietProtocol: DietProtocol;
  fastingProtocol: FastingProtocol;
  restrictions: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface UserMetrics {
  bmr: number;          // kcal/dia
  tdee: number;         // kcal/dia
  targetCalories: number;
  targetProtein: number;  // g
  targetCarbs: number;    // g
  targetFat: number;      // g
  targetWater: number;    // ml
}

// ─── Food & Diary ─────────────────────────────────────────────
export interface MacroInfo {
  calories: number;
  protein: number;   // g
  carbs: number;     // g
  fat: number;       // g
  fiber?: number;    // g
  sodium?: number;   // mg
}

export interface FoodItem extends MacroInfo {
  id: string;
  name: string;
  brand?: string;
  barcode?: string;
  portion: number;   // g
  portionUnit: string;
  imageUrl?: string;
  source: 'manual' | 'scanner' | 'barcode' | 'openfoodfacts';
}

export interface MealEntry extends MacroInfo {
  id: string;
  userId: string;
  date: string;        // YYYY-MM-DD
  slot: MealSlot;
  foodName: string;
  quantity: number;    // g or units
  quantityUnit: string;
  imageUrl?: string;
  source: 'manual' | 'scanner' | 'barcode';
  createdAt: Date;
}

// ─── Fasting ─────────────────────────────────────────────────
export interface FastingSession {
  id: string;
  userId: string;
  protocol: FastingProtocol;
  startedAt: Date;
  endsAt: Date;
  endedAt?: Date;
  completed: boolean;
  caloriesdayBefore: number;
  notes?: string;
}

// ─── Workout ─────────────────────────────────────────────────
export type WorkoutType = 'hiit' | 'strength' | 'cardio' | 'abs' | 'yoga';
export type WorkoutDuration = 10 | 20 | 30;

export interface Workout {
  id: string;
  name: string;
  type: WorkoutType;
  duration: WorkoutDuration;
  caloriesBurn: number;
  exercises: Exercise[];
  gifUrl?: string;
  premium: boolean;
}

export interface Exercise {
  name: string;
  sets?: number;
  reps?: number;
  duration?: number;  // seconds
  gifUrl?: string;
}

export interface WorkoutCompleted {
  id: string;
  userId: string;
  workoutId: string;
  date: string;
  duration: WorkoutDuration;
  caloriesBurned: number;
  completedAt: Date;
}

// ─── Bioimpedance ─────────────────────────────────────────────
export interface BioimpedanceLog {
  id: string;
  userId: string;
  date: string;
  weight: number;          // kg
  bodyFatPercent: number;  // %
  muscleMass: number;      // kg
  visceralFat: number;     // level 1-20
  waterPercent: number;    // %
  metabolicAge: number;    // years
  bmr: number;             // kcal/day
  boneMass?: number;       // kg
  source: 'manual' | 'bluetooth';
  createdAt: Date;
}

// ─── Progress ────────────────────────────────────────────────
export interface ProgressPhoto {
  id: string;
  userId: string;
  date: string;
  imageUrl: string;
  weight?: number;
  bodyFatPercent?: number;
  notes?: string;
  createdAt: Date;
}

// ─── Gamification ────────────────────────────────────────────
export type BadgeId =
  | 'first_log'
  | 'first_fast'
  | 'fast_7days'
  | 'protein_week'
  | 'scanner_addict'
  | 'weight_loss_1kg'
  | 'weight_loss_5kg'
  | 'streak_7'
  | 'streak_30'
  | 'workout_10'
  | 'clean_week';

export interface Badge {
  id: BadgeId;
  name: string;
  description: string;
  emoji: string;
  xpReward: number;
  unlockedAt?: Date;
}

export interface GamificationData {
  xp: number;
  level: number;
  levelName: string;
  streak: number;
  lastLoginDate: string;
  badges: BadgeId[];
  weeklyRank?: number;
}

// ─── Notifications ────────────────────────────────────────────
export type NotificationType =
  | 'fast_start'
  | 'fast_end'
  | 'fast_warning'
  | 'protein_low'
  | 'water_reminder'
  | 'weigh_in'
  | 'workout_reminder'
  | 'streak_at_risk'
  | 'badge_unlocked'
  | 'sos_mode';

export interface NotificationConfig {
  waterReminder: boolean;
  waterReminderTimes: string[];  // HH:mm
  weighInTime: string;           // HH:mm
  proteinAlert: boolean;
  workoutReminder: boolean;
  workoutTime: string;           // HH:mm
  fastingAlerts: boolean;
}

// ─── Community ───────────────────────────────────────────────
export interface CommunityPost {
  id: string;
  userId: string;
  anonymousName: string;
  content: string;
  weightChange?: number;
  streak?: number;
  likes: number;
  createdAt: Date;
}

export interface Challenge {
  id: string;
  name: string;
  description: string;
  emoji: string;
  startDate: string;
  endDate: string;
  metric: 'protein' | 'fasting' | 'workout' | 'streak';
  participants: ChallengeParticipant[];
}

export interface ChallengeParticipant {
  userId: string;
  anonymousName: string;
  score: number;
  rank: number;
}

// ─── Meal Plan ───────────────────────────────────────────────
export interface MealPlan {
  id: string;
  userId: string;
  weekStart: string;  // YYYY-MM-DD (Monday)
  days: MealPlanDay[];
}

export interface MealPlanDay {
  date: string;
  meals: PlannedMeal[];
  totalCalories: number;
  totalProtein: number;
}

export interface PlannedMeal {
  slot: MealSlot;
  foods: FoodItem[];
}

// ─── Premium ─────────────────────────────────────────────────
export interface PremiumStatus {
  active: boolean;
  plan: PremiumPlan;
  expiresAt?: Date;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
}

// ─── Dashboard ───────────────────────────────────────────────
export interface DailyStats {
  date: string;
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  totalWater: number;
  caloriesBurned: number;
  fastingActive: boolean;
  fastingCompleted: boolean;
  missionCompleted: boolean;
}

// ─── API Responses ───────────────────────────────────────────
export interface ScanFoodResult {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  portion: number;
  portionUnit: string;
  confidence: number;
  clarifyingQuestions?: string[];
  imageDescription?: string;
}

export interface CoachMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}
