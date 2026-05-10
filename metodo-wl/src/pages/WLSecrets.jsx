import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Lock, Unlock, Star, Zap, TrendingUp, Brain, Rocket, AlertTriangle, Eye, Shield } from 'lucide-react'
import AppLayout from '../components/AppLayout'
import toast from 'react-hot-toast'

const SECRETS = [
  {
    id: 1,
    icon: Rocket,
    category: 'Hacks de Crescimento',
    title: 'O hack dos 3 minutos que triplicou meu alcance',
    teaser: 'Existe uma ação de 3 minutos que você pode fazer logo após publicar qualquer conteúdo que multiplica o alcance em até 3x. Poucos criadores conhecem isso.',
    color: '#0066ff',
    xpRequired: 500,
    unlocked: true,
    content: 'Nos primeiros 3 minutos após publicar, responda todos os comentários existentes, dê like nos comentários, e compartilhe o post nos seus stories com enquete. Isso sinaliza alta atividade para o algoritmo e ele distribui mais.',
  },
  {
    id: 2,
    icon: Brain,
    category: 'Mentalidade',
    title: 'A mentalidade que separa quem ganha R$1K de quem ganha R$100K',
    teaser: 'Não é sobre técnica. É sobre uma mudança fundamental na forma como você pensa sobre valor, preço e posicionamento.',
    color: '#7c3aed',
    xpRequired: 800,
    unlocked: true,
    content: 'Quem ganha R$1K vende tempo. Quem ganha R$100K vende transformação. A virada é: pare de precificar por hora trabalhada e comece a precificar pelo resultado que você entrega. Um cliente que vai de 0 a R$20K/mês vale muito mais do que uma sessão de 1h.',
  },
  {
    id: 3,
    icon: TrendingUp,
    category: 'Estratégias Pessoais',
    title: 'Como usei um Reel "ruim" para ganhar 40k seguidores',
    teaser: 'O conteúdo que menos produzi foi o que mais cresceu. Descobri um padrão específico em Reels que o algoritmo adora — mesmo que a produção seja simples.',
    color: '#ec4899',
    xpRequired: 1200,
    unlocked: false,
    content: '',
  },
  {
    id: 4,
    icon: Zap,
    category: 'Atalhos',
    title: 'O atalho de 24h que acelera resultados em 30 dias',
    teaser: 'Uma estratégia específica de 24h que, se feita corretamente, comprime o trabalho de um mês em um dia. Usada por todos os top criadores.',
    color: '#f59e0b',
    xpRequired: 1500,
    unlocked: false,
    content: '',
  },
  {
    id: 5,
    icon: AlertTriangle,
    category: 'Erros Comuns',
    title: 'O erro que fez eu perder R$80K em um lançamento',
    teaser: 'Cometi um erro específico de copy que destruiu minha taxa de conversão. Depois de corrigir, o próximo lançamento foi 5x maior.',
    color: '#ef4444',
    xpRequired: 2000,
    unlocked: false,
    content: '',
  },
  {
    id: 6,
    icon: Eye,
    category: 'Técnicas Escondidas',
    title: 'A técnica de "perfil fantasma" para espionar concorrentes',
    teaser: 'Existe uma forma ética de monitorar o que os maiores criadores do seu nicho estão testando antes de publicar. Isso te dá uma vantagem enorme.',
    color: '#00d4ff',
    xpRequired: 2500,
    unlocked: false,
    content: '',
  },
  {
    id: 7,
    icon: Shield,
    category: 'Hacks de Crescimento',
    title: 'Como nunca mais depender de um algoritmo',
    teaser: 'A estratégia multi-plataforma que garante que uma mudança de algoritmo nunca mais afete seu negócio. Funciona em qualquer nicho.',
    color: '#10b981',
    xpRequired: 3000,
    unlocked: false,
    content: '',
  },
  {
    id: 8,
    icon: Star,
    category: 'Estratégias Pessoais',
    title: 'O método de precificação que ninguém te conta',
    teaser: 'Como descobri que meu produto deveria custar 10x mais — e por que aumentar o preço aumentou as vendas. A lógica contraintuitiva do mercado premium.',
    color: '#f59e0b',
    xpRequired: 3500,
    unlocked: false,
    content: '',
  },
]

const CATEGORIES = [...new Set(SECRETS.map(s => s.category))]

function SecretCard({ secret, index }) {
  const [expanded, setExpanded] = useState(false)

  const handleUnlock = () => {
    if (!secret.unlocked) {
      toast('Acumule mais XP para desbloquear este segredo! 🔒', { icon: '⚡' })
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07 }}
      className={`card-wl p-6 flex flex-col gap-4 transition-all ${secret.unlocked ? 'hover:border-wl-gold/30' : 'opacity-70'}`}
      style={secret.unlocked ? { borderColor: `${secret.color}30` } : {}}
    >
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: secret.unlocked ? `${secret.color}20` : 'rgba(30,30,58,0.8)', border: `1px solid ${secret.unlocked ? secret.color + '40' : 'rgba(30,30,58,0.6)'}` }}>
          {secret.unlocked
            ? <secret.icon size={22} style={{ color: secret.color }} />
            : <Lock size={22} className="text-wl-gray" />}
        </div>
        <div className="flex-1">
          <span className="text-xs font-bold px-2 py-0.5 rounded-full mb-2 inline-block"
            style={{ background: `${secret.color}15`, color: secret.color }}>
            {secret.category}
          </span>
          <h3 className={`font-bold leading-snug ${secret.unlocked ? 'text-white' : 'text-wl-gray'}`}>
            {secret.unlocked ? secret.title : '🔒 ' + secret.title}
          </h3>
        </div>
      </div>

      {/* Teaser */}
      <p className="text-wl-gray text-sm leading-relaxed">{secret.teaser}</p>

      {/* Content (if unlocked and expanded) */}
      <AnimatePresence>
        {secret.unlocked && expanded && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            className="p-4 rounded-xl text-sm text-white leading-relaxed"
            style={{ background: `${secret.color}10`, border: `1px solid ${secret.color}25` }}>
            {secret.content}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Action */}
      {secret.unlocked ? (
        <button onClick={() => setExpanded(!expanded)}
          className="w-full py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all"
          style={{ background: `${secret.color}15`, border: `1px solid ${secret.color}30`, color: secret.color }}>
          {expanded ? <><Eye size={15} /> Ocultar segredo</> : <><Unlock size={15} /> Revelar segredo</>}
        </button>
      ) : (
        <button onClick={handleUnlock}
          className="w-full py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all border border-wl-border text-wl-gray hover:border-wl-gold/30 hover:text-wl-gold">
          <Lock size={15} />
          Desbloquear com {secret.xpRequired.toLocaleString('pt-BR')} XP
        </button>
      )}
    </motion.div>
  )
}

export default function WLSecrets() {
  const [activeCategory, setActiveCategory] = useState('all')

  const filtered = activeCategory === 'all' ? SECRETS : SECRETS.filter(s => s.category === activeCategory)
  const unlockedCount = SECRETS.filter(s => s.unlocked).length

  return (
    <AppLayout title="WL Secrets" subtitle="Estratégias exclusivas e técnicas secretas do MÉTODO WL">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Hero banner */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="relative p-8 rounded-3xl overflow-hidden text-center"
          style={{ background: 'linear-gradient(135deg, rgba(245,158,11,0.1), rgba(124,58,237,0.1))', border: '1px solid rgba(245,158,11,0.2)' }}>
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(6)].map((_, i) => (
              <motion.div key={i} className="absolute rounded-full"
                style={{ width: 100 + i * 40, height: 100 + i * 40, left: `${10 + i * 15}%`, top: '-20%', background: `rgba(245,158,11,0.03)`, border: '1px solid rgba(245,158,11,0.05)' }}
                animate={{ rotate: 360 }} transition={{ duration: 20 + i * 5, repeat: Infinity, ease: 'linear' }} />
            ))}
          </div>
          <div className="relative">
            <Star size={40} className="text-wl-gold mx-auto mb-4 fill-wl-gold" />
            <h2 className="text-3xl font-black text-white mb-2">WL Secrets VIP</h2>
            <p className="text-wl-gray max-w-lg mx-auto">Estratégias, hacks e técnicas pessoais que não estão nos módulos. Acumulados ao longo de anos de experiência real.</p>
            <div className="flex items-center justify-center gap-8 mt-6 text-sm">
              <div className="text-center">
                <div className="text-2xl font-black gradient-text-gold">{unlockedCount}</div>
                <div className="text-wl-gray">Desbloqueados</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-black text-wl-gray">{SECRETS.length - unlockedCount}</div>
                <div className="text-wl-gray">Bloqueados</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-black gradient-text">{SECRETS.length}</div>
                <div className="text-wl-gray">Total de segredos</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Category filter */}
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => setActiveCategory('all')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${activeCategory === 'all' ? 'bg-wl-gold text-black' : 'text-wl-gray border border-wl-border hover:border-wl-gold/40 hover:text-wl-gold'}`}>
            Todos
          </button>
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${activeCategory === cat ? 'bg-wl-gold text-black' : 'text-wl-gray border border-wl-border hover:border-wl-gold/40 hover:text-wl-gold'}`}>
              {cat}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map((secret, i) => <SecretCard key={secret.id} secret={secret} index={i} />)}
        </div>
      </div>
    </AppLayout>
  )
}
