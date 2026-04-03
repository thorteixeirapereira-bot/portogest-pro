import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Users, ClipboardList, Brain, Trophy } from 'lucide-react'

const tabs = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/colaboradores', icon: Users, label: 'Equipe' },
  { to: '/pesquisas', icon: ClipboardList, label: 'Pesquisas' },
  { to: '/testes', icon: Brain, label: 'Testes' },
  { to: '/ranking', icon: Trophy, label: 'Ranking' },
]

export default function BottomNav() {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 glass border-t border-slate-700/50 safe-bottom"
      aria-label="Navegação principal"
    >
      <div className="flex items-stretch">
        {tabs.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center justify-center py-2.5 gap-1 transition-all duration-150 min-h-[56px] ${
                isActive
                  ? 'text-blue-400'
                  : 'text-slate-500 hover:text-slate-300 active:text-slate-200'
              }`
            }
            aria-label={label}
          >
            {({ isActive }) => (
              <>
                <div className={`p-1 rounded-lg transition-all duration-150 ${isActive ? 'bg-blue-500/20' : ''}`}>
                  <Icon size={20} strokeWidth={isActive ? 2.5 : 1.8} />
                </div>
                <span className="text-[10px] font-medium leading-none">{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
