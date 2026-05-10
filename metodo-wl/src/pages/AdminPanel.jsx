
import { useState } from "react"
import AppLayout from "../components/AppLayout"
import { Users, BookOpen, BarChart3, DollarSign, TrendingUp, Eye, Edit, Trash2 } from "lucide-react"
import { MODULES } from "../data/courseData"

const MOCK_STUDENTS = [
  { id:1, name:"Mariana Costa", email:"mariana@email.com", progress:85, xp:12400, plan:"Premium", joinedAt:"15/01/2026" },
  { id:2, name:"Rafael Mendonça", email:"rafael@email.com", progress:100, xp:47200, plan:"Premium", joinedAt:"08/01/2026" },
  { id:3, name:"Letícia Ferreira", email:"leticia@email.com", progress:42, xp:5100, plan:"Premium", joinedAt:"20/01/2026" },
  { id:4, name:"Carlos Alberto", email:"carlos@email.com", progress:68, xp:8900, plan:"Premium", joinedAt:"12/01/2026" },
  { id:5, name:"Amanda Silveira", email:"amanda@email.com", progress:55, xp:7200, plan:"Premium", joinedAt:"18/01/2026" },
]

const TABS = ["Alunos","Módulos","Métricas","Vendas"]

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState("Métricas")

  const METRICS = [
    { label:"Alunos ativos", value:"10.847", change:"+8%", icon:<Users size={20}/>, color:"#0066ff" },
    { label:"Receita este mês", value:"R$ 234.500", change:"+23%", icon:<DollarSign size={20}/>, color:"#10b981" },
    { label:"Taxa de conclusão", value:"67%", change:"+5%", icon:<TrendingUp size={20}/>, color:"#f59e0b" },
    { label:"Retenção 30 dias", value:"89%", change:"+2%", icon:<BarChart3 size={20}/>, color:"#7c3aed" },
  ]

  return (
    <AppLayout title="Painel Administrativo" subtitle="Gerencie o MÉTODO WL">
      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {TABS.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold transition-all"
            style={{ background: activeTab === tab ? "rgba(0,102,255,0.15)" : "rgba(17,17,39,0.8)", border:`1px solid ${activeTab === tab ? "rgba(0,102,255,0.4)" : "rgba(30,30,58,0.8)"}`, color: activeTab === tab ? "#3385ff" : "#8892a4" }}>
            {tab}
          </button>
        ))}
      </div>

      {activeTab === "Métricas" && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {METRICS.map((m,i) => (
              <div key={i} className="card-wl p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background:`${m.color}15`, color:m.color }}>{m.icon}</div>
                  <span className="text-xs text-green-400 font-semibold">{m.change}</span>
                </div>
                <p className="text-2xl font-black text-white">{m.value}</p>
                <p className="text-wl-gray text-xs mt-1">{m.label}</p>
              </div>
            ))}
          </div>
          <div className="card-wl p-6">
            <h3 className="text-white font-bold mb-4">Módulos mais assistidos</h3>
            <div className="space-y-3">
              {MODULES.slice(0,6).map(mod => (
                <div key={mod.id} className="flex items-center gap-4">
                  <span className="text-xl">{mod.icon}</span>
                  <div className="flex-1">
                    <div className="flex justify-between mb-1">
                      <span className="text-wl-white text-sm">M{mod.id}: {mod.title}</span>
                      <span className="text-wl-gray text-xs">{Math.floor(Math.random()*5000+3000)} visualizações</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-wl-border overflow-hidden">
                      <div className="h-full rounded-full" style={{ width:`${Math.random()*60+40}%`, background:`linear-gradient(90deg, ${mod.color}, ${mod.color}88)` }}/>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === "Alunos" && (
        <div className="card-wl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-wl-border">
                {["Aluno","Progresso","XP","Plano","Desde","Ações"].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs text-wl-gray uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MOCK_STUDENTS.map(student => (
                <tr key={student.id} className="border-b border-wl-border/50 hover:bg-white/2">
                  <td className="px-4 py-4">
                    <div>
                      <p className="text-white text-sm font-semibold">{student.name}</p>
                      <p className="text-wl-gray text-xs">{student.email}</p>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-1.5 rounded-full bg-wl-border overflow-hidden">
                        <div className="h-full rounded-full bg-wl-blue" style={{ width:`${student.progress}%` }}/>
                      </div>
                      <span className="text-wl-gray text-xs">{student.progress}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-wl-gold text-sm font-bold">{student.xp.toLocaleString()}</td>
                  <td className="px-4 py-4"><span className="px-2 py-1 rounded text-xs font-bold bg-wl-blue/15 text-wl-blue">{student.plan}</span></td>
                  <td className="px-4 py-4 text-wl-gray text-xs">{student.joinedAt}</td>
                  <td className="px-4 py-4">
                    <div className="flex gap-2">
                      <button className="p-1.5 rounded-lg text-wl-gray hover:text-wl-blue transition-colors"><Eye size={14}/></button>
                      <button className="p-1.5 rounded-lg text-wl-gray hover:text-green-400 transition-colors"><Edit size={14}/></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === "Módulos" && (
        <div className="grid md:grid-cols-2 gap-4">
          {MODULES.map(mod => (
            <div key={mod.id} className="card-wl p-5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0" style={{ background:`${mod.color}15` }}>{mod.icon}</div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-semibold text-sm truncate">M{mod.id}: {mod.title}</p>
                <p className="text-wl-gray text-xs">{mod.lessons} aulas · {mod.duration}</p>
              </div>
              <div className="flex gap-2">
                <button className="p-2 rounded-lg text-wl-gray hover:text-wl-blue transition-colors"><Edit size={14}/></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === "Vendas" && (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            {[{ label:"Vendas hoje", value:"47", color:"#0066ff" },{ label:"Receita hoje", value:"R$ 23.359", color:"#10b981" },{ label:"Ticket médio", value:"R$ 497", color:"#f59e0b" }].map((s,i) => (
              <div key={i} className="card-wl p-5 text-center">
                <p className="text-3xl font-black" style={{ color:s.color }}>{s.value}</p>
                <p className="text-wl-gray text-sm mt-1">{s.label}</p>
              </div>
            ))}
          </div>
          <div className="card-wl p-6">
            <h3 className="text-white font-bold mb-4">Últimas vendas</h3>
            <div className="space-y-3">
              {["Ana Lima · R$ 497 · Cartão","Marcos Silva · R$ 497 · PIX","Paula Souza · R$ 497 · Cartão","Diego Ferreira · R$ 497 · PIX","Camila Rocha · R$ 497 · Cartão"].map((sale,i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl" style={{ background:"rgba(17,17,39,0.4)" }}>
                  <span className="text-wl-white text-sm">{sale}</span>
                  <span className="text-green-400 text-xs">{i===0?"agora":i===1?"2min atrás":i===2?"5min atrás":i===3?"12min atrás":"28min atrás"}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  )
}
