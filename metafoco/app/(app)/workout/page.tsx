'use client';

import { useState, useEffect, useRef } from 'react';
import { collection, addDoc, getDocs, query, orderBy, updateDoc, doc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { addXP } from '@/lib/gamification';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Clock, Dumbbell, Plus, Check, Play, Pause, RotateCcw, Link, Trash2, ChevronDown, ChevronUp, X } from 'lucide-react';
import { cn, todayString } from '@/lib/utils';
import toast from 'react-hot-toast';

// ─── Types ───────────────────────────────────────────────────
interface Exercise {
  name: string;
  sets: number;
  reps: string;   // "12" or "12-15" or "até a falha"
  rest: number;   // seconds
  videoUrl?: string;
  notes?: string;
}

interface CustomWorkout {
  id?: string;
  name: string;
  category: string;
  exercises: Exercise[];
  estimatedDuration: number; // min
  createdAt?: Date;
}

interface CompletedLog {
  id: string;
  workoutName: string;
  category: string;
  date: string;
  duration: number;
  completedAt: Date;
}

const CATEGORIES = [
  { label: 'Peito',     emoji: '🫀' },
  { label: 'Costas',    emoji: '🦾' },
  { label: 'Pernas',    emoji: '🦵' },
  { label: 'Ombros',    emoji: '💪' },
  { label: 'Bíceps',    emoji: '💪' },
  { label: 'Tríceps',   emoji: '🦴' },
  { label: 'Abdômen',   emoji: '🔥' },
  { label: 'HIIT',      emoji: '⚡' },
  { label: 'Cardio',    emoji: '❤️' },
  { label: 'Completo',  emoji: '🏋️' },
  { label: 'Mobilidade',emoji: '🧘' },
];

const QUICK_WORKOUTS = [
  { id: 'hiit_10', name: 'HIIT 10min', category: 'HIIT', emoji: '⚡', duration: 10, cal: 120, exercises: [{ name: 'Burpee', sets: 3, reps: '10', rest: 30 }, { name: 'Mountain Climber', sets: 3, reps: '30s', rest: 20 }, { name: 'Jump Squat', sets: 3, reps: '15', rest: 30 }] },
  { id: 'abs_20', name: 'Abdômen Total', category: 'Abdômen', emoji: '🔥', duration: 20, cal: 150, exercises: [{ name: 'Prancha', sets: 3, reps: '45s', rest: 30 }, { name: 'Crunch', sets: 4, reps: '20', rest: 20 }, { name: 'Bicicleta', sets: 3, reps: '30', rest: 20 }] },
  { id: 'strength_20', name: 'Força Básica', category: 'Completo', emoji: '💪', duration: 20, cal: 180, exercises: [{ name: 'Agachamento', sets: 4, reps: '12', rest: 60 }, { name: 'Flexão', sets: 4, reps: '15', rest: 45 }, { name: 'Afundo', sets: 3, reps: '12 cada', rest: 45 }] },
];

type Tab = 'library' | 'custom' | 'history';

export default function WorkoutPage() {
  const [tab, setTab] = useState<Tab>('library');
  const [completedIds, setCompletedIds] = useState<string[]>([]);
  const [myWorkouts, setMyWorkouts] = useState<CustomWorkout[]>([]);
  const [logs, setLogs] = useState<CompletedLog[]>([]);
  const [categoryFilter, setCategoryFilter] = useState('Todos');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Rest timer state
  const [restTimer, setRestTimer] = useState<number | null>(null);
  const [restRunning, setRestRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Builder state
  const [showBuilder, setShowBuilder] = useState(false);
  const [editWorkout, setEditWorkout] = useState<CustomWorkout>({
    name: '', category: 'Peito', exercises: [], estimatedDuration: 30,
  });
  const [newExercise, setNewExercise] = useState<Exercise>({
    name: '', sets: 3, reps: '12', rest: 60, videoUrl: '', notes: '',
  });

  useEffect(() => {
    if (!auth.currentUser) return;
    const uid = auth.currentUser.uid;
    // Load custom workouts
    getDocs(collection(db, 'custom_workouts', uid, 'list')).then((snap) => {
      setMyWorkouts(snap.docs.map((d) => ({ id: d.id, ...d.data() })) as CustomWorkout[]);
    });
    // Load history
    getDocs(query(collection(db, 'workout_logs', uid, 'logs'), orderBy('completedAt', 'desc'))).then((snap) => {
      setLogs(snap.docs.map((d) => ({ id: d.id, ...d.data() })) as CompletedLog[]);
    });
  }, []);

  // Rest timer logic
  useEffect(() => {
    if (restRunning && restTimer !== null && restTimer > 0) {
      intervalRef.current = setInterval(() => {
        setRestTimer((t) => {
          if (t === null || t <= 1) {
            setRestRunning(false);
            toast.success('Descanso finalizado! Próxima série. 💪');
            return null;
          }
          return t - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [restRunning, restTimer]);

  function startRest(seconds: number) {
    setRestTimer(seconds);
    setRestRunning(true);
    toast(`Descansando ${seconds}s ⏱️`, { duration: 1500 });
  }

  function toggleRest() {
    setRestRunning((r) => !r);
  }

  async function completeQuickWorkout(w: typeof QUICK_WORKOUTS[0]) {
    if (!auth.currentUser || completedIds.includes(w.id)) return;
    try {
      await addDoc(collection(db, 'workout_logs', auth.currentUser.uid, 'logs'), {
        workoutName: w.name, category: w.category, date: todayString(),
        duration: w.duration, completedAt: new Date(),
      });
      await addXP(auth.currentUser.uid, 'workout_completed');
      setCompletedIds((p) => [...p, w.id]);
      toast.success(`${w.name} concluído! +30 XP 🔥`);
    } catch { toast.error('Erro ao salvar.'); }
  }

  async function completeCustomWorkout(w: CustomWorkout) {
    if (!auth.currentUser || !w.id) return;
    try {
      const ref = await addDoc(collection(db, 'workout_logs', auth.currentUser.uid, 'logs'), {
        workoutName: w.name, category: w.category, date: todayString(),
        duration: w.estimatedDuration, completedAt: new Date(),
      });
      await addXP(auth.currentUser.uid, 'workout_completed');
      setCompletedIds((p) => [...p, w.id!]);
      setLogs((p) => [{ id: ref.id, workoutName: w.name, category: w.category, date: todayString(), duration: w.estimatedDuration, completedAt: new Date() }, ...p]);
      toast.success(`${w.name} concluído! +30 XP 🔥`);
    } catch { toast.error('Erro ao salvar.'); }
  }

  function addExerciseToBuilder() {
    if (!newExercise.name.trim()) { toast.error('Nome do exercício obrigatório.'); return; }
    setEditWorkout((w) => ({ ...w, exercises: [...w.exercises, { ...newExercise }] }));
    setNewExercise({ name: '', sets: 3, reps: '12', rest: 60, videoUrl: '', notes: '' });
  }

  async function saveWorkout() {
    if (!auth.currentUser || !editWorkout.name.trim()) { toast.error('Dê um nome ao treino.'); return; }
    try {
      const data = { ...editWorkout, createdAt: new Date() };
      const ref = await addDoc(collection(db, 'custom_workouts', auth.currentUser.uid, 'list'), data);
      setMyWorkouts((p) => [...p, { ...data, id: ref.id }]);
      setShowBuilder(false);
      setEditWorkout({ name: '', category: 'Peito', exercises: [], estimatedDuration: 30 });
      toast.success('Treino salvo! 💪');
    } catch { toast.error('Erro ao salvar treino.'); }
  }

  async function deleteWorkout(id: string) {
    if (!auth.currentUser) return;
    try {
      await updateDoc(doc(db, 'custom_workouts', auth.currentUser.uid, 'list', id), { deleted: true });
      setMyWorkouts((p) => p.filter((w) => w.id !== id));
      toast.success('Treino removido.');
    } catch { toast.error('Erro ao remover.'); }
  }

  const filteredQuick = categoryFilter === 'Todos' ? QUICK_WORKOUTS : QUICK_WORKOUTS.filter((w) => w.category === categoryFilter);
  const filteredCustom = categoryFilter === 'Todos' ? myWorkouts : myWorkouts.filter((w) => w.category === categoryFilter);

  return (
    <div className="min-h-screen bg-black pb-28">
      <div className="px-5 pt-12 pb-4">
        <h1 className="section-title text-3xl mb-1">Treinos</h1>
        <p className="text-white/40 text-sm">Biblioteca + seus treinos personalizados</p>
      </div>

      {/* Rest Timer Overlay */}
      {restTimer !== null && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 w-72">
          <div className="card-highlight flex items-center gap-4 shadow-xl">
            <div className="text-center flex-1">
              <div className="text-white/40 text-xs mb-0.5">Descanso</div>
              <div className="text-4xl font-bold font-display text-primary">{restTimer}s</div>
            </div>
            <div className="flex gap-2">
              <button onClick={toggleRest} className="p-2.5 rounded-xl bg-primary/20 text-primary">
                {restRunning ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-current" />}
              </button>
              <button onClick={() => { setRestTimer(null); setRestRunning(false); }} className="p-2.5 rounded-xl bg-white/5 text-white/40">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="px-5 mb-4">
        <div className="flex bg-surface rounded-2xl p-1 gap-1">
          {([
            { key: 'library', label: '📚 Biblioteca' },
            { key: 'custom',  label: '⚙️ Meus' },
            { key: 'history', label: '📈 Histórico' },
          ] as { key: Tab; label: string }[]).map((t) => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={cn('flex-1 py-2 rounded-xl text-xs font-semibold transition-all',
                tab === t.key ? 'bg-primary text-black' : 'text-white/40')}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Category filter */}
      <div className="px-5 mb-4 flex gap-2 overflow-x-auto scrollbar-hide pb-1">
        {['Todos', ...CATEGORIES.map((c) => c.label)].map((cat) => (
          <button key={cat} onClick={() => setCategoryFilter(cat)}
            className={cn('flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all',
              categoryFilter === cat ? 'bg-primary text-black border-primary' : 'border-white/20 text-white/50')}>
            {cat}
          </button>
        ))}
      </div>

      {/* ── LIBRARY ── */}
      {tab === 'library' && (
        <div className="px-5 space-y-3">
          {filteredQuick.map((w) => {
            const done = completedIds.includes(w.id);
            const open = expandedId === w.id;
            return (
              <div key={w.id} className={cn('card-highlight transition-all', done && 'opacity-70')}>
                <div className="flex items-start gap-3">
                  <div className="text-3xl">{w.emoji}</div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-white text-sm">{w.name}</h3>
                      <button onClick={() => setExpandedId(open ? null : w.id)} className="text-white/30">
                        {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                    <div className="flex gap-3 mt-1">
                      <span className="flex items-center gap-1 text-xs text-white/40"><Clock className="w-3 h-3" />{w.duration} min</span>
                      <span className="flex items-center gap-1 text-xs text-orange-400"><Flame className="w-3 h-3" />~{w.cal} kcal</span>
                      <span className="text-xs text-white/30">{w.category}</span>
                    </div>
                  </div>
                  <button onClick={() => completeQuickWorkout(w)} disabled={done}
                    className={cn('p-2.5 rounded-xl flex-shrink-0 transition-all',
                      done ? 'bg-success/20 text-success' : 'bg-primary/20 text-primary hover:bg-primary/30')}>
                    {done ? <Check className="w-5 h-5" /> : <Play className="w-5 h-5 fill-current" />}
                  </button>
                </div>

                <AnimatePresence>
                  {open && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                      <div className="mt-3 pt-3 border-t border-white/10 space-y-2">
                        {w.exercises.map((ex, i) => (
                          <ExerciseRow key={i} ex={ex} onRest={() => startRest(ex.rest)} />
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
          {filteredQuick.length === 0 && (
            <div className="text-center py-12 text-white/30 text-sm">Nenhum treino nessa categoria.</div>
          )}
        </div>
      )}

      {/* ── MEUS TREINOS ── */}
      {tab === 'custom' && (
        <div className="px-5 space-y-3">
          <motion.button whileTap={{ scale: 0.97 }} onClick={() => setShowBuilder(true)}
            className="w-full py-3 rounded-2xl border border-dashed border-primary/40 text-primary text-sm font-semibold flex items-center justify-center gap-2 hover:bg-primary/5 transition-colors">
            <Plus className="w-4 h-4" /> Criar treino personalizado
          </motion.button>

          {filteredCustom.map((w) => {
            const done = w.id ? completedIds.includes(w.id) : false;
            const open = expandedId === w.id;
            return (
              <div key={w.id} className={cn('card-highlight', done && 'opacity-70')}>
                <div className="flex items-start gap-3">
                  <div className="text-2xl">{CATEGORIES.find((c) => c.label === w.category)?.emoji ?? '🏋️'}</div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-white text-sm">{w.name}</h3>
                      <div className="flex items-center gap-1">
                        <button onClick={() => w.id && deleteWorkout(w.id)} className="p-1 text-white/20 hover:text-danger transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => setExpandedId(open ? null : (w.id ?? null))} className="p-1 text-white/30">
                          {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    <div className="flex gap-3 mt-1">
                      <span className="text-xs text-white/30">{w.category}</span>
                      <span className="flex items-center gap-1 text-xs text-white/30"><Dumbbell className="w-3 h-3" />{w.exercises.length} exercícios</span>
                      <span className="flex items-center gap-1 text-xs text-white/30"><Clock className="w-3 h-3" />{w.estimatedDuration} min</span>
                    </div>
                  </div>
                  <button onClick={() => completeCustomWorkout(w)} disabled={done}
                    className={cn('p-2.5 rounded-xl flex-shrink-0 transition-all',
                      done ? 'bg-success/20 text-success' : 'bg-primary/20 text-primary hover:bg-primary/30')}>
                    {done ? <Check className="w-5 h-5" /> : <Play className="w-5 h-5 fill-current" />}
                  </button>
                </div>

                <AnimatePresence>
                  {open && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                      <div className="mt-3 pt-3 border-t border-white/10 space-y-2">
                        {w.exercises.map((ex, i) => (
                          <ExerciseRow key={i} ex={ex} onRest={() => startRest(ex.rest)} />
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}

          {myWorkouts.length === 0 && (
            <div className="text-center py-12 text-white/30 text-sm">
              <Dumbbell className="w-10 h-10 mx-auto mb-3 text-white/10" />
              Nenhum treino criado ainda.
            </div>
          )}
        </div>
      )}

      {/* ── HISTÓRICO ── */}
      {tab === 'history' && (
        <div className="px-5 space-y-3">
          {logs.length === 0 ? (
            <div className="text-center py-12 text-white/30 text-sm">Nenhum treino concluído ainda.</div>
          ) : (
            logs.slice(0, 20).map((log) => (
              <div key={log.id} className="card flex items-center gap-3">
                <div className="text-2xl">{CATEGORIES.find((c) => c.label === log.category)?.emoji ?? '🏋️'}</div>
                <div className="flex-1">
                  <div className="text-white text-sm font-semibold">{log.workoutName}</div>
                  <div className="flex gap-3 mt-0.5">
                    <span className="text-white/30 text-xs">{log.category}</span>
                    <span className="flex items-center gap-1 text-xs text-white/30"><Clock className="w-3 h-3" />{log.duration} min</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-success text-xs font-semibold">✓ Concluído</div>
                  <div className="text-white/30 text-[10px]">
                    {new Date(log.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ── WORKOUT BUILDER MODAL ── */}
      <AnimatePresence>
        {showBuilder && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 z-50 overflow-y-auto">
            <div className="min-h-screen px-5 py-8 max-w-md mx-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-white font-bold text-xl">Criar treino</h2>
                <button onClick={() => setShowBuilder(false)} className="p-2 rounded-xl bg-white/5">
                  <X className="w-5 h-5 text-white/60" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Name */}
                <div>
                  <label className="text-white/50 text-xs">Nome do treino</label>
                  <input value={editWorkout.name} onChange={(e) => setEditWorkout((w) => ({ ...w, name: e.target.value }))}
                    placeholder="Ex: Treino de Peito Completo" className="input mt-1" />
                </div>

                {/* Category */}
                <div>
                  <label className="text-white/50 text-xs mb-2 block">Categoria</label>
                  <div className="flex flex-wrap gap-2">
                    {CATEGORIES.map((c) => (
                      <button key={c.label} onClick={() => setEditWorkout((w) => ({ ...w, category: c.label }))}
                        className={cn('px-3 py-1.5 rounded-full text-xs font-semibold border transition-all',
                          editWorkout.category === c.label ? 'bg-primary text-black border-primary' : 'border-white/20 text-white/50')}>
                        {c.emoji} {c.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Duration */}
                <div>
                  <label className="text-white/50 text-xs">Duração estimada (min)</label>
                  <div className="relative mt-1">
                    <input type="number" value={editWorkout.estimatedDuration}
                      onChange={(e) => setEditWorkout((w) => ({ ...w, estimatedDuration: Number(e.target.value) }))}
                      min={5} max={180} className="input pr-12" />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 text-sm">min</span>
                  </div>
                </div>

                {/* Exercises added */}
                {editWorkout.exercises.length > 0 && (
                  <div className="space-y-2">
                    <label className="text-white/50 text-xs">Exercícios ({editWorkout.exercises.length})</label>
                    {editWorkout.exercises.map((ex, i) => (
                      <div key={i} className="bg-surface rounded-xl px-3 py-2 flex items-center gap-2">
                        <div className="flex-1">
                          <div className="text-white text-sm font-semibold">{ex.name}</div>
                          <div className="text-white/40 text-xs">{ex.sets}×{ex.reps} · descanso {ex.rest}s{ex.videoUrl ? ' · 🔗 vídeo' : ''}</div>
                        </div>
                        <button onClick={() => setEditWorkout((w) => ({ ...w, exercises: w.exercises.filter((_, j) => j !== i) }))}
                          className="text-white/20 hover:text-danger transition-colors">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add exercise */}
                <div className="card space-y-3 border border-white/10">
                  <label className="text-white/60 text-sm font-semibold">+ Adicionar exercício</label>
                  <input value={newExercise.name} onChange={(e) => setNewExercise((x) => ({ ...x, name: e.target.value }))}
                    placeholder="Nome do exercício" className="input" />
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="text-white/40 text-xs">Séries</label>
                      <input type="number" value={newExercise.sets} onChange={(e) => setNewExercise((x) => ({ ...x, sets: Number(e.target.value) }))} min={1} max={10} className="input mt-1" />
                    </div>
                    <div>
                      <label className="text-white/40 text-xs">Reps</label>
                      <input value={newExercise.reps} onChange={(e) => setNewExercise((x) => ({ ...x, reps: e.target.value }))} placeholder="12" className="input mt-1" />
                    </div>
                    <div>
                      <label className="text-white/40 text-xs">Descanso (s)</label>
                      <input type="number" value={newExercise.rest} onChange={(e) => setNewExercise((x) => ({ ...x, rest: Number(e.target.value) }))} min={0} max={300} step={5} className="input mt-1" />
                    </div>
                  </div>
                  <div>
                    <label className="text-white/40 text-xs flex items-center gap-1"><Link className="w-3 h-3" /> Link do vídeo tutorial (opcional)</label>
                    <input value={newExercise.videoUrl ?? ''} onChange={(e) => setNewExercise((x) => ({ ...x, videoUrl: e.target.value }))}
                      placeholder="https://youtube.com/..." className="input mt-1" />
                  </div>
                  <button onClick={addExerciseToBuilder}
                    className="w-full py-2.5 rounded-xl bg-white/5 border border-white/10 text-white/60 text-sm hover:bg-white/10 transition-colors flex items-center justify-center gap-2">
                    <Plus className="w-4 h-4" /> Adicionar exercício
                  </button>
                </div>

                <button onClick={saveWorkout}
                  className="btn-primary w-full flex items-center justify-center gap-2">
                  <Check className="w-5 h-5" /> SALVAR TREINO
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ExerciseRow({ ex, onRest }: { ex: Exercise; onRest: () => void }) {
  return (
    <div className="flex items-center gap-3 bg-surface rounded-xl px-3 py-2">
      <div className="flex-1">
        <div className="text-white text-xs font-semibold">{ex.name}</div>
        <div className="text-white/40 text-[10px] mt-0.5">{ex.sets} séries × {ex.reps} reps</div>
      </div>
      <div className="flex items-center gap-2">
        {ex.videoUrl && (
          <a href={ex.videoUrl} target="_blank" rel="noopener noreferrer"
            className="p-1.5 rounded-lg bg-blue-500/15 text-blue-400" title="Ver tutorial">
            <Link className="w-3.5 h-3.5" />
          </a>
        )}
        <button onClick={onRest}
          className="flex items-center gap-1 px-2 py-1.5 rounded-lg bg-primary/15 text-primary text-[10px] font-semibold">
          <Clock className="w-3 h-3" /> {ex.rest}s
        </button>
      </div>
    </div>
  );
}
