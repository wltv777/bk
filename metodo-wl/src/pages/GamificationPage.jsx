
import AppLayout from "../components/AppLayout"
import { useAuth } from "../context/AuthContext"
import { ACHIEVEMENTS } from "../utils/helpers"
import { Star, Flame, Trophy, TrendingUp } from "lucide-react"

const MOCK_RANKING = [
  { pos:1, name:"Rafael M.", xp:47200, avatar:"https://randomuser.me/api/portraits/men/45.jpg" },
  { pos:2, name:"Mariana C.", xp:38900, avatar:"https://randomuser.me/api/portraits/women/32.jpg" },
  { pos:3, name:"Carlos A.", xp:29100, avatar:"https://randomuser.me/api/portraits/men/28.jpg" },
  { pos:4, name:"Letícia F.", xp:21500, avatar:"https://randomuser.me/api/portraits/women/67.jpg" },
  { pos:5, name:"Amanda S.", xp:18200, avatar:"https://randomuser.me/api/portraits/women/15.jpg" },
]

export default function GamificationPage() {
  const { user } = useAuth()
  const xp = user?.xp || 0
  const level = user?.level || 1
  const xpProgress = (xp % 1000) / 10
  const streak = user?.streak || 0

  return (
    <AppLayout title="Conquistas & XP" subtitle="Sua jornada gamificada no MÉTODO WL">
      <div className="max-w-5xl mx-auto grid lg:grid-cols-3 gap-6">
        {/* Main stats */}
        <div className="lg:col-span-2 space-y-6">
          {/* Level card */}
          <div className="card-premium p-8">
            <div className="flex items-center gap-6">
              <div className="relative w-32 h-32 shrink-0">
                <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                  <circle cx="18" cy="18" r="15.9" fill="none" stroke="rgba(30,30,58,0.8)" strokeWidth="2.5"/>
                  <circle cx="18" cy="18" r="15.9" fill="none" stroke="url(#xpg)" strokeWidth="2.5" strokeDasharray={`${xpProgress} 100`} strokeLinecap="round"/>
                  <defs><linearGradient id="xpg" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#0066ff"/><stop offset="100%" stopColor="#7c3aed"/></linearGradient></defs>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-black text-white">{level}</span>
                  <span className="text-wl-gray text-xs">Nível</span>
                </div>
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-black text-white mb-1">{user?.vipLevel}</h2>
                <p className="text-wl-gray text-sm mb-3">{xp.toLocaleString()} XP total · {(1000 - xp%1000)} XP para Lv.{level+1}</p>
                <div className="h-2 rounded-full bg-wl-border overflow-hidden">
                  <div className="h-full rounded-full" style={{ width:`${xpProgress}%`, background:"linear-gradient(90deg,#0066ff,#7c3aed)" }}/>
                </div>
              </div>
            </div>
          </div>

          {/* Streak */}
          <div className="card-wl p-6">
            <h3 className="text-white font-bold mb-4 flex items-center gap-2"><Flame size={16} className="text-red-400"/>Sequência de dias</h3>
            <div className="flex items-center gap-6">
              <div className="text-center">
                <p className="text-5xl font-black text-red-400">🔥{streak}</p>
                <p className="text-wl-gray text-sm">dias seguidos</p>
              </div>
              <div className="flex-1">
                <div className="flex gap-2 flex-wrap">
                  {[...Array(7)].map((_,i) => (
                    <div key={i} className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold"
                      style={{ background: i < streak ? "rgba(239,68,68,0.2)" : "rgba(30,30,58,0.8)", border:`1px solid ${i < streak ? "rgba(239,68,68,0.4)" : "rgba(30,30,58,0.8)"}` }}>
                      {i < streak ? "🔥" : "⬜"}
                    </div>
                  ))}
                </div>
                <p className="text-wl-gray text-xs mt-2">Acesse diariamente para manter sua sequência e ganhar bônus de XP!</p>
              </div>
            </div>
          </div>

          {/* Achievements */}
          <div className="card-wl p-6">
            <h3 className="text-white font-bold mb-5 flex items-center gap-2"><Trophy size={16} className="text-wl-gold"/>Conquistas ({(user?.badges||[]).length}/{ACHIEVEMENTS.length})</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {ACHIEVEMENTS.map(ach => {
                const earned = user?.badges?.includes(ach.id)
                return (
                  <div key={ach.id} className="p-4 rounded-xl transition-all"
                    style={{ background: earned ? "rgba(0,102,255,0.08)" : "rgba(17,17,39,0.4)", border:`1px solid ${earned ? "rgba(0,102,255,0.2)" : "rgba(30,30,58,0.4)"}`, opacity: earned ? 1 : 0.45 }}>
                    <div className="text-2xl mb-2">{ach.icon}</div>
                    <p className="text-white text-xs font-bold mb-1">{ach.title}</p>
                    <p className="text-wl-gray text-xs mb-2">{ach.desc}</p>
                    <p className="text-wl-gold text-xs font-bold">+{ach.xp} XP {earned ? "✓" : "🔒"}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Ranking */}
        <div className="space-y-4">
          <div className="card-wl p-5">
            <h3 className="text-white font-bold mb-4 flex items-center gap-2"><TrendingUp size={16} className="text-wl-blue"/>Ranking Global</h3>
            <div className="space-y-3">
              {MOCK_RANKING.map(m => (
                <div key={m.pos} className="flex items-center gap-3 p-2 rounded-xl" style={{ background:"rgba(17,17,39,0.4)" }}>
                  <span className="w-7 text-center font-black text-sm" style={{ color: m.pos===1?"#ffd700":m.pos===2?"#c0c0c0":m.pos===3?"#cd7f32":"#8892a4" }}>#{m.pos}</span>
                  <img src={m.avatar} alt="" className="w-8 h-8 rounded-full"/>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-semibold truncate">{m.name}</p>
                    <p className="text-wl-gray text-xs">{m.xp.toLocaleString()} XP</p>
                  </div>
                </div>
              ))}
              <div className="flex items-center gap-3 p-2 rounded-xl" style={{ background:"rgba(0,102,255,0.08)", border:"1px solid rgba(0,102,255,0.2)" }}>
                <span className="w-7 text-center font-black text-sm text-wl-blue">#42</span>
                <img src={user?.avatar} alt="" className="w-8 h-8 rounded-full ring-2 ring-wl-blue/30"/>
                <div className="flex-1">
                  <p className="text-white text-sm font-semibold">Você</p>
                  <p className="text-wl-gray text-xs">{xp.toLocaleString()} XP</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
