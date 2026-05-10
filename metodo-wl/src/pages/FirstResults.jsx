
import { useState } from "react"
import AppLayout from "../components/AppLayout"
import { useAuth } from "../context/AuthContext"
import { CheckCircle, Clock, Zap, Trophy } from "lucide-react"
import toast from "react-hot-toast"

const CHALLENGES = [
  { id:1, icon:"✍️", title:"Criar Minha Primeira Copy", desc:"Escreva uma copy de 5 linhas para um produto ou serviço seu usando a fórmula PAS do módulo 5.", xp:150, time:"30 min", path:"/ia", cta:"Criar com IA" },
  { id:2, icon:"📱", title:"Publicar Meu Primeiro Story", desc:"Crie e publique um story usando os templates prontos da biblioteca. Mostre seu resultado aqui!", xp:100, time:"15 min", path:"/copiar-e-postar", cta:"Ver templates" },
  { id:3, icon:"💰", title:"Criar Minha Primeira Oferta", desc:"Use o Gerador de Oferta Milionária para criar uma oferta irresistível para seu produto.", xp:200, time:"20 min", path:"/oferta-milionaria", cta:"Criar oferta" },
  { id:4, icon:"🎬", title:"Criar Meu Primeiro Roteiro de Reel", desc:"Use o Gerador de Reels Virais para criar um roteiro que pode viralizar no Instagram.", xp:150, time:"10 min", path:"/gerador-de-reels", cta:"Gerar roteiro" },
  { id:5, icon:"👤", title:"Otimizar Minha Bio", desc:"Analise seu Instagram e reescreva sua bio usando a IA do Método WL para ela converter mais.", xp:100, time:"15 min", path:"/analisador-instagram", cta:"Analisar Instagram" },
  { id:6, icon:"📅", title:"Criar Calendário de Conteúdo", desc:"Peça à IA do Método WL para criar um calendário de 30 dias personalizado para o seu nicho.", xp:200, time:"5 min", path:"/ia", cta:"Criar calendário" },
]

export default function FirstResults() {
  const { addXP } = useAuth()
  const [completed, setCompleted] = useState({})

  const completeChallenge = (challenge) => {
    if (completed[challenge.id]) return
    setCompleted(c => ({ ...c, [challenge.id]: true }))
    addXP(challenge.xp)
    toast.success(`🏆 Desafio concluído! +${challenge.xp} XP`)
  }

  const totalXP = CHALLENGES.reduce((s, c) => s + (completed[c.id] ? c.xp : 0), 0)
  const completedCount = Object.values(completed).filter(Boolean).length

  return (
    <AppLayout title="Primeiros Resultados em 24h" subtitle="Complete os desafios e conquiste seus primeiros resultados hoje">
      {/* Progress header */}
      <div className="card-premium p-6 mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-white font-bold text-lg">Desafio das 24h</h2>
          <p className="text-wl-gray text-sm">{completedCount}/{CHALLENGES.length} desafios concluídos</p>
        </div>
        <div className="text-right">
          <div className="text-3xl font-black gradient-text">+{totalXP} XP</div>
          <p className="text-wl-gray text-xs">ganhos hoje</p>
        </div>
        <div className="w-32 h-32 hidden md:flex items-center justify-center">
          <div className="relative w-24 h-24">
            <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
              <circle cx="18" cy="18" r="15.9" fill="none" stroke="rgba(30,30,58,0.8)" strokeWidth="3" />
              <circle cx="18" cy="18" r="15.9" fill="none" stroke="url(#pg)" strokeWidth="3"
                strokeDasharray={`${(completedCount/CHALLENGES.length)*100} 100`} strokeLinecap="round" />
              <defs><linearGradient id="pg"><stop offset="0%" stopColor="#0066ff"/><stop offset="100%" stopColor="#7c3aed"/></linearGradient></defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-white font-black text-lg">{Math.round(completedCount/CHALLENGES.length*100)}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Challenges */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
        {CHALLENGES.map(ch => {
          const done = !!completed[ch.id]
          return (
            <div key={ch.id} className="card-wl p-6 flex flex-col" style={done ? { borderColor: "rgba(0,255,136,0.3)", background: "rgba(0,255,136,0.03)" } : {}}>
              <div className="flex items-start justify-between mb-4">
                <div className="text-3xl">{ch.icon}</div>
                <div className="flex items-center gap-1 text-xs text-wl-gray">
                  <Clock size={12} /> {ch.time}
                </div>
              </div>
              <h3 className="text-white font-bold mb-2">{ch.title}</h3>
              <p className="text-wl-gray text-sm flex-1 mb-4">{ch.desc}</p>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1 text-wl-gold text-sm font-bold"><Zap size={14} />+{ch.xp} XP</span>
                {done ? (
                  <div className="flex items-center gap-1 text-green-400 text-sm font-bold">
                    <CheckCircle size={16} /> Concluído!
                  </div>
                ) : (
                  <button onClick={() => completeChallenge(ch)} className="btn-primary py-2 px-4 text-sm flex items-center gap-1">
                    <Trophy size={14} /> Concluir
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </AppLayout>
  )
}
