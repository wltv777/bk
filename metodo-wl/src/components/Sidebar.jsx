import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useApp } from '../context/AppContext'
import {
  LayoutDashboard, BookOpen, Users, Sparkles, Copy, Zap, Lock,
  Play, Brain, BarChart3, Award, Bell, User, LogOut, Crown,
  Rocket, Eye, Star, ChevronLeft, ChevronRight, Bot, Layers,
  TrendingUp, Target, Shield, Wand2
} from 'lucide-react'
import clsx from 'clsx'

const NAV_ITEMS = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard', group: 'principal' },
  { label: 'Curso Completo', icon: BookOpen, path: '/curso', group: 'principal' },
  { label: 'Comunidade', icon: Users, path: '/comunidade', group: 'principal' },
  { label: 'Bônus Exclusivos', icon: Award, path: '/bonus', group: 'principal' },

  { label: 'IA do MÉTODO WL', icon: Brain, path: '/ia', group: 'ia', highlight: true },
  { label: 'Gerador de Reels', icon: Play, path: '/gerador-de-reels', group: 'ia' },
  { label: 'Analisador Instagram', icon: BarChart3, path: '/analisador-instagram', group: 'ia' },
  { label: 'Oferta Milionária', icon: Zap, path: '/oferta-milionaria', group: 'ia' },
  { label: 'Lançamento Auto', icon: Rocket, path: '/lancamento-automatico', group: 'ia' },
  { label: 'Avatar IA', icon: Bot, path: '/avatar-ia', group: 'ia' },

  { label: 'Copiar e Postar', icon: Copy, path: '/copiar-e-postar', group: 'biblioteca' },
  { label: 'Prompts WL', icon: Sparkles, path: '/prompts-wl', group: 'biblioteca' },
  { label: 'Segredos WL', icon: Lock, path: '/segredos-wl', group: 'biblioteca', vip: true },
  { label: 'Antes e Depois', icon: Eye, path: '/antes-e-depois', group: 'biblioteca' },
  { label: 'Primeiros 24h', icon: Target, path: '/primeiros-resultados', group: 'biblioteca' },

  { label: 'Conquistas', icon: Star, path: '/conquistas', group: 'perfil' },
  { label: 'Sistema VIP', icon: Crown, path: '/vip', group: 'perfil' },
  { label: 'Notificações', icon: Bell, path: '/notificacoes', group: 'perfil' },
  { label: 'Meu Perfil', icon: User, path: '/perfil', group: 'perfil' },
  { label: 'Certificado', icon: Shield, path: '/certificado', group: 'perfil' },
]

const GROUP_LABELS = {
  principal: 'Principal',
  ia: '✨ Ferramentas IA',
  biblioteca: '📚 Biblioteca',
  perfil: 'Minha Conta',
}

export default function Sidebar() {
  const { user, logout } = useAuth()
  const { sidebarOpen, setSidebarOpen, unreadCount } = useApp()
  const navigate = useNavigate()
  const location = useLocation()

  const groups = ['principal', 'ia', 'biblioteca', 'perfil']

  const xpToNext = 1000 - ((user?.xp || 0) % 1000)
  const xpProgress = (((user?.xp || 0) % 1000) / 1000) * 100

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside className={clsx(
        'fixed left-0 top-0 h-screen z-40 flex flex-col transition-all duration-300',
        'border-r border-wl-border',
        sidebarOpen ? 'w-64' : 'w-16',
        'bg-wl-dark/95 backdrop-blur-xl',
      )}>
        {/* Logo */}
        <div className="flex items-center justify-between px-4 py-5 border-b border-wl-border">
          {sidebarOpen ? (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-black"
                style={{ background: 'linear-gradient(135deg, #0066ff, #7c3aed)' }}>
                W
              </div>
              <span className="font-display font-bold text-white text-sm tracking-wide">MÉTODO WL</span>
            </div>
          ) : (
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-black mx-auto"
              style={{ background: 'linear-gradient(135deg, #0066ff, #7c3aed)' }}>
              W
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-6 h-6 rounded-full flex items-center justify-center text-wl-gray hover:text-white transition-colors"
          >
            {sidebarOpen ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
          </button>
        </div>

        {/* User card */}
        {sidebarOpen && (
          <div className="mx-3 mt-3 p-3 rounded-xl glass-blue">
            <div className="flex items-center gap-3">
              <img src={user?.avatar} alt="" className="w-9 h-9 rounded-full ring-2 ring-wl-blue/30" />
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-semibold truncate">{user?.name}</p>
                <p className="text-xs" style={{ color: '#fbbf24' }}>{user?.vipLevel}</p>
              </div>
              <div className="text-right">
                <p className="text-white text-xs font-bold">Lv.{user?.level}</p>
                <p className="text-wl-gray text-xs">{user?.xp} XP</p>
              </div>
            </div>
            <div className="mt-2">
              <div className="h-1.5 rounded-full bg-wl-border overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${xpProgress}%`, background: 'linear-gradient(90deg, #0066ff, #7c3aed)' }}
                />
              </div>
              <p className="text-wl-gray text-xs mt-1">{xpToNext} XP para Lv.{(user?.level || 0) + 1}</p>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-1">
          {groups.map(group => {
            const items = NAV_ITEMS.filter(i => i.group === group)
            return (
              <div key={group}>
                {sidebarOpen && (
                  <p className="px-3 py-1 text-xs font-semibold text-wl-gray uppercase tracking-wider mt-3 mb-1">
                    {GROUP_LABELS[group]}
                  </p>
                )}
                {items.map(item => {
                  const isActive = location.pathname === item.path
                  const Icon = item.icon
                  return (
                    <button
                      key={item.path}
                      onClick={() => navigate(item.path)}
                      title={!sidebarOpen ? item.label : undefined}
                      className={clsx(
                        'nav-item w-full text-left relative',
                        isActive && 'active',
                        !sidebarOpen && 'justify-center px-0',
                        item.highlight && !isActive && 'text-wl-blue-light',
                      )}
                    >
                      <Icon size={18} className={clsx(item.highlight && !isActive && 'text-wl-blue')} />
                      {sidebarOpen && (
                        <>
                          <span className="text-sm">{item.label}</span>
                          {item.vip && (
                            <span className="ml-auto px-1.5 py-0.5 rounded text-xs font-bold badge-gold text-black">VIP</span>
                          )}
                          {item.path === '/notificacoes' && unreadCount > 0 && (
                            <span className="ml-auto w-5 h-5 rounded-full bg-red-500 flex items-center justify-center text-xs font-bold text-white">
                              {unreadCount}
                            </span>
                          )}
                        </>
                      )}
                      {!sidebarOpen && item.path === '/notificacoes' && unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-red-500" />
                      )}
                    </button>
                  )
                })}
              </div>
            )
          })}
        </nav>

        {/* Streak */}
        {sidebarOpen && (
          <div className="mx-3 mb-2 p-3 rounded-xl" style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)' }}>
            <div className="flex items-center gap-2">
              <span className="text-lg">🔥</span>
              <div>
                <p className="text-white text-xs font-bold">{user?.streak} dias seguidos</p>
                <p className="text-wl-gray text-xs">Continue sua sequência!</p>
              </div>
            </div>
          </div>
        )}

        {/* Logout */}
        <div className="p-2 border-t border-wl-border">
          <button
            onClick={logout}
            className={clsx(
              'nav-item w-full text-left hover:text-red-400',
              !sidebarOpen && 'justify-center px-0',
            )}
          >
            <LogOut size={18} />
            {sidebarOpen && <span className="text-sm">Sair</span>}
          </button>
        </div>
      </aside>
    </>
  )
}
