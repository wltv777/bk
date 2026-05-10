
import { useState } from "react"
import AppLayout from "../components/AppLayout"
import { useAuth } from "../context/AuthContext"
import { Zap, ChevronRight, ChevronLeft, RefreshCw, Copy, CheckCheck } from "lucide-react"
import { useCopyToClipboard } from "../hooks/useCopyToClipboard"
import toast from "react-hot-toast"

const STEPS = [
  { id:1, title:"Seu Nicho", field:"niche", placeholder:"Ex: Marketing Digital para infoprodutores", help:"Seja específico. Nicho específico = preço mais alto." },
  { id:2, title:"Nome do Produto", field:"product", placeholder:"Ex: Acelerador de Vendas, Método X, Programa Y", help:"O nome deve transmitir a transformação." },
  { id:3, title:"Seu Público", field:"audience", placeholder:"Ex: Empreendedores que querem vender pelo Instagram", help:"Descreva seu cliente ideal com detalhes." },
  { id:4, title:"Problema Principal", field:"problem", placeholder:"Ex: Não conseguem vender mesmo com muitos seguidores", help:"Qual é a DOR que você resolve?" },
  { id:5, title:"Seu Diferencial", field:"differentiator", placeholder:"Ex: Método em 7 dias com IA integrada", help:"O que te torna único? Seu mecanismo exclusivo." },
]

export default function MillionaireOffer() {
  const { addXP } = useAuth()
  const [step, setStep] = useState(0)
  const [form, setForm] = useState({ niche:"", product:"", audience:"", problem:"", differentiator:"" })
  const [loading, setLoading] = useState(false)
  const [offer, setOffer] = useState(null)
  const { copy, isCopied } = useCopyToClipboard()
  const s = STEPS[step]

  const generate = async () => {
    setLoading(true)
    await new Promise(r => setTimeout(r, 2500))
    setOffer({
      name: `PROGRAMA ${form.product.toUpperCase()} — O Sistema Definitivo Para ${form.audience}`,
      promise: `Em 30 dias, você vai [RESULTADO ESPECÍFICO] mesmo que hoje você [OBJEÇÃO PRINCIPAL] — ou eu devolvo 100% do seu dinheiro.`,
      mechanism: `O ${form.differentiator} — uma sequência de 3 etapas que ataca diretamente ${form.problem} usando IA e automação, eliminando o trabalho manual e acelerando seus resultados em 10x.`,
      bonuses: [`🎯 Bônus 1: Templates Premium de ${form.niche} (Valor: R$297)`,`⚡ Bônus 2: Sessão de Diagnóstico Individual (Valor: R$497)`,`📋 Bônus 3: Comunidade VIP de Suporte (Valor: R$197)`,`🤖 Bônus 4: Ferramenta de IA Exclusiva (Valor: R$397)`,`🚀 Bônus 5: Plano de 30 dias personalizado (Valor: R$297)`],
      stack: `Produto Principal: R$997\nBônus 1: R$297\nBônus 2: R$497\nBônus 3: R$197\nBônus 4: R$397\nBônus 5: R$297\n━━━━━━━━━━━━\nValor Total: R$2.682\nVocê paga HOJE: R$497`,
      cta: `SIM! Quero minha vaga no ${form.product} por apenas R$497 (era R$2.682)`,
      scarcity: `⚠️ ATENÇÃO: Esta oferta é válida apenas para as próximas 24 horas ou até as 20 vagas serem preenchidas. Após isso, o preço volta para R$997 sem os bônus.`,
    })
    addXP(200)
    toast.success("Oferta criada! +200 XP 💰")
    setLoading(false)
  }

  if (offer) return (
    <AppLayout title="Sua Oferta Milionária" subtitle="Criada pela IA do MÉTODO WL">
      <div className="max-w-3xl mx-auto space-y-5">
        {[
          { label:"📛 Nome do Produto", content:offer.name, id:"name" },
          { label:"💎 Promessa Principal", content:offer.promise, id:"promise" },
          { label:"⚙️ Mecanismo Único", content:offer.mechanism, id:"mechanism" },
          { label:"🎁 Stack de Bônus", content:offer.bonuses.join("\n"), id:"bonuses" },
          { label:"💰 Stack de Valor", content:offer.stack, id:"stack" },
          { label:"🚨 Escassez Ética", content:offer.scarcity, id:"scarcity" },
          { label:"👆 CTA Final", content:offer.cta, id:"cta" },
        ].map(item => (
          <div key={item.id} className="card-wl p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-wl-blue text-sm font-bold">{item.label}</span>
              <button onClick={() => copy(item.content, item.id)} className="copy-btn flex items-center gap-1 text-xs">
                {isCopied(item.id) ? <><CheckCheck size={12}/>Copiado!</> : <><Copy size={12}/>Copiar</>}
              </button>
            </div>
            <p className="text-wl-white text-sm leading-relaxed whitespace-pre-wrap">{item.content}</p>
          </div>
        ))}
        <button onClick={() => { setOffer(null); setStep(0); setForm({ niche:"", product:"", audience:"", problem:"", differentiator:"" }) }}
          className="btn-ghost w-full flex items-center justify-center gap-2">
          <RefreshCw size={16}/> Criar nova oferta
        </button>
      </div>
    </AppLayout>
  )

  return (
    <AppLayout title="Oferta Milionária" subtitle="Responda 5 perguntas e a IA cria sua oferta irresistível">
      <div className="max-w-2xl mx-auto">
        {/* Progress */}
        <div className="flex items-center gap-2 mb-8">
          {STEPS.map((st,i) => (
            <div key={st.id} className="flex items-center gap-2 flex-1">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all"
                style={{ background: i < step ? "#10b981" : i === step ? "linear-gradient(135deg,#0066ff,#7c3aed)" : "rgba(30,30,58,0.8)", color: "white" }}>
                {i < step ? "✓" : i+1}
              </div>
              {i < STEPS.length-1 && <div className="flex-1 h-0.5 rounded-full" style={{ background: i < step ? "#10b981" : "rgba(30,30,58,0.8)" }} />}
            </div>
          ))}
        </div>

        <div className="card-premium p-8">
          <p className="text-wl-blue text-xs font-semibold uppercase tracking-wider mb-2">Passo {step+1} de {STEPS.length}</p>
          <h2 className="text-2xl font-black text-white mb-2">{s.title}</h2>
          <p className="text-wl-gray text-sm mb-6">{s.help}</p>
          <textarea value={form[s.field]} onChange={e => setForm(f => ({ ...f, [s.field]: e.target.value }))} placeholder={s.placeholder} rows={4} className="input-wl w-full resize-none mb-6" />
          <div className="flex gap-3">
            {step > 0 && <button onClick={() => setStep(s => s-1)} className="btn-ghost flex items-center gap-2"><ChevronLeft size={16}/>Voltar</button>}
            {step < STEPS.length-1 ? (
              <button onClick={() => setStep(s => s+1)} disabled={!form[s.field].trim()} className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-50">
                Próximo <ChevronRight size={16}/>
              </button>
            ) : (
              <button onClick={generate} disabled={loading || !form[s.field].trim()} className="btn-gold flex-1 flex items-center justify-center gap-2 disabled:opacity-50">
                {loading ? <><div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin"/>Gerando...</> : <><Zap size={18}/>Gerar Minha Oferta Milionária</>}
              </button>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
