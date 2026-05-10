import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate, useParams } from 'react-router-dom'
import { Play, ChevronLeft, ChevronRight, CheckCircle, Circle, Download, FileText, Pencil, Lock, Zap, BookOpen, X } from 'lucide-react'
import AppLayout from '../components/AppLayout'
import { useAuth } from '../context/AuthContext'
import { MODULES } from '../data/courseData'
import toast from 'react-hot-toast'

export default function LessonPage() {
  const navigate = useNavigate()
  const { moduleId, lessonId } = useParams()
  const { user, addXP } = useAuth()

  const module = MODULES.find(m => m.id === parseInt(moduleId)) || MODULES[0]
  const lessons = module?.lessons_list || []
  const currentLesson = lessons.find(l => l.id === lessonId) || lessons[0]
  const currentIndex = lessons.findIndex(l => l.id === (currentLesson?.id))

  const [watched, setWatched] = useState(lessons.reduce((acc, l) => ({ ...acc, [l.id]: l.watched }), {}))
  const [notes, setNotes] = useState('')
  const [checklist, setChecklist] = useState(module?.checklist?.reduce((acc, item) => ({ ...acc, [item]: false }), {}) || {})
  const [showNotes, setShowNotes] = useState(false)

  const markComplete = () => {
    if (!watched[currentLesson?.id]) {
      setWatched(prev => ({ ...prev, [currentLesson.id]: true }))
      addXP(50)
      toast.success('🎉 +50 XP — Aula concluída!', { icon: '⚡' })
    }
  }

  const goNext = () => {
    if (currentIndex < lessons.length - 1) {
      navigate(`/aula/${moduleId}/${lessons[currentIndex + 1].id}`)
    } else {
      toast.success('🏆 Módulo concluído! +200 XP')
      navigate('/curso')
    }
  }

  const goPrev = () => {
    if (currentIndex > 0) {
      navigate(`/aula/${moduleId}/${lessons[currentIndex - 1].id}`)
    }
  }

  const lessonTypeIcon = (type) => {
    if (type === 'exercise') return '📝'
    if (type === 'quiz') return '❓'
    return '▶️'
  }

  return (
    <AppLayout title={module?.title} subtitle={`Módulo ${moduleId} · ${lessons.length} aulas`}>
      <div className="max-w-7xl mx-auto">
        <div className="grid xl:grid-cols-3 gap-6">
          {/* Main content */}
          <div className="xl:col-span-2 space-y-6">
            {/* Video player */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="video-player group cursor-pointer"
              style={{ background: 'linear-gradient(135deg, #080810, #0d0d1a)', border: '1px solid rgba(0,102,255,0.15)' }}>
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                <motion.div whileHover={{ scale: 1.1 }} className="w-20 h-20 rounded-full flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, #0066ff, #7c3aed)', boxShadow: '0 0 40px rgba(0,102,255,0.5)' }}>
                  <Play size={32} className="text-white ml-1" />
                </motion.div>
                <div className="text-center px-4">
                  <p className="text-white font-bold">{currentLesson?.title}</p>
                  <p className="text-wl-gray text-sm">{currentLesson?.duration}</p>
                </div>
              </div>
              {/* Progress bar inside video */}
              <div className="absolute bottom-0 left-0 right-0 h-1" style={{ background: 'rgba(0,0,0,0.5)' }}>
                <div className="h-full w-0 bg-wl-blue" style={{ width: watched[currentLesson?.id] ? '100%' : '0%', transition: 'width 2s ease' }} />
              </div>
            </motion.div>

            {/* Lesson header */}
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card-wl p-6">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs text-wl-blue font-medium">{lessonTypeIcon(currentLesson?.type)} Aula {currentLesson?.id}</span>
                    {watched[currentLesson?.id] && <span className="text-xs text-green-400 font-medium flex items-center gap-1"><CheckCircle size={12} /> Concluída</span>}
                  </div>
                  <h1 className="text-xl font-bold text-white">{currentLesson?.title}</h1>
                  <p className="text-wl-gray text-sm mt-1">Duração: {currentLesson?.duration}</p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={markComplete}
                  disabled={watched[currentLesson?.id]}
                  className={`px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 shrink-0 transition-all ${
                    watched[currentLesson?.id]
                      ? 'bg-green-500/20 border border-green-500/30 text-green-400 cursor-not-allowed'
                      : 'btn-primary'
                  }`}
                >
                  {watched[currentLesson?.id] ? (
                    <><CheckCircle size={16} /> Concluída</>
                  ) : (
                    <><Zap size={16} /> Marcar como concluída</>
                  )}
                </motion.button>
              </div>

              <p className="text-wl-gray leading-relaxed text-sm">
                Nesta aula você vai aprender os conceitos e técnicas apresentadas em <strong className="text-white">{currentLesson?.title}</strong>.
                Assista ao vídeo completo e depois marque como concluída para ganhar seus XP e avançar para a próxima aula.
              </p>
            </motion.div>

            {/* Navigation */}
            <div className="flex items-center gap-4">
              <button onClick={goPrev} disabled={currentIndex === 0}
                className="flex items-center gap-2 btn-ghost flex-1 justify-center disabled:opacity-40 disabled:cursor-not-allowed">
                <ChevronLeft size={18} /> Aula anterior
              </button>
              <button onClick={goNext} className="flex items-center gap-2 btn-primary flex-1 justify-center py-3">
                {currentIndex === lessons.length - 1 ? 'Próximo módulo' : 'Próxima aula'} <ChevronRight size={18} />
              </button>
            </div>

            {/* Checklist */}
            {module?.checklist && module.checklist.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card-wl p-6">
                <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                  <CheckCircle size={18} className="text-green-400" />
                  Checklist do módulo
                </h3>
                <div className="space-y-3">
                  {module.checklist.map((item) => (
                    <label key={item} className="flex items-center gap-3 cursor-pointer group">
                      <input type="checkbox" checked={checklist[item] || false}
                        onChange={() => setChecklist(prev => ({ ...prev, [item]: !prev[item] }))}
                        className="hidden" />
                      <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all shrink-0 ${
                        checklist[item] ? 'bg-green-500 border-green-500' : 'border-wl-border group-hover:border-green-400'
                      }`}>
                        {checklist[item] && <CheckCircle size={12} className="text-white" />}
                      </div>
                      <span className={`text-sm ${checklist[item] ? 'line-through text-wl-gray' : 'text-white'}`}>{item}</span>
                    </label>
                  ))}
                </div>
              </motion.div>
            )}

            {/* PDF + Notes */}
            <div className="grid md:grid-cols-2 gap-4">
              <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="card-wl p-5">
                <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                  <FileText size={16} className="text-wl-blue" /> Material do módulo
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-xl" style={{ background: 'rgba(0,102,255,0.08)', border: '1px solid rgba(0,102,255,0.15)' }}>
                    <div className="flex items-center gap-2">
                      <FileText size={16} className="text-wl-blue" />
                      <span className="text-sm text-white">{module?.pdf}</span>
                    </div>
                    <button className="text-xs text-wl-blue hover:underline flex items-center gap-1"><Download size={12} /> PDF</button>
                  </div>
                  {module?.bonus && (
                    <div className="flex items-center justify-between p-3 rounded-xl" style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.15)' }}>
                      <div className="flex items-center gap-2">
                        <span className="text-sm">🎁</span>
                        <span className="text-sm text-white">{module?.bonus}</span>
                      </div>
                      <button className="text-xs text-wl-gold hover:underline flex items-center gap-1"><Download size={12} /> Baixar</button>
                    </div>
                  )}
                </div>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="card-wl p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-white flex items-center gap-2"><Pencil size={16} className="text-wl-purple" /> Minhas notas</h3>
                  {!showNotes && <button onClick={() => setShowNotes(true)} className="text-xs text-wl-blue">Abrir</button>}
                </div>
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Escreva suas anotações sobre esta aula..."
                  className="input-wl resize-none text-sm"
                  rows={4}
                />
                <button onClick={() => { toast.success('Notas salvas!'); }} className="mt-3 text-xs text-wl-blue hover:underline">Salvar notas</button>
              </motion.div>
            </div>
          </div>

          {/* Sidebar - lesson list */}
          <div>
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }} className="card-wl p-5 sticky top-24">
              <div className="flex items-center gap-2 mb-5">
                <BookOpen size={18} className="text-wl-blue" />
                <h2 className="font-bold text-white text-sm">Aulas do módulo {moduleId}</h2>
              </div>
              <div className="space-y-1 max-h-[60vh] overflow-y-auto pr-1">
                {lessons.map((lesson, idx) => (
                  <button key={lesson.id}
                    onClick={() => navigate(`/aula/${moduleId}/${lesson.id}`)}
                    className={`w-full flex items-start gap-3 p-3 rounded-xl text-left transition-all ${
                      lesson.id === currentLesson?.id
                        ? 'bg-wl-blue/15 border border-wl-blue/30'
                        : 'hover:bg-white/5'
                    }`}>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold ${
                      watched[lesson.id]
                        ? 'bg-green-500 text-white'
                        : lesson.id === currentLesson?.id
                          ? 'bg-wl-blue text-white'
                          : 'bg-wl-border text-wl-gray'
                    }`}>
                      {watched[lesson.id] ? '✓' : idx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-medium leading-snug ${lesson.id === currentLesson?.id ? 'text-white' : 'text-wl-gray'}`}>
                        {lesson.title}
                      </p>
                      <p className="text-xs text-wl-gray/60 mt-0.5">{lesson.duration}</p>
                    </div>
                  </button>
                ))}
              </div>

              {/* Module progress */}
              <div className="mt-5 pt-5 border-t border-wl-border">
                <div className="flex justify-between text-xs text-wl-gray mb-2">
                  <span>Progresso do módulo</span>
                  <span>{Object.values(watched).filter(Boolean).length}/{lessons.length} aulas</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${(Object.values(watched).filter(Boolean).length / lessons.length) * 100}%` }} />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
