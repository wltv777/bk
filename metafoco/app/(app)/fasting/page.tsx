'use client';

import { useState } from 'react';
import { doc, addDoc, collection } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { useFastingStore } from '@/store/fastingStore';
import { useUserStore } from '@/store/userStore';
import { FastingTimer } from '@/components/dashboard/FastingTimer';
import { addXP, unlockBadge } from '@/lib/gamification';
import { formatTime } from '@/lib/utils';
import { Trophy, Clock, Calendar, Flame } from 'lucide-react';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';
import type { FastingProtocol } from '@/types';

const PROTOCOLS: { value: FastingProtocol; label: string; desc: string; color: string }[] = [
  { value: '14:10', label: '14:10', desc: 'Iniciante — Jejum 14h / Comer 10h', color: 'text-green-400' },
  { value: '16:8',  label: '16:8',  desc: 'Popular — Jejum 16h / Comer 8h',    color: 'text-primary' },
  { value: '18:6',  label: '18:6',  desc: 'Avançado — Jejum 18h / Comer 6h',   color: 'text-orange-400' },
  { value: '20:4',  label: '20:4',  desc: 'Guerreiro — Jejum 20h / Comer 4h',  color: 'text-danger' },
];

const MOTIVATIONAL_MESSAGES = [
  '"Feche a boca agora 😘 — Sua janela acabou."',
  '"Jejum ativo = gordura pagando a conta."',
  '"Disciplina é o corpo mais bonito."',
  '"O corpo queima gordura enquanto você dorme. Deixa ele trabalhar."',
];

export default function FastingPage() {
  const { profile } = useUserStore();
  const { activeSession, history, endFast } = useFastingStore();
  const [selectedProtocol, setSelectedProtocol] = useState<FastingProtocol>(
    profile?.fastingProtocol ?? '16:8'
  );

  async function handleEndFast() {
    const uid = auth.currentUser?.uid;
    if (!activeSession || !uid) return;

    const remainSeconds = Math.floor((activeSession.endsAt.getTime() - Date.now()) / 1000);
    const completed = remainSeconds <= 300; // tolerância de 5min

    // Save to Firestore
    try {
      await addDoc(collection(db, 'fasting_sessions', uid, 'sessions'), {
        ...activeSession,
        endedAt: new Date(),
        completed,
      });

      if (completed) {
        await addXP(uid, 'fast_completed');
        await unlockBadge(uid, 'first_fast');
        toast.success('Jejum concluído! +50 XP 🔥', { duration: 4000 });
      } else {
        toast('Jejum encerrado antes do tempo. Vai que vai! 💪');
      }
    } catch {
      toast.error('Erro ao salvar jejum.');
    }

    endFast(completed);
  }

  const completedCount = history.filter((h) => h.completed).length;

  return (
    <div className="min-h-screen bg-black">
      <div className="px-5 pt-12 pb-4">
        <h1 className="section-title text-3xl mb-1">Jejum</h1>
        <p className="text-white/40 text-sm">Controle sua janela de alimentação</p>
      </div>

      <div className="px-5 space-y-4 pb-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="card text-center py-3">
            <Trophy className="w-5 h-5 text-primary mx-auto mb-1" />
            <div className="text-primary font-bold text-lg">{completedCount}</div>
            <div className="text-white/30 text-xs">Concluídos</div>
          </div>
          <div className="card text-center py-3">
            <Flame className="w-5 h-5 text-orange-400 mx-auto mb-1" />
            <div className="text-orange-400 font-bold text-lg">{selectedProtocol.split(':')[0]}h</div>
            <div className="text-white/30 text-xs">Protocolo</div>
          </div>
          <div className="card text-center py-3">
            <Calendar className="w-5 h-5 text-blue-400 mx-auto mb-1" />
            <div className="text-blue-400 font-bold text-lg">{history.length}</div>
            <div className="text-white/30 text-xs">Iniciados</div>
          </div>
        </div>

        {/* Protocol selector (only when not fasting) */}
        {!activeSession && (
          <div className="space-y-2">
            <h3 className="text-white/60 text-sm font-semibold">Escolha o protocolo</h3>
            {PROTOCOLS.map((p) => (
              <button
                key={p.value}
                onClick={() => setSelectedProtocol(p.value)}
                className={cn(
                  'w-full p-3 rounded-xl flex items-center gap-3 border transition-all text-left',
                  selectedProtocol === p.value
                    ? 'bg-primary/10 border-primary'
                    : 'bg-surface border-white/10'
                )}
              >
                <span className={cn('font-display text-2xl', p.color)}>{p.label}</span>
                <div className="flex-1">
                  <div className="text-sm text-white/80">{p.desc}</div>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Main timer */}
        <FastingTimer protocol={activeSession?.protocol ?? selectedProtocol} />

        {/* Motivational */}
        <div className="card-highlight">
          <p className="text-white/50 text-sm italic text-center">
            {MOTIVATIONAL_MESSAGES[Math.floor(Date.now() / 3600000) % MOTIVATIONAL_MESSAGES.length]}
          </p>
        </div>

        {/* History */}
        {history.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-white/60 text-sm font-semibold flex items-center gap-2">
              <Clock className="w-4 h-4" /> Histórico recente
            </h3>
            {history.slice(0, 5).map((session) => (
              <div key={session.id} className="card flex items-center gap-3">
                <div className={cn(
                  'w-8 h-8 rounded-lg flex items-center justify-center text-sm',
                  session.completed ? 'bg-success/20 text-success' : 'bg-white/5 text-white/30'
                )}>
                  {session.completed ? '✓' : '✗'}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-semibold text-white">{session.protocol}</div>
                  <div className="text-xs text-white/30">
                    {new Date(session.startedAt).toLocaleDateString('pt-BR')}
                  </div>
                </div>
                <span className={cn(
                  'text-xs font-semibold',
                  session.completed ? 'text-success' : 'text-white/30'
                )}>
                  {session.completed ? 'Concluído' : 'Incompleto'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
