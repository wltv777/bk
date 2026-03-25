'use client';

import { motion } from 'framer-motion';
import { getLevelInfo } from '@/lib/calculations';
import { Zap } from 'lucide-react';

interface XPBarProps {
  xp: number;
  compact?: boolean;
}

export function XPBar({ xp, compact = false }: XPBarProps) {
  const { level, name, nextLevelXP } = getLevelInfo(xp);
  const prevLevelXP = level > 1 ? getLevelInfo(xp - 1).nextLevelXP : 0;
  const progress = Math.min(((xp - prevLevelXP) / (nextLevelXP - prevLevelXP)) * 100, 100);

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <Zap className="w-3 h-3 text-primary fill-primary" />
        <span className="text-xs text-white/50">Nv.{level}</span>
        <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            className="h-full xp-bar-fill rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.8 }}
          />
        </div>
        <span className="text-xs text-white/30">{xp}xp</span>
      </div>
    );
  }

  return (
    <div className="card space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-primary fill-primary" />
          <span className="text-sm font-bold text-primary">Nível {level}</span>
        </div>
        <span className="text-xs text-white/40">{name}</span>
      </div>
      <div className="progress-track h-3">
        <motion.div
          className="h-full xp-bar-fill rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
      </div>
      <div className="flex justify-between text-xs text-white/30">
        <span>{xp} XP</span>
        <span>{nextLevelXP} XP</span>
      </div>
    </div>
  );
}
