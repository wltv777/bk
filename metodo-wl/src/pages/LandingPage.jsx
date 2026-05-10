import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Play, Star, ChevronDown, ChevronUp, Zap, Shield, Trophy, Users, TrendingUp, CheckCircle, ArrowRight, Clock } from 'lucide-react'
import { TESTIMONIALS, QUICK_RESULTS } from '../data/testimonialsData'
import { MODULES, BONUSES } from '../data/courseData'

function CountdownTimer() {
  const [time, setTime] = useState({ h: 47, m: 59, s: 59 })
  useEffect(() => {
    const stored = localStorage.getItem('wl_countdown')
    const target = stored ? parseInt(stored) : Date.now() + 48 * 3600 * 1000
    if (!stored) localStorage.setItem('wl_countdown', String(target))
    const tick = () => {
      const diff = Math.max(0, target - Date.now())
      setTime({
        h: Math.floor(diff / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
        s: Math.floor((diff % 60000) / 1000),
      })
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])
  const pad = n => String(n).padStart(2, '0')
  return (
    <div className="flex items-center gap-3">
      {[['h', 'Horas'], ['m', 'Min'], ['s', 'Seg']].map(([k, label]) => (
        <div key={k} className="countdown-box">
          <span className="text-3xl font-black gradient-text">{pad(time[k])}</span>
          <span className="text-xs text-wl-gray mt-1">{label}</span>
        </div>
      ))}
    </div>
  )
}

function ParticlesEffect() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: Math.random() * 4 + 1,
            height: Math.random() * 4 + 1,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            background: i % 3 === 0 ? '#0066ff' : i % 3 === 1 ? '#7c3aed' : '#00d4ff',
          }}
          animate={{ y: [-20, 20], opacity: [0, 1, 0] }}
          transition={{ duration: 3 + Math.random() * 4, repeat: Infinity, delay: Math.random() * 3 }}
        />
      ))}
    </div>
  )
}

const FAQS = [
  { q: 'Para quem é o MÉTODO WL?', a: 'Para qualquer pessoa que quer construir um negócio digital lucrativo, seja do zero ou escalando o que já tem. Não precisa de experiência prévia.' },
  { q: 'Em quanto tempo verei resultados?', a: 'Nossos alunos reportam primeiros resultados em 7 a 30 dias. Depende da sua dedicação e aplicação do método.' },
  { q: 'Por quanto tempo tenho acesso?', a: 'Acesso vitalício a todo o conteúdo, incluindo atualizações futuras. Uma vez dentro, você está dentro para sempre.' },
  { q: 'Funciona mesmo para iniciantes?', a: 'Sim! O método foi desenhado para ser implementado do absoluto zero. Os módulos são progressivos e práticos.' },
  { q: 'Como funciona a garantia?', a: 'Você tem 7 dias de garantia incondicional. Se por qualquer motivo não ficar satisfeito, devolvemos 100% do seu investimento.' },
  { q: 'O que está incluído no preço?', a: 'Todos os 12 módulos + 6 bônus exclusivos + acesso à comunidade VIP + todas as ferramentas de IA + atualizações vitalícias.' },
]

export default function LandingPage() {
  const navigate = useNavigate()
  const [openFaq, setOpenFaq] = useState(null)
  const [activeTestimonial, setActiveTestimonial] = useState(0)
  const heroRef = useRef(null)

  useEffect(() => {
    const id = setInterval(() => setActiveTestimonial(p => (p + 1) % TESTIMONIALS.length), 5000)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="min-h-screen bg-wl-black overflow-x-hidden">
      {/* Top urgency bar */}
      <div className="bg-gradient-to-r from-wl-blue via-wl-purple to-wl-blue py-2 text-center text-sm font-medium text-white animate-pulse">
        🔥 OFERTA ESPECIAL: Termina em breve — Vagas limitadas!
      </div>

      {/* Nav */}
      <nav className="sticky top-0 z-50 h-16 flex items-center justify-between px-6 md:px-12" style={{ background: 'rgba(8,8,16,0.9)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(30,30,58,0.5)' }}>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#0066ff,#7c3aed)' }}>
            <Zap size={16} className="text-white" />
          </div>
          <span className="font-black text-white text-lg tracking-tight">MÉTODO WL</span>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/login')} className="text-wl-gray hover:text-white text-sm font-medium transition-colors">
            Já sou aluno
          </button>
          <button onClick={() => navigate('/vendas')} className="btn-primary py-2 px-5 text-sm">
            Quero entrar
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section ref={heroRef} className="relative hero-gradient min-h-screen flex items-center justify-center px-6 pt-20 pb-32" style={{ paddingTop: '120px' }}>
        <ParticlesEffect />
        <div className="relative max-w-5xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold mb-8 glass-blue">
            <Star size={14} className="text-wl-gold fill-wl-gold" />
            <span className="text-wl-white">+10.000 alunos transformados</span>
          </motion.div>

          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-4xl md:text-7xl font-black text-white leading-none mb-6">
            O método que vai te fazer{' '}
            <span className="gradient-text block md:inline">faturar R$ 10K+</span>{' '}
            com marketing digital
          </motion.h1>

          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-lg md:text-xl text-wl-gray max-w-3xl mx-auto mb-10 leading-relaxed">
            12 módulos práticos + IA integrada + comunidade VIP. Do zero ao seu primeiro resultado em até 30 dias, com o método que já gerou mais de <span className="text-white font-bold">R$ 2 milhões</span> em vendas para nossos alunos.
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <button onClick={() => navigate('/vendas')} className="btn-gold text-lg px-10 py-5 flex items-center gap-3">
              <Zap size={20} />
              QUERO MINHA VAGA AGORA
              <ArrowRight size={20} />
            </button>
            <button className="btn-ghost flex items-center gap-2">
              <Play size={18} />
              Ver aula grátis
            </button>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="flex flex-col items-center gap-4">
            <p className="text-wl-gray text-sm">⏰ Oferta expira em:</p>
            <CountdownTimer />
          </motion.div>

          {/* Social proof stats */}
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-20">
            {[
              { value: '10.000+', label: 'Alunos ativos', icon: Users },
              { value: 'R$ 2M+', label: 'Gerados pelos alunos', icon: TrendingUp },
              { value: '12', label: 'Módulos premium', icon: Trophy },
              { value: '98%', label: 'Taxa de satisfação', icon: Star },
            ].map(({ value, label, icon: Icon }) => (
              <div key={label} className="card-wl p-6 text-center">
                <Icon size={24} className="text-wl-blue mx-auto mb-2" />
                <div className="text-3xl font-black gradient-text">{value}</div>
                <div className="text-wl-gray text-sm mt-1">{label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Quick results ticker */}
      <div className="bg-wl-card border-y border-wl-border py-4 overflow-hidden">
        <div className="flex gap-8 animate-marquee whitespace-nowrap">
          {[...QUICK_RESULTS, ...QUICK_RESULTS].map((r, i) => (
            <span key={i} className="inline-flex items-center gap-2 text-sm text-wl-gray shrink-0">
              <span>{r.icon}</span>
              <span className="text-white font-medium">{r.name}</span>
              <span>{r.result}</span>
              <span className="text-wl-blue">em {r.hours}h</span>
              <span className="mx-4 text-wl-border">•</span>
            </span>
          ))}
        </div>
      </div>

      {/* Testimonials */}
      <section className="py-24 px-6 relative">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black text-white mb-4">
              Resultados <span className="gradient-text-gold">reais</span> de alunos reais
            </h2>
            <p className="text-wl-gray text-lg">Histórias de transformação que aconteceram de verdade</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <motion.div key={t.id} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className={`card-wl p-6 ${t.highlight ? 'border-wl-gold/30 bg-gradient-to-b from-wl-card to-wl-dark' : ''}`}>
                <div className="flex items-center gap-3 mb-4">
                  <img src={t.avatar} alt={t.name} className="w-12 h-12 rounded-full ring-2 ring-wl-blue/30" />
                  <div>
                    <div className="font-bold text-white">{t.name}</div>
                    <div className="text-xs text-wl-gray">{t.role}</div>
                  </div>
                  <span className="ml-auto text-xs font-bold px-2 py-1 rounded-full badge-gold text-black">{t.badge}</span>
                </div>
                <div className="flex mb-3">
                  {[...Array(t.stars)].map((_, j) => <Star key={j} size={14} className="text-wl-gold fill-wl-gold" />)}
                </div>
                <p className="text-wl-gray text-sm leading-relaxed mb-4">{t.text}</p>
                <div className="border-t border-wl-border pt-4">
                  <div className="text-xs text-wl-gray mb-1">Resultado:</div>
                  <div className="text-wl-gold font-bold">{t.result}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Course preview */}
      <section className="py-24 px-6 bg-wl-dark/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black text-white mb-4">
              O que você vai <span className="gradient-text">aprender</span>
            </h2>
            <p className="text-wl-gray text-lg">12 módulos completos com mais de 100 aulas práticas</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {MODULES.slice(0, 6).map((m, i) => (
              <motion.div key={m.id} initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}
                className="card-wl p-5 flex items-start gap-4">
                <span className="text-3xl">{m.icon}</span>
                <div>
                  <div className="font-bold text-white mb-1">Módulo {m.id}: {m.title}</div>
                  <div className="text-sm text-wl-gray">{m.subtitle}</div>
                  <div className="text-xs text-wl-blue mt-2">{m.lessons} aulas • {m.duration}</div>
                </div>
              </motion.div>
            ))}
          </div>
          <div className="text-center mt-8">
            <p className="text-wl-gray">+ 6 módulos avançados incluídos</p>
          </div>
        </div>
      </section>

      {/* Bonuses */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black text-white mb-4">
              Bônus exclusivos <span className="gradient-text-gold">grátis</span>
            </h2>
            <p className="text-wl-gray text-lg">Mais de R$ 2.182 em bônus incluídos sem custo extra</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {BONUSES.map((b, i) => (
              <motion.div key={b.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="card-premium p-6">
                <span className="text-4xl mb-4 block">{b.icon}</span>
                <div className="text-lg font-bold text-white mb-1">{b.title}</div>
                <div className="text-sm text-wl-gray mb-3">{b.description}</div>
                <div className="text-wl-gold font-bold">Valor: {b.value}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 px-6 bg-wl-dark/50">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black text-white mb-4">Perguntas <span className="gradient-text">frequentes</span></h2>
          </div>
          <div className="space-y-3">
            {FAQS.map((f, i) => (
              <motion.div key={i} initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="card-wl overflow-hidden">
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full flex items-center justify-between p-6 text-left">
                  <span className="font-semibold text-white">{f.q}</span>
                  {openFaq === i ? <ChevronUp size={20} className="text-wl-blue shrink-0" /> : <ChevronDown size={20} className="text-wl-gray shrink-0" />}
                </button>
                <AnimatePresence>
                  {openFaq === i && (
                    <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                      <p className="text-wl-gray px-6 pb-6 leading-relaxed">{f.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-32 px-6 relative hero-gradient">
        <ParticlesEffect />
        <div className="relative max-w-3xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}>
            <h2 className="text-4xl md:text-6xl font-black text-white mb-6">
              Sua transformação começa <span className="gradient-text-gold">hoje</span>
            </h2>
            <p className="text-wl-gray text-lg mb-8">Mais de 10.000 alunos já mudaram suas vidas. Você é o próximo?</p>
            <div className="flex flex-col items-center gap-4">
              <CountdownTimer />
              <button onClick={() => navigate('/vendas')} className="btn-gold text-xl px-12 py-6 mt-4 flex items-center gap-3">
                <Zap size={24} />
                GARANTIR MINHA VAGA AGORA
              </button>
              <div className="flex items-center gap-6 text-sm text-wl-gray mt-4">
                <span className="flex items-center gap-2"><Shield size={16} className="text-green-400" /> Garantia 7 dias</span>
                <span className="flex items-center gap-2"><CheckCircle size={16} className="text-wl-blue" /> Acesso imediato</span>
                <span className="flex items-center gap-2"><Clock size={16} className="text-wl-gold" /> Vitalício</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-wl-dark border-t border-wl-border py-10 text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#0066ff,#7c3aed)' }}>
            <Zap size={12} className="text-white" />
          </div>
          <span className="font-black text-white">MÉTODO WL</span>
        </div>
        <p className="text-wl-gray text-sm">© 2026 MÉTODO WL. Todos os direitos reservados.</p>
        <p className="text-wl-gray/50 text-xs mt-2">Os resultados apresentados não são garantia de resultado individual. Resultados variam conforme dedicação e aplicação.</p>
      </footer>
    </div>
  )
}
