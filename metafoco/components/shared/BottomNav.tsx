'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, BookOpen, TrendingUp, MessageCircle, User, CalendarDays } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/dashboard',  icon: Home,           label: 'Home'      },
  { href: '/diary',      icon: BookOpen,       label: 'Diário'    },
  { href: '/meal-plan',  icon: CalendarDays,   label: 'Plano'     },
  { href: '/progress',   icon: TrendingUp,     label: 'Progresso' },
  { href: '/coach',      icon: MessageCircle,  label: 'Coach'     },
  { href: '/settings',   icon: User,           label: 'Perfil'    },
];

export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav className="bottom-nav">
      <div className="flex items-stretch h-16">
        {navItems.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex-1 flex flex-col items-center justify-center gap-0.5 transition-colors no-tap-highlight',
                active ? 'text-primary' : 'text-white/30 hover:text-white/60'
              )}
            >
              <Icon className={cn('w-5 h-5', active && 'drop-shadow-[0_0_6px_rgba(255,215,0,0.6)]')} />
              <span className={cn('text-[10px] font-medium', active ? 'text-primary' : 'text-white/30')}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
