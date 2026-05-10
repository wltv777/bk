import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Copy, Check, Search, Zap } from 'lucide-react'
import AppLayout from '../components/AppLayout'
import { PROMPT_CATEGORIES } from '../data/promptsData'
import toast from 'react-hot-toast'

function PromptCard({ prompt }) {
  const [copied, setCopied] = useState(false)
  const [expanded, setExpanded] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(prompt.prompt)
    setCopied(true)
    toast.success('Prompt copiado! Cole no ChatGPT ou Claude 🤖')
    setTimeout(() => setCopied(false), 2500)
  }

  return (
    <motion.div layout initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
      className="card-wl p-5 flex flex-col gap-3 hover:border-wl-blue/30 transition-all">
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-bold text-white text-sm leading-snug">{prompt.title}</h3>
        <div className="flex items-center gap-1 text-xs text-wl-gray shrink-0">
          <Zap size={11} className="text-wl-gold" />
          {prompt.uses?.toLocaleString('pt-BR')}
        </div>
      </div>

      <div className="relative">
        <p className={`text-wl-gray text-xs leading-relaxed ${expanded ? '' : 'line-clamp-3'}`}>
          {prompt.prompt}
        </p>
        {!expanded && (
          <button onClick={() => setExpanded(true)} className="text-xs text-wl-blue hover:underline mt-1">
            Ver completo
          </button>
        )}
        {expanded && (
          <button onClick={() => setExpanded(false)} className="text-xs text-wl-blue hover:underline mt-1">
            Recolher
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-1.5">
        {prompt.tags?.map(tag => (
          <span key={tag} className="text-xs px-2 py-0.5 rounded-full border border-wl-border text-wl-gray">
            #{tag}
          </span>
        ))}
      </div>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        onClick={handleCopy}
        className={`w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
          copied
            ? 'bg-green-500/20 border border-green-500/40 text-green-400'
            : 'btn-primary py-2.5'
        }`}
      >
        {copied ? <><Check size={13} /> Copiado!</> : <><Copy size={13} /> Usar Prompt</>}
      </motion.button>
    </motion.div>
  )
}

export default function WLPrompts() {
  const [activeCategory, setActiveCategory] = useState(PROMPT_CATEGORIES[0].id)
  const [search, setSearch] = useState('')

  const currentCat = PROMPT_CATEGORIES.find(c => c.id === activeCategory)

  const filteredPrompts = search
    ? PROMPT_CATEGORIES.flatMap(c => c.prompts).filter(p =>
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.prompt.toLowerCase().includes(search.toLowerCase()) ||
        p.tags?.some(t => t.toLowerCase().includes(search.toLowerCase()))
      )
    : currentCat?.prompts || []

  const totalPrompts = PROMPT_CATEGORIES.reduce((a, c) => a + c.prompts.length, 0)
  const totalUses = PROMPT_CATEGORIES.flatMap(c => c.prompts).reduce((a, p) => a + (p.uses || 0), 0)

  return (
    <AppLayout title="WL Prompts" subtitle="Biblioteca de prompts testados e aprovados">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Prompts disponíveis', value: totalPrompts },
            { label: 'Total de usos', value: totalUses.toLocaleString('pt-BR') },
            { label: 'Categorias', value: PROMPT_CATEGORIES.length },
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
            placeholder="Buscar prompts por título, descrição ou tag..."
            className="input-wl pl-11"
          />
        </div>

        {/* Category tabs */}
        {!search && (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {PROMPT_CATEGORIES.map(cat => (
              <button key={cat.id} onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap shrink-0 ${
                  activeCategory === cat.id
                    ? 'text-white'
                    : 'text-wl-gray border border-wl-border hover:border-wl-blue/40 hover:text-white'
                }`}
                style={activeCategory === cat.id ? { background: `${cat.color}20`, border: `1px solid ${cat.color}50`, color: cat.color } : {}}>
                <span>{cat.icon}</span>
                {cat.label}
                <span className="text-xs opacity-60">({cat.prompts.length})</span>
              </button>
            ))}
          </div>
        )}

        {/* Category description */}
        {!search && currentCat && (
          <div className="flex items-center gap-3 p-4 rounded-xl" style={{ background: `${currentCat.color}10`, border: `1px solid ${currentCat.color}25` }}>
            <span className="text-2xl">{currentCat.icon}</span>
            <div>
              <h3 className="font-bold text-white">{currentCat.label}</h3>
              <p className="text-wl-gray text-sm">{currentCat.prompts.length} prompts nesta categoria</p>
            </div>
          </div>
        )}

        {/* Search results label */}
        {search && (
          <p className="text-wl-gray text-sm">{filteredPrompts.length} resultado(s) para "{search}"</p>
        )}

        {/* Prompts grid */}
        <AnimatePresence mode="wait">
          {filteredPrompts.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="text-center py-20 text-wl-gray">
              <Search size={40} className="mx-auto mb-4 opacity-30" />
              <p>Nenhum prompt encontrado.</p>
            </motion.div>
          ) : (
            <motion.div layout className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
              {filteredPrompts.map(prompt => <PromptCard key={prompt.id} prompt={prompt} />)}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AppLayout>
  )
}
