
import AppLayout from "../components/AppLayout"
import { useApp } from "../context/AppContext"
import { Bell, Trophy, BookOpen, Users, Zap, CheckCheck } from "lucide-react"

const ICONS = { achievement:<Trophy size={18} className="text-wl-gold"/>, module:<BookOpen size={18} className="text-wl-blue"/>, community:<Users size={18} className="text-purple-400"/>, xp:<Zap size={18} className="text-green-400"/> }

export default function NotificationsPage() {
  const { notifications, markNotificationRead, markAllRead } = useApp()
  const unread = notifications.filter(n => !n.read).length

  return (
    <AppLayout title="Notificações" subtitle="Suas atualizações e conquistas">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <p className="text-wl-gray text-sm">{unread > 0 ? `${unread} não lidas` : "Tudo lido ✓"}</p>
          {unread > 0 && <button onClick={markAllRead} className="flex items-center gap-1.5 text-wl-blue text-sm hover:underline"><CheckCheck size={14}/>Marcar todas como lidas</button>}
        </div>
        <div className="space-y-3">
          {notifications.map(notif => (
            <div key={notif.id} onClick={() => markNotificationRead(notif.id)}
              className="card-wl p-5 flex items-start gap-4 cursor-pointer transition-all hover:border-wl-blue/30"
              style={{ borderColor: !notif.read ? "rgba(0,102,255,0.2)" : undefined, background: !notif.read ? "rgba(0,102,255,0.03)" : undefined }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background:"rgba(17,17,39,0.8)", border:"1px solid rgba(30,30,58,0.8)" }}>
                {ICONS[notif.type] || <Bell size={18} className="text-wl-gray"/>}
              </div>
              <div className="flex-1">
                <p className="text-wl-white text-sm">{notif.message}</p>
                <p className="text-wl-gray text-xs mt-1">{notif.time} atrás</p>
              </div>
              {!notif.read && <div className="w-2 h-2 rounded-full bg-wl-blue shrink-0 mt-2" />}
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  )
}
