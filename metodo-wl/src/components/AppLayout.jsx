import { useApp } from '../context/AppContext'
import { useAuth } from '../context/AuthContext'
import Sidebar from './Sidebar'
import { Bell, Search, Menu, Sparkles } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import clsx from 'clsx'

export default function AppLayout({ children, title, subtitle }) {
  const { sidebarOpen, setSidebarOpen, unreadCount, searchQuery, setSearchQuery } = useApp()
  const { user } = useAuth()
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-wl-black flex">
      <Sidebar />

      <main className={clsx(
        'flex-1 min-h-screen transition-all duration-300',
        sidebarOpen ? 'md:ml-64' : 'md:ml-16',
      )}>
        {/* Top bar */}
        <header className="sticky top-0 z-20 h-16 flex items-center justify-between px-4 md:px-6 border-b border-wl-border"
          style={{ background: 'rgba(8,8,16,0.8)', backdropFilter: 'blur(20px)' }}>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-white/5 text-wl-gray"
            >
              <Menu size={20} />
            </button>
            {title && (
              <div>
                <h1 className="text-white font-bold text-base leading-none">{title}</h1>
                {subtitle && <p className="text-wl-gray text-xs mt-0.5">{subtitle}</p>}
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 px-3 py-2 rounded-xl input-wl w-56">
              <Search size={14} className="text-wl-gray shrink-0" />
              <input
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Buscar..."
                className="bg-transparent outline-none text-sm text-white placeholder-wl-gray w-full"
              />
            </div>

            <button
              onClick={() => navigate('/ia')}
              className="hidden md:flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all"
              style={{ background: 'rgba(0,102,255,0.1)', border: '1px solid rgba(0,102,255,0.2)', color: '#3385ff' }}
            >
              <Sparkles size={14} />
              IA WL
            </button>

            <button
              onClick={() => navigate('/notificacoes')}
              className="relative p-2 rounded-xl hover:bg-white/5 text-wl-gray hover:text-white transition-colors"
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 flex items-center justify-center text-xs font-bold text-white">
                  {unreadCount}
                </span>
              )}
            </button>

            <button onClick={() => navigate('/perfil')}>
              <img
                src={user?.avatar}
                alt=""
                className="w-8 h-8 rounded-full ring-2 ring-wl-blue/30 hover:ring-wl-blue/60 transition-all"
              />
            </button>
          </div>
        </header>

        {/* Content */}
        <div className="p-4 md:p-6">
          {children}
        </div>
      </main>
    </div>
  )
}
