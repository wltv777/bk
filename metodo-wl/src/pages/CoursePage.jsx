import { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Lock, Play, CheckCircle, Clock, BookOpen, Filter } from 'lucide-react'
import AppLayout from '../components/AppLayout'
import { MODULES } from '../data/courseData'

const FILTERS = [
  { id: 'all', label: 'Todos' },
  { id: 'in_progress', label: 'Em andamento' },
  { id: 'completed', label: 'Concluídos' },
  { id: 'locked', label: 'Bloqueados' },
]

export default function CoursePage() {
  const navigate = useNavigate()
  const [filter, setFilter] = useState('all')

  const filteredModules = MODULES.filter(m => {
    if (filter === 'all') return true
    if (filter === 'in_progress') return !m.locked && m.progress > 0 && m.progress < 100
    if (filter === 'completed') return m.progress === 100
    if (filter === 'locked') return m.locked
    return true
  })

  const totalLessons = MODULES.reduce((a, m) => a + m.lessons, 0)
  const completedModules = MODULES.filter(m => m.progress === 100).length

  return (
    <AppLayout title="Curso" subtitle="12 módulos completos de marketing digital">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Stats bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total de módulos', value: '12', icon: BookOpen, color: '#0066ff' },
            { label: 'Aulas no total', value: String(totalLessons), icon: Play, color: '#7c3aed' },
            { label: 'Módulos completos', value: String(completedModules), icon: CheckCircle, color: '#22c55e' },
            { label: 'Horas de conteúdo', value: '50h+', icon: Clock, color: '#f59e0b' },
          ].map(s => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="card-wl p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-wl-gray">{s.label}</span>
                <s.icon size={16} style={{ color: s.color }} />
              </div>
              <div className="text-3xl font-black text-white">{s.value}</div>
            </motion.div>
          ))}
        </div>

        {/* Filter tabs */}
        <div className="flex items-center gap-3 flex-wrap">
          <Filter size={16} className="text-wl-gray" />
          {FILTERS.map(f => (
            <button key={f.id} onClick={() => setFilter(f.id)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                filter === f.id
                  ? 'bg-wl-blue text-white'
                  : 'text-wl-gray hover:text-white border border-wl-border hover:border-wl-blue/40'
              }`}>
              {f.label}
            </button>
          ))}
        </div>

        {/* Module grid */}
        {filteredModules.length === 0 ? (
          <div className="text-center py-20 text-wl-gray">
            <BookOpen size={40} className="mx-auto mb-4 opacity-30" />
            <p>Nenhum módulo nessa categoria ainda.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredModules.map((m, i) => (
              <motion.div key={m.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                whileHover={m.locked ? {} : { y: -4 }}
                className={`card-wl overflow-hidden cursor-pointer transition-all ${m.locked ? 'opacity-60' : ''} ${m.progress === 100 ? 'border-green-500/30' : ''}`}
                onClick={() => !m.locked && navigate(`/aula/${m.id}/1.1`)}>

                {/* Thumbnail */}
                <div className="relative h-40 overflow-hidden">
                  <img src={m.thumbnail} alt={m.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.2), rgba(8,8,16,0.9))' }} />

                  {/* Status overlay */}
                  <div className="absolute top-3 left-3">
                    <span className="text-sm px-2 py-1 rounded-lg font-bold"
                      style={{ background: `${m.color}30`, border: `1px solid ${m.color}50`, color: m.color }}>
                      Módulo {m.id}
                    </span>
                  </div>

                  {m.locked ? (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.7)' }}>
                        <Lock size={22} className="text-wl-gray" />
                      </div>
                    </div>
                  ) : m.progress === 100 ? (
                    <div className="absolute top-3 right-3">
                      <CheckCircle size={22} className="text-green-400" />
                    </div>
                  ) : !m.locked && m.progress === 0 ? (
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                      <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: 'rgba(0,102,255,0.8)' }}>
                        <Play size={22} className="text-white ml-0.5" />
                      </div>
                    </div>
                  ) : null}

                  <div className="absolute bottom-2 right-3">
                    <span className="text-xs text-white/70">{m.duration}</span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5">
                  <div className="flex items-start gap-3 mb-3">
                    <span className="text-2xl shrink-0">{m.icon}</span>
                    <div>
                      <h3 className="font-bold text-white leading-snug">{m.title}</h3>
                      <p className="text-wl-gray text-xs mt-0.5">{m.subtitle}</p>
                    </div>
                  </div>

                  <p className="text-wl-gray text-sm mb-4 line-clamp-2 leading-relaxed">{m.description}</p>

                  <div className="flex items-center gap-4 text-xs text-wl-gray mb-4">
                    <span className="flex items-center gap-1"><Play size={12} /> {m.lessons} aulas</span>
                    <span className="flex items-center gap-1"><Clock size={12} /> {m.duration}</span>
                  </div>

                  {/* Progress bar */}
                  {!m.locked && (
                    <>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-wl-gray">Progresso</span>
                        <span className={m.progress === 100 ? 'text-green-400' : 'text-wl-blue'}>{m.progress}%</span>
                      </div>
                      <div className="progress-bar">
                        <motion.div className="progress-fill" initial={{ width: 0 }} animate={{ width: `${m.progress}%` }}
                          transition={{ duration: 1, delay: 0.3 + i * 0.05 }}
                          style={{ background: m.progress === 100 ? 'linear-gradient(90deg, #00ff88, #22c55e)' : undefined }} />
                      </div>
                    </>
                  )}

                  {m.locked && (
                    <div className="flex items-center gap-2 text-sm text-wl-gray mt-2">
                      <Lock size={14} />
                      <span>Complete os módulos anteriores para desbloquear</span>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  )
}
