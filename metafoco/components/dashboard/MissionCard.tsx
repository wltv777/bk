'use client';

import { useMemo } from 'react';
import { Target, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

const missions = [
  'Bate proteína e foge do doce.',
  'Não é o dia perfeito. É o dia consistente.',
  'Feche a boca, abra o foco. 🔥',
  'Bebe água antes de abrir a geladeira.',
  'Treina 20 min. Sem desculpa.',
  'O progresso é silencioso. A gordura não.',
  'Proteína no café da manhã. É ordem.',
  'Jejum ativo = gordura pagando a conta.',
  'Seu futuro eu vai agradecer o de hoje.',
  'Macros na meta = corpo respondendo.',
];

interface MissionCardProps {
  completed?: boolean;
  onComplete?: () => void;
}

export function MissionCard({ completed = false, onComplete }: MissionCardProps) {
  const mission = useMemo(() => {
    const dayOfYear = Math.floor(Date.now() / 86400000);
    return missions[dayOfYear % missions.length];
  }, []);

  return (
    <div className={cn(
      'card-highlight rounded-2xl p-4 flex items-start gap-3',
      completed && 'border-success/30 bg-success/5'
    )}>
      <div className={cn(
        'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5',
        completed ? 'bg-success/20' : 'bg-primary/20'
      )}>
        {completed ? (
          <Check className="w-5 h-5 text-success" />
        ) : (
          <Target className="w-5 h-5 text-primary" />
        )}
      </div>
      <div className="flex-1">
        <div className="text-xs text-white/40 mb-1 uppercase tracking-wider">Missão do dia</div>
        <p className={cn('font-semibold text-sm leading-relaxed', completed ? 'text-white/40 line-through' : 'text-white')}>
          {mission}
        </p>
        {!completed && onComplete && (
          <button
            onClick={onComplete}
            className="mt-2 text-xs text-primary font-semibold hover:text-primary-light transition-colors"
          >
            Marcar como concluída →
          </button>
        )}
      </div>
    </div>
  );
}
