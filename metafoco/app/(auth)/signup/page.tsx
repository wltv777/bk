'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, Flame, Lock, Mail, User } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Logo } from '@/components/logo/Logo';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function SignupPage() {
  const router = useRouter();
  const { signup } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !email || !password) return;
    if (password.length < 6) {
      toast.error('Senha deve ter pelo menos 6 caracteres.');
      return;
    }
    setLoading(true);
    try {
      await signup(email.trim(), password, name.trim());
      toast.success('Conta criada! Vamos configurar seu perfil.');
      router.replace('/onboarding');
    } catch (err: any) {
      const msg = err.code === 'auth/email-already-in-use'
        ? 'Este email já está em uso.'
        : 'Erro ao criar conta. Tente novamente.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-black flex flex-col">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -left-20 w-64 h-64 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute bottom-1/3 -right-20 w-48 h-48 rounded-full bg-accent/5 blur-3xl" />
      </div>

      <div className="flex-1 flex flex-col justify-center px-6 py-12 relative z-10">
        <div className="flex flex-col items-center mb-10">
          <Logo size="lg" showTagline />
        </div>

        <div className="card-highlight rounded-3xl p-6 max-w-sm w-full mx-auto">
          <h1 className="section-title mb-1">Criar conta</h1>
          <p className="text-white/40 text-sm mb-6">Sua transformação começa agora.</p>

          <form onSubmit={handleSignup} className="space-y-4">
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 w-4 h-4" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Seu nome"
                autoComplete="name"
                className="input pl-10"
                required
              />
            </div>

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

            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 w-4 h-4" />
              <input
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Crie uma senha (min. 6 caracteres)"
                autoComplete="new-password"
                className="input pl-10 pr-10"
                required
                minLength={6}
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
                  CRIAR CONTA
                </>
              )}
            </button>
          </form>

          <p className="text-white/20 text-xs text-center mt-4">
            Ao criar conta, você concorda com nossos termos de uso.
          </p>

          <div className="mt-4 text-center">
            <p className="text-white/40 text-sm">
              Já tem conta?{' '}
              <Link href="/login" className="text-primary font-semibold hover:text-primary-light transition-colors">
                Entrar
              </Link>
            </p>
          </div>
        </div>

        <p className="text-center text-white/20 text-xs mt-8 italic">
          "Seu corpo muda quando sua cabeça muda."
        </p>
      </div>
    </div>
  );
}
