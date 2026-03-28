'use client';

import { useState, useEffect, useRef } from 'react';
import { collection, getDocs, query, orderBy, limit, addDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { useUserStore } from '@/store/userStore';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingDown, TrendingUp, Camera, Download, Plus, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';
import type { BioimpedanceLog, ProgressPhoto } from '@/types';

export default function ProgressPage() {
  const { profile, metrics } = useUserStore();
  const [logs, setLogs] = useState<BioimpedanceLog[]>([]);
  const [photos, setPhotos] = useState<ProgressPhoto[]>([]);
  const [activeChart, setActiveChart] = useState<'weight' | 'fat' | 'muscle'>('weight');
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!auth.currentUser) return;
    const uid = auth.currentUser.uid;
    getDocs(
      query(collection(db, 'bioimpedance_logs', uid, 'logs'), orderBy('date', 'asc'), limit(30))
    ).then((snap) => {
      setLogs(snap.docs.map((d) => ({ id: d.id, ...d.data() })) as BioimpedanceLog[]);
    });

    getDocs(
      query(collection(db, 'progress_photos', uid, 'photos'), orderBy('date', 'asc'), limit(10))
    ).then((snap) => {
      setPhotos(snap.docs.map((d) => ({ id: d.id, ...d.data() })) as ProgressPhoto[]);
    });
  }, []);

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !auth.currentUser) return;

    setUploading(true);
    try {
      // Convert to base64 data URL for local storage (no Firebase Storage needed)
      const reader = new FileReader();
      reader.onload = async (ev) => {
        const dataUrl = ev.target?.result as string;
        const today = new Date().toISOString().split('T')[0];
        const photo: Omit<ProgressPhoto, 'id'> = {
          userId: auth.currentUser!.uid,
          date: today,
          imageUrl: dataUrl,
          weight: profile?.weight,
          createdAt: new Date(),
        };
        const ref = await addDoc(
          collection(db, 'progress_photos', auth.currentUser!.uid, 'photos'),
          photo
        );
        setPhotos((prev) => [...prev, { ...photo, id: ref.id }]);
        toast.success('Foto de progresso salva! 📸');
        setUploading(false);
      };
      reader.readAsDataURL(file);
    } catch {
      toast.error('Erro ao salvar foto.');
      setUploading(false);
    }
  }

  function exportProgressCard() {
    if (!profile || !metrics) return;
    const first = logs[0];
    const last = logs[logs.length - 1];
    const summary = {
      nome: profile.name,
      objetivo: profile.goal,
      periodo: first && last ? `${first.date} → ${last.date}` : 'Sem dados ainda',
      pesoInicial: first?.weight ?? profile.weight,
      pesoAtual: last?.weight ?? profile.weight,
      variacao: first && last ? `${Math.round((last.weight - first.weight) * 10) / 10}kg` : '—',
      gorduraInicial: first?.bodyFatPercent ?? '—',
      gorduraAtual: last?.bodyFatPercent ?? '—',
      massaMagraAtual: last?.muscleMass ?? '—',
      metaCalorias: metrics.targetCalories,
      metaProteina: `${metrics.targetProtein}g`,
      exportadoEm: new Date().toLocaleString('pt-BR'),
    };

    const blob = new Blob([JSON.stringify(summary, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `metafoco_progresso_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Progresso exportado!');
  }

  const chartData = logs.map((l) => ({
    date: new Date(l.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }),
    weight: l.weight,
    fat: l.bodyFatPercent,
    muscle: l.muscleMass,
  }));

  const first = logs[0];
  const last = logs[logs.length - 1];

  const weightDiff = last && first ? Math.round((last.weight - first.weight) * 10) / 10 : null;
  const fatDiff    = last && first ? Math.round((last.bodyFatPercent - first.bodyFatPercent) * 10) / 10 : null;
  const muscleDiff = last && first ? Math.round((last.muscleMass - first.muscleMass) * 10) / 10 : null;

  const charts = [
    { key: 'weight', label: 'Peso (kg)', color: '#FFD700',  diff: weightDiff, goodWhenDown: profile?.goal !== 'gain' },
    { key: 'fat',    label: 'Gordura %', color: '#FF6B35',  diff: fatDiff,    goodWhenDown: true },
    { key: 'muscle', label: 'Músculo kg', color: '#3B82F6', diff: muscleDiff, goodWhenDown: false },
  ] as const;

  const beforePhoto = photos[0];
  const afterPhoto  = photos[photos.length - 1];

  return (
    <div className="min-h-screen bg-black pb-24">
      <div className="px-5 pt-12 pb-4">
        <h1 className="section-title text-3xl mb-1">Progresso</h1>
        <p className="text-white/40 text-sm">Sua evolução visual e numérica</p>
      </div>

      <div className="px-5 space-y-4">
        {/* Summary cards */}
        <div className="grid grid-cols-3 gap-2">
          {charts.map(({ key, label, color, diff, goodWhenDown }) => {
            const isGood = diff !== null && (goodWhenDown ? diff < 0 : diff > 0);
            const isBad  = diff !== null && (goodWhenDown ? diff > 0 : diff < 0);
            return (
              <button
                key={key}
                onClick={() => setActiveChart(key as typeof activeChart)}
                className={cn(
                  'card text-center py-3 transition-all border',
                  activeChart === key ? 'border-primary/60' : 'border-transparent'
                )}
              >
                <div className="text-lg font-bold" style={{ color }}>
                  {diff !== null ? (diff > 0 ? `+${diff}` : diff) : '--'}
                </div>
                <div className="text-white/30 text-[10px]">{label}</div>
                {diff !== null && (
                  isGood ? <TrendingDown className="w-3 h-3 text-success mx-auto mt-1" />
                  : isBad ? <TrendingUp className="w-3 h-3 text-danger mx-auto mt-1" />
                  : null
                )}
              </button>
            );
          })}
        </div>

        {/* Chart */}
        {chartData.length > 1 ? (
          <div className="card">
            <h3 className="text-white/60 text-sm mb-4">
              {charts.find((c) => c.key === activeChart)?.label}
            </h3>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={charts.find((c) => c.key === activeChart)?.color} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={charts.find((c) => c.key === activeChart)?.color} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" tick={{ fill: '#888', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis hide domain={['auto', 'auto']} />
                <Tooltip
                  contentStyle={{ background: '#1A1A1A', border: '1px solid rgba(255,215,0,0.2)', borderRadius: 12 }}
                  labelStyle={{ color: '#888' }}
                  itemStyle={{ color: '#FFD700' }}
                />
                <Area
                  type="monotone"
                  dataKey={activeChart}
                  stroke={charts.find((c) => c.key === activeChart)?.color}
                  strokeWidth={2}
                  fill="url(#grad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="card text-center py-10">
            <div className="text-4xl mb-2">📈</div>
            <p className="text-white/40 text-sm">Registre suas medidas em Análise Corporal para ver os gráficos.</p>
          </div>
        )}

        {/* Motivational insight */}
        {weightDiff !== null && (
          <div className={cn(
            'card-highlight rounded-2xl p-4',
            weightDiff < 0 ? 'border-success/30' : weightDiff > 0 ? 'border-warning/20' : ''
          )}>
            <p className="text-white/70 text-sm">
              {weightDiff < 0
                ? `📉 Você perdeu ${Math.abs(weightDiff)}kg desde o início. Evolução limpa. Continua.`
                : weightDiff > 0
                ? `⚠️ Peso subiu ${weightDiff}kg. Pode ser retenção. Checa a água e o sódio.`
                : `✅ Peso estável. Foco na composição corporal.`}
            </p>
          </div>
        )}

        {/* Photo comparison */}
        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-white flex items-center gap-2 text-sm">
              <Camera className="w-4 h-4 text-primary" />
              Fotos antes/depois
            </h3>
            <button
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="flex items-center gap-1 text-xs text-primary hover:text-primary-light transition-colors"
            >
              {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
              Adicionar
            </button>
          </div>

          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handlePhotoUpload}
          />

          <div className="grid grid-cols-2 gap-3">
            <PhotoSlot label="Antes" photo={beforePhoto} onClick={() => fileRef.current?.click()} />
            <PhotoSlot label="Depois" photo={afterPhoto} onClick={() => fileRef.current?.click()} />
          </div>

          {photos.length > 2 && (
            <p className="text-white/30 text-xs text-center mt-2">{photos.length} fotos registradas</p>
          )}
        </div>

        {/* Export */}
        <button
          onClick={exportProgressCard}
          className="btn-outline w-full flex items-center justify-center gap-2 text-sm"
        >
          <Download className="w-4 h-4" />
          Exportar resumo de progresso
        </button>
      </div>
    </div>
  );
}

function PhotoSlot({ label, photo, onClick }: { label: string; photo?: ProgressPhoto; onClick: () => void }) {
  if (photo?.imageUrl) {
    return (
      <div className="relative rounded-xl overflow-hidden aspect-square">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={photo.imageUrl} alt={label} className="w-full h-full object-cover" />
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent px-2 py-1.5">
          <div className="text-white text-xs font-semibold">{label}</div>
          <div className="text-white/40 text-[10px]">{photo.date}</div>
        </div>
      </div>
    );
  }
  return (
    <button
      onClick={onClick}
      className="bg-surface-2 rounded-xl aspect-square flex flex-col items-center justify-center gap-2 border border-dashed border-white/10 hover:border-primary/30 transition-colors"
    >
      <Camera className="w-6 h-6 text-white/20" />
      <span className="text-white/20 text-xs">{label}</span>
    </button>
  );
}
