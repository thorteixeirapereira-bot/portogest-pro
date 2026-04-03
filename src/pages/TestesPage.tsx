import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ChevronRight, Brain, Users, CheckCircle } from 'lucide-react'
import { ALL_TESTS, getTestDef } from '../lib/psychTests'
import { useTestesStore } from '../store/testesSupabase'
import { useColaboradoresStore } from '../store/colaboradoresSupabase'
import { supabase } from '../lib/supabase'
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts'
import PsychTestPage from './PsychTestPage'
import type { DbTestePerfil, DbColaborador } from '../lib/supabase'
import type { PsychTestType } from '../types'

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

// ─── Team Results Dashboard ───────────────────────────────────────────────────

type TesteComColaborador = DbTestePerfil & { colaborador?: DbColaborador }

function TeamDashboard({ allResults, colaboradores }: {
  allResults: TesteComColaborador[]
  colaboradores: DbColaborador[]
}) {
  const navigate = useNavigate()
  const [expandedCol, setExpandedCol] = useState<string | null>(null)

  if (colaboradores.length === 0) return null

  // Build matrix: collaborator → test types done
  const matrix = colaboradores.map(col => {
    const colResults = allResults.filter(r => r.colaborador_id === col.id)
    return { col, results: colResults, done: colResults.map(r => r.tipo) }
  })

  return (
    <div className="space-y-4">
      {/* Matrix overview */}
      <div className="card p-4">
        <div className="flex items-center gap-2 mb-3">
          <Users size={16} className="text-blue-400" />
          <p className="text-sm font-semibold text-white">Cobertura da Equipe</p>
        </div>
        <div className="space-y-2">
          {matrix.map(({ col, done }) => {
            const initials = col.nome.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
            const pct = Math.round((done.length / ALL_TESTS.length) * 100)
            return (
              <button
                key={col.id}
                onClick={() => setExpandedCol(expandedCol === col.id ? null : col.id)}
                className="w-full text-left"
              >
                <div className="flex items-center gap-3 mb-1">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-[10px]">{initials}</span>
                  </div>
                  <span className="text-sm text-white flex-1 truncate">{col.nome}</span>
                  <div className="flex gap-1 flex-shrink-0">
                    {ALL_TESTS.map(t => (
                      <span key={t.type} className={`text-xs w-5 h-5 flex items-center justify-center rounded ${done.includes(t.type) ? 'opacity-100' : 'opacity-20'}`}>
                        {TEST_ICONS[t.type]}
                      </span>
                    ))}
                  </div>
                  <span className="text-xs text-slate-500 w-8 text-right">{pct}%</span>
                </div>
                <div className="h-1 bg-slate-700 rounded-full overflow-hidden ml-10">
                  <div className="h-full bg-gradient-to-r from-blue-600 to-purple-500 rounded-full" style={{ width: `${pct}%` }} />
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Expanded collaborator results */}
      {expandedCol && (() => {
        const entry = matrix.find(m => m.col.id === expandedCol)
        if (!entry || entry.results.length === 0) return null
        return (
          <div className="card p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-white">{entry.col.nome} — Resultados</p>
              <button onClick={() => navigate(`/colaboradores/${entry.col.id}`)} className="text-xs text-blue-400">
                Ver perfil →
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {entry.results.map(r => {
                const test = getTestDef(r.tipo as PsychTestType)
                const interp = test.interpret(r.scores)
                const data = test.dimensions.map(d => ({
                  subject: d.label,
                  value: Number(((r.scores[d.key] ?? 0) * (test.questions[0].type === 'scale5' ? 1 : 5)).toFixed(1)),
                  fullMark: 5,
                }))
                return (
                  <div key={r.id} className="bg-slate-800/50 rounded-xl p-3">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="text-base">{TEST_ICONS[r.tipo]}</span>
                      <p className="text-xs font-semibold text-white truncate">{test.title}</p>
                    </div>
                    <div className="h-24">
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart data={data}>
                          <PolarGrid stroke="#334155" />
                          <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 8 }} />
                          <Radar dataKey="value" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.25} strokeWidth={1.5} />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1 line-clamp-2">{interp.profile.split('—')[0]}</p>
                  </div>
                )
              })}
            </div>
            {/* Pending tests */}
            {entry.done.length < ALL_TESTS.length && (
              <div className="mt-3 pt-3 border-t border-slate-700/50">
                <p className="text-xs text-slate-500 mb-2">Testes pendentes:</p>
                <div className="flex flex-wrap gap-1.5">
                  {ALL_TESTS.filter(t => !entry.done.includes(t.type)).map(t => (
                    <button
                      key={t.type}
                      onClick={() => navigate(`/testes?tipo=${t.type}&colaborador=${entry.col.id}`)}
                      className="text-xs bg-slate-700 text-slate-300 px-2.5 py-1 rounded-lg hover:bg-slate-600 transition-colors"
                    >
                      {TEST_ICONS[t.type]} {t.title}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )
      })()}
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function TestesPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { results, fetchForColaborador } = useTestesStore()
  const { colaboradores, fetchColaboradores } = useColaboradoresStore()

  const testType = searchParams.get('tipo')
  const colaboradorId = searchParams.get('colaborador')

  const [allResults, setAllResults] = useState<TesteComColaborador[]>([])
  const [tab, setTab] = useState<'testes' | 'equipe'>('testes')

  useEffect(() => {
    fetchColaboradores()
    if (colaboradorId) fetchForColaborador(colaboradorId)

    // Fetch ALL tests for the team overview
    supabase.from('testes_perfil').select('*').order('created_at', { ascending: false })
      .then(({ data }) => setAllResults(data ?? []))
  }, [colaboradorId])

  // If test type is in URL, show the quiz directly
  if (testType) {
    return (
      <div className="px-4 py-4 animate-fade-in max-w-lg mx-auto">
        <PsychTestPage />
      </div>
    )
  }

  const totalCompleted = allResults.length
  const completedByType = ALL_TESTS.map(t => ({
    ...t,
    count: allResults.filter(r => r.tipo === t.type).length,
  }))

  return (
    <div className="px-4 py-4 space-y-4 animate-fade-in">
      <div>
        <h2 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
          <Brain size={20} className="text-purple-400" /> Testes de Perfil
        </h2>
        <p className="text-sm text-slate-500">{totalCompleted} testes realizados · {colaboradores.length} colaboradores</p>
      </div>

      {/* Tabs */}
      <div className="flex bg-slate-800/60 rounded-xl p-0.5 gap-0.5">
        {(['testes', 'equipe'] as const).map((key) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${
              tab === key ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            {key === 'testes' ? '📋 Aplicar Testes' : '👥 Resultados da Equipe'}
          </button>
        ))}
      </div>

      {/* Apply tests tab */}
      {tab === 'testes' && (
        <>
          <div className="bg-blue-500/5 border border-blue-500/20 rounded-2xl p-4">
            <p className="text-sm text-blue-300 font-medium mb-1">Como funciona</p>
            <p className="text-xs text-slate-400 leading-relaxed">
              Selecione um teste, escolha o colaborador e aplique presencialmente ou envie o link.
              O resultado é salvo automaticamente no perfil com gráfico.
            </p>
          </div>

          <div className="space-y-3">
            {completedByType.map(test => (
              <div key={test.type} className="card p-4 flex items-center gap-4">
                <div className={`w-12 h-12 ${COLOR_MAP[test.color] || 'bg-blue-600'} rounded-2xl flex items-center justify-center flex-shrink-0 text-2xl`}>
                  {TEST_ICONS[test.type]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-white leading-tight">{test.title}</p>
                  <p className="text-xs text-slate-500">{test.subtitle}</p>
                  <div className="flex items-center gap-3 mt-1">
                    {test.count > 0 && (
                      <span className="text-xs text-blue-400 flex items-center gap-1">
                        <CheckCircle size={10} /> {test.count} feito{test.count !== 1 ? 's' : ''}
                      </span>
                    )}
                    <span className="text-xs text-amber-400">+{POINTS_MAP[test.type]} pts</span>
                  </div>
                </div>
                <button
                  onClick={() => navigate(`/testes?tipo=${test.type}${colaboradorId ? `&colaborador=${colaboradorId}` : ''}`)}
                  className="btn-primary px-4 py-2 text-xs !min-h-0 gap-1 flex-shrink-0"
                >
                  Iniciar <ChevronRight size={14} />
                </button>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Team results tab */}
      {tab === 'equipe' && (
        <TeamDashboard allResults={allResults} colaboradores={colaboradores} />
      )}
    </div>
  )
}
