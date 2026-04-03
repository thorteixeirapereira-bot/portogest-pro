import { LogOut, Anchor } from 'lucide-react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'

const pageTitles: Record<string, string> = {
  '/': 'Dashboard',
  '/eventos': 'Eventos',
  '/colaboradores': 'Colaboradores',
  '/relatorios': 'Relatórios',
  '/analytics': 'Analytics',
  '/pesquisas': 'Pesquisas',
  '/testes': 'Testes de Perfil',
  '/ranking': 'Ranking',
  '/equipe': 'Equipe',
}

export default function Header() {
  const navigate = useNavigate()
  const location = useLocation()
  const { logout } = useAuthStore()

  const pathBase = '/' + location.pathname.split('/')[1]
  const title = pageTitles[pathBase] || 'PortoGest'

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <header className="sticky top-0 z-40 glass border-b border-slate-700/50 safe-top">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl flex items-center justify-center flex-shrink-0">
            <Anchor size={16} className="text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white leading-none">{title}</h1>
            <p className="text-[10px] text-slate-500 font-medium leading-none mt-0.5">PortoGest Pro</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="btn-ghost w-10 h-10 !px-0 !py-0"
          aria-label="Sair"
        >
          <LogOut size={18} />
        </button>
      </div>
    </header>
  )
}
