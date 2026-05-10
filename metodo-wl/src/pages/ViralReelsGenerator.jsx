
import { useState } from "react"
import AppLayout from "../components/AppLayout"
import { Play, Zap, Copy, CheckCheck, RefreshCw } from "lucide-react"
import { useCopyToClipboard } from "../hooks/useCopyToClipboard"
import { useAuth } from "../context/AuthContext"
import toast from "react-hot-toast"

const NICHES = ["Marketing Digital","Emagrecimento","Fitness","Negócios Online","Moda e Estilo","Culinária","Finanças Pessoais","Desenvolvimento Pessoal","Relacionamentos","Saúde e Bem-estar","Tecnologia","Pets"]
const FORMATS = ["Educativo","Venda","Entretenimento","Motivacional","Tutorial","Bastidores"]
const DURATIONS = ["15 segundos","30 segundos","60 segundos","90 segundos"]

function ResultCard({ label, content, id }) {
  const { copy, isCopied } = useCopyToClipboard()
  return (
    <div className="p-4 rounded-xl" style={{ background:"rgba(8,8,16,0.6)", border:"1px solid rgba(30,30,58,0.8)" }}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-wl-blue text-xs font-semibold uppercase tracking-wider">{label}</span>
        <button onClick={() => copy(content, id)} className="copy-btn text-xs flex items-center gap-1">
          {isCopied(id) ? <><CheckCheck size={10}/>Copiado!</> : <><Copy size={10}/>Copiar</>}
        </button>
      </div>
      <p className="text-wl-white text-sm leading-relaxed whitespace-pre-wrap">{content}</p>
    </div>
  )
}

export default function ViralReelsGenerator() {
  const { addXP } = useAuth()
  const [form, setForm] = useState({ niche:"", topic:"", format:"Educativo", duration:"60 segundos" })
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  const generate = async () => {
    if (!form.niche || !form.topic) { toast.error("Preencha o nicho e o tema"); return }
    setLoading(true)
    await new Promise(r => setTimeout(r, 2200))
    const niche = form.niche; const topic = form.topic; const fmt = form.format; const dur = form.duration
    setResult({
      hook: `"PARA TUDO! Se você está no nicho de ${niche}, você PRECISA ver isso sobre ${topic}. Isso mudou tudo para mim."`,
      script: `[0-3s] HOOK: "${topic.toUpperCase()} — A verdade que ninguém te conta"\n\n[3-15s] PROBLEMA: Apresente o problema que seu público enfrenta com ${topic}. Seja específico e emocional. Ex: "Eu passei X tempo tentando ${topic} sem resultado, até descobrir..."\n\n[15-35s] SOLUÇÃO: Revele o método ou insight principal. Use gestos, texto na tela e energia alta.\n\n[35-55s] RESULTADO: Mostre o que acontece quando você aplica. "Depois que fiz isso, consegui [resultado específico]"\n\n[55-60s] CTA: "Salva esse vídeo! Você vai precisar. Segue para mais sobre ${niche} 🔥"`,
      cta: `"Salva esse vídeo agora! 💾 E segue @suaconta para mais estratégias de ${niche} que realmente funcionam!"`,
      caption: `🎯 ${topic.toUpperCase()}\n\nA maioria das pessoas no nicho de ${niche} comete esse erro e nem sabe...\n\nDepois de [RESULTADO PESSOAL], descobri que o segredo é [SUA ESTRATÉGIA PRINCIPAL].\n\nSalva esse vídeo, você vai usar! 🔖\n\nConta nos comentários: você já sabia disso? 👇\n\n#${niche.replace(/ /g,"")} #${topic.replace(/ /g,"")} #MarketingDigital #MetodoWL #${fmt}`,
      hashtags: `#${niche.replace(/ /g,"")} #${topic.replace(/ /g,"")} #MarketingDigital #EmpreendedorDigital #ContentCreator #Instagram2026 #Viral #${fmt} #MetodoWL #NegocioDigital`,
      music: `🎵 Música sugerida para ${fmt}:\n• ${fmt === "Motivacional" ? "Rodrigo Amarante - Tuyo (Lo-fi version)" : fmt === "Educativo" ? "Música instrumental lo-fi sem direitos autorais" : "Trending audio do momento no Instagram Reels"}\n\n💡 Dica: Use o trending audio da semana para +40% de alcance orgânico`,
    })
    addXP(100)
    toast.success("Reel gerado! +100 XP 🎬")
    setLoading(false)
  }

  return (
    <AppLayout title="Gerador de Reels Virais" subtitle="IA que cria roteiros com potencial viral em segundos">
      <div className="max-w-4xl mx-auto grid lg:grid-cols-2 gap-6">
        {/* Form */}
        <div className="card-wl p-6 space-y-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background:"linear-gradient(135deg, #ec4899, #7c3aed)" }}>
              <Play size={20} className="text-white" fill="white" />
            </div>
            <div>
              <h2 className="text-white font-bold">Configure seu Reel</h2>
              <p className="text-wl-gray text-xs">Preencha e a IA cria tudo</p>
            </div>
          </div>

          <div>
            <label className="text-wl-gray text-sm block mb-2">Seu Nicho *</label>
            <select value={form.niche} onChange={set("niche")} className="input-wl">
              <option value="">Selecione seu nicho</option>
              {NICHES.map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>

          <div>
            <label className="text-wl-gray text-sm block mb-2">Tema do Reel *</label>
            <input value={form.topic} onChange={set("topic")} placeholder="Ex: Como crescer 1000 seguidores em 30 dias" className="input-wl" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-wl-gray text-sm block mb-2">Formato</label>
              <select value={form.format} onChange={set("format")} className="input-wl">
                {FORMATS.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
            <div>
              <label className="text-wl-gray text-sm block mb-2">Duração</label>
              <select value={form.duration} onChange={set("duration")} className="input-wl">
                {DURATIONS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </div>

          <button onClick={generate} disabled={loading} className="btn-primary w-full py-4 flex items-center justify-center gap-3 disabled:opacity-50">
            {loading ? <><RefreshCw size={18} className="animate-spin"/>Gerando seu Reel...</> : <><Zap size={18}/>Gerar Reel Viral</>}
          </button>
        </div>

        {/* Result */}
        <div className="space-y-4">
          {!result ? (
            <div className="card-wl p-8 text-center h-full flex flex-col items-center justify-center">
              <div className="text-6xl mb-4">🎬</div>
              <p className="text-white font-bold mb-2">Seu roteiro aparecerá aqui</p>
              <p className="text-wl-gray text-sm">Configure o formulário e clique em Gerar</p>
            </div>
          ) : (
            <>
              <ResultCard label="🪝 Hook (0-3s)" content={result.hook} id="hook" />
              <ResultCard label="📝 Roteiro Completo" content={result.script} id="script" />
              <ResultCard label="📣 CTA Final" content={result.cta} id="cta" />
              <ResultCard label="📄 Legenda" content={result.caption} id="caption" />
              <ResultCard label="🏷️ Hashtags" content={result.hashtags} id="hashtags" />
              <ResultCard label="🎵 Música" content={result.music} id="music" />
              <button onClick={() => setResult(null)} className="btn-ghost w-full flex items-center justify-center gap-2 text-sm">
                <RefreshCw size={16} /> Gerar novo roteiro
              </button>
            </>
          )}
        </div>
      </div>
    </AppLayout>
  )
}
