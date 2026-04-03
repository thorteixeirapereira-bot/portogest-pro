import { Bell, Sun, Moon, LogOut, Anchor } from 'lucide-react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useUIStore } from '../../store/uiStore'
import { useAuthStore } from '../../store/authStore'
import { useEventsStore } from '../../store/eventsStore'

const pageTitles: Record<string, string> = {
  '/': 'Dashboard',
  '/eventos': 'Eventos',
  '/colaboradores': 'Colaboradores',
  '/relatorios': 'Relatórios',
  '/analytics': 'Analytics',
  '/pesquisas': 'Pesquisas',
}

export default function Header() {
  const navigate = useNavigate()
  const location = useLocation()
  const { theme, toggleTheme } = useUIStore()
  const { logout } = useAuthStore()
  const { events } = useEventsStore()

  const title = pageTitles[location.pathname] || 'PortoGest'
  const pendingCount = events.filter(e => !e.hasFeedback && e.criticality === 'crítico').length

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <header className="sticky top-0 z-40 glass border-b border-slate-700/50 safe-top">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Logo + Title */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl flex items-center justify-center flex-shrink-0">
            <Anchor size={16} className="text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white leading-none">{title}</h1>
            <p className="text-[10px] text-slate-500 font-medium leading-none mt-0.5">PortoGest Pro</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          <button
            onClick={toggleTheme}
            className="btn-ghost w-10 h-10 !px-0 !py-0"
            aria-label="Alternar tema"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          <button
            className="btn-ghost w-10 h-10 !px-0 !py-0 relative"
            aria-label="Notificações"
          >
            <Bell size={18} />
            {pendingCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 rounded-full text-[9px] font-bold text-white flex items-center justify-center">
                {pendingCount}
              </span>
            )}
          </button>

          <button
            onClick={handleLogout}
            className="btn-ghost w-10 h-10 !px-0 !py-0"
            aria-label="Sair"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </header>
  )
}
