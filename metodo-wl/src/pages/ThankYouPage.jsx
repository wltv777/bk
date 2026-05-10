import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Zap, ArrowRight, CheckCircle, Star, Users, BookOpen, MessageSquare } from 'lucide-react'

function Confetti() {
  const canvasRef = useRef(null)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const particles = Array.from({ length: 120 }, () => ({
      x: Math.random() * canvas.width,
      y: -20,
      w: Math.random() * 10 + 4,
      h: Math.random() * 6 + 3,
      color: ['#0066ff', '#7c3aed', '#f59e0b', '#00d4ff', '#ec4899'][Math.floor(Math.random() * 5)],
      rotation: Math.random() * 360,
      rotSpeed: (Math.random() - 0.5) * 6,
      vx: (Math.random() - 0.5) * 3,
      vy: Math.random() * 3 + 1,
    }))

    let frame
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      particles.forEach(p => {
        p.x += p.vx
        p.y += p.vy
        p.rotation += p.rotSpeed
        if (p.y > canvas.height) { p.y = -20; p.x = Math.random() * canvas.width }
        ctx.save()
        ctx.translate(p.x + p.w / 2, p.y + p.h / 2)
        ctx.rotate((p.rotation * Math.PI) / 180)
        ctx.fillStyle = p.color
        ctx.globalAlpha = 0.85
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h)
        ctx.restore()
      })
      frame = requestAnimationFrame(animate)
    }
    animate()
    return () => cancelAnimationFrame(frame)
  }, [])

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-10" />
}

const STEPS = [
  { icon: BookOpen, title: 'Acesse os módulos', desc: 'Comece pelo Módulo 1 — Fundamentos do Marketing Digital', cta: 'Ir para os módulos', path: '/curso' },
  { icon: MessageSquare, title: 'Conheça a IA WL', desc: 'Peça para criar sua primeira legenda, copy ou roteiro de Reel', cta: 'Usar a IA agora', path: '/ia' },
  { icon: Users, title: 'Entre na comunidade', desc: 'Apresente-se na comunidade VIP e conecte-se com outros alunos', cta: 'Acessar comunidade', path: '/comunidade' },
]

export default function ThankYouPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-wl-black hero-gradient flex items-center justify-center px-4 py-16 relative overflow-hidden">
      <Confetti />

      <div className="relative z-20 max-w-3xl mx-auto text-center">
        {/* Badge */}
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.2 }}
          className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8"
          style={{ background: 'linear-gradient(135deg, #f59e0b, #fbbf24)', boxShadow: '0 0 60px rgba(245,158,11,0.6)' }}>
          <Star size={44} className="text-black fill-black" />
        </motion.div>

        {/* Headline */}
        <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="text-4xl md:text-6xl font-black text-white mb-4">
          Bem-vindo ao{' '}
          <span className="gradient-text">MÉTODO WL!</span>
        </motion.h1>

        <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="text-xl text-wl-gray mb-4">
          Sua compra foi confirmada com sucesso! 🎉
        </motion.p>

        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
          className="text-wl-gray mb-10 max-w-xl mx-auto">
          Você tomou a melhor decisão da sua vida digital. Seu acesso completo já está disponível — vamos começar?
        </motion.p>

        {/* Main CTA */}
        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate('/dashboard')}
          className="btn-gold text-xl px-12 py-6 mb-12 flex items-center gap-3 mx-auto"
        >
          <Zap size={24} />
          Acessar minha plataforma
          <ArrowRight size={24} />
        </motion.button>

        {/* What's next */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
          <h2 className="text-xl font-bold text-white mb-6">Próximos passos recomendados</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {STEPS.map((step, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 + i * 0.1 }}
                className="card-wl p-6 text-left cursor-pointer hover:border-wl-blue/40 transition-all"
                onClick={() => navigate(step.path)}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: 'linear-gradient(135deg, #0066ff22, #7c3aed22)', border: '1px solid rgba(0,102,255,0.2)' }}>
                  <step.icon size={20} className="text-wl-blue" />
                </div>
                <p className="text-sm text-wl-gold font-bold mb-1">Passo {i + 1}</p>
                <h3 className="font-bold text-white mb-2">{step.title}</h3>
                <p className="text-wl-gray text-sm mb-4">{step.desc}</p>
                <span className="text-wl-blue text-sm font-medium flex items-center gap-1">{step.cta} <ArrowRight size={14} /></span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Email notice */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.1 }}
          className="mt-10 glass p-4 rounded-2xl text-sm text-wl-gray max-w-lg mx-auto">
          <CheckCircle size={16} className="text-green-400 inline mr-2" />
          Um e-mail de confirmação foi enviado para o seu endereço cadastrado com todos os detalhes de acesso.
        </motion.div>

        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.3 }} className="mt-8 text-wl-gray/50 text-xs">
          Suporte: contato@metodowl.com.br · Acesso vitalício garantido
        </motion.p>
      </div>
    </div>
  )
}
