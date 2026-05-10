
import { useState } from "react"
import AppLayout from "../components/AppLayout"
import { useAuth } from "../context/AuthContext"
import { Heart, MessageCircle, Share2, Trophy, Send, Image } from "lucide-react"
import toast from "react-hot-toast"

const POSTS = [
  { id:1, user:"Mariana Costa", avatar:"https://randomuser.me/api/portraits/women/32.jpg", badge:"Gold WL", time:"2h", content:"Acabei de fechar minha primeira venda usando o script do módulo 8! R$ 1.200 em 24 horas 🔥 O método realmente funciona!", likes:47, comments:12, result:"R$1.200 em 24h" },
  { id:2, user:"Rafael Mendonça", avatar:"https://randomuser.me/api/portraits/men/45.jpg", badge:"Black WL", time:"5h", content:"Meu Reel usando a fórmula do módulo 3 chegou em 800K views! Ganhei 3.200 seguidores em 48 horas. Quem tiver dúvidas sobre hooks, me chama!", likes:89, comments:31, result:"800K views no Reel" },
  { id:3, user:"Letícia Ferreira", avatar:"https://randomuser.me/api/portraits/women/67.jpg", badge:"Silver WL", time:"1d", content:"Usei o Gerador de Reels Virais da plataforma e criou um roteiro INCRÍVEL. Nunca fui tão consistente no conteúdo. Obrigada equipe WL! 💎", likes:34, comments:8 },
  { id:4, user:"Carlos Alberto", avatar:"https://randomuser.me/api/portraits/men/28.jpg", badge:"Gold WL", time:"2d", content:"Aviso importante: se você ainda não fez o módulo de copywriting, pare tudo e faz agora. Escrevi minha primeira copy ontem e já gerou R$ 3.400 em pedidos!", likes:62, comments:19, result:"R$3.400 em pedidos" },
]

const RANKING = [
  { pos:1, name:"Rafael M.", xp:"47.200", avatar:"https://randomuser.me/api/portraits/men/45.jpg" },
  { pos:2, name:"Mariana C.", xp:"38.900", avatar:"https://randomuser.me/api/portraits/women/32.jpg" },
  { pos:3, name:"Carlos A.", xp:"29.100", avatar:"https://randomuser.me/api/portraits/men/28.jpg" },
  { pos:4, name:"Letícia F.", xp:"21.500", avatar:"https://randomuser.me/api/portraits/women/67.jpg" },
  { pos:5, name:"Amanda S.", xp:"18.200", avatar:"https://randomuser.me/api/portraits/women/15.jpg" },
]

export default function CommunityPage() {
  const { user } = useAuth()
  const [postText, setPostText] = useState("")
  const [liked, setLiked] = useState({})

  const sendPost = () => {
    if (!postText.trim()) return
    toast.success("Post publicado! +50 XP 🎉")
    setPostText("")
  }

  return (
    <AppLayout title="Comunidade WL" subtitle="Conecte-se, compartilhe resultados e cresça junto">
      <div className="max-w-5xl mx-auto grid lg:grid-cols-3 gap-6">
        {/* Feed */}
        <div className="lg:col-span-2 space-y-4">
          {/* Post composer */}
          <div className="card-wl p-5">
            <div className="flex gap-3">
              <img src={user?.avatar} alt="" className="w-10 h-10 rounded-full shrink-0" />
              <div className="flex-1">
                <textarea value={postText} onChange={e => setPostText(e.target.value)}
                  placeholder="Compartilhe seu resultado, dúvida ou aprendizado com a comunidade..."
                  rows={3} className="input-wl w-full resize-none text-sm mb-3" />
                <div className="flex items-center justify-between">
                  <button className="text-wl-gray hover:text-white transition-colors">
                    <Image size={18} />
                  </button>
                  <button onClick={sendPost} className="btn-primary py-2 px-5 text-sm flex items-center gap-2">
                    <Send size={14} /> Publicar
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Posts */}
          {POSTS.map(post => (
            <div key={post.id} className="card-wl p-5">
              <div className="flex items-start gap-3 mb-4">
                <img src={post.avatar} alt="" className="w-10 h-10 rounded-full" />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-white font-semibold text-sm">{post.user}</span>
                    <span className="px-2 py-0.5 rounded text-xs font-bold" style={{ background: "rgba(245,158,11,0.15)", color: "#fbbf24" }}>{post.badge}</span>
                    <span className="text-wl-gray text-xs">{post.time}</span>
                  </div>
                  {post.result && <p className="text-green-400 text-xs mt-0.5">🎯 {post.result}</p>}
                </div>
              </div>
              <p className="text-wl-gray text-sm leading-relaxed mb-4">{post.content}</p>
              <div className="flex items-center gap-6 text-wl-gray text-sm">
                <button onClick={() => setLiked(l => ({ ...l, [post.id]: !l[post.id] }))}
                  className="flex items-center gap-1.5 hover:text-red-400 transition-colors">
                  <Heart size={16} fill={liked[post.id] ? "#ef4444" : "none"} className={liked[post.id] ? "text-red-400" : ""} />
                  {post.likes + (liked[post.id] ? 1 : 0)}
                </button>
                <button className="flex items-center gap-1.5 hover:text-wl-blue transition-colors">
                  <MessageCircle size={16} /> {post.comments}
                </button>
                <button className="flex items-center gap-1.5 hover:text-wl-purple transition-colors">
                  <Share2 size={16} /> Compartilhar
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="card-wl p-5">
            <h3 className="text-white font-bold mb-4 flex items-center gap-2"><Trophy size={16} className="text-wl-gold" /> Ranking WL</h3>
            <div className="space-y-3">
              {RANKING.map(member => (
                <div key={member.pos} className="flex items-center gap-3">
                  <span className="w-6 text-center text-sm font-bold" style={{ color: member.pos === 1 ? "#ffd700" : member.pos === 2 ? "#c0c0c0" : member.pos === 3 ? "#cd7f32" : "#8892a4" }}>
                    #{member.pos}
                  </span>
                  <img src={member.avatar} alt="" className="w-8 h-8 rounded-full" />
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-semibold truncate">{member.name}</p>
                    <p className="text-wl-gray text-xs">{member.xp} XP</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card-wl p-5">
            <h3 className="text-white font-bold mb-3">🏆 Conquistas recentes</h3>
            <div className="space-y-2 text-sm text-wl-gray">
              <p><span className="text-yellow-400">Mariana C.</span> desbloqueou "Primeira Venda"</p>
              <p><span className="text-blue-400">Rafael M.</span> atingiu nível Black WL</p>
              <p><span className="text-purple-400">Carlos A.</span> completou 30 dias seguidos</p>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
