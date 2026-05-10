import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Play, Star, Shield, Zap, CheckCircle, ChevronDown, ChevronUp, ArrowRight, Clock, Users, Trophy, Lock } from 'lucide-react'
import { TESTIMONIALS } from '../data/testimonialsData'
import { BONUSES } from '../data/courseData'

function CountdownTimer() {
  const [time, setTime] = useState({ h: 47, m: 59, s: 59 })
  useEffect(() => {
    const stored = localStorage.getItem('wl_sales_countdown')
    const target = stored ? parseInt(stored) : Date.now() + 48 * 3600 * 1000
    if (!stored) localStorage.setItem('wl_sales_countdown', String(target))
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
    <div className="flex items-center gap-3 justify-center">
      {[['h', 'Horas'], ['m', 'Min'], ['s', 'Seg']].map(([k, label]) => (
        <div key={k} className="countdown-box">
          <span className="text-3xl font-black text-wl-gold">{pad(time[k])}</span>
          <span className="text-xs text-wl-gray mt-1">{label}</span>
        </div>
      ))}
    </div>
  )
}

const FAQS = [
  { q: 'Para quem é o MÉTODO WL?', a: 'Para qualquer pessoa que quer construir um negócio digital lucrativo — seja do zero ou acelerando o que já tem. Funciona para coaches, infoprodutores, prestadores de serviço, e-commerces e qualquer nicho.' },
  { q: 'Preciso de experiência para começar?', a: 'Zero experiência necessária. O método foi estruturado do absoluto início. Você vai aprender passo a passo, com aulas práticas e exercícios aplicados.' },
  { q: 'Como funcionam as ferramentas de IA?', a: 'As ferramentas estão integradas à plataforma. São o Gerador de Reels, Analisador de Instagram, a IA Assistente, a Biblioteca de Copy e muito mais. Tudo dentro do seu painel.' },
  { q: 'Por quanto tempo tenho acesso?', a: 'Acesso vitalício. Uma vez dentro, você está dentro para sempre — incluindo todas as atualizações futuras do método.' },
  { q: 'Como funciona a garantia de 7 dias?', a: 'Se por qualquer motivo não ficar satisfeito nos primeiros 7 dias, basta mandar um e-mail e devolvemos 100% do seu dinheiro. Sem perguntas, sem burocracia.' },
  { q: 'Posso parcelar?', a: 'Sim! Você pode parcelar em até 12x no cartão. À vista no Pix tem desconto adicional.' },
]

export default function SalesPage() {
  const navigate = useNavigate()
  const [openFaq, setOpenFaq] = useState(null)

  const totalBonusValue = 2182

  return (
    <div className="min-h-screen bg-wl-black overflow-x-hidden">
      {/* Urgency bar */}
      <div className="bg-gradient-to-r from-red-700 via-red-600 to-red-700 py-2.5 text-center text-sm font-bold text-white">
        ⚠️ ATENÇÃO: Essa oferta fecha em breve — Não perca!
      </div>

      {/* Nav */}
      <nav className="sticky top-0 z-50 h-16 flex items-center justify-between px-6 md:px-12" style={{ background: 'rgba(8,8,16,0.95)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(30,30,58,0.5)' }}>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#0066ff,#7c3aed)' }}>
            <Zap size={16} className="text-white" />
          </div>
          <span className="font-black text-white text-lg tracking-tight">MÉTODO WL</span>
        </div>
        <div className="flex items-center gap-6 text-sm text-wl-gray">
          <span className="flex items-center gap-1.5"><Shield size={14} className="text-green-400" /> Garantia 7 dias</span>
          <span className="flex items-center gap-1.5"><Lock size={14} className="text-wl-blue" /> Compra segura</span>
        </div>
      </nav>

      {/* VSL Section */}
      <section className="relative hero-gradient py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold mb-6 glass-gold">
            <Star size={14} className="text-wl-gold fill-wl-gold" />
            <span className="gradient-text-gold">Método #1 em marketing digital do Brasil</span>
          </motion.div>

          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-4xl md:text-6xl font-black text-white leading-tight mb-6">
            Construa seu negócio digital{' '}
            <span className="gradient-text">do zero ao R$ 10K+</span>{' '}
            em 30 dias
          </motion.h1>

          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="text-lg text-wl-gray mb-10 max-w-2xl mx-auto">
            O sistema completo com 12 módulos, IA integrada e comunidade VIP que já transformou mais de <strong className="text-white">10.000 vidas</strong> e gerou <strong className="text-wl-gold">R$ 2 milhões</strong> em resultados.
          </motion.p>

          {/* Video placeholder */}
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }} className="relative rounded-3xl overflow-hidden mb-10 cursor-pointer group"
            style={{ aspectRatio: '16/9', background: 'linear-gradient(135deg, #0d0d1a, #111127)', border: '1px solid rgba(0,102,255,0.2)' }}>
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
              <motion.div whileHover={{ scale: 1.1 }} className="w-20 h-20 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #0066ff, #7c3aed)', boxShadow: '0 0 40px rgba(0,102,255,0.5)' }}>
                <Play size={32} className="text-white ml-1" />
              </motion.div>
              <p className="text-white font-bold text-lg">Assista ao vídeo de apresentação</p>
              <p className="text-wl-gray text-sm">Entenda por que o MÉTODO WL é diferente de tudo que você já viu</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Price Section */}
      <section className="py-20 px-6">
        <div className="max-w-2xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="card-premium p-10 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1" style={{ background: 'linear-gradient(90deg, #0066ff, #7c3aed, #00d4ff)' }} />

            <p className="text-wl-gray text-sm uppercase tracking-widest mb-2">Investimento hoje</p>
            <div className="flex items-center justify-center gap-4 mb-2">
              <span className="text-wl-gray line-through text-2xl">R$ 997</span>
              <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">-50%</span>
            </div>
            <div className="text-6xl font-black gradient-text mb-2">R$ 497</div>
            <p className="text-wl-gray text-sm mb-2">ou 12x de R$ 49,90</p>
            <p className="text-wl-blue text-sm font-medium mb-8">🔥 Pix à vista com desconto adicional</p>

            <button onClick={() => navigate('/checkout')} className="btn-gold text-xl w-full py-5 mb-6 flex items-center justify-center gap-3">
              <Zap size={22} />
              GARANTIR MINHA VAGA AGORA
              <ArrowRight size={22} />
            </button>

            <div className="flex items-center justify-center gap-6 text-sm text-wl-gray">
              <span className="flex items-center gap-1.5"><Shield size={14} className="text-green-400" /> Garantia 7 dias</span>
              <span className="flex items-center gap-1.5"><Lock size={14} className="text-wl-blue" /> Pagamento seguro</span>
              <span className="flex items-center gap-1.5"><CheckCircle size={14} className="text-wl-purple" /> Acesso imediato</span>
            </div>

            <p className="text-wl-gray/50 text-xs mt-6">Parcelamento disponível em todos os cartões de crédito.</p>
          </motion.div>

          {/* Countdown */}
          <div className="mt-10 text-center">
            <p className="text-wl-gray mb-4 text-sm">⏰ Essa oferta expira em:</p>
            <CountdownTimer />
          </div>
        </div>
      </section>

      {/* What you get */}
      <section className="py-20 px-6 bg-wl-dark/50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-5xl font-black text-white mb-4">Tudo que você recebe <span className="gradient-text">hoje</span></h2>
          </div>
          <div className="grid md:grid-cols-2 gap-4 mb-10">
            {[
              { icon: '🎓', title: '12 Módulos Completos', desc: 'Mais de 100 aulas práticas com método comprovado', value: 'R$ 997' },
              { icon: '🤖', title: 'IA Assistente WL', desc: 'Chatbot especializado em marketing e criação de conteúdo', value: 'R$ 297' },
              { icon: '🎬', title: 'Gerador de Reels Virais', desc: 'Roteiros, hooks e legendas criados em segundos pela IA', value: 'R$ 297' },
              { icon: '📱', title: 'Analisador de Instagram', desc: 'Diagnóstico completo do seu perfil com plano de ação', value: 'R$ 197' },
              { icon: '👥', title: 'Comunidade VIP', desc: 'Rede exclusiva com suporte da equipe WL', value: 'R$ 397' },
              { icon: '📋', title: 'Biblioteca Copy & Prompts', desc: '500+ prompts e conteúdos prontos para usar', value: 'R$ 297' },
            ].map((item) => (
              <div key={item.title} className="card-wl p-5 flex items-center gap-4">
                <span className="text-3xl shrink-0">{item.icon}</span>
                <div className="flex-1">
                  <div className="font-bold text-white">{item.title}</div>
                  <div className="text-sm text-wl-gray">{item.desc}</div>
                </div>
                <div className="text-wl-gold text-sm font-bold shrink-0">{item.value}</div>
              </div>
            ))}
          </div>

          {/* Bonuses */}
          <h3 className="text-2xl font-black text-white mb-6 text-center">Bônus exclusivos incluídos <span className="gradient-text-gold">grátis</span></h3>
          <div className="grid md:grid-cols-3 gap-4">
            {BONUSES.map((b) => (
              <motion.div key={b.id} whileHover={{ y: -4 }} className="card-premium p-5">
                <span className="text-3xl block mb-3">{b.icon}</span>
                <div className="font-bold text-white text-sm mb-1">{b.title}</div>
                <div className="text-wl-gray text-xs mb-3">{b.subtitle}</div>
                <div className="text-wl-gold text-sm font-bold">Valor: {b.value}</div>
              </motion.div>
            ))}
          </div>

          <div className="glass mt-8 p-6 rounded-2xl text-center">
            <p className="text-wl-gray text-sm mb-2">Valor total de tudo que você recebe:</p>
            <p className="text-wl-gray line-through text-xl">R$ {(997 + totalBonusValue).toLocaleString('pt-BR')}</p>
            <p className="text-4xl font-black gradient-text-gold">Por apenas R$ 497</p>
          </div>
        </div>
      </section>

      {/* Guarantee */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto">
          <motion.div whileInView={{ opacity: 1, scale: 1 }} initial={{ opacity: 0, scale: 0.95 }} viewport={{ once: true }}
            className="card-wl p-10 text-center" style={{ borderColor: 'rgba(0,255,136,0.3)' }}>
            <div className="w-20 h-20 rounded-full bg-green-500/10 border-2 border-green-400/30 flex items-center justify-center mx-auto mb-6">
              <Shield size={36} className="text-green-400" />
            </div>
            <h2 className="text-3xl font-black text-white mb-4">Garantia incondicional de 7 dias</h2>
            <p className="text-wl-gray leading-relaxed">
              Se por qualquer motivo você não ficar 100% satisfeito nos primeiros 7 dias, basta nos enviar um e-mail e devolvemos <strong className="text-white">100% do seu dinheiro</strong>. Sem perguntas, sem burocracia, sem enrolação.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-6 bg-wl-dark/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-5xl font-black text-white mb-4">O que nossos alunos <span className="gradient-text-gold">falam</span></h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.slice(0, 3).map((t, i) => (
              <motion.div key={t.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="card-wl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <img src={t.avatar} alt={t.name} className="w-12 h-12 rounded-full" />
                  <div>
                    <div className="font-bold text-white text-sm">{t.name}</div>
                    <div className="text-xs text-wl-gray">{t.role}</div>
                  </div>
                </div>
                <div className="flex mb-3">{[...Array(5)].map((_, j) => <Star key={j} size={14} className="text-wl-gold fill-wl-gold" />)}</div>
                <p className="text-wl-gray text-sm leading-relaxed mb-4">"{t.text}"</p>
                <div className="bg-wl-gold/10 border border-wl-gold/20 rounded-xl p-3">
                  <p className="text-wl-gold font-bold text-sm">{t.result}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-5xl font-black text-white mb-4">Dúvidas <span className="gradient-text">frequentes</span></h2>
          </div>
          <div className="space-y-3">
            {FAQS.map((f, i) => (
              <div key={i} className="card-wl overflow-hidden">
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
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 px-6 hero-gradient">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}>
            <h2 className="text-4xl md:text-6xl font-black text-white mb-4">
              Não deixe para <span className="gradient-text-gold">amanhã</span>
            </h2>
            <p className="text-wl-gray text-lg mb-10">O preço sobe quando o timer zerar. Garanta agora.</p>
            <div className="mb-8"><CountdownTimer /></div>
            <button onClick={() => navigate('/checkout')} className="btn-gold text-xl px-12 py-6 flex items-center gap-3 mx-auto">
              <Zap size={24} />
              QUERO MEU ACESSO AGORA — R$ 497
            </button>
            <div className="flex items-center justify-center gap-6 text-sm text-wl-gray mt-6">
              <span className="flex items-center gap-2"><Shield size={14} className="text-green-400" /> 7 dias de garantia</span>
              <span className="flex items-center gap-2"><CheckCircle size={14} className="text-wl-blue" /> Acesso imediato</span>
              <span className="flex items-center gap-2"><Clock size={14} className="text-wl-gold" /> Vitalício</span>
            </div>
          </motion.div>
        </div>
      </section>

      <footer className="bg-wl-dark border-t border-wl-border py-10 text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#0066ff,#7c3aed)' }}>
            <Zap size={12} className="text-white" />
          </div>
          <span className="font-black text-white">MÉTODO WL</span>
        </div>
        <p className="text-wl-gray text-sm">© 2026 MÉTODO WL. Todos os direitos reservados.</p>
        <p className="text-wl-gray/50 text-xs mt-2">Os resultados apresentados não são garantia de resultado individual.</p>
      </footer>
    </div>
  )
}
