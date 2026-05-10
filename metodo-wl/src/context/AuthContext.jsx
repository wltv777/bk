import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem('wl_user')
    if (stored) {
      try {
        setUser(JSON.parse(stored))
      } catch {
        localStorage.removeItem('wl_user')
      }
    }
    setLoading(false)
  }, [])

  const login = async (email, password) => {
    const mockUser = {
      id: 'usr_001',
      email,
      name: email.split('@')[0].charAt(0).toUpperCase() + email.split('@')[0].slice(1),
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
      role: 'student',
      plan: 'premium',
      joinedAt: new Date().toISOString(),
      xp: 2450,
      level: 4,
      streak: 7,
      vipLevel: 'Gold WL',
      completedModules: [1, 2],
      currentModule: 3,
      totalProgress: 42,
      badges: ['first_login', 'first_lesson', 'module_1_complete', 'streak_7'],
      lastLesson: '3.1',
    }
    setUser(mockUser)
    localStorage.setItem('wl_user', JSON.stringify(mockUser))
    return mockUser
  }

  const register = async (name, email, password) => {
    const newUser = {
      id: `usr_${Date.now()}`,
      email,
      name,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
      role: 'student',
      plan: 'premium',
      joinedAt: new Date().toISOString(),
      xp: 100,
      level: 1,
      streak: 1,
      vipLevel: 'Bronze WL',
      completedModules: [],
      currentModule: 1,
      totalProgress: 0,
      badges: ['first_login'],
      lastLesson: null,
    }
    setUser(newUser)
    localStorage.setItem('wl_user', JSON.stringify(newUser))
    return newUser
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('wl_user')
  }

  const updateUser = (updates) => {
    const updated = { ...user, ...updates }
    setUser(updated)
    localStorage.setItem('wl_user', JSON.stringify(updated))
  }

  const addXP = (amount) => {
    const newXP = (user?.xp || 0) + amount
    const newLevel = Math.floor(newXP / 1000) + 1
    updateUser({ xp: newXP, level: newLevel })
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser, addXP }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
