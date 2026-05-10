
import AppLayout from "../components/AppLayout"
import { useAuth } from "../context/AuthContext"
import { Crown, Star, Zap, Lock, CheckCircle } from "lucide-react"

const LEVELS = [
  { name:"Bronze WL", min:0, max:1999, color:"#cd7f32", gradient:"linear-gradient(135deg,#cd7f32,#a0522d)", benefits:["Acesso aos primeiros 4 módulos","Biblioteca básica de prompts","Comunidade geral","Ferramentas de IA básicas"] },
  { name:"Silver WL", min:2000, max:4999, color:"#c0c0c0", gradient:"linear-gradient(135deg,#c0c0c0,#a0a0a0)", benefits:["Acesso a 8 módulos","Biblioteca completa de prompts","Comunidade + ranking","Gerador de Reels Virais","Copiar e Postar completo"] },
  { name:"Gold WL", min:5000, max:9999, color:"#f59e0b", gradient:"linear-gradient(135deg,#ffd700,#f59e0b)", benefits:["Acesso a todos os 12 módulos","Prompts WL Premium","Segredos WL desbloqueados","Analisador de Instagram","Modo Oferta Milionária","Certificado premium"] },
  { name:"Black WL", min:10000, max:Infinity, color:"#7c3aed", gradient:"linear-gradient(135deg,#1a1a2e,#7c3aed)", benefits:["Acesso VIP total ilimitado","Todas as ferramentas de IA","Grupo VIP exclusivo","Mentorias em grupo mensais","Conteúdo antecipado","Badge exclusivo Black WL"] },
]

export default function VIPSystem() {
  const { user } = useAuth()
  const xp = user?.xp || 0
  const currentLevel = LEVELS.findIndex(l => xp >= l.min && xp <= l.max)

  return (
    <AppLayout title="Sistema VIP WL" subtitle="Quanto mais você usa, mais você desbloqueia">
      <div className="max-w-4xl mx-auto">
        {/* Current status */}
        <div className="card-premium p-8 mb-8 text-center">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold mb-4"
            style={{ background: LEVELS[Math.max(0,currentLevel)].gradient, color: currentLevel >= 2 ? "#000" : "#fff" }}>
            <Crown size={16} /> {user?.vipLevel || "Bronze WL"}
          </div>
          <h2 className="text-2xl font-black text-white mb-2">Nível atual: {user?.vipLevel}</h2>
          <p className="text-wl-gray mb-4">{xp.toLocaleString()} XP acumulados</p>
          {currentLevel < LEVELS.length - 1 && (
            <div className="max-w-xs mx-auto">
              <div className="flex justify-between text-xs text-wl-gray mb-2">
                <span>Atual</span>
                <span>{(LEVELS[currentLevel+1]?.min - xp).toLocaleString()} XP para {LEVELS[currentLevel+1]?.name}</span>
              </div>
              <div className="h-2 rounded-full bg-wl-border overflow-hidden">
                <div className="h-full rounded-full" style={{ width:`${((xp - LEVELS[Math.max(0,currentLevel)].min)/(LEVELS[currentLevel+1]?.min - LEVELS[Math.max(0,currentLevel)].min))*100}%`, background: LEVELS[Math.max(0,currentLevel)].gradient }} />
              </div>
            </div>
          )}
        </div>

        {/* Level cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {LEVELS.map((level, i) => {
            const isCurrentLevel = i === currentLevel
            const isUnlocked = xp >= level.min
            return (
              <div key={i} className="rounded-2xl p-6 transition-all"
                style={{ background: isCurrentLevel ? level.gradient.replace("linear-gradient(135deg,","rgba(").replace(",",",.1)").replace(")","") || "rgba(17,17,39,0.8)" : "rgba(17,17,39,0.8)", border:`2px solid ${isCurrentLevel ? level.color : isUnlocked ? level.color+"40" : "rgba(30,30,58,0.8)"}` }}>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ background: level.gradient }}>
                  <Crown size={22} className={i >= 2 ? "text-black" : "text-white"} />
                </div>
                <h3 className="text-white font-black text-lg mb-1">{level.name}</h3>
                <p className="text-wl-gray text-xs mb-4">{level.min.toLocaleString()} XP{level.max < Infinity ? ` — ${level.max.toLocaleString()} XP` : "+"}</p>
                <ul className="space-y-2">
                  {level.benefits.map((b,j) => (
                    <li key={j} className="flex items-start gap-2 text-xs">
                      {isUnlocked ? <CheckCircle size={12} className="text-green-400 shrink-0 mt-0.5" /> : <Lock size={12} className="text-wl-gray shrink-0 mt-0.5" />}
                      <span className={isUnlocked ? "text-wl-white" : "text-wl-gray"}>{b}</span>
                    </li>
                  ))}
                </ul>
                {isCurrentLevel && <div className="mt-4 px-3 py-1.5 rounded-lg text-center text-xs font-bold text-white" style={{ background:"rgba(255,255,255,0.15)" }}>✨ Nível Atual</div>}
              </div>
            )
          })}
        </div>

        {/* How to earn XP */}
        <div className="card-wl p-6 mt-6">
          <h3 className="text-white font-bold mb-4 flex items-center gap-2"><Zap size={16} className="text-wl-gold"/>Como ganhar XP</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[{ action:"Assistir aula", xp:50 },{ action:"Completar módulo", xp:250 },{ action:"Usar ferramenta IA", xp:100 },{ action:"Postar na comunidade", xp:50 },{ action:"Streak diário", xp:25 },{ action:"Completar desafio", xp:150 },{ action:"Criar oferta", xp:200 },{ action:"Gerar reel", xp:100 }].map((item,i) => (
              <div key={i} className="p-3 rounded-xl text-center" style={{ background:"rgba(245,158,11,0.05)", border:"1px solid rgba(245,158,11,0.1)" }}>
                <p className="text-wl-gold font-black">+{item.xp} XP</p>
                <p className="text-wl-gray text-xs mt-1">{item.action}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
