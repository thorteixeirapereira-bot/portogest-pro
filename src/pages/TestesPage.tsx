import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ChevronRight, Brain } from 'lucide-react'
import { ALL_TESTS } from '../lib/psychTests'
import { useTestesStore } from '../store/testesSupabase'
import { useColaboradoresStore } from '../store/colaboradoresSupabase'
import PsychTestPage from './PsychTestPage'

const TEST_ICONS: Record<string, string> = {
  disc: '🎯', bigfive: '🧠', vac: '📚', ikigai: '🌸', ie: '❤️',
}

const COLOR_MAP: Record<string, string> = {
  blue: 'bg-blue-600', purple: 'bg-purple-600', green: 'bg-emerald-600',
  pink: 'bg-pink-600', red: 'bg-red-600',
}

const POINTS_MAP: Record<string, number> = {
  disc: 50, bigfive: 50, vac: 30, ikigai: 40, ie: 50,
}

export default function TestesPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { results, fetchForColaborador } = useTestesStore()
  const { colaboradores, fetchColaboradores } = useColaboradoresStore()

  const testType = searchParams.get('tipo')
  const colaboradorId = searchParams.get('colaborador')

  useEffect(() => {
    fetchColaboradores()
    if (colaboradorId) fetchForColaborador(colaboradorId)
  }, [colaboradorId])

  // If test type is in URL, show the quiz directly
  if (testType) {
    return (
      <div className="px-4 py-4 animate-fade-in max-w-lg mx-auto">
        <PsychTestPage />
      </div>
    )
  }

  const getResultCount = (tipo: string) =>
    results.filter(r => r.tipo === tipo).length

  // Group results by employee
  const byEmployee: Record<string, typeof results> = {}
  results.forEach(r => {
    if (!byEmployee[r.colaborador_id]) byEmployee[r.colaborador_id] = []
    byEmployee[r.colaborador_id].push(r)
  })

  return (
    <div className="px-4 py-4 space-y-4 animate-fade-in">
      <div>
        <h2 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
          <Brain size={20} className="text-purple-400" /> Testes de Perfil
        </h2>
        <p className="text-sm text-slate-500">5 testes psicológicos para conhecer sua equipe</p>
      </div>

      <div className="bg-blue-500/5 border border-blue-500/20 rounded-2xl p-4">
        <p className="text-sm text-blue-300 font-medium mb-1">Como funciona</p>
        <p className="text-xs text-slate-400 leading-relaxed">
          Selecione um teste e um colaborador. Aplique presencialmente ou envie o link para o colaborador responder.
          O resultado é salvo no perfil com gráficos e insights.
        </p>
      </div>

      {/* Test cards */}
      <div className="space-y-3">
        {ALL_TESTS.map(test => {
          const count = getResultCount(test.type)
          return (
            <div key={test.type} className="card p-4 flex items-center gap-4">
              <div className={`w-12 h-12 ${COLOR_MAP[test.color] || 'bg-blue-600'} rounded-2xl flex items-center justify-center flex-shrink-0 text-2xl`}>
                {TEST_ICONS[test.type]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-white leading-tight">{test.title}</p>
                <p className="text-xs text-slate-500">{test.subtitle}</p>
                <div className="flex items-center gap-3 mt-1">
                  {count > 0 && <p className="text-xs text-blue-400">{count} perfil{count !== 1 ? 'is' : ''}</p>}
                  <p className="text-xs text-amber-400">+{POINTS_MAP[test.type]} pts</p>
                </div>
              </div>
              <button
                onClick={() => navigate(`/testes?tipo=${test.type}${colaboradorId ? `&colaborador=${colaboradorId}` : ''}`)}
                className="btn-primary px-4 py-2 text-xs !min-h-0 gap-1 flex-shrink-0"
              >
                Iniciar <ChevronRight size={14} />
              </button>
            </div>
          )
        })}
      </div>

      {/* Recent results */}
      {Object.keys(byEmployee).length > 0 && (
        <div>
          <p className="text-xs text-slate-500 font-medium uppercase tracking-wide mb-2">Perfis Recentes</p>
          <div className="space-y-2">
            {Object.entries(byEmployee).map(([empId, empResults]) => {
              const col = colaboradores.find(c => c.id === empId)
              const name = col?.nome || empResults[0]?.colaborador_id || 'Colaborador'
              const initials = name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
              return (
                <button
                  key={empId}
                  onClick={() => navigate(`/colaboradores/${empId}`)}
                  className="card p-3 w-full text-left hover:border-slate-600 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold text-xs">{initials}</span>
                    </div>
                    <p className="font-medium text-white text-sm flex-1">{name}</p>
                    <div className="flex gap-1">
                      {empResults.map(r => (
                        <span key={r.id} className="text-base">{TEST_ICONS[r.tipo] || '📊'}</span>
                      ))}
                    </div>
                    <ChevronRight size={14} className="text-slate-600" />
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
