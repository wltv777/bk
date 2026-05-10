export function formatXP(xp) {
  if (xp >= 1000) return `${(xp / 1000).toFixed(1)}K`
  return xp.toString()
}

export function getLevelFromXP(xp) {
  return Math.floor(xp / 1000) + 1
}

export function getXPProgress(xp) {
  return ((xp % 1000) / 1000) * 100
}

export function getVIPLevel(xp) {
  if (xp >= 10000) return { label: 'Black WL', color: '#ffd700', bg: 'linear-gradient(135deg, #1a1a1a, #333)' }
  if (xp >= 5000) return { label: 'Gold WL', color: '#000', bg: 'linear-gradient(135deg, #ffd700, #f59e0b)' }
  if (xp >= 2000) return { label: 'Silver WL', color: '#000', bg: 'linear-gradient(135deg, #c0c0c0, #a0a0a0)' }
  return { label: 'Bronze WL', color: '#fff', bg: 'linear-gradient(135deg, #cd7f32, #a0522d)' }
}

export function pad(n) {
  return n.toString().padStart(2, '0')
}

export function truncate(str, max = 100) {
  if (str.length <= max) return str
  return str.slice(0, max) + '...'
}

export const ACHIEVEMENTS = [
  { id: 'first_login', icon: '🎉', title: 'Bem-vindo ao MÉTODO WL', desc: 'Fez seu primeiro login', xp: 50 },
  { id: 'first_lesson', icon: '📖', title: 'Primeira Aula', desc: 'Completou sua primeira aula', xp: 100 },
  { id: 'module_1_complete', icon: '🏅', title: 'Fundamentos Dominados', desc: 'Completou o módulo 1', xp: 250 },
  { id: 'streak_7', icon: '🔥', title: '7 Dias Seguidos', desc: 'Manteve sequência de 7 dias', xp: 500 },
  { id: 'first_copy', icon: '✍️', title: 'Copywriter Iniciante', desc: 'Criou sua primeira copy', xp: 150 },
  { id: 'first_reel', icon: '🎬', title: 'Criador de Conteúdo', desc: 'Gerou seu primeiro roteiro de Reel', xp: 200 },
  { id: 'first_sale', icon: '💰', title: 'Primeira Venda', desc: 'Realizou sua primeira venda online', xp: 1000 },
  { id: 'instagram_analyzed', icon: '📱', title: 'Perfil Auditado', desc: 'Analisou seu Instagram com IA', xp: 100 },
  { id: 'offer_created', icon: '⚡', title: 'Oferta Milionária', desc: 'Criou sua primeira oferta com IA', xp: 300 },
  { id: 'streak_30', icon: '🌟', title: 'Mês Dedicado', desc: 'Manteve sequência de 30 dias', xp: 2000 },
  { id: 'all_modules', icon: '🏆', title: 'MÉTODO WL Master', desc: 'Completou todos os 12 módulos', xp: 5000 },
  { id: 'viral_reel', icon: '🚀', title: 'Criador Viral', desc: 'Criou um Reel com potencial viral', xp: 500 },
]
