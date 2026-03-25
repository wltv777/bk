'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, Flame, Lock, Mail } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Logo } from '@/components/logo/Logo';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    try {
      await login(email.trim(), password);
      router.replace('/dashboard');
    } catch (err: any) {
      const msg = err.code === 'auth/invalid-credential'
        ? 'Email ou senha incorretos.'
        : 'Erro ao entrar. Tente novamente.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* Header bg decorative */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute top-1/3 -left-20 w-48 h-48 rounded-full bg-accent/5 blur-3xl" />
      </div>

      <div className="flex-1 flex flex-col justify-center px-6 py-12 relative z-10">
        {/* Logo */}
        <div className="flex flex-col items-center mb-10">
          <Logo size="lg" showTagline />
        </div>

        {/* Form card */}
        <div className="card-highlight rounded-3xl p-6 max-w-sm w-full mx-auto">
          <h1 className="section-title mb-1">Bem-vindo de volta</h1>
          <p className="text-white/40 text-sm mb-6">Entre na sua conta e volte ao foco.</p>

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email */}
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 w-4 h-4" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Seu email"
                autoComplete="email"
                className="input pl-10"
                required
              />
            </div>

            {/* Password */}
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 w-4 h-4" />
              <input
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Sua senha"
                autoComplete="current-password"
                className="input pl-10 pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
              >
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={cn(
                'btn-primary w-full flex items-center justify-center gap-2',
                loading && 'opacity-60 pointer-events-none'
              )}
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
              ) : (
                <>
                  <Flame className="w-5 h-5" />
                  ENTRAR
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-white/40 text-sm">
              Não tem conta?{' '}
              <Link href="/signup" className="text-primary font-semibold hover:text-primary-light transition-colors">
                Criar agora
              </Link>
            </p>
          </div>
        </div>

        {/* Motivational */}
        <p className="text-center text-white/20 text-xs mt-8 italic">
          "Disciplina é a forma mais sexy de amor-próprio."
        </p>
      </div>
    </div>
  );
}
