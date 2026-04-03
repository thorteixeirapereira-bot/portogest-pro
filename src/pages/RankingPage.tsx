import { useEffect } from 'react'
import { Trophy, Medal, Star, Brain } from 'lucide-react'
import { useColaboradoresStore } from '../store/colaboradoresSupabase'
import { ALL_TESTS } from '../lib/psychTests'
import { useNavigate } from 'react-router-dom'

const TEST_ICONS: Record<string, string> = {
  disc: '🎯', bigfive: '🧠', vac: '📚', ikigai: '🌸', ie: '❤️',
}

function MedalIcon({ pos }: { pos: number }) {
  if (pos === 1) return <div className="w-8 h-8 bg-amber-400 rounded-full flex items-center justify-center text-slate-900 font-bold text-sm">1</div>
  if (pos === 2) return <div className="w-8 h-8 bg-slate-400 rounded-full flex items-center justify-center text-slate-900 font-bold text-sm">2</div>
  if (pos === 3) return <div className="w-8 h-8 bg-orange-600 rounded-full flex items-center justify-center text-white font-bold text-sm">3</div>
  return <div className="w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center text-slate-400 font-bold text-sm">{pos}</div>
}

export default function RankingPage() {
  const navigate = useNavigate()
  const { colaboradores, fetchColaboradores } = useColaboradoresStore()

  useEffect(() => { fetchColaboradores() }, [])

  const sorted = [...colaboradores].sort((a, b) => b.pontos_total - a.pontos_total)
  const maxPontos = sorted[0]?.pontos_total || 1

  const levelLabel = (pts: number) =>
    pts >= 200 ? '🏆 Elite' : pts >= 100 ? '⭐ Destaque' : pts >= 50 ? '📈 Em Evolução' : '🌱 Iniciando'

  return (
    <div className="px-4 py-4 space-y-4 animate-fade-in">
      <div>
        <h2 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
          <Trophy size={20} className="text-amber-400" /> Ranking
        </h2>
        <p className="text-sm text-slate-500">{colaboradores.length} colaborador{colaboradores.length !== 1 ? 'es' : ''} no ranking</p>
      </div>

      {/* Top 3 Podium */}
      {sorted.length >= 3 && (
        <div className="card p-4">
          <p className="text-xs text-slate-500 font-medium mb-4 uppercase tracking-wide">Pódio</p>
          <div className="flex items-end justify-center gap-4">
            {/* 2nd */}
            <div className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 rounded-2xl bg-slate-700 flex items-center justify-center">
                <span className="text-white font-bold">{sorted[1]?.nome.split(' ')[0].slice(0, 2).toUpperCase()}</span>
              </div>
              <p className="text-xs text-slate-400 text-center max-w-16 truncate">{sorted[1]?.nome.split(' ')[0]}</p>
              <div className="bg-slate-600 w-14 h-12 rounded-t-lg flex items-center justify-center">
                <span className="text-slate-300 font-bold text-sm">2</span>
              </div>
              <span className="text-xs text-slate-400">{sorted[1]?.pontos_total}pts</span>
            </div>
            {/* 1st */}
            <div className="flex flex-col items-center gap-2 -mb-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-900/30">
                <span className="text-white font-bold text-lg">{sorted[0]?.nome.split(' ')[0].slice(0, 2).toUpperCase()}</span>
              </div>
              <p className="text-xs text-amber-300 text-center font-medium max-w-16 truncate">{sorted[0]?.nome.split(' ')[0]}</p>
              <div className="bg-amber-500 w-14 h-16 rounded-t-lg flex items-center justify-center">
                <Trophy size={20} className="text-white" />
              </div>
              <span className="text-xs text-amber-400 font-bold">{sorted[0]?.pontos_total}pts</span>
            </div>
            {/* 3rd */}
            <div className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 rounded-2xl bg-slate-700 flex items-center justify-center">
                <span className="text-white font-bold">{sorted[2]?.nome.split(' ')[0].slice(0, 2).toUpperCase()}</span>
              </div>
              <p className="text-xs text-slate-400 text-center max-w-16 truncate">{sorted[2]?.nome.split(' ')[0]}</p>
              <div className="bg-orange-700 w-14 h-8 rounded-t-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">3</span>
              </div>
              <span className="text-xs text-slate-400">{sorted[2]?.pontos_total}pts</span>
            </div>
          </div>
        </div>
      )}

      {/* Full ranking list */}
      <div className="space-y-2">
        {sorted.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <span className="text-5xl">🏆</span>
            <p className="text-slate-500">Nenhum colaborador no ranking ainda.</p>
            <p className="text-xs text-slate-600">Cadastre colaboradores e aplique testes para ver o ranking.</p>
          </div>
        ) : (
          sorted.map((col, idx) => {
            const barWidth = maxPontos > 0 ? (col.pontos_total / maxPontos) * 100 : 0
            return (
              <button
                key={col.id}
                onClick={() => navigate(`/colaboradores/${col.id}`)}
                className="card p-4 w-full text-left hover:border-slate-600 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <MedalIcon pos={idx + 1} />
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-xs">{col.nome.split(' ').map(n => n[0]).join('').slice(0, 2)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-semibold text-white text-sm truncate">{col.nome}</p>
                      <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                        <Star size={11} className="text-amber-400" />
                        <span className="text-sm font-bold text-amber-400">{col.pontos_total}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-600 to-blue-400 rounded-full transition-all duration-700"
                          style={{ width: `${barWidth}%` }}
                        />
                      </div>
                      <span className="text-xs text-slate-500 flex-shrink-0">{levelLabel(col.pontos_total)}</span>
                    </div>
                  </div>
                </div>
              </button>
            )
          })
        )}
      </div>

      {/* Points guide */}
      <div className="card p-4">
        <p className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
          <Brain size={14} className="text-purple-400" /> Como ganhar pontos
        </p>
        <div className="space-y-1.5">
          {ALL_TESTS.map(t => (
            <div key={t.type} className="flex justify-between text-xs">
              <span className="text-slate-400">{TEST_ICONS[t.type]} {t.title}</span>
              <span className="text-amber-400 font-medium">+{t.type === 'vac' ? 30 : t.type === 'ikigai' ? 40 : 50} pts</span>
            </div>
          ))}
          <div className="flex justify-between text-xs border-t border-slate-700/50 pt-1.5 mt-1.5">
            <span className="text-slate-400">📋 Pesquisa respondida</span>
            <span className="text-amber-400 font-medium">+20 pts</span>
          </div>
        </div>
      </div>
    </div>
  )
}
