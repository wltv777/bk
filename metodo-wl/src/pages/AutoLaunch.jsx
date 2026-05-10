
import { useState } from "react"
import AppLayout from "../components/AppLayout"
import { useAuth } from "../context/AuthContext"
import { Rocket, Zap, Calendar, MessageCircle, Play, Mail } from "lucide-react"
import { useCopyToClipboard } from "../hooks/useCopyToClipboard"
import toast from "react-hot-toast"

const TABS = [{ id:"calendar", label:"📅 Calendário", icon:Calendar },{ id:"stories", label:"📱 Stories", icon:Play },{ id:"reels", label:"🎬 Reels", icon:Play },{ id:"whatsapp", label:"💬 WhatsApp", icon:MessageCircle },{ id:"email", label:"📧 E-mail", icon:Mail }]

export default function AutoLaunch() {
  const { addXP } = useAuth()
  const [form, setForm] = useState({ product:"", niche:"", price:"", launchDate:"" })
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [activeTab, setActiveTab] = useState("calendar")
  const { copy, isCopied } = useCopyToClipboard()
  const set = k => e => setForm(f => ({...f, [k]: e.target.value}))

  const generate = async () => {
    if (!form.product || !form.niche) { toast.error("Preencha produto e nicho"); return }
    setLoading(true); await new Promise(r => setTimeout(r, 2500))
    const p = form.product; const n = form.niche; const price = form.price || "497"
    setResult({
      calendar: [
        { day:"Dia 1", theme:"🔥 Aquecimento", content:`Story: Teaser misterioso sobre ${p}. Post: Conteúdo de alto valor sobre ${n}. Objetivo: Gerar curiosidade.` },
        { day:"Dia 2", theme:"💡 Educação", content:`Reel educativo: O maior erro de quem está no nicho de . Objetivo: Posicionamento de autoridade.` },
        { day:"Dia 3", theme:"📖 História", content:`Story: Sua jornada antes e depois. Eu era assim... hoje sou assim. Objetivo: Conexão emocional.` },
        { day:"Dia 4", theme:"🤝 Prova Social", content:`Post: Depoimentos de clientes. Veja o que aconteceu quando [cliente] aplicou.... Objetivo: Credibilidade.` },
        { day:"Dia 5", theme:"🎯 Problema", content:`Reel: Por que 97% das pessoas falham em . Agite a dor. Objetivo: Identificação.` },
        { day:"Dia 6", theme:"💎 Pré-abertura", content:`Story: Amanhã abrimos. Última chance de entrar na lista VIP. CTA: Manda DM. Objetivo: Lista de interesse.` },
        { day:"Dia 7", theme:"🚀 ABERTURA", content:`Lives + Stories com countdown. Post de abertura oficial. Preço de lançamento por 48h. Objetivo: VENDAS!` },
      ],
      stories: `📱 SEQUÊNCIA DE STORIES — 7 DIAS\n\nDIA 1-2: Stories de valor sobre ${n}. Ensine algo específico sem revelar ${p}.\n\nDIA 3-4: Bastidores e história pessoal. Humanize antes de vender.\n\nDIA 5: Enquete: "Você sofre com [dor do nicho]?"\n(Resultado cria lead quente)\n\nDIA 6: "Algo especial chega amanhã..."\n(Caixinha de perguntas sobre ${n})\n\nDIA 7 - ABERTURA:\n"🔴 ABERTO! As vagas do ${p} estão disponíveis por apenas R$${price}. Mas só até [data]. Arrasta pra cima ⬆️"`,
      reels: `🎬 REELS DE LANÇAMENTO\n\nReel 1 (Dia 1): "O que aconteceu quando eu parei de fazer isso no ${n}"\n→ Hook: educativo, gera autoridade\n\nReel 2 (Dia 3): "De [antes] para [depois] em [prazo] — minha história real"\n→ Hook: emocional, gera conexão\n\nReel 3 (Dia 5): "${n}: por que quase todo mundo falha nos primeiros 30 dias"\n→ Hook: problema + agitação\n\nReel 4 (Dia 7): "Hoje é o dia! O ${p} está aberto por tempo limitado"\n→ Direto ao ponto, urgência`,
      whatsapp: `💬 SEQUÊNCIA WHATSAPP\n\nMsg 1 (Dia 5 - Lead capturado):\n"Oi [Nome]! Vi que você se interessou por ${n}. Posso te contar uma coisa importante que vai acontecer nos próximos dias? 🔥"\n\nMsg 2 (Dia 6):\n"[Nome], lembra que disse que tinha algo especial? Amanhã abre. Mas tenho reservado algumas vagas VIP para pessoas que chegaram antes. Você quer garantir a sua? 💎"\n\nMsg 3 (Dia 7 - Abertura):\n"ABRIU! ⚡ O ${p} está disponível por R$${price}. Mas as vagas são limitadas e o preço muda em 48h. Quer o link? 👇"\n\nMsg 4 (Dia 8 - Follow-up):\n"[Nome], vi que você ainda não garantiu sua vaga. Quero entender: tem alguma dúvida que eu posso responder? 🤝"`,
      email: `📧 SEQUÊNCIA DE E-MAIL\n\nE-mail 1 (Dia 5):\nAssunto: "Uma coisa importante que vai acontecer em 48h..."\n→ Conteúdo de valor sobre ${n} + teaser do lançamento\n\nE-mail 2 (Dia 6):\nAssunto: "Você não vai acreditar no que preparei para [nicho]"\n→ Revela mais detalhes, gera antecipação\n\nE-mail 3 (Dia 7 - Abertura):\nAssunto: "🚀 ABERTO! ${p} — mas só por 48h"\n→ Apresentação completa, oferta, link de compra\n\nE-mail 4 (Dia 8):\nAssunto: "Restam apenas X vagas para ${p}"\n→ Urgência, depoimentos, responde objeções\n\nE-mail 5 (Fechamento):\nAssunto: "⏰ Última hora — ${p} fecha hoje às 23h59"\n→ Urgência máxima, oferta final`,
    })
    addXP(300)
    toast.success("Lançamento criado! +300 XP 🚀")
    setLoading(false)
  }

  return (
    <AppLayout title="Lançamento Automático" subtitle="IA que cria todo seu plano de lançamento">
      {!result ? (
        <div className="max-w-2xl mx-auto">
          <div className="card-premium p-8 space-y-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background:"linear-gradient(135deg,#0066ff,#7c3aed)" }}>
                <Rocket size={24} className="text-white" />
              </div>
              <div>
                <h2 className="text-white font-bold text-lg">Configure seu Lançamento</h2>
                <p className="text-wl-gray text-sm">A IA cria o plano completo de 7 dias</p>
              </div>
            </div>
            {[{ k:"product", l:"Nome do Produto", ph:"Ex: Método Vendas Digital" },{ k:"niche", l:"Seu Nicho", ph:"Ex: Marketing Digital, Fitness, Culinária" },{ k:"price", l:"Preço de Lançamento (R$)", ph:"Ex: 497" },{ k:"launchDate", l:"Data do Lançamento", ph:"Ex: 15/06/2026" }].map(({ k, l, ph }) => (
              <div key={k}>
                <label className="text-wl-gray text-sm block mb-2">{l}</label>
                <input value={form[k]} onChange={set(k)} placeholder={ph} className="input-wl" type={k === "launchDate" ? "text" : "text"} />
              </div>
            ))}
            <button onClick={generate} disabled={loading} className="btn-gold w-full py-4 flex items-center justify-center gap-2 disabled:opacity-50">
              {loading ? <><div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin"/>Gerando lançamento completo...</> : <><Zap size={18}/>Gerar Meu Lançamento Automático</>}
            </button>
          </div>
        </div>
      ) : (
        <div className="max-w-4xl mx-auto">
          <div className="flex gap-2 flex-wrap mb-6">
            {TABS.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className="px-4 py-2.5 rounded-xl text-sm font-semibold transition-all"
                style={{ background: activeTab === tab.id ? "rgba(0,102,255,0.15)" : "rgba(17,17,39,0.8)", border: `1px solid ${activeTab === tab.id ? "rgba(0,102,255,0.4)" : "rgba(30,30,58,0.8)"}`, color: activeTab === tab.id ? "#3385ff" : "#8892a4" }}>
                {tab.label}
              </button>
            ))}
          </div>

          {activeTab === "calendar" ? (
            <div className="space-y-3">
              {result.calendar.map((day, i) => (
                <div key={i} className="card-wl p-5 flex gap-4">
                  <div className="w-16 text-center shrink-0">
                    <p className="text-wl-blue font-bold text-xs">{day.day}</p>
                    <p className="text-wl-gray text-xs mt-1">{day.theme}</p>
                  </div>
                  <div className="flex-1">
                    <p className="text-wl-white text-sm leading-relaxed">{day.content}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="card-wl p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-white font-bold">{TABS.find(t => t.id === activeTab)?.label}</h3>
                <button onClick={() => copy(result[activeTab], activeTab)} className="copy-btn flex items-center gap-1 text-xs">
                  {isCopied(activeTab) ? "✓ Copiado!" : "Copiar tudo"}
                </button>
              </div>
              <pre className="text-wl-white text-sm leading-relaxed whitespace-pre-wrap font-sans">{result[activeTab]}</pre>
            </div>
          )}
        </div>
      )}
    </AppLayout>
  )
}
