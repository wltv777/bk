
import { useState } from "react"
import AppLayout from "../components/AppLayout"
import { useAuth } from "../context/AuthContext"
import { Bot, Zap, Palette, Mic, Eye, RefreshCw } from "lucide-react"
import toast from "react-hot-toast"

const STYLES = ["Autoridade Séria","Amigável e Descontraído","Motivacional","Educativo Premium","Criativo e Jovem","Luxo e Exclusividade"]
const TONES = ["Direto e objetivo","Emocional e inspirador","Técnico e preciso","Humor e leveza","Premium e sofisticado"]
const PALETTES = [
  { name:"Azul Premium", colors:["#0066ff","#7c3aed","#00d4ff"] },
  { name:"Dourado Luxo", colors:["#f59e0b","#1a1a1a","#ffffff"] },
  { name:"Verde Sucesso", colors:["#10b981","#064e3b","#f0fdf4"] },
  { name:"Rosa Power", colors:["#ec4899","#7c3aed","#1a1a2e"] },
  { name:"Laranja Energia", colors:["#f97316","#dc2626","#1a1a1a"] },
]

export default function AIAvatarSystem() {
  const { addXP } = useAuth()
  const [form, setForm] = useState({ name:"", niche:"", style:"Autoridade Séria", tone:"Direto e objetivo", palette:0 })
  const [loading, setLoading] = useState(false)
  const [avatar, setAvatar] = useState(null)
  const set = k => e => setForm(f => ({...f, [k]: e.target.value}))

  const generate = async () => {
    if (!form.name || !form.niche) { toast.error("Preencha nome e nicho"); return }
    setLoading(true); await new Promise(r => setTimeout(r, 2000))
    const pal = PALETTES[form.palette]
    setAvatar({
      name: form.name,
      bio: `Ajudo ${form.niche} a [RESULTADO PRINCIPAL] usando um método exclusivo de [MECANISMO ÚNICO]. Já transformei + de [NÚMERO] vidas. Sua transformação começa aqui 👇`,
      style: form.style,
      tone: form.tone,
      palette: pal,
      pillars: [`🎯 Pilar 1: Educação sobre ${form.niche}`,`💡 Pilar 2: Bastidores e autenticidade`,`🏆 Pilar 3: Resultados e provas sociais`,`🤝 Pilar 4: Conexão e comunidade`,`🚀 Pilar 5: Vendas e chamadas para ação`],
      contentStyle: `Tom: ${form.tone}\nEstilo visual: ${form.style}\nFrequência: 1 Reel + 3 Stories + 1 Carrossel por dia\nHorários: 9h, 12h, 18h, 21h`,
      voiceTips: [`Use sempre "você" em vez de "vocês" — intimidade cria conexão`,`Comece com hook nos primeiros 3 segundos`,`Conte histórias pessoais para criar identificação`,`Use dados e números para gerar credibilidade`,`Termine sempre com uma pergunta para estimular comentários`],
    })
    addXP(150)
    toast.success("Avatar criado! +150 XP 🤖")
    setLoading(false)
  }

  return (
    <AppLayout title="Sistema Avatar IA" subtitle="Crie sua identidade digital com IA">
      <div className="max-w-5xl mx-auto grid lg:grid-cols-2 gap-6">
        {/* Form */}
        <div className="card-wl p-6 space-y-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background:"linear-gradient(135deg,#0066ff,#7c3aed)" }}>
              <Bot size={20} className="text-white" />
            </div>
            <div>
              <h2 className="text-white font-bold">Criar meu Avatar IA</h2>
              <p className="text-wl-gray text-xs">Defina sua identidade digital</p>
            </div>
          </div>

          <div><label className="text-wl-gray text-sm block mb-2">Seu nome / marca</label><input value={form.name} onChange={set("name")} placeholder="Ex: João Silva / @joaoempreende" className="input-wl" /></div>
          <div><label className="text-wl-gray text-sm block mb-2">Seu nicho / área</label><input value={form.niche} onChange={set("niche")} placeholder="Ex: Marketing Digital para coaches" className="input-wl" /></div>

          <div>
            <label className="text-wl-gray text-sm block mb-2 flex items-center gap-1"><Eye size={14}/>Estilo visual</label>
            <div className="grid grid-cols-2 gap-2">
              {STYLES.map(s => <button key={s} onClick={() => setForm(f => ({...f, style:s}))}
                className="p-2 rounded-lg text-xs text-center transition-all"
                style={{ background: form.style === s ? "rgba(0,102,255,0.15)" : "rgba(17,17,39,0.8)", border:`1px solid ${form.style === s ? "rgba(0,102,255,0.4)" : "rgba(30,30,58,0.8)"}`, color: form.style === s ? "#3385ff" : "#8892a4" }}>
                {s}
              </button>)}
            </div>
          </div>

          <div>
            <label className="text-wl-gray text-sm block mb-2 flex items-center gap-1"><Mic size={14}/>Tom de voz</label>
            <div className="space-y-2">
              {TONES.map(t => <button key={t} onClick={() => setForm(f => ({...f, tone:t}))}
                className="w-full text-left p-2.5 rounded-lg text-sm transition-all"
                style={{ background: form.tone === t ? "rgba(0,102,255,0.1)" : "rgba(17,17,39,0.8)", border:`1px solid ${form.tone === t ? "rgba(0,102,255,0.3)" : "rgba(30,30,58,0.8)"}`, color: form.tone === t ? "#3385ff" : "#8892a4" }}>
                {t}
              </button>)}
            </div>
          </div>

          <div>
            <label className="text-wl-gray text-sm block mb-2 flex items-center gap-1"><Palette size={14}/>Paleta de cores</label>
            <div className="grid grid-cols-3 gap-2">
              {PALETTES.map((pal, i) => (
                <button key={i} onClick={() => setForm(f => ({...f, palette:i}))}
                  className="p-2 rounded-lg text-center transition-all"
                  style={{ background: form.palette === i ? "rgba(0,102,255,0.1)" : "rgba(17,17,39,0.8)", border:`1px solid ${form.palette === i ? "rgba(0,102,255,0.3)" : "rgba(30,30,58,0.8)"}` }}>
                  <div className="flex gap-1 justify-center mb-1">
                    {pal.colors.map((c,j) => <div key={j} className="w-4 h-4 rounded-full" style={{ background:c }} />)}
                  </div>
                  <p className="text-xs" style={{ color: form.palette === i ? "#3385ff" : "#8892a4" }}>{pal.name}</p>
                </button>
              ))}
            </div>
          </div>

          <button onClick={generate} disabled={loading} className="btn-primary w-full py-4 flex items-center justify-center gap-2 disabled:opacity-50">
            {loading ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>Criando seu avatar...</> : <><Zap size={18}/>Criar meu Avatar IA</>}
          </button>
        </div>

        {/* Result */}
        <div className="space-y-4">
          {!avatar ? (
            <div className="card-wl p-8 text-center h-64 flex flex-col items-center justify-center">
              <Bot size={48} className="text-wl-gray mb-4" />
              <p className="text-white font-bold mb-2">Seu avatar aparecerá aqui</p>
              <p className="text-wl-gray text-sm">Configure o formulário e clique em Criar</p>
            </div>
          ) : (
            <>
              <div className="card-premium p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-black text-white"
                    style={{ background:`linear-gradient(135deg, ${avatar.palette.colors[0]}, ${avatar.palette.colors[1]})` }}>
                    {avatar.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-lg">{avatar.name}</h3>
                    <p className="text-wl-gray text-xs">{avatar.style} · {avatar.tone}</p>
                    <div className="flex gap-1 mt-1">
                      {avatar.palette.colors.map((c,i) => <div key={i} className="w-5 h-5 rounded-full border border-white/20" style={{ background:c }} />)}
                    </div>
                  </div>
                </div>
                <div className="p-3 rounded-xl text-sm text-wl-white" style={{ background:"rgba(8,8,16,0.6)" }}>{avatar.bio}</div>
              </div>
              <div className="card-wl p-5">
                <h4 className="text-white font-bold mb-3">🎯 Pilares de Conteúdo</h4>
                <ul className="space-y-2">{avatar.pillars.map((p,i) => <li key={i} className="text-wl-gray text-sm">{p}</li>)}</ul>
              </div>
              <div className="card-wl p-5">
                <h4 className="text-white font-bold mb-3">🎙️ Tom de Voz — Dicas</h4>
                <ul className="space-y-2">{avatar.voiceTips.map((t,i) => <li key={i} className="text-wl-gray text-sm">• {t}</li>)}</ul>
              </div>
              <button onClick={() => { setAvatar(null); setForm({ name:"", niche:"", style:"Autoridade Séria", tone:"Direto e objetivo", palette:0 }) }} className="btn-ghost w-full flex items-center justify-center gap-2 text-sm">
                <RefreshCw size={16}/> Criar novo avatar
              </button>
            </>
          )}
        </div>
      </div>
    </AppLayout>
  )
}
