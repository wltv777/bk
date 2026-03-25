'use client';

import { motion } from 'framer-motion';
import { cn, formatPercent } from '@/lib/utils';

interface MacroBarProps {
  label: string;
  consumed: number;
  target: number;
  unit?: string;
  color: string;
  bgColor: string;
  textColor: string;
}

export function MacroBar({ label, consumed, target, unit = 'g', color, bgColor, textColor }: MacroBarProps) {
  const percent = formatPercent(consumed, target);
  const over = consumed > target;

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className={cn('font-semibold', textColor)}>{label}</span>
        <span className="text-white/50">
          <span className={cn(over && 'text-danger font-bold')}>{Math.round(consumed)}</span>
          /{Math.round(target)}{unit}
        </span>
      </div>
      <div className="progress-track">
        <motion.div
          className={cn('progress-fill', bgColor)}
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          style={{ background: over ? '#FF3B30' : color }}
        />
      </div>
    </div>
  );
}
