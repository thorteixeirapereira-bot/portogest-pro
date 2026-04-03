import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import { useUIStore } from './store/uiStore'
import LoginScreen from './components/auth/LoginScreen'
import AppShell from './components/layout/AppShell'
import DashboardPage from './pages/DashboardPage'
import EventsPage from './pages/EventsPage'
import EmployeesPage from './pages/EmployeesPage'
import ReportsPage from './pages/ReportsPage'
import AnalyticsPage from './pages/AnalyticsPage'
import SurveysPage from './pages/SurveysPage'
import SplashScreen from './components/layout/SplashScreen'
import { useState } from 'react'

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user } = useAuth()
  if (!isAuthenticated && !user) return <Navigate to="/login" replace />
  return <>{children}</>
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
          <Route path="colaboradores" element={<EmployeesPage />} />
          <Route path="relatorios" element={<ReportsPage />} />
          <Route path="analytics" element={<AnalyticsPage />} />
          <Route path="pesquisas" element={<SurveysPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
