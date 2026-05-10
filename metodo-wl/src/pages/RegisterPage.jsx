import { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate, Link } from 'react-router-dom'
import { Eye, EyeOff, Zap, Mail, Lock, User, ArrowRight, CheckCircle } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

export default function RegisterPage() {
  const navigate = useNavigate()
  const { register } = useAuth()
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.password) {
      toast.error('Preencha todos os campos')
      return
    }
    if (form.password.length < 6) {
      toast.error('A senha deve ter no mínimo 6 caracteres')
      return
    }
    if (form.password !== form.confirm) {
      toast.error('As senhas não coincidem')
      return
    }
    setLoading(true)
    try {
      await register(form.name, form.email, form.password)
      toast.success('Conta criada! Bem-vindo ao MÉTODO WL 🎉')
      navigate('/dashboard')
    } catch (err) {
      toast.error('Erro ao criar conta. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const passwordStrength = () => {
    const p = form.password
    if (!p) return 0
    let score = 0
    if (p.length >= 6) score++
    if (p.length >= 10) score++
    if (/[A-Z]/.test(p)) score++
    if (/[0-9]/.test(p)) score++
    if (/[^a-zA-Z0-9]/.test(p)) score++
    return score
  }

  const strength = passwordStrength()
  const strengthColors = ['', '#ef4444', '#f59e0b', '#f59e0b', '#22c55e', '#22c55e']
  const strengthLabels = ['', 'Fraca', 'Média', 'Média', 'Forte', 'Muito forte']

  return (
    <div className="min-h-screen bg-wl-black hero-gradient flex flex-col items-center justify-center px-4 py-16">
      {/* Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(10)].map((_, i) => (
          <motion.div key={i} className="absolute rounded-full"
            style={{ width: Math.random() * 3 + 1, height: Math.random() * 3 + 1, left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`, background: i % 3 === 0 ? '#0066ff' : i % 3 === 1 ? '#7c3aed' : '#00d4ff' }}
            animate={{ y: [-15, 15], opacity: [0, 0.7, 0] }}
            transition={{ duration: 4 + Math.random() * 4, repeat: Infinity, delay: Math.random() * 3 }} />
        ))}
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: 'linear-gradient(135deg,#0066ff,#7c3aed)', boxShadow: '0 0 30px rgba(0,102,255,0.4)' }}>
            <Zap size={28} className="text-white" />
          </div>
          <h1 className="text-3xl font-black text-white">MÉTODO WL</h1>
          <p className="text-wl-gray text-sm mt-1">Crie sua conta e comece hoje</p>
        </motion.div>

        {/* Benefits */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="flex items-center justify-center gap-6 text-xs text-wl-gray mb-6">
          {['Acesso imediato', '12 módulos', 'IA integrada'].map(b => (
            <span key={b} className="flex items-center gap-1.5"><CheckCircle size={12} className="text-green-400" /> {b}</span>
          ))}
        </motion.div>

        {/* Card */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="card-premium p-8 rounded-3xl">
          <h2 className="text-xl font-bold text-white mb-6 text-center">Criar minha conta</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div>
              <label className="text-sm font-medium text-wl-gray block mb-2">Nome completo</label>
              <div className="relative">
                <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-wl-gray" />
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="Seu nome"
                  className="input-wl pl-11"
                  autoComplete="name"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="text-sm font-medium text-wl-gray block mb-2">E-mail</label>
              <div className="relative">
                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-wl-gray" />
                <input
                  type="email"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  placeholder="seu@email.com"
                  className="input-wl pl-11"
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="text-sm font-medium text-wl-gray block mb-2">Senha</label>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-wl-gray" />
                <input
                  type={showPass ? 'text' : 'password'}
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  placeholder="Mínimo 6 caracteres"
                  className="input-wl pl-11 pr-12"
                  autoComplete="new-password"
                />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-wl-gray hover:text-white transition-colors">
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {form.password && (
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex-1 flex gap-1">
                    {[1, 2, 3, 4, 5].map(s => (
                      <div key={s} className="h-1 flex-1 rounded-full transition-all duration-300"
                        style={{ background: s <= strength ? strengthColors[strength] : 'rgba(30,30,58,0.8)' }} />
                    ))}
                  </div>
                  <span className="text-xs" style={{ color: strengthColors[strength] }}>{strengthLabels[strength]}</span>
                </div>
              )}
            </div>

            {/* Confirm */}
            <div>
              <label className="text-sm font-medium text-wl-gray block mb-2">Confirmar senha</label>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-wl-gray" />
                <input
                  type={showPass ? 'text' : 'password'}
                  value={form.confirm}
                  onChange={e => setForm({ ...form, confirm: e.target.value })}
                  placeholder="Repita a senha"
                  className="input-wl pl-11"
                  autoComplete="new-password"
                />
                {form.confirm && form.password === form.confirm && (
                  <CheckCircle size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-green-400" />
                )}
              </div>
            </div>

            {/* Submit */}
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: loading ? 1 : 1.02 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
              className="btn-primary w-full flex items-center justify-center gap-3 text-base mt-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Zap size={18} />
                  Criar minha conta agora
                  <ArrowRight size={18} />
                </>
              )}
            </motion.button>
          </form>

          <p className="text-wl-gray/50 text-xs text-center mt-4">
            Ao criar uma conta você concorda com nossos Termos de Uso e Política de Privacidade.
          </p>

          <div className="mt-5 text-center">
            <p className="text-wl-gray text-sm">
              Já tem conta?{' '}
              <Link to="/login" className="text-wl-blue hover:underline font-medium">Entrar</Link>
            </p>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }} className="flex items-center justify-center gap-6 mt-8 text-xs text-wl-gray">
          <span>🔒 Conexão segura SSL</span>
          <span>🛡️ LGPD Compliance</span>
          <span>✅ Garantia 7 dias</span>
        </motion.div>
      </div>
    </div>
  )
}
