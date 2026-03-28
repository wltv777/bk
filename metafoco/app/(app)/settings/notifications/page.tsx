'use client';

import { useState } from 'react';
import { useUserStore } from '@/store/userStore';
import { Bell, BellOff, Clock, Droplets, Scale, Dumbbell, Zap, ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function NotificationsPage() {
  const { notifications } = useUserStore();

  const [water, setWater] = useState(notifications.waterReminder);
  const [protein, setProtein] = useState(notifications.proteinAlert);
  const [workout, setWorkout] = useState(notifications.workoutReminder);
  const [fasting, setFasting] = useState(notifications.fastingAlerts);
  const [weighIn, setWeighIn] = useState(true);
  const [saved, setSaved] = useState(false);

  function save() {
    // In a real app this would persist to Firestore / store
    setSaved(true);
    toast.success('Notificações salvas!');
    setTimeout(() => setSaved(false), 2000);
  }

  const items = [
    {
      icon: <Droplets className="w-4 h-4 text-blue-400" />,
      label: 'Lembrete de água',
      description: 'Notificações ao longo do dia para beber água',
      value: water,
      onChange: setWater,
    },
    {
      icon: <Zap className="w-4 h-4 text-primary" />,
      label: 'Alerta de proteína',
      description: 'Avisa quando você ainda não atingiu a meta diária',
      value: protein,
      onChange: setProtein,
    },
    {
      icon: <Dumbbell className="w-4 h-4 text-orange-400" />,
      label: 'Lembrete de treino',
      description: 'Aviso no horário do seu treino programado',
      value: workout,
      onChange: setWorkout,
    },
    {
      icon: <Clock className="w-4 h-4 text-green-400" />,
      label: 'Alertas de jejum',
      description: 'Início e fim da janela de jejum',
      value: fasting,
      onChange: setFasting,
    },
    {
      icon: <Scale className="w-4 h-4 text-white/50" />,
      label: 'Pesagem semanal',
      description: 'Lembra de registrar o peso toda semana',
      value: weighIn,
      onChange: setWeighIn,
    },
  ];

  return (
    <div className="min-h-screen bg-black pb-24">
      <div className="px-5 pt-12 pb-4">
        <Link href="/settings" className="flex items-center gap-2 text-white/40 text-sm mb-4 hover:text-white/60 transition-colors">
          <ChevronLeft className="w-4 h-4" /> Voltar
        </Link>
        <div className="flex items-center gap-2 mb-1">
          <Bell className="w-5 h-5 text-primary" />
          <h1 className="section-title text-2xl">Notificações</h1>
        </div>
        <p className="text-white/40 text-sm">Personalize seus avisos e lembretes</p>
      </div>

      <div className="px-5 space-y-3">
        {items.map((item) => (
          <div key={item.label} className="card flex items-center gap-4">
            <div className="p-2 rounded-xl bg-white/5">{item.icon}</div>
            <div className="flex-1">
              <div className="text-white text-sm font-semibold">{item.label}</div>
              <div className="text-white/30 text-xs mt-0.5">{item.description}</div>
            </div>
            <Toggle value={item.value} onChange={item.onChange} />
          </div>
        ))}

        <div className="card-highlight">
          <p className="text-white/40 text-xs text-center leading-relaxed">
            As notificações dependem das permissões do seu navegador/dispositivo. Certifique-se de que o METAFOCO tem permissão de enviar notificações.
          </p>
        </div>

        <button
          onClick={save}
          className={cn('btn-primary w-full flex items-center justify-center gap-2', saved && 'opacity-80')}
        >
          {saved ? '✓ Salvo' : 'Salvar preferências'}
        </button>
      </div>
    </div>
  );
}

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!value)}
      className={cn(
        'w-12 h-6 rounded-full transition-all duration-300 relative flex-shrink-0',
        value ? 'bg-primary' : 'bg-white/10'
      )}
    >
      <div
        className={cn(
          'w-5 h-5 rounded-full bg-white shadow-sm absolute top-0.5 transition-all duration-300',
          value ? 'left-6' : 'left-0.5'
        )}
      />
    </button>
  );
}
