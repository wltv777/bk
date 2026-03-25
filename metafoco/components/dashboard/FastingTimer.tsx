'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useFastingStore } from '@/store/fastingStore';
import { ProgressRing } from '@/components/shared/ProgressRing';
import { formatTime } from '@/lib/utils';
import { Play, Square, Timer } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FastingTimerProps {
  protocol: string;
  compact?: boolean;
}

export function FastingTimer({ protocol, compact = false }: FastingTimerProps) {
  const { activeSession, startFast, endFast, getRemainingSeconds, getElapsedPercent } = useFastingStore();
  const [remaining, setRemaining] = useState(0);
  const [percent, setPercent] = useState(0);

  useEffect(() => {
    if (!activeSession) return;
    const tick = () => {
      setRemaining(getRemainingSeconds());
      setPercent(getElapsedPercent());
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [activeSession, getRemainingSeconds, getElapsedPercent]);

  if (compact) {
    return (
      <div className={cn('flex items-center gap-2 px-3 py-2 rounded-xl', activeSession ? 'bg-primary/10 border border-primary/30' : 'bg-surface border border-white/10')}>
        <Timer className={cn('w-4 h-4', activeSession ? 'text-primary' : 'text-white/40')} />
        <div className="flex-1">
          <div className="text-xs text-white/40">Jejum {protocol}</div>
          <div className={cn('text-sm font-bold font-mono', activeSession ? 'text-primary' : 'text-white/30')}>
            {activeSession ? formatTime(remaining) : 'Inativo'}
          </div>
        </div>
        {activeSession ? (
          <button
            onClick={() => endFast(remaining === 0)}
            className="p-1.5 rounded-lg bg-danger/20 text-danger hover:bg-danger/30 transition-colors"
          >
            <Square className="w-3 h-3 fill-current" />
          </button>
        ) : (
          <button
            onClick={() => startFast(protocol as any, 2000)}
            className="p-1.5 rounded-lg bg-primary/20 text-primary hover:bg-primary/30 transition-colors"
          >
            <Play className="w-3 h-3 fill-current" />
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="card flex flex-col items-center gap-4 py-6">
      <h3 className="text-white/60 text-sm">Jejum Intermitente — {protocol}</h3>

      {activeSession ? (
        <>
          <div className={cn(activeSession && 'fasting-active')}>
            <ProgressRing
              value={percent}
              size={180}
              strokeWidth={14}
              color="#FFD700"
              label={formatTime(remaining)}
              sublabel={remaining === 0 ? 'Jejum concluído!' : 'restando'}
            />
          </div>

          <div className="text-center">
            <div className="text-white/40 text-xs">
              Iniciou às {activeSession.startedAt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
            </div>
            <div className="text-white/40 text-xs">
              Termina às {activeSession.endsAt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>

          <button
            onClick={() => endFast(remaining <= 60)}
            className="btn-danger flex items-center gap-2 px-6"
          >
            <Square className="w-4 h-4 fill-white" />
            ENCERRAR JEJUM
          </button>
        </>
      ) : (
        <>
          <ProgressRing value={0} size={180} strokeWidth={14} color="#333" label="00:00" sublabel="Jejum inativo" />

          <p className="text-white/40 text-sm text-center">
            Inicie o jejum para começar o timer.
          </p>

          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => startFast(protocol as any, 0)}
            className="btn-primary flex items-center gap-2 px-8"
          >
            <Play className="w-5 h-5 fill-black" />
            INICIAR JEJUM
          </motion.button>
        </>
      )}
    </div>
  );
}
