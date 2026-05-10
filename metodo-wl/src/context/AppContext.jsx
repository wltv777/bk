import { createContext, useContext, useState } from 'react'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [notifications, setNotifications] = useState([
    { id: 1, type: 'achievement', message: 'Você desbloqueou a conquista "7 dias seguidos"!', time: '2min', read: false },
    { id: 2, type: 'module', message: 'Módulo 4 desbloqueado! IA no Marketing está disponível.', time: '1h', read: false },
    { id: 3, type: 'community', message: 'Rafael comentou no seu post da comunidade.', time: '3h', read: true },
    { id: 4, type: 'xp', message: 'Você ganhou 150 XP por completar o módulo 2!', time: '1d', read: true },
  ])
  const [aiMessages, setAiMessages] = useState([
    { role: 'assistant', content: 'Olá! Sou a IA do MÉTODO WL 🤖 Estou aqui para te ajudar a criar conteúdo incrível, copys que vendem, roteiros de Reels e muito mais. O que você precisa hoje?' }
  ])
  const [currentPage, setCurrentPage] = useState('dashboard')
  const [searchQuery, setSearchQuery] = useState('')

  const markNotificationRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
  }

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

  const addNotification = (notification) => {
    setNotifications(prev => [{ ...notification, id: Date.now(), time: 'agora', read: false }, ...prev])
  }

  const sendAiMessage = async (message) => {
    const userMsg = { role: 'user', content: message }
    setAiMessages(prev => [...prev, userMsg])

    await new Promise(r => setTimeout(r, 1200))

    const responses = {
      'legenda': `Aqui está uma legenda poderosa para você:\n\n**"${message}"**\n\n---\n\n📌 *Você sabia que 87% das pessoas que tentam [NICHO] desistem antes de ver resultado?*\n\nO motivo é simples: elas não têm o método certo.\n\nEu comecei do zero. Sem seguidores. Sem audiência. Sem dinheiro para anúncios.\n\nHoje, [RESULTADO INCRÍVEL].\n\nE o segredo foi [SEU MÉTODO].\n\nComenta **"QUERO"** que eu te conto mais 👇\n\n#MarketingDigital #EmpreendedorDigital #MetodoWL`,
      'copy': `**COPY DE ALTA CONVERSÃO:**\n\n---\n\n🔥 **[HEADLINE PODEROSA]**\n\nVocê está cansado de [DOR DO CLIENTE]?\n\nEu sei exatamente como você se sente. Por [TEMPO], eu também passei por isso.\n\nAté que descobri [SEU PRODUTO/MÉTODO].\n\nEm [PRAZO], consegui [RESULTADO].\n\nE hoje já ajudei mais de [NÚMERO] pessoas a conquistar o mesmo.\n\n✅ [BENEFÍCIO 1]\n✅ [BENEFÍCIO 2]  \n✅ [BENEFÍCIO 3]\n\nGarantia de [X dias] ou seu dinheiro de volta.\n\n👉 [CTA] — Clique no link abaixo AGORA`,
      'reel': `**🎬 ROTEIRO DE REEL VIRAL:**\n\n**HOOK (0-3s):**\n"Para tudo. Você precisa ver isso sobre [TEMA]"\n\n**PROBLEMA (3-15s):**\nMostra o problema que sua audiência tem com [TEMA]. Seja específico e emocional.\n\n**VIRADA (15-35s):**\nApresenta a solução surpreendente que poucos conhecem. Use dados se possível.\n\n**RESULTADO (35-50s):**\nMostra o que acontece quando você aplica a solução. Seja visual.\n\n**CTA (50-60s):**\n"Salva esse vídeo, você vai precisar. E segue para mais conteúdo como esse 🔥"\n\n**LEGENDA:** [Adiciona curiosidade sobre o tema]\n**HASHTAGS:** #[nicho] #[tema] #MetodoWL`,
    }

    const key = Object.keys(responses).find(k => message.toLowerCase().includes(k))
    const reply = key ? responses[key] : `Entendi! Vou criar o conteúdo sobre **"${message}"** para você.\n\nCom base no seu nicho e público-alvo, aqui está minha sugestão:\n\n---\n\n📱 **Conteúdo gerado pela IA WL:**\n\n${message.length > 20 ? message : 'Descreva melhor o que você precisa (legenda, copy, reel, story, script, calendário) e vou gerar algo incrível para você! 🚀'}\n\n---\n\n💡 *Dica: Quanto mais detalhes você me der sobre seu nicho, produto e público, melhor será o resultado!*`

    setAiMessages(prev => [...prev, { role: 'assistant', content: reply }])
  }

  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <AppContext.Provider value={{
      sidebarOpen,
      setSidebarOpen,
      notifications,
      unreadCount,
      markNotificationRead,
      markAllRead,
      addNotification,
      aiMessages,
      setAiMessages,
      sendAiMessage,
      currentPage,
      setCurrentPage,
      searchQuery,
      setSearchQuery,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
