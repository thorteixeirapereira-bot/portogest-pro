import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import { useUIStore } from './store/uiStore'
import { useAuthStore } from './store/authStore'
import LoginScreen from './components/auth/LoginScreen'
import AppShell from './components/layout/AppShell'
import DashboardPage from './pages/DashboardPage'
import EventsPage from './pages/EventsPage'
import ReportsPage from './pages/ReportsPage'
import AnalyticsPage from './pages/AnalyticsPage'
import SurveysPage from './pages/SurveysPage'
import SurveyResponderPage from './pages/SurveyResponderPage'
import SplashScreen from './components/layout/SplashScreen'
import PWABanner from './components/layout/PWABanner'
import ManagerSetupModal from './components/auth/ManagerSetupModal'
import PostLoginVoiceMenu from './components/voice/PostLoginVoiceMenu'
import EventFormModal from './components/events/EventFormModal'
import ColaboradoresPage from './pages/ColaboradoresPage'
import ColaboradorProfilePage from './pages/ColaboradorProfilePage'
import ColaboradorPublicPage from './pages/ColaboradorPublicPage'
import TestesPage from './pages/TestesPage'
import RankingPage from './pages/RankingPage'
import PesquisaPublicaPage from './pages/PesquisaPublicaPage'

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user } = useAuth()
  if (!isAuthenticated && !user) return <Navigate to="/login" replace />
  return <>{children}</>
}

// Modals/overlays that sit on top of the authenticated app
function AuthOverlays() {
  const { user } = useAuthStore()
  const { managerName } = useUIStore()
  const [showSetup, setShowSetup] = useState(false)
  const [showVoiceMenu, setShowVoiceMenu] = useState(false)
  const [showEventForm, setShowEventForm] = useState(false)

  useEffect(() => {
    if (!user) return
    const sessionKey = `voice-menu-shown-${user.id}`
    const shownThisSession = sessionStorage.getItem(sessionKey)
    if (!managerName) {
      setShowSetup(true)
    } else if (!shownThisSession) {
      setShowVoiceMenu(true)
      sessionStorage.setItem(sessionKey, '1')
    }
  }, [user?.id])

  const handleSetupDone = () => {
    setShowSetup(false)
    if (user) {
      const sessionKey = `voice-menu-shown-${user.id}`
      if (!sessionStorage.getItem(sessionKey)) {
        setShowVoiceMenu(true)
        sessionStorage.setItem(sessionKey, '1')
      }
    }
  }

  if (!user) return null

  return (
    <>
      {showSetup && <ManagerSetupModal onDone={handleSetupDone} />}
      {showVoiceMenu && !showSetup && (
        <PostLoginVoiceMenu
          managerName={managerName}
          onClose={() => setShowVoiceMenu(false)}
          onNewEvent={() => { setShowVoiceMenu(false); setShowEventForm(true) }}
        />
      )}
      {showEventForm && (
        <EventFormModal onClose={() => setShowEventForm(false)} />
      )}
    </>
  )
}

export default function App() {
  const { theme } = useUIStore()
  const [showSplash, setShowSplash] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 2000)
    return () => clearTimeout(timer)
  }, [])

  if (showSplash) return <SplashScreen />

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginScreen />} />

        {/* Public — no auth required */}
        <Route path="/responder/:surveyId" element={<SurveyResponderPage />} />
        <Route path="/p/:pesquisaId" element={<PesquisaPublicaPage />} />
        <Route path="/c/:token" element={<ColaboradorPublicPage />} />
        <Route path="/c/:token/teste/:testType" element={<ColaboradorPublicPage />} />
        <Route path="/c/:token/pesquisa/:pesquisaId" element={<ColaboradorPublicPage />} />

        {/* Protected app shell */}
        <Route
          path="/"
          element={
            <AuthGuard>
              <AppShell />
            </AuthGuard>
          }
        >
          <Route index element={<DashboardPage />} />
          <Route path="eventos" element={<EventsPage />} />
          <Route path="colaboradores" element={<ColaboradoresPage />} />
          <Route path="colaboradores/:id" element={<ColaboradorProfilePage />} />
          <Route path="relatorios" element={<ReportsPage />} />
          <Route path="analytics" element={<AnalyticsPage />} />
          <Route path="pesquisas" element={<SurveysPage />} />
          <Route path="testes" element={<TestesPage />} />
          <Route path="ranking" element={<RankingPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* Global overlays (shown when authenticated) */}
      <AuthOverlays />
      <PWABanner />
    </BrowserRouter>
  )
}
