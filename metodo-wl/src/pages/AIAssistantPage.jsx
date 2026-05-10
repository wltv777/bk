import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Copy, Check, Zap, Sparkles, RefreshCw } from 'lucide-react'
import AppLayout from '../components/AppLayout'
import { useApp } from '../context/AppContext'
import toast from 'react-hot-toast'

const QUICK_PROMPTS = [
  { label: 'Criar legenda', prompt: 'Crie uma legenda poderosa para um post de [SEU TEMA] que gere muito engajamento', icon: '✍️' },
  { label: 'Script de venda', prompt: 'Crie um script de vendas persuasivo para WhatsApp do meu produto de [SEU NICHO]', icon: '💰' },
  { label: 'Roteiro de Reel', prompt: 'Crie um roteiro viral de Reel de 30-60 segundos sobre [SEU TEMA]', icon: '🎬' },
  { label: 'Calendário de conteúdo', prompt: 'Crie um calendário de conteúdo de 7 dias para o nicho de [SEU NICHO]', icon: '📅' },
  { label: 'Bio do Instagram', prompt: 'Crie uma bio irresistível para o Instagram do meu negócio de [SEU NICHO]', icon: '📱' },
  { label: 'Stories de venda', prompt: 'Crie uma sequência de 5 stories para vender [SEU PRODUTO]', icon: '🔥' },
]

const SIDEBAR_PROMPTS = [
  { title: 'Marketing Digital', prompts: ['Estratégia de conteúdo', 'Análise de concorrentes', 'Funil de vendas'] },
  { title: 'Instagram', prompts: ['Hook de Reel', 'Carrossel viral', 'Story sequência'] },
  { title: 'Copywriting', prompts: ['Headline poderosa', 'CTA urgência', 'Objeções copy'] },
  { title: 'IA & Automação', prompts: ['Prompt de imagem', 'Sequência e-mail', 'Chatbot script'] },
]

function MessageBubble({ msg }) {
  const [copied, setCopied] = useState(false)
  const isUser = msg.role === 'user'

  const copy = () => {
    navigator.clipboard.writeText(msg.content)
    setCopied(true)
    toast.success('Copiado!')
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
      <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-sm ${
        isUser ? 'bg-wl-blue text-white' : 'bg-gradient-to-br from-wl-purple to-wl-blue text-white'
      }`}>
        {isUser ? '👤' : '🤖'}
      </div>
      <div className={`flex-1 max-w-[80%] ${isUser ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
        <div className={`rounded-2xl p-4 text-sm leading-relaxed whitespace-pre-wrap ${
          isUser
            ? 'bg-wl-blue text-white rounded-tr-sm'
            : 'card-wl text-wl-white rounded-tl-sm'
        }`}>
          {msg.content}
        </div>
        {!isUser && (
          <button onClick={copy} className={`copy-btn text-xs flex items-center gap-1.5 ${copied ? 'copied' : ''}`}>
            {copied ? <><Check size={12} /> Copiado!</> : <><Copy size={12} /> Copiar resposta</>}
          </button>
        )}
      </div>
    </motion.div>
  )
}

function TypingIndicator() {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex gap-3">
      <div className="w-8 h-8 rounded-xl flex items-center justify-center text-sm shrink-0" style={{ background: 'linear-gradient(135deg, #7c3aed, #0066ff)' }}>🤖</div>
      <div className="card-wl px-5 py-4 rounded-2xl rounded-tl-sm">
        <div className="flex items-center gap-1">
          <div className="typing-dot" />
          <div className="typing-dot" />
          <div className="typing-dot" />
        </div>
      </div>
    </motion.div>
  )
}

export default function AIAssistantPage() {
  const { aiMessages, sendAiMessage } = useApp()
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [aiMessages, loading])

  const send = async (text) => {
    const msg = (text || input).trim()
    if (!msg) return
    setInput('')
    setLoading(true)
    try {
      await sendAiMessage(msg)
    } finally {
      setLoading(false)
      inputRef.current?.focus()
    }
  }

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  return (
    <AppLayout title="IA Assistente WL" subtitle="Sua IA especializada em marketing digital e criação de conteúdo">
      <div className="max-w-7xl mx-auto h-[calc(100vh-130px)] flex gap-6">
        {/* Sidebar */}
        <div className="hidden xl:flex flex-col w-64 shrink-0 gap-4">
          <div className="card-wl p-4 flex-1 overflow-y-auto">
            <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
              <Sparkles size={14} className="text-wl-gold" /> Prompts sugeridos
            </h3>
            <div className="space-y-5">
              {SIDEBAR_PROMPTS.map(cat => (
                <div key={cat.title}>
                  <p className="text-xs text-wl-gray/60 uppercase tracking-wider mb-2">{cat.title}</p>
                  <div className="space-y-1">
                    {cat.prompts.map(p => (
                      <button key={p} onClick={() => send(p)}
                        className="w-full text-left text-xs text-wl-gray hover:text-white p-2 rounded-lg hover:bg-white/5 transition-colors">
                        → {p}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Chat area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Quick prompts */}
          <div className="flex gap-2 mb-4 flex-wrap">
            {QUICK_PROMPTS.map(qp => (
              <motion.button key={qp.label} whileHover={{ scale: 1.03 }} onClick={() => setInput(qp.prompt)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-all"
                style={{ background: 'rgba(0,102,255,0.08)', border: '1px solid rgba(0,102,255,0.2)', color: '#8892a4' }}>
                <span>{qp.icon}</span>
                <span>{qp.label}</span>
              </motion.button>
            ))}
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto space-y-4 pr-1 mb-4">
            {aiMessages.map((msg, i) => (
              <MessageBubble key={i} msg={msg} />
            ))}
            {loading && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="card-wl p-3 flex items-end gap-3">
            <div className="flex-1">
              <textarea
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKey}
                placeholder="Digite sua mensagem... (Enter para enviar, Shift+Enter para nova linha)"
                className="w-full bg-transparent outline-none text-sm text-white placeholder-wl-gray resize-none max-h-32"
                rows={1}
                style={{ lineHeight: '1.5' }}
                onInput={e => {
                  e.target.style.height = 'auto'
                  e.target.style.height = Math.min(e.target.scrollHeight, 128) + 'px'
                }}
              />
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs text-wl-gray hidden md:block">Enter ↵</span>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => send()}
                disabled={!input.trim() || loading}
                className="w-10 h-10 rounded-xl flex items-center justify-center transition-all disabled:opacity-40"
                style={{ background: input.trim() && !loading ? 'linear-gradient(135deg, #0066ff, #7c3aed)' : 'rgba(30,30,58,0.8)' }}>
                {loading ? <RefreshCw size={18} className="text-white animate-spin" /> : <Send size={18} className="text-white" />}
              </motion.button>
            </div>
          </div>

          <p className="text-center text-xs text-wl-gray/40 mt-2">
            IA WL especializada em marketing digital, copywriting, Reels e estratégias de vendas
          </p>
        </div>
      </div>
    </AppLayout>
  )
}
