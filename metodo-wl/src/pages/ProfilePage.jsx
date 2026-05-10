
import AppLayout from "../components/AppLayout"
import { useAuth } from "../context/AuthContext"
import { useState } from "react"
import { User, Edit3, Save, Camera } from "lucide-react"
import { ACHIEVEMENTS } from "../utils/helpers"
import toast from "react-hot-toast"

export default function ProfilePage() {
  const { user, updateUser } = useAuth()
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({ name: user?.name || "", email: user?.email || "" })

  const save = () => {
    updateUser(form)
    setEditing(false)
    toast.success("Perfil atualizado!")
  }

  const earned = ACHIEVEMENTS.filter(a => user?.badges?.includes(a.id))

  return (
    <AppLayout title="Meu Perfil" subtitle="Sua jornada no MÉTODO WL">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Profile card */}
        <div className="card-premium p-8">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="relative">
              <img src={user?.avatar} alt="" className="w-24 h-24 rounded-2xl ring-4 ring-wl-blue/30" />
              <button className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center" style={{ background:"linear-gradient(135deg,#0066ff,#7c3aed)" }}>
                <Camera size={14} className="text-white" />
              </button>
            </div>
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-2xl font-black text-white mb-1">{user?.name}</h2>
              <p className="text-wl-gray text-sm mb-2">{user?.email}</p>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold"
                style={{ background:"rgba(245,158,11,0.15)", color:"#fbbf24", border:"1px solid rgba(245,158,11,0.3)" }}>
                👑 {user?.vipLevel}
              </div>
            </div>
            <button onClick={() => editing ? save() : setEditing(true)}
              className="btn-primary flex items-center gap-2 text-sm py-2.5 px-5">
              {editing ? <><Save size={16}/>Salvar</> : <><Edit3 size={16}/>Editar</>}
            </button>
          </div>
          {editing && (
            <div className="mt-6 pt-6 border-t border-wl-border grid gap-4">
              <div><label className="text-wl-gray text-sm block mb-2">Nome</label><input value={form.name} onChange={e => setForm(f => ({...f, name:e.target.value}))} className="input-wl" /></div>
              <div><label className="text-wl-gray text-sm block mb-2">E-mail</label><input value={form.email} onChange={e => setForm(f => ({...f, email:e.target.value}))} className="input-wl" /></div>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[{ label:"XP Total", value:(user?.xp||0).toLocaleString()+"XP" },{ label:"Nível", value:`Nível ${user?.level||1}` },{ label:"Streak", value:`${user?.streak||0} dias 🔥` },{ label:"Conquistas", value:`${earned.length}/${ACHIEVEMENTS.length}` }].map((s,i) => (
            <div key={i} className="card-wl p-4 text-center">
              <p className="text-2xl font-black gradient-text">{s.value}</p>
              <p className="text-wl-gray text-xs mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Earned badges */}
        <div className="card-wl p-6">
          <h3 className="text-white font-bold mb-5 flex items-center gap-2"><User size={16}/>Conquistas desbloqueadas</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {ACHIEVEMENTS.map(ach => {
              const isEarned = user?.badges?.includes(ach.id)
              return (
                <div key={ach.id} className="p-4 rounded-xl flex items-center gap-3 transition-all"
                  style={{ background: isEarned ? "rgba(0,102,255,0.08)" : "rgba(17,17,39,0.4)", border:`1px solid ${isEarned ? "rgba(0,102,255,0.2)" : "rgba(30,30,58,0.4)"}`, opacity: isEarned ? 1 : 0.4 }}>
                  <span className="text-2xl">{ach.icon}</span>
                  <div>
                    <p className="text-white text-xs font-bold">{ach.title}</p>
                    <p className="text-wl-gold text-xs">+{ach.xp} XP</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
