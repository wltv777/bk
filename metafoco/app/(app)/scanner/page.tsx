'use client';

import { useState, useRef, useCallback, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { collection, addDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { useDiaryStore } from '@/store/diaryStore';
import { addXP } from '@/lib/gamification';
import { Camera, Barcode, Upload, RefreshCw, Check, ChevronDown } from 'lucide-react';
import { cn, getMealSlotLabel, todayString } from '@/lib/utils';
import toast from 'react-hot-toast';
import type { ScanFoodResult, MealSlot } from '@/types';

function ScannerContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mode = searchParams.get('mode') ?? 'camera';
  const [activeMode, setActiveMode] = useState<'camera' | 'barcode'>(mode as any);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [photo, setPhoto] = useState<string | null>(null);
  const [result, setResult] = useState<ScanFoodResult | null>(null);
  const [scanning, setScanning] = useState(false);
  const [saving, setSaving] = useState(false);
  const [quantity, setQuantity] = useState(100);
  const [slot, setSlot] = useState<MealSlot>('lunch');
  const [barcodeInput, setBarcodeInput] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const { addEntry } = useDiaryStore();

  useEffect(() => {
    return () => { stream?.getTracks().forEach((t) => t.stop()); };
  }, [stream]);

  async function startCamera() {
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      setStream(s);
      if (videoRef.current) videoRef.current.srcObject = s;
    } catch {
      toast.error('Câmera não disponível. Use upload de foto.');
    }
  }

  function stopCamera() {
    stream?.getTracks().forEach((t) => t.stop());
    setStream(null);
  }

  function capturePhoto() {
    if (!videoRef.current || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const video = videoRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d')?.drawImage(video, 0, 0);
    const base64 = canvas.toDataURL('image/jpeg', 0.8).split(',')[1];
    setPhoto(base64);
    stopCamera();
    analyzePhoto(base64);
  }

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const base64 = (ev.target?.result as string).split(',')[1];
      setPhoto(base64);
      analyzePhoto(base64);
    };
    reader.readAsDataURL(file);
  }

  async function analyzePhoto(base64: string) {
    setScanning(true);
    setResult(null);
    try {
      const res = await fetch('/api/scan-food', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: base64, mimeType: 'image/jpeg' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setResult(data);
      setQuantity(data.portion ?? 100);
    } catch (err: any) {
      toast.error(err.message || 'Não consegui identificar. Tente outra foto.');
    } finally {
      setScanning(false);
    }
  }

  async function lookupBarcode() {
    if (!barcodeInput) return;
    setScanning(true);
    setResult(null);
    try {
      const res = await fetch(`/api/barcode?code=${barcodeInput}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setResult({
        name: data.name,
        calories: Math.round(data.calories_100g * quantity / 100),
        protein: Math.round(data.protein_100g * quantity / 100 * 10) / 10,
        carbs: Math.round(data.carbs_100g * quantity / 100 * 10) / 10,
        fat: Math.round(data.fat_100g * quantity / 100 * 10) / 10,
        fiber: Math.round((data.fiber_100g ?? 0) * quantity / 100 * 10) / 10,
        portion: quantity,
        portionUnit: 'g',
        confidence: 1,
      });
    } catch (err: any) {
      toast.error(err.message || 'Produto não encontrado.');
    } finally {
      setScanning(false);
    }
  }

  async function saveResult() {
    if (!result || !auth.currentUser) return;
    setSaving(true);
    const factor = quantity / (result.portion || 100);
    const entry = {
      userId: auth.currentUser.uid,
      date: todayString(),
      slot,
      foodName: result.name,
      quantity,
      quantityUnit: 'g',
      calories: Math.round(result.calories * factor),
      protein:  Math.round(result.protein  * factor * 10) / 10,
      carbs:    Math.round(result.carbs    * factor * 10) / 10,
      fat:      Math.round(result.fat      * factor * 10) / 10,
      fiber:    Math.round((result.fiber ?? 0) * factor * 10) / 10,
      source: activeMode === 'barcode' ? 'barcode' as const : 'scanner' as const,
      createdAt: new Date(),
    };
    try {
      const ref = await addDoc(collection(db, 'meals', auth.currentUser.uid, 'entries'), entry);
      addEntry({ ...entry, id: ref.id });
      await addXP(auth.currentUser.uid, 'scan_used');
      toast.success(`${result.name} adicionado! 🔥`);
      router.push('/diary');
    } catch {
      toast.error('Erro ao salvar.');
    } finally {
      setSaving(false);
    }
  }

  function reset() {
    setPhoto(null);
    setResult(null);
    setScanning(false);
    setBarcodeInput('');
  }

  const slots: MealSlot[] = ['breakfast', 'lunch', 'dinner', 'snack', 'pre_workout', 'post_workout'];

  return (
    <div className="min-h-screen bg-black">
      <div className="px-5 pt-12 pb-4">
        <h1 className="section-title text-3xl mb-1">Scanner</h1>
        <p className="text-white/40 text-sm">Foto ou código de barras</p>
      </div>

      {/* Mode toggle */}
      <div className="px-5 mb-4">
        <div className="flex bg-surface rounded-2xl p-1">
          <button
            onClick={() => { setActiveMode('camera'); reset(); }}
            className={cn('flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all', activeMode === 'camera' ? 'bg-primary text-black' : 'text-white/50')}
          >
            <Camera className="w-4 h-4" /> Foto IA
          </button>
          <button
            onClick={() => { setActiveMode('barcode'); reset(); }}
            className={cn('flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all', activeMode === 'barcode' ? 'bg-primary text-black' : 'text-white/50')}
          >
            <Barcode className="w-4 h-4" /> Código
          </button>
        </div>
      </div>

      <div className="px-5 space-y-4">
        {/* Camera mode */}
        {activeMode === 'camera' && !result && (
          <div className="space-y-3">
            {/* Preview */}
            <div className="relative rounded-2xl overflow-hidden bg-surface aspect-square">
              {photo ? (
                <img src={`data:image/jpeg;base64,${photo}`} className="w-full h-full object-cover" alt="Foto capturada" />
              ) : stream ? (
                <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center gap-3 text-white/30">
                  <Camera className="w-12 h-12" />
                  <p className="text-sm">Câmera desativada</p>
                </div>
              )}

              {scanning && (
                <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-3">
                  <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  <p className="text-primary text-sm font-semibold">Analisando com IA...</p>
                </div>
              )}
            </div>
            <canvas ref={canvasRef} className="hidden" />

            <div className="grid grid-cols-3 gap-2">
              {!stream ? (
                <button onClick={startCamera} className="btn-primary col-span-2 flex items-center justify-center gap-2 text-sm">
                  <Camera className="w-4 h-4" /> Abrir câmera
                </button>
              ) : (
                <button onClick={capturePhoto} className="btn-primary col-span-2 flex items-center justify-center gap-2 text-sm">
                  <Camera className="w-4 h-4" /> Fotografar
                </button>
              )}
              <button
                onClick={() => fileRef.current?.click()}
                className="btn-outline flex items-center justify-center gap-1 text-sm px-2"
              >
                <Upload className="w-4 h-4" />
              </button>
            </div>

            <input ref={fileRef} type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
          </div>
        )}

        {/* Barcode mode */}
        {activeMode === 'barcode' && !result && (
          <div className="space-y-3">
            <div className="card text-center py-8">
              <Barcode className="w-12 h-12 text-white/30 mx-auto mb-2" />
              <p className="text-white/40 text-sm">Digite ou escaneie o EAN</p>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={barcodeInput}
                onChange={(e) => setBarcodeInput(e.target.value)}
                placeholder="Ex: 7891000315507"
                className="input flex-1 font-mono"
                inputMode="numeric"
              />
              <button
                onClick={lookupBarcode}
                disabled={!barcodeInput || scanning}
                className="btn-primary px-4 flex items-center gap-1"
              >
                {scanning ? <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" /> : 'Buscar'}
              </button>
            </div>
          </div>
        )}

        {/* Result */}
        {result && (
          <div className="space-y-3 animate-slide-up">
            <div className="card-highlight space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-white">{result.name}</h3>
                  {result.imageDescription && (
                    <p className="text-white/30 text-xs mt-0.5">{result.imageDescription}</p>
                  )}
                </div>
                <button onClick={reset} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                  <RefreshCw className="w-4 h-4 text-white/40" />
                </button>
              </div>

              {/* Macros */}
              <div className="grid grid-cols-4 gap-2 text-center">
                {[
                  { label: 'Calorias', value: `${Math.round(result.calories * quantity / result.portion)}`, unit: 'kcal', color: 'text-primary' },
                  { label: 'Proteína', value: `${(result.protein * quantity / result.portion).toFixed(1)}`, unit: 'g', color: 'text-blue-400' },
                  { label: 'Carbo',    value: `${(result.carbs * quantity / result.portion).toFixed(1)}`,   unit: 'g', color: 'text-orange-400' },
                  { label: 'Gordura',  value: `${(result.fat * quantity / result.portion).toFixed(1)}`,     unit: 'g', color: 'text-yellow-400' },
                ].map(({ label, value, unit, color }) => (
                  <div key={label} className="bg-surface rounded-xl p-2">
                    <div className={cn('font-bold text-lg', color)}>{value}</div>
                    <div className="text-white/30 text-[10px]">{unit}</div>
                    <div className="text-white/20 text-[10px]">{label}</div>
                  </div>
                ))}
              </div>

              {/* Quantity */}
              <div className="space-y-1">
                <label className="text-white/50 text-xs">Quantidade consumida (g)</label>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  min={1} max={2000}
                  className="input"
                />
              </div>

              {/* Slot */}
              <div className="space-y-1">
                <label className="text-white/50 text-xs">Refeição</label>
                <div className="relative">
                  <select value={slot} onChange={(e) => setSlot(e.target.value as MealSlot)} className="input appearance-none pr-8">
                    {slots.map((s) => (
                      <option key={s} value={s} className="bg-surface">{getMealSlotLabel(s)}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 w-4 h-4 pointer-events-none" />
                </div>
              </div>

              {result.clarifyingQuestions?.map((q) => (
                <div key={q} className="bg-surface-2 rounded-xl px-3 py-2 text-xs text-white/50">
                  🤔 {q}
                </div>
              ))}
            </div>

            <button
              onClick={saveResult}
              disabled={saving}
              className={cn('btn-primary w-full flex items-center justify-center gap-2', saving && 'opacity-60 pointer-events-none')}
            >
              {saving ? (
                <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
              ) : (
                <><Check className="w-5 h-5" /> SALVAR NO DIÁRIO</>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ScannerPage() {
  return <Suspense fallback={<div className="min-h-screen bg-black" />}><ScannerContent /></Suspense>;
}
