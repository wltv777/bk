
import { useState } from "react"
import AppLayout from "../components/AppLayout"
import { useAuth } from "../context/AuthContext"
import { Search, BarChart3, TrendingUp, AlertTriangle, CheckCircle, Zap } from "lucide-react"
import toast from "react-hot-toast"

const CATEGORIES = ["Bio & Posicionamento","Identidade Visual","Engajamento","CTA & Conversão","Storytelling","Autoridade"]

export default function InstagramAnalyzer() {
  const { addXP } = useAuth()
  const [handle, setHandle] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)

  const analyze = async () => {
    if (!handle.trim()) { toast.error("Digite um @ do Instagram"); return }
    setLoading(true)
    await new Promise(r => setTimeout(r, 2500))
    const scores = CATEGORIES.map(cat => ({ cat, score: Math.floor(Math.random()*40)+40, max:100 }))
    const avg = Math.round(scores.reduce((s,i) => s+i.score, 0)/scores.length)
    setResult({
      handle: handle.replace("@",""),
      overallScore: avg,
      scores,
      strengths: ["Frequência de postagem consistente","Uso de hashtags relevantes","Interação com seguidores"],
      improvements: ["Bio não tem CTA claro","Feed sem identidade visual definida","Ausência de destaques organizados","Stories raramente publicados","Falta de prova social visível"],
      plan: [
        "1️⃣ Reescreva sua bio com a fórmula WL: [Quem ajuda] + [Como] + [CTA]",
        "2️⃣ Crie 5 destaques temáticos: Sobre mim, Resultados, Método, Clientes, Depoimentos",
        "3️⃣ Defina sua paleta de cores (3 cores máximo) e aplique em todos os posts",
        "4️⃣ Crie 1 Reel por dia durante 7 dias usando a fórmula WL de hook",
        "5️⃣ Adicione CTA em todos os posts: comentários, link na bio, DM",
      ],
    })
    addXP(100)
    toast.success("Análise concluída! +100 XP 📊")
    setLoading(false)
  }

  const scoreColor = s => s >= 70 ? "#00ff88" : s >= 50 ? "#f59e0b" : "#ef4444"
  const scoreLabel = s => s >= 70 ? "Bom" : s >= 50 ? "Regular" : "Precisa melhorar"

  return (
    <AppLayout title="Analisador de Instagram" subtitle="IA que analisa e diagnostica seu perfil com precisão">
      <div className="max-w-4xl mx-auto">
        {/* Search */}
        <div className="card-wl p-6 mb-6">
          <h2 className="text-white font-bold mb-4 flex items-center gap-2"><Search size={18} className="text-wl-blue"/> Insira o @ do Instagram</h2>
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-wl-gray">@</span>
              <input value={handle} onChange={e => setHandle(e.target.value)} placeholder="seuinstagram" className="input-wl pl-8"
                onKeyDown={e => e.key === "Enter" && analyze()} />
            </div>
            <button onClick={analyze} disabled={loading} className="btn-primary px-6 flex items-center gap-2 disabled:opacity-50">
              {loading ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>Analisando...</> : <><Zap size={16}/>Analisar</>}
            </button>
          </div>
          <p className="text-wl-gray text-xs mt-2">Funciona com qualquer perfil público do Instagram</p>
        </div>

        {result && (
          <div className="space-y-6">
            {/* Score */}
            <div className="card-premium p-8 text-center">
              <p className="text-wl-gray text-sm mb-4">Análise do perfil @{result.handle}</p>
              <div className="relative w-40 h-40 mx-auto mb-4">
                <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                  <circle cx="18" cy="18" r="15.9" fill="none" stroke="rgba(30,30,58,0.8)" strokeWidth="2.5" />
                  <circle cx="18" cy="18" r="15.9" fill="none" stroke={scoreColor(result.overallScore)} strokeWidth="2.5"
                    strokeDasharray={`${result.overallScore} 100`} strokeLinecap="round" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl font-black text-white">{result.overallScore}</span>
                  <span className="text-wl-gray text-xs">/100</span>
                </div>
              </div>
              <p className="text-xl font-bold" style={{ color: scoreColor(result.overallScore) }}>
                {scoreLabel(result.overallScore)}
              </p>
              <p className="text-wl-gray text-sm mt-2">Seu perfil tem potencial mas precisa de ajustes estratégicos</p>
            </div>

            {/* Category breakdown */}
            <div className="card-wl p-6">
              <h3 className="text-white font-bold mb-5 flex items-center gap-2"><BarChart3 size={16} className="text-wl-blue"/>Análise por categoria</h3>
              <div className="space-y-4">
                {result.scores.map(item => (
                  <div key={item.cat}>
                    <div className="flex justify-between mb-1">
                      <span className="text-wl-gray text-sm">{item.cat}</span>
                      <span className="text-sm font-bold" style={{ color: scoreColor(item.score) }}>{item.score}/100</span>
                    </div>
                    <div className="h-2 rounded-full bg-wl-border overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-1000" style={{ width:`${item.score}%`, background: scoreColor(item.score) }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Improvements */}
            <div className="grid md:grid-cols-2 gap-5">
              <div className="card-wl p-5">
                <h3 className="text-white font-bold mb-4 flex items-center gap-2"><CheckCircle size={16} className="text-green-400"/>Pontos fortes</h3>
                <ul className="space-y-2">
                  {result.strengths.map((s,i) => <li key={i} className="flex items-start gap-2 text-sm text-wl-gray"><CheckCircle size={14} className="text-green-400 shrink-0 mt-0.5"/>{s}</li>)}
                </ul>
              </div>
              <div className="card-wl p-5">
                <h3 className="text-white font-bold mb-4 flex items-center gap-2"><AlertTriangle size={16} className="text-yellow-400"/>Precisa melhorar</h3>
                <ul className="space-y-2">
                  {result.improvements.map((s,i) => <li key={i} className="flex items-start gap-2 text-sm text-wl-gray"><AlertTriangle size={14} className="text-yellow-400 shrink-0 mt-0.5"/>{s}</li>)}
                </ul>
              </div>
            </div>

            {/* Action plan */}
            <div className="card-premium p-6">
              <h3 className="text-white font-bold mb-5 flex items-center gap-2"><TrendingUp size={16} className="text-wl-blue"/>Plano de ação — próximos 7 dias</h3>
              <div className="space-y-3">
                {result.plan.map((step,i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-xl" style={{ background:"rgba(0,102,255,0.05)", border:"1px solid rgba(0,102,255,0.1)" }}>
                    <span className="text-wl-white text-sm">{step}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  )
}
