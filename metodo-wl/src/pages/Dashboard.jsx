import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Flame, Zap, Trophy, BookOpen, TrendingUp, Play, ArrowRight, Star, Users, MessageSquare, Lock } from 'lucide-react'
import AppLayout from '../components/AppLayout'
import { useAuth } from '../context/AuthContext'
import { MODULES } from '../data/courseData'

const BADGES = [
  { id: 'first_login', icon: '🚀', label: 'Primeiro acesso', earned: true },
  { id: 'first_lesson', icon: '📚', label: 'Primeira aula', earned: true },
  { id: 'module_1_complete', icon: '🎯', label: 'Módulo 1 completo', earned: true },
  { id: 'streak_7', icon: '🔥', label: '7 dias seguidos', earned: true },
  { id: 'module_2_complete', icon: '💎', label: 'Módulo 2 completo', earned: false },
  { id: 'viral_reel', icon: '🎬', label: 'Primeiro Reel viral', earned: false },
]

const FEED_POSTS = [
  { id: 1, user: 'Mariana Costa', badge: 'Gold WL', avatar: 'https://randomuser.me/api/portraits/women/32.jpg', content: 'Acabei de terminar o Módulo 3 e já criei meu primeiro Reel com a fórmula WL! 🔥 Já tem 500 views em menos de 2h!', likes: 48, time: '2min atrás' },
  { id: 2, user: 'Rafael Mendonça', badge: 'Black WL', avatar: 'https://randomuser.me/api/portraits/men/45.jpg', content: 'Script de WhatsApp do módulo 8 funcionou demais! Fechei 3 clientes em um dia 💰', likes: 92, time: '45min atrás' },
  { id: 3, user: 'Letícia Ferreira', badge: 'Silver WL', avatar: 'https://randomuser.me/api/portraits/women/67.jpg', content: 'Usando a IA do MÉTODO WL para criar meu calendário de conteúdo de 30 dias. Em menos de 10 minutos tá pronto! 🤖', likes: 67, time: '2h atrás' },
]

function CircularProgress({ value, color = '#0066ff', size = 64 }) {
  const r = (size - 8) / 2
  const circ = 2 * Math.PI * r
  const dash = (value / 100) * circ
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="rotate-[-90deg]">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(30,30,58,0.8)" strokeWidth="6" />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth="6"
        strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
        style={{ transition: 'stroke-dasharray 1s ease-out' }} />
    </svg>
  )
}

export default function Dashboard() {
  const navigate = useNavigate()
  const { user } = useAuth()

  const lastModule = MODULES.find(m => m.progress > 0 && m.progress < 100) || MODULES[0]
  const lastLesson = lastModule?.lessons_list?.find(l => !l.watched) || lastModule?.lessons_list?.[0]
  const completedCount = MODULES.filter(m => m.progress === 100).length
  const xpToNextLevel = 1000 - (user?.xp % 1000 || 0)

  return (
    <AppLayout title="Dashboard" subtitle={`Bem-vindo de volta, ${user?.name?.split(' ')[0] || 'aluno'}! 🚀`}>
      <div className="space-y-8 max-w-7xl mx-auto">

        {/* Quick stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: Zap, label: 'XP Total', value: (user?.xp || 0).toLocaleString('pt-BR'), color: '#f59e0b', sub: `Nível ${user?.level || 1}` },
            { icon: Flame, label: 'Streak', value: `${user?.streak || 0} dias`, color: '#ef4444', sub: 'consecutivos' },
            { icon: BookOpen, label: 'Módulos', value: `${completedCount}/12`, color: '#0066ff', sub: 'completados' },
            { icon: Trophy, label: 'Rank VIP', value: user?.vipLevel || 'Bronze WL', color: '#f59e0b', sub: 'nível atual' },
          ].map(({ icon: Icon, label, value, color, sub }) => (
            <motion.div key={label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card-wl p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-wl-gray">{label}</span>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${color}20` }}>
                  <Icon size={16} style={{ color }} />
                </div>
              </div>
              <div className="text-2xl font-black text-white">{value}</div>
              <div className="text-xs text-wl-gray mt-1">{sub}</div>
            </motion.div>
          ))}
        </div>

        {/* Continue watching + XP bar */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Continue watching */}
          <div className="lg:col-span-2">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card-premium p-6 h-full">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-bold text-white">Continuar assistindo</h2>
                <button onClick={() => navigate('/curso')} className="text-wl-blue text-sm hover:underline flex items-center gap-1">
                  Ver todos <ArrowRight size={14} />
                </button>
              </div>
              <div className="relative rounded-2xl overflow-hidden mb-5 cursor-pointer group"
                style={{ aspectRatio: '16/9', background: 'linear-gradient(135deg, #0d0d1a, #111127)' }}
                onClick={() => navigate(`/aula/${lastModule?.id}/1.1`)}>
                <img src={lastModule?.thumbnail} alt="" className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:opacity-50 transition-opacity" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.div whileHover={{ scale: 1.1 }} className="w-16 h-16 rounded-full flex items-center justify-center"
                    style={{ background: 'rgba(0,102,255,0.8)', backdropFilter: 'blur(8px)' }}>
                    <Play size={28} className="text-white ml-1" />
                  </motion.div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80">
                  <p className="text-white font-bold text-sm">{lastLesson?.title || 'Próxima aula'}</p>
                  <p className="text-wl-gray text-xs">Módulo {lastModule?.id}: {lastModule?.title}</p>
                </div>
              </div>
              <div className="progress-bar mb-2">
                <motion.div className="progress-fill" initial={{ width: 0 }} animate={{ width: `${lastModule?.progress || 0}%` }} transition={{ duration: 1, delay: 0.5 }} />
              </div>
              <div className="flex justify-between text-xs text-wl-gray">
                <span>{lastModule?.progress || 0}% concluído</span>
                <span>{lastModule?.lessons} aulas · {lastModule?.duration}</span>
              </div>
            </motion.div>
          </div>

          {/* Level progress + badges */}
          <div className="space-y-4">
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="card-wl p-5">
              <h3 className="font-bold text-white mb-4 text-sm">Progresso de nível</h3>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <CircularProgress value={(user?.xp % 1000) / 10} color="#f59e0b" size={72} />
                  <span className="absolute inset-0 flex items-center justify-center text-lg font-black text-white">{user?.level || 1}</span>
                </div>
                <div>
                  <p className="text-white font-bold">Nível {user?.level || 1}</p>
                  <p className="text-wl-gray text-xs">{xpToNextLevel} XP para próximo nível</p>
                  <div className="progress-bar mt-2 w-28">
                    <div className="progress-fill" style={{ width: `${(user?.xp % 1000) / 10}%`, background: 'linear-gradient(90deg, #f59e0b, #fbbf24)' }} />
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.25 }} className="card-wl p-5">
              <h3 className="font-bold text-white mb-4 text-sm">Conquistas</h3>
              <div className="grid grid-cols-3 gap-2">
                {BADGES.map(b => (
                  <div key={b.id} className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${b.earned ? 'opacity-100' : 'opacity-30 grayscale'}`}
                    title={b.label}>
                    <span className="text-2xl">{b.icon}</span>
                    <span className="text-xs text-wl-gray text-center leading-tight">{b.label}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>

        {/* Module grid */}
        <div>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-bold text-white">Todos os módulos</h2>
            <button onClick={() => navigate('/curso')} className="text-wl-blue text-sm hover:underline flex items-center gap-1">
              Ver detalhes <ArrowRight size={14} />
            </button>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {MODULES.map((m, i) => (
              <motion.div key={m.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                className={`module-card ${m.progress === 100 ? 'completed' : ''} ${m.locked ? 'locked' : ''}`}
                onClick={() => !m.locked && navigate(`/aula/${m.id}/1.1`)}>
                <div className="flex items-start justify-between mb-3">
                  <span className="text-3xl">{m.icon}</span>
                  {m.locked ? (
                    <span className="text-xs text-wl-gray flex items-center gap-1"><Lock size={12} /> Bloqueado</span>
                  ) : m.progress === 100 ? (
                    <span className="text-xs text-green-400 font-bold">✓ Completo</span>
                  ) : m.progress > 0 ? (
                    <span className="text-xs text-wl-blue font-medium">{m.progress}%</span>
                  ) : null}
                </div>
                <p className="text-xs text-wl-gray mb-1">Módulo {m.id}</p>
                <h3 className="font-bold text-white text-sm mb-1 leading-snug">{m.title}</h3>
                <p className="text-xs text-wl-gray mb-3">{m.lessons} aulas · {m.duration}</p>
                {!m.locked && (
                  <div className="progress-bar">
                    <motion.div className="progress-fill" initial={{ width: 0 }} animate={{ width: `${m.progress}%` }} transition={{ duration: 1, delay: 0.3 + i * 0.05 }}
                      style={{ background: m.progress === 100 ? 'linear-gradient(90deg, #00ff88, #22c55e)' : undefined }} />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Quick access + Community */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Quick access tools */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="card-wl p-6">
            <h2 className="font-bold text-white mb-5 flex items-center gap-2">
              <Zap size={18} className="text-wl-blue" />
              Ferramentas IA
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: '🤖', label: 'Assistente IA', path: '/ia', color: '#0066ff' },
                { icon: '🎬', label: 'Gerador de Reels', path: '/reels', color: '#ec4899' },
                { icon: '📱', label: 'Analisar Instagram', path: '/analisador', color: '#7c3aed' },
                { icon: '🚀', label: 'Auto Lançamento', path: '/lancamento', color: '#f59e0b' },
                { icon: '📋', label: 'Copy & Paste', path: '/copypaste', color: '#10b981' },
                { icon: '💡', title: 'WL Prompts', path: '/prompts', color: '#00d4ff' },
              ].map(t => (
                <button key={t.label || t.title} onClick={() => navigate(t.path)}
                  className="flex items-center gap-3 p-3 rounded-xl transition-all hover:scale-105 text-left"
                  style={{ background: `${t.color}10`, border: `1px solid ${t.color}25` }}>
                  <span className="text-xl">{t.icon}</span>
                  <span className="text-sm font-medium text-white">{t.label || t.title}</span>
                </button>
              ))}
            </div>
          </motion.div>

          {/* Community feed */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }} className="card-wl p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-white flex items-center gap-2">
                <Users size={18} className="text-wl-purple" />
                Comunidade VIP
              </h2>
              <button onClick={() => navigate('/comunidade')} className="text-wl-blue text-sm hover:underline flex items-center gap-1">
                Ver tudo <ArrowRight size={14} />
              </button>
            </div>
            <div className="space-y-4">
              {FEED_POSTS.map(post => (
                <div key={post.id} className="flex gap-3">
                  <img src={post.avatar} alt="" className="w-8 h-8 rounded-full shrink-0 ring-1 ring-wl-border" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-white font-medium text-xs">{post.user}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full badge-gold text-black">{post.badge}</span>
                    </div>
                    <p className="text-wl-gray text-xs leading-relaxed line-clamp-2">{post.content}</p>
                    <div className="flex items-center gap-3 mt-1.5 text-xs text-wl-gray">
                      <span>❤️ {post.likes}</span>
                      <span>💬 comentar</span>
                      <span className="ml-auto">{post.time}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </AppLayout>
  )
}
