
import AppLayout from "../components/AppLayout"
import { BONUSES } from "../data/courseData"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { Gift, ArrowRight, Zap } from "lucide-react"

const BONUS_PATHS = { 1:"/copiar-e-postar", 2:"/comunidade", 3:"/prompts-wl", 4:"/analisador-instagram", 5:"/gerador-de-reels", 6:"/lancamento-automatico" }

export default function BonusPage() {
  const navigate = useNavigate()
  const totalValue = BONUSES.reduce((s,b) => s + parseInt(b.value.replace(/\D/g,"")), 0)

  return (
    <AppLayout title="Bônus Exclusivos" subtitle="Tudo que você ganhou de bônus ao entrar no MÉTODO WL">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="card-premium p-8 text-center mb-8">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold mb-4"
            style={{ background:"rgba(245,158,11,0.15)", color:"#fbbf24", border:"1px solid rgba(245,158,11,0.3)" }}>
            <Gift size={16}/> Bônus Desbloqueados
          </div>
          <h2 className="text-3xl font-black text-white mb-2">Você tem <span className="gradient-text-gold">R$ {totalValue.toLocaleString("pt-BR")}</span> em bônus</h2>
          <p className="text-wl-gray">Acesso imediato a todos os bônus abaixo — sem custo adicional.</p>
        </div>

        {/* Bonus cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {BONUSES.map((bonus, i) => (
            <motion.div key={bonus.id} initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.08 }}
              className="card-wl p-6 flex flex-col" style={{ borderColor:`${bonus.color}20` }}>
              <div className="flex items-start justify-between mb-4">
                <div className="text-4xl">{bonus.icon}</div>
                <div className="text-right">
                  <span className="text-wl-gray text-xs line-through">{bonus.value}</span>
                  <div className="text-green-400 text-xs font-bold">GRÁTIS ✓</div>
                </div>
              </div>
              <h3 className="text-white font-bold mb-2">{bonus.title}</h3>
              <p className="text-wl-gold text-xs font-semibold mb-2">{bonus.subtitle}</p>
              <p className="text-wl-gray text-sm flex-1 mb-5">{bonus.description}</p>
              <button onClick={() => navigate(BONUS_PATHS[bonus.id] || "/dashboard")}
                className="btn-primary py-2.5 text-sm flex items-center justify-center gap-2">
                <Zap size={14}/> Acessar agora <ArrowRight size={14}/>
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </AppLayout>
  )
}
