'use client';

import { useState, useRef, useEffect } from 'react';
import { useUserStore } from '@/store/userStore';
import { useDiaryStore } from '@/store/diaryStore';
import { useFastingStore } from '@/store/fastingStore';
import { Logo } from '@/components/logo/Logo';
import { Send, Bot, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { CoachMessage } from '@/types';

const QUICK_PROMPTS = [
  'Como estou hoje?',
  'O que comer agora?',
  'Interpretei minha bioimpedância',
  'Exagerei na comida',
  'Jejum tá difícil',
  'Dicas de proteína',
];

const INITIAL_MESSAGES: CoachMessage[] = [
  {
    role: 'assistant',
    content: 'E aí! Sou o METAFOCO Coach. Tô aqui pra te manter no foco, interpretar seus dados e te dar um puxão de orelha quando precisar. O que tá rolando? 💪',
    timestamp: new Date(),
  },
];

export default function CoachPage() {
  const { profile, metrics, premium } = useUserStore();
  const { getTodayTotals } = useDiaryStore();
  const { activeSession } = useFastingStore();
  const [messages, setMessages] = useState<CoachMessage[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [msgCount, setMsgCount] = useState(0);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const FREE_LIMIT = 10;
  const isLimited = !premium.active && msgCount >= FREE_LIMIT;

  const totals = getTodayTotals();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function sendMessage(text?: string) {
    const content = text ?? input.trim();
    if (!content || loading || isLimited) return;

    const userMsg: CoachMessage = { role: 'user', content, timestamp: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    setMsgCount((c) => c + 1);

    const context = {
      profile: profile ? {
        name: profile.name,
        goal: profile.goal,
        weight: profile.weight,
        targetWeight: profile.targetWeight,
        fastingProtocol: profile.fastingProtocol,
      } : null,
      today: {
        calories: totals.calories,
        targetCalories: metrics?.targetCalories,
        protein: totals.protein,
        targetProtein: metrics?.targetProtein,
        fastingActive: !!activeSession,
      },
    };

    try {
      const res = await fetch('/api/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          context,
          messages: [...messages, userMsg].map(({ role, content }) => ({ role, content })),
        }),
      });
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: data.reply, timestamp: new Date() },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Deu ruim aqui. Mas você continua, tá? 💪', timestamp: new Date() },
      ]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  }

  return (
    <div className="flex flex-col h-screen bg-black">
      {/* Header */}
      <div className="px-5 pt-12 pb-4 flex items-center gap-3 border-b border-white/5">
        <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
          <Bot className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="font-bold text-white">METAFOCO Coach</h1>
          <p className="text-white/30 text-xs">
            {premium.active ? 'Ilimitado • Premium' : `${FREE_LIMIT - msgCount} msgs restantes`}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
        {messages.map((msg, i) => (
          <div key={i} className={cn('flex gap-2', msg.role === 'user' ? 'flex-row-reverse' : 'flex-row')}>
            {msg.role === 'assistant' && (
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-auto">
                <Zap className="w-3.5 h-3.5 text-primary fill-primary" />
              </div>
            )}
            <div className={cn(
              'max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed',
              msg.role === 'user'
                ? 'bg-primary text-black font-medium rounded-tr-sm'
                : 'bg-surface text-white rounded-tl-sm'
            )}>
              {msg.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex gap-2">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
              <Zap className="w-3.5 h-3.5 text-primary fill-primary" />
            </div>
            <div className="bg-surface rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1">
              {[0,1,2].map(i => (
                <span key={i} className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Quick prompts */}
      <div className="px-5 py-2 flex gap-2 overflow-x-auto scrollbar-hide">
        {QUICK_PROMPTS.map((p) => (
          <button
            key={p}
            onClick={() => sendMessage(p)}
            disabled={loading || isLimited}
            className="flex-shrink-0 text-xs bg-surface border border-white/10 text-white/60 px-3 py-1.5 rounded-full hover:border-primary/40 hover:text-primary transition-colors"
          >
            {p}
          </button>
        ))}
      </div>

      {/* Premium gate */}
      {isLimited && (
        <div className="mx-5 mb-2 card-highlight text-center py-3">
          <p className="text-primary text-sm font-bold">💎 Limite atingido</p>
          <p className="text-white/40 text-xs">Assine o Premium para mensagens ilimitadas</p>
        </div>
      )}

      {/* Input */}
      <div className="px-5 pb-24 pt-2">
        <div className="flex gap-2 bg-surface rounded-2xl p-2 border border-white/10">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            placeholder={isLimited ? 'Atualize para Premium...' : 'Fala pro coach...'}
            disabled={isLimited}
            className="flex-1 bg-transparent text-white placeholder-white/30 text-sm outline-none px-2"
          />
          <button
            onClick={() => sendMessage()}
            disabled={!input.trim() || loading || isLimited}
            className={cn(
              'w-10 h-10 rounded-xl flex items-center justify-center transition-all',
              input.trim() && !isLimited ? 'bg-primary text-black' : 'bg-white/5 text-white/20'
            )}
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
