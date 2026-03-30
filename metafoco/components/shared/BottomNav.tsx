'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, BookOpen, ScanLine, Salad, User } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/dashboard',    icon: Home,     label: 'Início',  featured: false },
  { href: '/diary',        icon: BookOpen, label: 'Diário',  featured: false },
  { href: '/scanner',      icon: ScanLine, label: 'Scanner', featured: true  },
  { href: '/diet-builder', icon: Salad,    label: 'Dieta',   featured: false },
  { href: '/settings',     icon: User,     label: 'Perfil',  featured: false },
];

export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav className="bottom-nav">
      <div className="flex items-end h-16 px-2">
        {navItems.map(({ href, icon: Icon, label, featured }) => {
          const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href));
          if (featured) {
            return (
              <Link key={href} href={href} className="flex-1 flex flex-col items-center justify-end pb-2 no-tap-highlight -translate-y-3">
                <div className={cn(
                  'w-14 h-14 rounded-full flex items-center justify-center mb-1 transition-all',
                  active
                    ? 'shadow-[0_0_20px_rgba(245,166,35,0.6)]'
                    : 'shadow-[0_4px_16px_rgba(0,0,0,0.5)]'
                )} style={{ background: 'linear-gradient(135deg, #F5A623, #E8541A)' }}>
                  <Icon className="w-6 h-6 text-black" />
                </div>
                <span className={cn('text-[10px] font-semibold', active ? 'text-primary' : 'text-white/50')}>{label}</span>
              </Link>
            );
          }
          return (
            <Link key={href} href={href} className={cn('flex-1 flex flex-col items-center justify-center gap-0.5 h-full transition-colors no-tap-highlight', active ? 'text-primary' : 'text-white/30')}>
              <Icon className={cn('w-5 h-5', active && 'drop-shadow-[0_0_6px_rgba(245,166,35,0.6)]')} />
              <span className={cn('text-[10px] font-medium', active ? 'text-primary' : 'text-white/30')}>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
