
import AppLayout from "../components/AppLayout"
import { useState } from "react"
import { ArrowRight, X, Check } from "lucide-react"

const COMPARISONS = [
  { id:1, title:"Perfil do Instagram", icon:"📱",
    bad: { label:"❌ Perfil Fraco", points:["Bio genérica sem CTA","Foto de perfil pessoal comum","Sem destaque fixo","Feed sem identidade visual","0 chamadas para ação"] },
    good: { label:"✅ Perfil Otimizado", points:["Bio estratégica com CTA claro","Logo ou foto profissional","Destaques organizados por tema","Feed com identidade visual única","CTA em todos os posts"] } },
  { id:2, title:"Copy de Venda", icon:"✍️",
    bad: { label:"❌ Copy Fraca", points:["Foca nas features do produto","Linguagem técnica e fria","Sem prova social","Sem urgência ou escassez","CTA genérico: Compre agora"] },
    good: { label:"✅ Copy Forte", points:["Foca na transformação do cliente","Linguagem emocional e pessoal","Depoimentos reais com resultados","Escassez ética com prazo real","CTA irresistível: Quero minha vaga"] } },
  { id:3, title:"Bio do Instagram", icon:"👤",
    bad: { label:"❌ Bio Ruim", points:["Mãe de 3 filhos | Apaixonada por café ☕","Sem nicho definido","Sem proposta de valor","Sem CTA","Emoji aleatórios"] },
    good: { label:"✅ Bio Premium", points:["Ajudo [público] a [resultado] em [prazo]","Nicho cristalino e específico","Proposta de valor em 1 linha","Link + CTA direto","Emojis estratégicos"] } },
  { id:4, title:"Thumbnail de Vídeo", icon:"🎬",
    bad: { label:"❌ Thumbnail Fraca", points:["Print genérico do vídeo","Sem texto ou título","Rosto sem expressão","Cores apagadas","Sem contraste ou hierarquia"] },
    good: { label:"✅ Thumbnail Viral", points:["Rosto com expressão de surpresa/empolgação","Título impactante em destaque","Cores vibrantes e contrastantes","Elemento de curiosidade visual","Paleta consistente com o canal"] } },
  { id:5, title:"Oferta Digital", icon:"💰",
    bad: { label:"❌ Oferta Comum", points:["Apenas o produto principal","Sem bônus claros","Preço sem âncora","Sem garantia explícita","Escassez genérica"] },
    good: { label:"✅ Oferta Irresistível", points:["Produto + 5 bônus detalhados","Valores de cada bônus listados","Preço original vs atual (âncora)","Garantia de X dias em destaque","Escassez específica e ética"] } },
  { id:6, title:"Landing Page", icon:"🖥️",
    bad: { label:"❌ Página Simples", points:["Apenas texto e botão","Sem prova social","Sem headline poderosa","Design amador","Sem hierarquia visual"] },
    good: { label:"✅ Página Profissional", points:["Hero com headline irresistível","Depoimentos com fotos reais","VSL ou video de vendas","Design premium e responsivo","Funil otimizado de conversão"] } },
]

export default function BeforeAfter() {
  const [active, setActive] = useState(1)
  const item = COMPARISONS.find(c => c.id === active)

  return (
    <AppLayout title="Antes e Depois" subtitle="Veja a diferença de aplicar o MÉTODO WL">
      {/* Tabs */}
      <div className="flex gap-2 flex-wrap mb-8">
        {COMPARISONS.map(c => (
          <button key={c.id} onClick={() => setActive(c.id)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all"
            style={{ background: active === c.id ? "rgba(0,102,255,0.15)" : "rgba(17,17,39,0.8)", border: `1px solid ${active === c.id ? "rgba(0,102,255,0.4)" : "rgba(30,30,58,0.8)"}`, color: active === c.id ? "#3385ff" : "#8892a4" }}>
            {c.icon} {c.title}
          </button>
        ))}
      </div>

      {item && (
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-black text-center text-white mb-8">{item.icon} {item.title}</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Bad */}
            <div className="p-6 rounded-2xl" style={{ background: "rgba(239,68,68,0.05)", border: "2px solid rgba(239,68,68,0.2)" }}>
              <h3 className="text-red-400 font-bold text-lg mb-6">{item.bad.label}</h3>
              <ul className="space-y-3">
                {item.bad.points.map((p, i) => (
                  <li key={i} className="flex items-start gap-3 text-wl-gray text-sm">
                    <X size={16} className="text-red-400 shrink-0 mt-0.5" /> {p}
                  </li>
                ))}
              </ul>
            </div>
            {/* Good */}
            <div className="p-6 rounded-2xl relative" style={{ background: "rgba(0,255,136,0.05)", border: "2px solid rgba(0,255,136,0.2)" }}>
              <h3 className="text-green-400 font-bold text-lg mb-6">{item.good.label}</h3>
              <ul className="space-y-3">
                {item.good.points.map((p, i) => (
                  <li key={i} className="flex items-start gap-3 text-wl-white text-sm">
                    <Check size={16} className="text-green-400 shrink-0 mt-0.5" /> {p}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="text-center mt-8">
            <div className="inline-flex items-center gap-3 px-6 py-4 rounded-2xl" style={{ background: "rgba(0,102,255,0.08)", border: "1px solid rgba(0,102,255,0.2)" }}>
              <span className="text-wl-gray text-sm">Antes</span>
              <ArrowRight size={20} className="text-wl-blue" />
              <span className="text-wl-blue font-bold text-sm">Com o MÉTODO WL em 30 dias</span>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  )
}
