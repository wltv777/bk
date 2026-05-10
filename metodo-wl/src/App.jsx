import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import LandingPage from './pages/LandingPage'
import SalesPage from './pages/SalesPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import CheckoutPage from './pages/CheckoutPage'
import ThankYouPage from './pages/ThankYouPage'
import Dashboard from './pages/Dashboard'
import CoursePage from './pages/CoursePage'
import LessonPage from './pages/LessonPage'
import CommunityPage from './pages/CommunityPage'
import AIAssistantPage from './pages/AIAssistantPage'
import CopyPasteLibrary from './pages/CopyPasteLibrary'
import WLPrompts from './pages/WLPrompts'
import WLSecrets from './pages/WLSecrets'
import BeforeAfter from './pages/BeforeAfter'
import FirstResults from './pages/FirstResults'
import ViralReelsGenerator from './pages/ViralReelsGenerator'
import InstagramAnalyzer from './pages/InstagramAnalyzer'
import MillionaireOffer from './pages/MillionaireOffer'
import AutoLaunch from './pages/AutoLaunch'
import AIAvatarSystem from './pages/AIAvatarSystem'
import ProfilePage from './pages/ProfilePage'
import CertificatePage from './pages/CertificatePage'
import AdminPanel from './pages/AdminPanel'
import VIPSystem from './pages/VIPSystem'
import GamificationPage from './pages/GamificationPage'
import NotificationsPage from './pages/NotificationsPage'
import BonusPage from './pages/BonusPage'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return (
    <div className="min-h-screen bg-wl-black flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 rounded-full border-2 border-transparent border-t-wl-blue animate-spin" />
        <span className="text-wl-gray text-sm">Carregando...</span>
      </div>
    </div>
  )
  return user ? children : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/vendas" element={<SalesPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/cadastro" element={<RegisterPage />} />
      <Route path="/checkout" element={<CheckoutPage />} />
      <Route path="/obrigado" element={<ThankYouPage />} />

      {/* Protected */}
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/curso" element={<ProtectedRoute><CoursePage /></ProtectedRoute>} />
      <Route path="/aula/:moduleId/:lessonId" element={<ProtectedRoute><LessonPage /></ProtectedRoute>} />
      <Route path="/comunidade" element={<ProtectedRoute><CommunityPage /></ProtectedRoute>} />
      <Route path="/ia" element={<ProtectedRoute><AIAssistantPage /></ProtectedRoute>} />
      <Route path="/copiar-e-postar" element={<ProtectedRoute><CopyPasteLibrary /></ProtectedRoute>} />
      <Route path="/prompts-wl" element={<ProtectedRoute><WLPrompts /></ProtectedRoute>} />
      <Route path="/segredos-wl" element={<ProtectedRoute><WLSecrets /></ProtectedRoute>} />
      <Route path="/antes-e-depois" element={<ProtectedRoute><BeforeAfter /></ProtectedRoute>} />
      <Route path="/primeiros-resultados" element={<ProtectedRoute><FirstResults /></ProtectedRoute>} />
      <Route path="/gerador-de-reels" element={<ProtectedRoute><ViralReelsGenerator /></ProtectedRoute>} />
      <Route path="/analisador-instagram" element={<ProtectedRoute><InstagramAnalyzer /></ProtectedRoute>} />
      <Route path="/oferta-milionaria" element={<ProtectedRoute><MillionaireOffer /></ProtectedRoute>} />
      <Route path="/lancamento-automatico" element={<ProtectedRoute><AutoLaunch /></ProtectedRoute>} />
      <Route path="/avatar-ia" element={<ProtectedRoute><AIAvatarSystem /></ProtectedRoute>} />
      <Route path="/perfil" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
      <Route path="/certificado" element={<ProtectedRoute><CertificatePage /></ProtectedRoute>} />
      <Route path="/admin" element={<ProtectedRoute><AdminPanel /></ProtectedRoute>} />
      <Route path="/vip" element={<ProtectedRoute><VIPSystem /></ProtectedRoute>} />
      <Route path="/conquistas" element={<ProtectedRoute><GamificationPage /></ProtectedRoute>} />
      <Route path="/notificacoes" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
      <Route path="/bonus" element={<ProtectedRoute><BonusPage /></ProtectedRoute>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
