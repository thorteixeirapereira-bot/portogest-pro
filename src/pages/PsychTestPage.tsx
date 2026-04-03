import { useState, useEffect } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowLeft, ArrowRight, CheckCircle, ChevronDown } from 'lucide-react'
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip } from 'recharts'
import { getTestDef, type PsychTestDef } from '../lib/psychTests'
import { useTestesStore } from '../store/testesSupabase'
import { useColaboradoresStore } from '../store/colaboradoresSupabase'
import type { PsychTestType } from '../types'

// ─── Score calculation ────────────────────────────────────────────────────────

function calcScores(test: PsychTestDef, answers: Record<string, string | number>): Record<string, number> {
  const totals: Record<string, number[]> = {}
  test.dimensions.forEach(d => { totals[d.key] = [] })

  test.questions.forEach(q => {
    const answer = answers[q.id]
    if (answer === undefined) return
    if (q.type === 'scale5') {
      const dim = q.options[0].dimension
      totals[dim]?.push(Number(answer))
    } else {
      const selected = q.options.find(o => o.text === answer)
      if (selected) totals[selected.dimension]?.push(1)
    }
  })

  const result: Record<string, number> = {}
  test.dimensions.forEach(d => {
    const vals = totals[d.key]
    result[d.key] = vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0
  })
  return result
}

// ─── Result Chart ─────────────────────────────────────────────────────────────

function ResultChart({ test, scores }: { test: PsychTestDef; scores: Record<string, number> }) {
  const data = test.dimensions.map(d => ({
    subject: d.label,
    value: Number(((scores[d.key] ?? 0) * (test.questions[0].type === 'scale5' ? 1 : 5)).toFixed(1)),
    fullMark: 5,
  }))

  return (
    <div className="h-56">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data}>
          <PolarGrid stroke="#334155" />
          <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 11 }} />
          <Radar name="Você" dataKey="value" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.25} strokeWidth={2} />
          <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 12 }}
            labelStyle={{ color: '#fff' }} itemStyle={{ color: '#60a5fa' }} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  )
}

// ─── Results Screen ───────────────────────────────────────────────────────────

function ResultsScreen({ test, scores, employeeName, onBack }: {
  test: PsychTestDef; scores: Record<string, number>; employeeName: string; onBack: () => void
}) {
  const interpretation = test.interpret(scores)
  return (
    <div className="animate-fade-in space-y-4 pb-8">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="btn-ghost w-9 h-9 !px-0 !py-0"><ArrowLeft size={18} /></button>
        <div>
          <p className="text-xs text-slate-500">{employeeName}</p>
          <h2 className="text-lg font-bold text-white">{test.title} — Resultado</h2>
        </div>
      </div>
      <div className="card p-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-2xl">{test.icon}</span>
          <div>
            <p className="text-xs text-slate-500">{test.subtitle}</p>
            <p className="font-semibold text-white">{interpretation.profile}</p>
          </div>
        </div>
        <ResultChart test={test} scores={scores} />
      </div>
      <div className="card p-4 space-y-3">
        <p className="text-sm font-semibold text-slate-300 mb-1">Dimensões</p>
        {test.dimensions.map(dim => {
          const raw = scores[dim.key] || 0
          const pct = Math.min(100, (raw / 5) * 100)
          return (
            <div key={dim.key}>
              <div className="flex justify-between mb-1">
                <span className="text-xs text-slate-400 font-medium">{dim.label}</span>
                <span className="text-xs font-bold" style={{ color: dim.color }}>
                  {(raw * (test.questions[0].type === 'scale5' ? 1 : 5)).toFixed(1)}
                </span>
              </div>
              <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: dim.color }} />
              </div>
              <p className="text-xs text-slate-600 mt-0.5">{dim.description}</p>
            </div>
          )
        })}
      </div>
      <div className="card p-4">
        <p className="text-sm font-semibold text-slate-300 mb-3">Insights</p>
        <div className="space-y-2">
          {interpretation.insights.map((insight, i) => (
            <div key={i} className="flex gap-2 items-start">
              <CheckCircle size={14} className="text-blue-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-slate-400">{insight}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Quiz Screen ──────────────────────────────────────────────────────────────

function QuizScreen({ test, employeeName, onComplete }: {
  test: PsychTestDef; employeeName: string; onComplete: (scores: Record<string, number>) => void
}) {
  const [current, setCurrent] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string | number>>({})
  const q = test.questions[current]
  const total = test.questions.length
  const progress = (current / total) * 100
  const canNext = answers[q.id] !== undefined
  const scaleLabels = ['', 'Discordo totalmente', 'Discordo', 'Neutro', 'Concordo', 'Concordo totalmente']

  const handleNext = () => {
    if (current < total - 1) setCurrent(c => c + 1)
    else onComplete(calcScores(test, answers))
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-5">
        <div className="flex justify-between text-xs text-slate-500 mb-1.5">
          <span>{employeeName}</span>
          <span>{current + 1} / {total}</span>
        </div>
        <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
          <div className="h-full bg-blue-500 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>
      </div>
      <div className="card p-5 mb-4">
        <p className="text-xs text-slate-500 mb-3">{test.icon} {test.title} · Pergunta {current + 1}</p>
        <p className="text-base font-semibold text-white leading-snug">{q.text}</p>
      </div>
      <div className="space-y-2.5 mb-5">
        {q.type === 'scale5' ? (
          [1, 2, 3, 4, 5].map(n => (
            <button key={n} onClick={() => setAnswers(a => ({ ...a, [q.id]: n }))}
              className={`w-full flex items-center gap-3 rounded-2xl px-4 py-3 transition-all text-left ${
                Number(answers[q.id]) === n
                  ? 'bg-blue-600 text-white border border-blue-500'
                  : 'bg-slate-800/60 text-slate-300 border border-slate-700/40 hover:bg-slate-700/60'
              }`}>
              <span className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold flex-shrink-0 ${
                Number(answers[q.id]) === n ? 'bg-white/20' : 'bg-slate-700'
              }`}>{n}</span>
              <span className="text-sm">{scaleLabels[n]}</span>
            </button>
          ))
        ) : (
          q.options.map((opt, i) => (
            <button key={i} onClick={() => setAnswers(a => ({ ...a, [q.id]: opt.text }))}
              className={`w-full text-left rounded-2xl px-4 py-3.5 transition-all text-sm font-medium ${
                answers[q.id] === opt.text
                  ? 'bg-blue-600 text-white border border-blue-500'
                  : 'bg-slate-800/60 text-slate-300 border border-slate-700/40 hover:bg-slate-700/60'
              }`}>
              {opt.text}
            </button>
          ))
        )}
      </div>
      <button onClick={handleNext} disabled={!canNext} className="btn-primary w-full disabled:opacity-40 gap-2">
        {current < total - 1 ? <><span>Próxima</span><ArrowRight size={16} /></> : <><CheckCircle size={16} /><span>Ver Resultado</span></>}
      </button>
    </div>
  )
}

// ─── Employee Selector ────────────────────────────────────────────────────────

function EmployeeSelector({ onSelect, defaultId }: { onSelect: (id: string, name: string) => void; defaultId?: string }) {
  const { colaboradores, fetchColaboradores } = useColaboradoresStore()
  const [search, setSearch] = useState('')
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState('')

  useEffect(() => {
    fetchColaboradores().then(() => {
      if (defaultId) {
        const col = colaboradores.find(c => c.id === defaultId)
        if (col) { setSelected(col.nome); onSelect(col.id, col.nome) }
      }
    })
  }, [defaultId])

  // Re-check after colaboradores load
  useEffect(() => {
    if (defaultId && colaboradores.length > 0) {
      const col = colaboradores.find(c => c.id === defaultId)
      if (col && !selected) { setSelected(col.nome); onSelect(col.id, col.nome) }
    }
  }, [colaboradores, defaultId])

  const filtered = colaboradores.filter(c => c.ativo && c.nome.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="relative">
      <label className="label">Selecionar Colaborador *</label>
      <button type="button" onClick={() => setOpen(o => !o)}
        className="input flex items-center justify-between gap-2 text-left">
        <span className={selected ? 'text-white' : 'text-slate-400'}>{selected || 'Escolha um colaborador...'}</span>
        <ChevronDown size={16} className="text-slate-500 flex-shrink-0" />
      </button>
      {open && (
        <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden shadow-xl max-h-60 flex flex-col">
          <div className="p-2 border-b border-slate-700">
            <input autoFocus value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar..." className="input text-sm py-2" />
          </div>
          <div className="overflow-y-auto">
            {filtered.map(col => (
              <button key={col.id} onClick={() => { onSelect(col.id, col.nome); setSelected(col.nome); setOpen(false) }}
                className="w-full text-left px-4 py-2.5 hover:bg-slate-700 transition-colors">
                <p className="text-sm text-white font-medium">{col.nome}</p>
                <p className="text-xs text-slate-500">{col.cargo}</p>
              </button>
            ))}
            {filtered.length === 0 && <p className="text-sm text-slate-500 p-4 text-center">Nenhum resultado</p>}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Props interface for public mode ─────────────────────────────────────────

interface PublicModeProps {
  colaboradorId: string
  colaboradorNome: string
  token: string
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function PsychTestPage({ publicMode }: { publicMode?: PublicModeProps }) {
  const { testType: routeTestType } = useParams<{ testType?: string }>()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { saveResult } = useTestesStore()
  const { addPontos } = useColaboradoresStore()

  // Determine testType from route or query param
  const testType = routeTestType || searchParams.get('tipo') || undefined
  const defaultColaboradorId = publicMode?.colaboradorId || searchParams.get('colaborador') || undefined

  const [selectedEmployee, setSelectedEmployee] = useState<{ id: string; name: string } | null>(
    publicMode ? { id: publicMode.colaboradorId, name: publicMode.colaboradorNome } : null
  )
  const [stage, setStage] = useState<'setup' | 'quiz' | 'results'>('setup')
  const [scores, setScores] = useState<Record<string, number>>({})
  const [currentTest, setCurrentTest] = useState<PsychTestDef | null>(null)

  useEffect(() => {
    if (testType) {
      setCurrentTest(getTestDef(testType as PsychTestType))
      if (publicMode) setStage('quiz')
    }
  }, [testType])

  if (!testType || !currentTest) {
    navigate(publicMode ? `/c/${publicMode.token}` : '/testes')
    return null
  }

  const handleComplete = async (newScores: Record<string, number>) => {
    if (!selectedEmployee) return
    setScores(newScores)
    await saveResult(selectedEmployee.id, testType as PsychTestType, newScores)
    await addPontos(selectedEmployee.id, testType, `Teste ${currentTest.title}`)
    setStage('results')
  }

  const handleBack = () => {
    if (publicMode) navigate(`/c/${publicMode.token}`)
    else navigate('/testes')
  }

  return (
    <div className={publicMode ? '' : 'px-4 py-4 animate-fade-in max-w-lg mx-auto'}>
      {stage === 'setup' && !publicMode && (
        <div className="space-y-5">
          <div className="flex items-center gap-3">
            <button onClick={handleBack} className="btn-ghost w-9 h-9 !px-0 !py-0"><ArrowLeft size={18} /></button>
            <div>
              <p className="text-xs text-slate-500">{currentTest.subtitle}</p>
              <h2 className="text-xl font-bold text-white">{currentTest.icon} {currentTest.title}</h2>
            </div>
          </div>
          <div className="card p-4">
            <p className="text-sm text-slate-400 leading-relaxed">{currentTest.instructions}</p>
            <p className="text-xs text-slate-600 mt-2">{currentTest.questions.length} questões</p>
          </div>
          <EmployeeSelector onSelect={(id, name) => setSelectedEmployee({ id, name })} defaultId={defaultColaboradorId} />
          <button onClick={() => setStage('quiz')} disabled={!selectedEmployee} className="btn-primary w-full disabled:opacity-40 gap-2">
            Iniciar Teste <ArrowRight size={16} />
          </button>
        </div>
      )}
      {stage === 'quiz' && selectedEmployee && (
        <QuizScreen test={currentTest} employeeName={selectedEmployee.name} onComplete={handleComplete} />
      )}
      {stage === 'results' && selectedEmployee && (
        <ResultsScreen test={currentTest} scores={scores} employeeName={selectedEmployee.name} onBack={handleBack} />
      )}
    </div>
  )
}
