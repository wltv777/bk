'use client';

import { useState } from 'react';
import { addDoc, collection } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { addXP } from '@/lib/gamification';
import { useDiaryStore } from '@/store/diaryStore';
import { Flame, Clock, Dumbbell, Zap, Play, Check } from 'lucide-react';
import { cn, todayString } from '@/lib/utils';
import toast from 'react-hot-toast';
import type { WorkoutType, WorkoutDuration } from '@/types';

const WORKOUTS = [
  { id: 'hiit_10', name: 'HIIT Explosivo', type: 'hiit' as WorkoutType, duration: 10 as WorkoutDuration, caloriesBurn: 120, emoji: '⚡', premium: false, desc: 'Circuito rápido de alta intensidade. Sem desculpa.' },
  { id: 'abs_20', name: 'Abdômen Total', type: 'abs' as WorkoutType, duration: 20 as WorkoutDuration, caloriesBurn: 150, emoji: '🔥', premium: false, desc: 'Prancha, crunch, bicicleta. Vira torso.' },
  { id: 'strength_20', name: 'Força Básica', type: 'strength' as WorkoutType, duration: 20 as WorkoutDuration, caloriesBurn: 180, emoji: '💪', premium: false, desc: 'Agachamento, flexão, afundo. Clássico que funciona.' },
  { id: 'hiit_30', name: 'HIIT Avançado', type: 'hiit' as WorkoutType, duration: 30 as WorkoutDuration, caloriesBurn: 350, emoji: '🏃', premium: true, desc: 'Tabata + circuito funcional. Premium.' },
  { id: 'yoga_20', name: 'Mobilidade', type: 'yoga' as WorkoutType, duration: 20 as WorkoutDuration, caloriesBurn: 80, emoji: '🧘', premium: false, desc: 'Alongamento e mobilidade. Recuperação ativa.' },
  { id: 'cardio_30', name: 'Cardio Queima', type: 'cardio' as WorkoutType, duration: 30 as WorkoutDuration, caloriesBurn: 300, emoji: '❤️', premium: true, desc: 'Steady state + intervalos. Faixa de treino.' },
];

export default function WorkoutPage() {
  const [completed, setCompleted] = useState<string[]>([]);

  async function finishWorkout(workout: typeof WORKOUTS[0]) {
    if (!auth.currentUser || completed.includes(workout.id)) return;
    try {
      await addDoc(collection(db, 'workouts', auth.currentUser.uid, 'completed'), {
        workoutId: workout.id,
        date: todayString(),
        duration: workout.duration,
        caloriesBurned: workout.caloriesBurn,
        completedAt: new Date(),
      });
      await addXP(auth.currentUser.uid, 'workout_completed');
      setCompleted((prev) => [...prev, workout.id]);
      toast.success(`+${workout.caloriesBurn} kcal queimadas. Continua no foco. 🔥`, { duration: 4000 });
    } catch {
      toast.error('Erro ao salvar treino.');
    }
  }

  const filters: { label: string; value: WorkoutType | 'all' }[] = [
    { label: 'Todos', value: 'all' },
    { label: 'HIIT', value: 'hiit' },
    { label: 'Força', value: 'strength' },
    { label: 'Abdômen', value: 'abs' },
    { label: 'Cardio', value: 'cardio' },
  ];
  const [filter, setFilter] = useState<WorkoutType | 'all'>('all');

  const filtered = filter === 'all' ? WORKOUTS : WORKOUTS.filter((w) => w.type === filter);

  return (
    <div className="min-h-screen bg-black">
      <div className="px-5 pt-12 pb-4">
        <h1 className="section-title text-3xl mb-1">Treinos</h1>
        <p className="text-white/40 text-sm">Rápidos, intensos e sem enrolação</p>
      </div>

      {/* Filter chips */}
      <div className="px-5 mb-4 flex gap-2 overflow-x-auto scrollbar-hide pb-1">
        {filters.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={cn(
              'flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-semibold border transition-all',
              filter === f.value ? 'bg-primary text-black border-primary' : 'border-white/20 text-white/50'
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="px-5 space-y-3 pb-6">
        {filtered.map((workout) => {
          const done = completed.includes(workout.id);
          return (
            <div key={workout.id} className={cn('card-highlight transition-all', done && 'opacity-60')}>
              <div className="flex items-start gap-3">
                <div className="text-3xl">{workout.emoji}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-white">{workout.name}</h3>
                    {workout.premium && (
                      <span className="text-[10px] bg-primary/20 text-primary px-1.5 py-0.5 rounded-full font-semibold">PREMIUM</span>
                    )}
                  </div>
                  <p className="text-white/40 text-xs mt-0.5">{workout.desc}</p>
                  <div className="flex gap-3 mt-2">
                    <span className="flex items-center gap-1 text-xs text-white/40">
                      <Clock className="w-3 h-3" /> {workout.duration} min
                    </span>
                    <span className="flex items-center gap-1 text-xs text-orange-400">
                      <Flame className="w-3 h-3" /> ~{workout.caloriesBurn} kcal
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => finishWorkout(workout)}
                  disabled={done}
                  className={cn(
                    'p-2.5 rounded-xl transition-all flex-shrink-0',
                    done ? 'bg-success/20 text-success' : 'bg-primary/20 text-primary hover:bg-primary/30'
                  )}
                >
                  {done ? <Check className="w-5 h-5" /> : <Play className="w-5 h-5 fill-current" />}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
