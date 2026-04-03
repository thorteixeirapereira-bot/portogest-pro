import { useState } from 'react'
import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import { LayoutDashboard, CalendarCheck, Users, ClipboardList, BarChart3, FileText, Brain, Trophy, Grid3x3, X } from 'lucide-react'

const mainTabs = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/eventos', icon: CalendarCheck, label: 'Eventos' },
  { to: '/colaboradores', icon: Users, label: 'Equipe' },
  { to: '/pesquisas', icon: ClipboardList, label: 'Pesquisas' },
]

const moreTabs = [
  { to: '/testes', icon: Brain, label: 'Testes', color: 'text-purple-400' },
  { to: '/ranking', icon: Trophy, label: 'Ranking', color: 'text-amber-400' },
  { to: '/analytics', icon: BarChart3, label: 'Analytics', color: 'text-blue-400' },
  { to: '/relatorios', icon: FileText, label: 'Relatórios', color: 'text-slate-300' },
]

export default function BottomNav() {
  const [showMore, setShowMore] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  const moreRoutes = moreTabs.map(t => t.to)
  const moreIsActive = moreRoutes.includes(location.pathname)

  const handleMoreNav = (to: string) => {
    setShowMore(false)
    navigate(to)
  }

  return (
    <>
      {/* More overlay */}
      {showMore && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          onClick={() => setShowMore(false)}
        >
          <div
            className="absolute bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-700/50 rounded-t-2xl p-4 pb-8"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-semibold text-white">Mais seções</p>
              <button onClick={() => setShowMore(false)} className="btn-ghost w-8 h-8 !px-0 !py-0">
                <X size={18} />
              </button>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {moreTabs.map(({ to, icon: Icon, label, color }) => (
                <button
                  key={to}
                  onClick={() => handleMoreNav(to)}
                  className={`flex flex-col items-center gap-2 p-3 rounded-2xl transition-all ${
                    location.pathname === to
                      ? 'bg-slate-700/80 border border-slate-600'
                      : 'bg-slate-800/60 hover:bg-slate-700/60'
                  }`}
                >
                  <Icon size={22} className={color} />
                  <span className="text-[10px] font-medium text-slate-300 leading-none">{label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Bottom nav bar */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-40 glass border-t border-slate-700/50 safe-bottom"
        aria-label="Navegação principal"
      >
        <div className="flex items-stretch">
          {mainTabs.map(({ to, icon: Icon, label }) => (
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

          {/* Mais button */}
          <button
            onClick={() => setShowMore(o => !o)}
            className={`flex-1 flex flex-col items-center justify-center py-2.5 gap-1 transition-all duration-150 min-h-[56px] ${
              moreIsActive || showMore ? 'text-blue-400' : 'text-slate-500 hover:text-slate-300'
            }`}
            aria-label="Mais"
          >
            <div className={`p-1 rounded-lg transition-all duration-150 ${moreIsActive || showMore ? 'bg-blue-500/20' : ''}`}>
              <Grid3x3 size={20} strokeWidth={moreIsActive || showMore ? 2.5 : 1.8} />
            </div>
            <span className="text-[10px] font-medium leading-none">Mais</span>
          </button>
        </div>
      </nav>
    </>
  )
}
