'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Camera, Search, Scan, CalendarDays } from 'lucide-react';

export function FAB() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const actions = [
    { icon: Camera,       label: 'Foto IA',      href: '/scanner?mode=camera',  color: 'bg-primary' },
    { icon: Scan,         label: 'Cód. barras',  href: '/scanner?mode=barcode', color: 'bg-accent' },
    { icon: Search,       label: 'Buscar',       href: '/diary?action=add',     color: 'bg-surface-3' },
    { icon: CalendarDays, label: 'Plano semanal',href: '/meal-plan',            color: 'bg-surface-3' },
  ];

  function go(href: string) {
    setOpen(false);
    router.push(href);
  }

  return (
    <>
      {/* Backdrop */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Action buttons */}
      <AnimatePresence>
        {open && actions.map(({ icon: Icon, label, href, color }, i) => (
          <motion.button
            key={href}
            initial={{ opacity: 0, scale: 0, y: 0 }}
            animate={{ opacity: 1, scale: 1, y: -(64 + i * 60) }}
            exit={{ opacity: 0, scale: 0, y: 0 }}
            transition={{ delay: i * 0.05, type: 'spring', stiffness: 300, damping: 20 }}
            onClick={() => go(href)}
            className={cn(
              'fixed bottom-24 right-5 w-12 h-12 rounded-full z-50',
              'flex items-center justify-center shadow-lg',
              color
            )}
            style={{ transformOrigin: 'bottom right' }}
          >
            <Icon className="w-5 h-5 text-black" />
          </motion.button>
        ))}
      </AnimatePresence>

      {/* Labels */}
      <AnimatePresence>
        {open && actions.map(({ label }, i) => (
          <motion.span
            key={label}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            transition={{ delay: i * 0.05 + 0.1 }}
            className="fixed right-20 z-50 text-white text-xs font-semibold bg-black/80 px-2 py-1 rounded-lg pointer-events-none"
            style={{ bottom: `${96 + i * 60 + 12}px` }}
          >
            {label}
          </motion.span>
        ))}
      </AnimatePresence>

      {/* Main FAB */}
      <motion.button
        className="fab z-50"
        onClick={() => setOpen(!open)}
        whileTap={{ scale: 0.9 }}
        animate={{ rotate: open ? 45 : 0 }}
        transition={{ duration: 0.2 }}
        aria-label="Registrar refeição"
      >
        {open ? (
          <X className="w-6 h-6 text-black" />
        ) : (
          <Plus className="w-7 h-7 text-black" strokeWidth={2.5} />
        )}
      </motion.button>
    </>
  );
}

// inline cn since it's a shared component without circular imports
function cn(...classes: (string | undefined | false)[]) {
  return classes.filter(Boolean).join(' ');
}
