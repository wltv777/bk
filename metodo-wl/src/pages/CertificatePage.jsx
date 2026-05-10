
import AppLayout from "../components/AppLayout"
import { useAuth } from "../context/AuthContext"
import { Award, Download, Share2, Lock } from "lucide-react"
import toast from "react-hot-toast"

export default function CertificatePage() {
  const { user } = useAuth()
  const progress = user?.totalProgress || 0
  const eligible = progress >= 80

  return (
    <AppLayout title="Certificado" subtitle="Seu diploma digital do MÉTODO WL">
      <div className="max-w-3xl mx-auto">
        {!eligible ? (
          <div className="card-wl p-12 text-center">
            <Lock size={48} className="text-wl-gray mx-auto mb-4" />
            <h2 className="text-white font-bold text-xl mb-2">Certificado bloqueado</h2>
            <p className="text-wl-gray mb-4">Complete pelo menos 80% do curso para desbloquear seu certificado.</p>
            <div className="max-w-xs mx-auto">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-wl-gray">Progresso atual</span>
                <span className="text-white font-bold">{progress}%</span>
              </div>
              <div className="h-3 rounded-full bg-wl-border overflow-hidden">
                <div className="h-full rounded-full" style={{ width:`${progress}%`, background:"linear-gradient(90deg,#0066ff,#7c3aed)" }} />
              </div>
              <p className="text-wl-gray text-xs mt-2">Faltam {80-progress}% para desbloquear</p>
            </div>
          </div>
        ) : (
          <>
            {/* Certificate */}
            <div className="p-10 rounded-3xl text-center mb-6 relative overflow-hidden"
              style={{ background:"linear-gradient(135deg, #111127, #0d0d1a)", border:"2px solid rgba(245,158,11,0.3)", boxShadow:"0 0 60px rgba(245,158,11,0.1)" }}>
              <div className="absolute top-0 left-0 right-0 h-1" style={{ background:"linear-gradient(90deg,#0066ff,#7c3aed,#f59e0b)" }} />
              <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl"
                style={{ background:"linear-gradient(135deg,#f59e0b,#fbbf24)" }}>🏆</div>
              <p className="text-wl-gold text-sm font-semibold uppercase tracking-widest mb-3">Certificado de Conclusão</p>
              <h1 className="text-4xl font-black text-white mb-3" style={{ fontFamily:"Plus Jakarta Sans" }}>MÉTODO WL</h1>
              <p className="text-wl-gray mb-6">Certificamos que</p>
              <h2 className="text-3xl font-bold gradient-text mb-6">{user?.name}</h2>
              <p className="text-wl-gray max-w-md mx-auto mb-8">concluiu com sucesso o programa completo de Marketing Digital com IA, demonstrando domínio das estratégias e ferramentas mais avançadas do mercado.</p>
              <div className="flex items-center justify-center gap-8 pt-6 border-t border-wl-border">
                <div className="text-center"><p className="text-white font-bold">WL</p><p className="text-wl-gray text-xs">Fundador</p></div>
                <div className="text-center"><p className="text-wl-gray text-xs">{new Date().toLocaleDateString("pt-BR")}</p><p className="text-wl-gray text-xs">Data de emissão</p></div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-1" style={{ background:"linear-gradient(90deg,#f59e0b,#7c3aed,#0066ff)" }} />
            </div>
            <div className="flex gap-3">
              <button onClick={() => toast.success("Download iniciado!")} className="btn-primary flex-1 flex items-center justify-center gap-2"><Download size={18}/>Baixar PDF</button>
              <button onClick={() => toast.success("Link copiado para compartilhar!")} className="btn-ghost flex items-center gap-2"><Share2 size={18}/>Compartilhar</button>
            </div>
          </>
        )}
      </div>
    </AppLayout>
  )
}
