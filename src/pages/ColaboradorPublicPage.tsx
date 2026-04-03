import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Anchor, Trophy, CheckCircle, Brain, ClipboardList, ArrowRight, Star } from 'lucide-react'
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts'
import { getColaboradorByToken, getPontuacoes } from '../store/colaboradoresSupabase'
import { getTestesForColaborador } from '../store/testesSupabase'
import { getPesquisaById, submitResposta } from '../store/pesquisasSupabase'
import { getTestDef, ALL_TESTS } from '../lib/psychTests'
import type { DbColaborador, DbTestePerfil, DbPesquisa, DbPontuacao } from '../lib/supabase'
import type { PsychTestType } from '../types'
import PsychTestPage from './PsychTestPage'

const TEST_ICONS: Record<string, string> = {
  disc: '🎯', bigfive: '🧠', vac: '📚', ikigai: '🌸', ie: '❤️',
}

// ─── Survey Responder (inline) ────────────────────────────────────────────────

function SurveyResponder({ pesquisa, colaboradorId, token, onDone }: {
  pesquisa: DbPesquisa
  colaboradorId: string
  token: string
  onDone: () => void
}) {
  const [answers, setAnswers] = useState<Record<string, string | number>>({})
  const [step, setStep] = useState<'questions' | 'done'>('questions')
  const [submitting, setSubmitting] = useState(false)
  const navigate = useNavigate()

  const canSubmit = pesquisa.perguntas
    .filter(q => q.obrigatoria)
    .every(q => answers[q.id] !== undefined && answers[q.id] !== '')

  const handleSubmit = async () => {
    setSubmitting(true)
    await submitResposta(pesquisa.id, colaboradorId, 'Colaborador', answers)
    // Add points via the colaborador store
    const { supabase } = await import('../lib/supabase')
    await supabase.from('pontuacoes').insert({
      colaborador_id: colaboradorId,
      tipo: 'pesquisa',
      descricao: `Pesquisa: ${pesquisa.titulo}`,
      pontos: 20,
    })
    setSubmitting(false)
    setStep('done')
  }

  if (step === 'done') {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4 animate-fade-in">
        <div className="w-20 h-20 bg-emerald-500/10 border-2 border-emerald-500/40 rounded-full flex items-center justify-center">
          <CheckCircle size={40} className="text-emerald-400" />
        </div>
        <div className="text-center">
          <h2 className="text-xl font-bold text-white mb-2">Obrigado!</h2>
          <p className="text-slate-400 text-sm">+20 pontos adicionados ao seu perfil.</p>
        </div>
        <button onClick={() => { navigate(`/c/${token}`); onDone() }} className="btn-primary gap-2">
          Ver meu perfil <ArrowRight size={16} />
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <div>
        <h2 className="text-xl font-bold text-white">{pesquisa.titulo}</h2>
        {pesquisa.descricao && <p className="text-sm text-slate-500 mt-1">{pesquisa.descricao}</p>}
      </div>
      {pesquisa.perguntas.map((q, i) => (
        <div key={q.id} className="card p-4">
          <p className="text-sm font-medium text-white mb-3">
            <span className="text-blue-400 mr-2">{i + 1}.</span>
            {q.texto}
            {q.obrigatoria && <span className="text-red-400 ml-1">*</span>}
          </p>
          {q.tipo === 'scale' && (
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map(n => (
                <button key={n} onClick={() => setAnswers(a => ({ ...a, [q.id]: n }))}
                  className={`flex-1 h-10 rounded-xl font-bold transition-all ${Number(answers[q.id]) === n ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'}`}>
                  {n}
                </button>
              ))}
            </div>
          )}
          {q.tipo === 'yesno' && (
            <div className="flex gap-3">
              {['sim', 'não'].map(opt => (
                <button key={opt} onClick={() => setAnswers(a => ({ ...a, [q.id]: opt }))}
                  className={`flex-1 py-3 rounded-xl font-semibold capitalize transition-all ${answers[q.id] === opt ? (opt === 'sim' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white') : 'bg-slate-800 text-slate-400'}`}>
                  {opt === 'sim' ? 'Sim' : 'Não'}
                </button>
              ))}
            </div>
          )}
          {q.tipo === 'multiple' && q.opcoes && (
            <div className="space-y-2">
              {q.opcoes.map(opt => (
                <button key={opt} onClick={() => setAnswers(a => ({ ...a, [q.id]: opt }))}
                  className={`w-full text-left py-3 px-4 rounded-xl text-sm transition-all ${answers[q.id] === opt ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'}`}>
                  {opt}
                </button>
              ))}
            </div>
          )}
          {q.tipo === 'text' && (
            <textarea value={String(answers[q.id] ?? '')} onChange={e => setAnswers(a => ({ ...a, [q.id]: e.target.value }))}
              placeholder="Sua resposta..." rows={3} className="input resize-none" />
          )}
        </div>
      ))}
      <button onClick={handleSubmit} disabled={!canSubmit || submitting} className="btn-primary w-full disabled:opacity-40">
        {submitting ? 'Enviando...' : 'Enviar Respostas'}
      </button>
    </div>
  )
}

// ─── Profile View ─────────────────────────────────────────────────────────────

function ProfileView({ colaborador, testes, pontuacoes, token }: {
  colaborador: DbColaborador
  testes: DbTestePerfil[]
  pontuacoes: DbPontuacao[]
  token: string
}) {
  const navigate = useNavigate()
  const initials = colaborador.nome.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
  const testesFaltando = ALL_TESTS.filter(t => !testes.some(r => r.tipo === t.type))
  const progressPct = Math.round((testes.length / ALL_TESTS.length) * 100)

  const levelLabel = colaborador.pontos_total >= 200 ? '🏆 Elite' :
    colaborador.pontos_total >= 100 ? '⭐ Destaque' :
    colaborador.pontos_total >= 50 ? '📈 Em evolução' : '🌱 Iniciando'

  return (
    <div className="space-y-5">
      {/* Profile card */}
      <div className="card p-5 text-center">
        <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center mb-3">
          <span className="text-white font-bold text-2xl">{initials}</span>
        </div>
        <h2 className="text-xl font-bold text-white">{colaborador.nome}</h2>
        {colaborador.cargo && <p className="text-sm text-slate-500 mt-0.5">{colaborador.cargo}</p>}

        <div className="flex items-center justify-center gap-2 mt-3">
          <Trophy size={16} className="text-amber-400" />
          <span className="text-2xl font-bold text-amber-400">{colaborador.pontos_total}</span>
          <span className="text-slate-500 text-sm">pontos</span>
        </div>
        <span className="inline-block mt-1 text-sm font-medium text-slate-400">{levelLabel}</span>

        <div className="mt-4">
          <div className="flex justify-between text-xs text-slate-500 mb-1.5">
            <span>Progresso nos testes</span>
            <span>{testes.length}/{ALL_TESTS.length} ({progressPct}%)</span>
          </div>
          <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-blue-600 to-blue-400 rounded-full transition-all duration-700" style={{ width: `${progressPct}%` }} />
          </div>
        </div>
      </div>

      {/* Testes pendentes */}
      {testesFaltando.length > 0 && (
        <div className="card p-4">
          <p className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
            <Brain size={16} className="text-purple-400" /> Testes disponíveis para você
          </p>
          <div className="space-y-2">
            {testesFaltando.map(t => (
              <button
                key={t.type}
                onClick={() => navigate(`/c/${token}/teste/${t.type}`)}
                className="w-full flex items-center gap-3 bg-slate-800/60 hover:bg-slate-700/60 border border-slate-700/40 rounded-xl p-3 transition-all"
              >
                <span className="text-xl">{TEST_ICONS[t.type]}</span>
                <div className="text-left flex-1">
                  <p className="text-sm font-medium text-white">{t.title}</p>
                  <p className="text-xs text-slate-500">{t.subtitle}</p>
                </div>
                <div className="flex items-center gap-1 text-xs text-amber-400">
                  <Star size={10} /> +{t.type === 'vac' ? 30 : 50} pts
                </div>
                <ArrowRight size={14} className="text-slate-500" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Resultados dos testes */}
      {testes.length > 0 && (
        <div className="card p-4">
          <p className="text-sm font-semibold text-white mb-3">Meus Resultados</p>
          <div className="space-y-4">
            {testes.map(r => {
              const test = getTestDef(r.tipo as PsychTestType)
              const interp = test.interpret(r.scores)
              const data = test.dimensions.map(d => ({
                subject: d.label,
                value: Number(((r.scores[d.key] ?? 0) * (test.questions[0].type === 'scale5' ? 1 : 5)).toFixed(1)),
                fullMark: 5,
              }))
              return (
                <div key={r.id} className="bg-slate-800/50 rounded-xl p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">{TEST_ICONS[r.tipo]}</span>
                    <div>
                      <p className="font-medium text-white text-sm">{test.title}</p>
                      <p className="text-xs text-slate-500">{interp.profile.split('—')[0]}</p>
                    </div>
                  </div>
                  <div className="h-32">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart data={data}>
                        <PolarGrid stroke="#334155" />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 9 }} />
                        <Radar dataKey="value" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.25} strokeWidth={2} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-2 space-y-1">
                    {interp.insights.slice(0, 2).map((ins, i) => (
                      <p key={i} className="text-xs text-slate-400 flex gap-1.5">
                        <CheckCircle size={11} className="text-blue-400 flex-shrink-0 mt-0.5" />
                        {ins}
                      </p>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Pontuação */}
      {pontuacoes.length > 0 && (
        <div className="card p-4">
          <p className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
            <Trophy size={14} className="text-amber-400" /> Histórico de pontos
          </p>
          <div className="space-y-2">
            {pontuacoes.slice(0, 10).map(p => (
              <div key={p.id} className="flex items-center justify-between text-sm">
                <span className="text-slate-400 capitalize">{p.descricao || p.tipo}</span>
                <span className="text-emerald-400 font-bold">+{p.pontos}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Dicas de desenvolvimento */}
      <div className="bg-blue-500/5 border border-blue-500/20 rounded-2xl p-4">
        <p className="text-sm font-semibold text-blue-300 mb-2">💡 Dicas para o seu desenvolvimento</p>
        <div className="space-y-2 text-xs text-slate-400">
          {testes.length === 0 && <p>• Comece pelos testes de perfil — eles ajudam você e seu gestor a entender seus pontos fortes.</p>}
          {testes.length > 0 && testes.length < 3 && <p>• Continue respondendo os testes para ter um perfil mais completo.</p>}
          {testes.length >= 3 && <p>• Seu perfil está ficando cada vez mais completo. Continue evoluindo!</p>}
          <p>• Responda pesquisas quando seu gestor enviar — cada resposta conta pontos para você.</p>
          <p>• Sua pontuação reflete seu engajamento e desenvolvimento contínuo.</p>
        </div>
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ColaboradorPublicPage() {
  const { token, testType, pesquisaId } = useParams<{
    token: string
    testType?: string
    pesquisaId?: string
  }>()
  const navigate = useNavigate()

  const [colaborador, setColaborador] = useState<DbColaborador | null>(null)
  const [testes, setTestes] = useState<DbTestePerfil[]>([])
  const [pontuacoes, setPontuacoes] = useState<DbPontuacao[]>([])
  const [pesquisa, setPesquisa] = useState<DbPesquisa | null>(null)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!token) return
    getColaboradorByToken(token).then(col => {
      if (!col) { setNotFound(true); return }
      setColaborador(col)
      Promise.all([
        getTestesForColaborador(col.id),
        getPontuacoes(col.id),
      ]).then(([t, p]) => {
        setTestes(t)
        setPontuacoes(p)
      })
    })
  }, [token])

  useEffect(() => {
    if (pesquisaId) {
      getPesquisaById(pesquisaId).then(p => setPesquisa(p))
    }
  }, [pesquisaId])

  if (notFound) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 gap-4">
        <span className="text-5xl">🔍</span>
        <p className="text-white font-semibold">Link inválido ou expirado</p>
        <p className="text-slate-500 text-sm text-center">Peça ao seu gestor um novo link.</p>
      </div>
    )
  }

  if (!colaborador) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Top bar */}
      <div className="bg-slate-900 border-b border-slate-800 px-4 py-3">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl flex items-center justify-center">
            <Anchor size={14} className="text-white" />
          </div>
          <div>
            <p className="text-xs text-slate-500">PortoGest Pro</p>
            <p className="text-sm font-semibold text-white leading-tight">
              {testType ? getTestDef(testType as PsychTestType).title :
               pesquisaId ? (pesquisa?.titulo ?? 'Pesquisa') :
               'Meu Perfil'}
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-5 pb-10">
        {/* Show test page */}
        {testType && (
          <PsychTestPage
            publicMode={{ colaboradorId: colaborador.id, colaboradorNome: colaborador.nome, token: token! }}
          />
        )}

        {/* Show survey */}
        {pesquisaId && !testType && (
          pesquisa ? (
            <SurveyResponder
              pesquisa={pesquisa}
              colaboradorId={colaborador.id}
              token={token!}
              onDone={() => navigate(`/c/${token}`)}
            />
          ) : (
            <div className="text-center py-16 text-slate-500">Carregando pesquisa...</div>
          )
        )}

        {/* Profile view */}
        {!testType && !pesquisaId && (
          <ProfileView
            colaborador={colaborador}
            testes={testes}
            pontuacoes={pontuacoes}
            token={token!}
          />
        )}
      </div>
    </div>
  )
}
