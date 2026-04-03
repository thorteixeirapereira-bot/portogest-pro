import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Trophy, Brain, ChevronRight, Star } from 'lucide-react'
import { useUIStore } from '../store/uiStore'
import { useColaboradoresStore } from '../store/colaboradoresSupabase'
import { usePesquisasStore } from '../store/pesquisasSupabase'
import { supabase } from '../lib/supabase'
import KPICards from '../components/dashboard/KPICards'
import type { DbColaborador } from '../lib/supabase'

const ALL_TEST_TYPES = ['disc', 'bigfive', 'vac', 'ikigai', 'ie']
const TEST_ICONS: Record<string, string> = {
  disc: '🎯', bigfive: '🧠', vac: '📚', ikigai: '🌸', ie: '❤️',
}

function levelLabel(pts: number) {
  if (pts >= 200) return '🏆 Elite'
  if (pts >= 100) return '⭐ Destaque'
  if (pts >= 50) return '📈 Em Evolução'
  return '🌱 Iniciando'
}

export default function DashboardPage() {
  const navigate = useNavigate()
  const { managerName } = useUIStore()
  const { colaboradores, fetchColaboradores } = useColaboradoresStore()
  const { pesquisas, fetchPesquisas } = usePesquisasStore()

  const [totalTestes, setTotalTestes] = useState(0)
  const [testesPorTipo, setTestesPorTipo] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetchColaboradores(),
      fetchPesquisas(),
      supabase.from('testes_perfil').select('tipo').then(({ data }) => {
        const counts: Record<string, number> = {}
        data?.forEach(r => { counts[r.tipo] = (counts[r.tipo] || 0) + 1 })
        setTestesPorTipo(counts)
        setTotalTestes(data?.length ?? 0)
      }),
    ]).finally(() => setLoading(false))
  }, [])

  const totalPontos = colaboradores.reduce((a, c) => a + c.pontos_total, 0)
  const pesquisasAtivas = pesquisas.filter(p => p.ativa).length
  const top5 = [...colaboradores].sort((a, b) => b.pontos_total - a.pontos_total).slice(0, 5)
  const semTestes = colaboradores.filter(c =>
    !ALL_TEST_TYPES.some(() => false) // placeholder — recalculated below
  )
  const colaboradoresSemTestes = colaboradores.filter(c => c.pontos_total === 0)

  return (
    <div className="px-4 py-4 space-y-5 animate-fade-in pb-6">
      {/* Welcome */}
      <div>
        <p className="text-slate-500 text-sm">Bem-vindo,</p>
        <h2 className="text-xl font-bold text-white">{managerName?.split(' ')[0] || 'Gestor'} 👋</h2>
      </div>

      {/* KPIs */}
      {loading ? (
        <div className="grid grid-cols-2 gap-3">
          {[0, 1, 2, 3].map(i => (
            <div key={i} className="card p-4 h-24 animate-pulse bg-slate-800/50" />
          ))}
        </div>
      ) : (
        <KPICards
          totalColaboradores={colaboradores.length}
          totalTestes={totalTestes}
          totalPontos={totalPontos}
          pesquisasAtivas={pesquisasAtivas}
        />
      )}

      {/* Ranking top 5 */}
      {top5.length > 0 && (
        <div className="card p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Trophy size={16} className="text-amber-400" />
              <h3 className="text-sm font-semibold text-white">Top Colaboradores</h3>
            </div>
            <button onClick={() => navigate('/ranking')} className="text-xs text-blue-400">
              Ver ranking →
            </button>
          </div>
          <div className="space-y-2">
            {top5.map((col, i) => {
              const initials = col.nome.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
              const medalBg = i === 0 ? 'bg-amber-500/20' : i === 1 ? 'bg-slate-500/20' : 'bg-slate-700/20'
              const medalColor = i === 0 ? 'text-amber-400' : i === 1 ? 'text-slate-300' : 'text-slate-500'
              return (
                <button
                  key={col.id}
                  onClick={() => navigate(`/colaboradores/${col.id}`)}
                  className="w-full flex items-center gap-3 hover:bg-slate-800/50 rounded-xl p-2 transition-colors"
                >
                  <div className={`w-6 h-6 rounded-full ${medalBg} flex items-center justify-center flex-shrink-0`}>
                    <span className={`text-xs font-bold ${medalColor}`}>{i + 1}</span>
                  </div>
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-xs">{initials}</span>
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <p className="text-sm font-medium text-white truncate">{col.nome}</p>
                    <p className="text-xs text-slate-500">{levelLabel(col.pontos_total)}</p>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <Star size={11} className="text-amber-400" />
                    <span className="text-sm font-bold text-amber-400">{col.pontos_total}</span>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Testes por tipo */}
      {totalTestes > 0 && (
        <div className="card p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Brain size={16} className="text-purple-400" />
              <h3 className="text-sm font-semibold text-white">Testes Realizados</h3>
            </div>
            <button onClick={() => navigate('/testes')} className="text-xs text-blue-400">
              Ver testes →
            </button>
          </div>
          <div className="space-y-2">
            {ALL_TEST_TYPES.map(tipo => {
              const count = testesPorTipo[tipo] || 0
              const pct = colaboradores.length > 0 ? (count / colaboradores.length) * 100 : 0
              return (
                <div key={tipo} className="flex items-center gap-3">
                  <span className="text-base w-6">{TEST_ICONS[tipo]}</span>
                  <div className="flex-1">
                    <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-purple-600 to-blue-500 rounded-full transition-all duration-700"
                        style={{ width: `${Math.min(100, pct)}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-xs text-slate-400 w-10 text-right">{count}/{colaboradores.length}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Onboarding: se não há ninguém */}
      {!loading && colaboradores.length === 0 && (
        <div className="card p-5 border-blue-500/20 bg-blue-500/5">
          <p className="text-sm font-semibold text-blue-300 mb-2">🚀 Comece agora</p>
          <p className="text-xs text-slate-400 mb-4">
            Cadastre colaboradores para ver o dashboard com dados reais, aplicar testes de perfil e criar pesquisas.
          </p>
          <div className="space-y-2">
            <button onClick={() => navigate('/colaboradores')} className="btn-primary w-full gap-2 text-sm">
              👥 Cadastrar Colaboradores <ChevronRight size={14} />
            </button>
            <button onClick={() => navigate('/pesquisas')} className="btn-ghost w-full text-sm">
              📋 Criar Pesquisa
            </button>
          </div>
        </div>
      )}

      {/* Colaboradores sem engajamento */}
      {!loading && colaboradores.length > 0 && colaboradoresSemTestes.length > 0 && (
        <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-4">
          <p className="text-xs text-amber-400 font-semibold mb-1">
            ⚠️ {colaboradoresSemTestes.length} colaborador{colaboradoresSemTestes.length !== 1 ? 'es' : ''} sem pontuação
          </p>
          <p className="text-xs text-slate-500">Aplique testes ou envie pesquisas para engajar a equipe.</p>
          <button onClick={() => navigate('/testes')} className="text-xs text-amber-400 mt-2 hover:underline">
            Iniciar testes →
          </button>
        </div>
      )}
    </div>
  )
}
