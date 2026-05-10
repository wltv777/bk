import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Copy, Check, Search, Filter, Star } from 'lucide-react'
import AppLayout from '../components/AppLayout'
import { COPY_PASTE_CONTENT } from '../data/promptsData'
import toast from 'react-hot-toast'

const CATEGORIES = [
  { id: 'all', label: 'Todos', icon: '⚡' },
  { id: 'stories', label: 'Stories', icon: '📸' },
  { id: 'legendas', label: 'Legendas', icon: '✍️' },
  { id: 'whatsapp', label: 'WhatsApp', icon: '💬' },
  { id: 'headlines', label: 'Headlines', icon: '📢' },
  { id: 'ctas', label: 'CTAs', icon: '🚀' },
  { id: 'reels', label: 'Reels', icon: '🎬' },
  { id: 'scripts', label: 'Scripts', icon: '📋' },
]

const CAT_COLORS = {
  stories: '#ec4899',
  legendas: '#7c3aed',
  whatsapp: '#25d366',
  headlines: '#f59e0b',
  ctas: '#0066ff',
  reels: '#ec4899',
  scripts: '#10b981',
}

function CopyCard({ item }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(item.content)
    setCopied(true)
    toast.success('Conteúdo copiado! 📋')
    setTimeout(() => setCopied(false), 2000)
  }

  const color = CAT_COLORS[item.category] || '#0066ff'

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="card-wl p-5 flex flex-col gap-4 h-full"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <span className="text-xs font-bold px-2 py-0.5 rounded-full mb-2 inline-block"
            style={{ background: `${color}20`, color, border: `1px solid ${color}40` }}>
            {CATEGORIES.find(c => c.id === item.category)?.icon} {item.category.charAt(0).toUpperCase() + item.category.slice(1)}
          </span>
          <h3 className="font-bold text-white text-sm">{item.title}</h3>
        </div>
        <div className="flex items-center gap-1 text-xs text-wl-gray shrink-0">
          <Copy size={11} />
          {(item.copies || 0).toLocaleString('pt-BR')}x
        </div>
      </div>

      {/* Content preview */}
      <div className="flex-1 p-4 rounded-xl text-sm text-wl-gray whitespace-pre-line leading-relaxed overflow-hidden max-h-48 relative"
        style={{ background: 'rgba(8,8,16,0.5)', border: '1px solid rgba(30,30,58,0.6)' }}>
        <div className="line-clamp-6">{item.content}</div>
        <div className="absolute bottom-0 left-0 right-0 h-8" style={{ background: 'linear-gradient(to top, rgba(17,17,39,0.9), transparent)' }} />
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-1.5">
        {item.tags?.map(tag => (
          <span key={tag} className="text-xs px-2 py-0.5 rounded-full text-wl-gray border border-wl-border">#{tag}</span>
        ))}
      </div>

      {/* Copy button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        onClick={handleCopy}
        className={`w-full py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${
          copied
            ? 'bg-green-500/20 border border-green-500/40 text-green-400'
            : 'bg-wl-blue/10 border border-wl-blue/30 text-wl-blue hover:bg-wl-blue/20'
        }`}
      >
        {copied ? <><Check size={15} /> Copiado!</> : <><Copy size={15} /> Copiar conteúdo</>}
      </motion.button>
    </motion.div>
  )
}

export default function CopyPasteLibrary() {
  const [activeCategory, setActiveCategory] = useState('all')
  const [search, setSearch] = useState('')

  const filtered = COPY_PASTE_CONTENT.filter(item => {
    const matchCat = activeCategory === 'all' || item.category === activeCategory
    const matchSearch = !search || item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.content.toLowerCase().includes(search.toLowerCase()) ||
      item.tags?.some(t => t.toLowerCase().includes(search.toLowerCase()))
    return matchCat && matchSearch
  })

  const totalCopies = COPY_PASTE_CONTENT.reduce((a, c) => a + (c.copies || 0), 0)

  return (
    <AppLayout title="Biblioteca Copy & Paste" subtitle="Conteúdo pronto para usar — copie e publique">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Templates prontos', value: COPY_PASTE_CONTENT.length },
            { label: 'Total de cópias', value: totalCopies.toLocaleString('pt-BR') },
            { label: 'Categorias', value: CATEGORIES.length - 1 },
          ].map(s => (
            <div key={s.label} className="card-wl p-4 text-center">
              <div className="text-2xl font-black gradient-text">{s.value}</div>
              <div className="text-xs text-wl-gray mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Search */}
        <div className="relative">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-wl-gray" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por título, conteúdo ou tag..."
            className="input-wl pl-11"
          />
        </div>

        {/* Category filter */}
        <div className="flex gap-2 flex-wrap">
          {CATEGORIES.map(cat => (
            <button key={cat.id} onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                activeCategory === cat.id
                  ? 'bg-wl-blue text-white'
                  : 'text-wl-gray border border-wl-border hover:border-wl-blue/40 hover:text-white'
              }`}>
              {cat.icon} {cat.label}
              {cat.id !== 'all' && (
                <span className="text-xs opacity-60">
                  {COPY_PASTE_CONTENT.filter(i => i.category === cat.id).length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Grid */}
        <AnimatePresence mode="wait">
          {filtered.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="text-center py-20 text-wl-gray">
              <Copy size={40} className="mx-auto mb-4 opacity-30" />
              <p>Nenhum conteúdo encontrado.</p>
            </motion.div>
          ) : (
            <motion.div layout className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
              {filtered.map(item => <CopyCard key={item.id} item={item} />)}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AppLayout>
  )
}
