'use client';

import { cn } from '@/lib/utils';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showTagline?: boolean;
  className?: string;
}

const sizes = {
  sm: 'text-3xl',
  md: 'text-4xl',
  lg: 'text-5xl',
  xl: 'text-7xl',
};

export function Logo({ size = 'md', showTagline = false, className }: LogoProps) {
  return (
    <div className={cn('flex flex-col items-center', className)}>
      <div className={cn('logo-text font-display leading-none', sizes[size])}>
        METAFOCO
      </div>
      {showTagline && (
        <p className="text-white/40 text-xs tracking-widest mt-1 uppercase">
          Foco. Disciplina. Resultado.
        </p>
      )}
    </div>
  );
}

export function LogoIcon({ size = 40, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFD700" />
          <stop offset="50%" stopColor="#F5A623" />
          <stop offset="100%" stopColor="#FF6B35" />
        </linearGradient>
      </defs>
      <circle cx="20" cy="20" r="20" fill="black" />
      <text
        x="50%"
        y="54%"
        textAnchor="middle"
        dominantBaseline="middle"
        fill="url(#logoGrad)"
        fontFamily="Impact, sans-serif"
        fontSize="16"
        fontWeight="bold"
        letterSpacing="1"
      >
        MF
      </text>
    </svg>
  );
}
