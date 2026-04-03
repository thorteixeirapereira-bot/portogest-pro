import { useEffect, useState } from 'react'
import { Plus, ChevronDown, ChevronUp, ClipboardCheck, BarChart2, QrCode, X } from 'lucide-react'
import { useSurveysStore } from '../store/surveysStore'
import { useAuthStore } from '../store/authStore'
import type { Survey, SurveyQuestion, SurveyResponse, QuestionType } from '../types'

// ─── Survey Result Viewer ─────────────────────────────────────────────────────

function SurveyResults({ survey }: { survey: Survey }) {
  const { questions, responses } = survey

  return (
    <div className="space-y-4 mt-3">
      <p className="text-xs text-slate-500">{responses.length} resposta{responses.length !== 1 ? 's' : ''}</p>
      {questions.map(q => {
        const answers = responses.map(r => r.answers[q.id]).filter(Boolean)
        if (answers.length === 0) return null

        if (q.type === 'scale') {
          const avg = answers.reduce((a: number, b) => a + Number(b), 0) / answers.length
          const distribution = [1, 2, 3, 4, 5].map(v => ({
            value: v,
            count: answers.filter(a => Number(a) === v).length,
          }))
          const max = Math.max(...distribution.map(d => d.count), 1)

          return (
            <div key={q.id} className="bg-slate-800/50 rounded-xl p-4">
              <p className="text-sm font-medium text-white mb-3">{q.text}</p>
              <p className="text-2xl font-bold text-amber-400 mb-2">{avg.toFixed(1)} <span className="text-sm text-slate-500">/ 5</span></p>
              <div className="flex items-end gap-1 h-12">
                {distribution.map(d => (
                  <div key={d.value} className="flex-1 flex flex-col items-center gap-1">
                    <div
                      className="w-full bg-blue-600 rounded-sm transition-all"
                      style={{ height: `${(d.count / max) * 40}px`, minHeight: d.count > 0 ? 4 : 0 }}
                    />
                    <span className="text-[9px] text-slate-500">{d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )
        }

        if (q.type === 'yesno') {
          const sim = answers.filter(a => a === 'sim').length
          const nao = answers.filter(a => a === 'não').length
          return (
            <div key={q.id} className="bg-slate-800/50 rounded-xl p-4">
              <p className="text-sm font-medium text-white mb-3">{q.text}</p>
              <div className="flex gap-3">
                <div className="flex-1 bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 text-center">
                  <p className="text-2xl font-bold text-emerald-400">{sim}</p>
                  <p className="text-xs text-slate-500">Sim</p>
                </div>
                <div className="flex-1 bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-center">
                  <p className="text-2xl font-bold text-red-400">{nao}</p>
                  <p className="text-xs text-slate-500">Não</p>
                </div>
              </div>
            </div>
          )
        }

        if (q.type === 'multiple') {
          const countMap: Record<string, number> = {}
          answers.forEach((a: unknown) => { const s = String(a); countMap[s] = (countMap[s] || 0) + 1 })
          const max = Math.max(...Object.values(countMap), 1)

          return (
            <div key={q.id} className="bg-slate-800/50 rounded-xl p-4">
              <p className="text-sm font-medium text-white mb-3">{q.text}</p>
              <div className="space-y-2">
                {Object.entries(countMap).sort((a, b) => b[1] - a[1]).map(([opt, count]) => (
                  <div key={opt} className="flex items-center gap-2">
                    <span className="text-xs text-slate-400 w-24 truncate">{opt}</span>
                    <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full"
                        style={{ width: `${(count / max) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-white font-medium w-4 text-right">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          )
        }

        if (q.type === 'text') {
          return (
            <div key={q.id} className="bg-slate-800/50 rounded-xl p-4">
              <p className="text-sm font-medium text-white mb-2">{q.text}</p>
              <div className="space-y-1.5">
                {(answers as string[]).filter(Boolean).map((a, i) => (
                  <p key={i} className="text-xs text-slate-400 bg-slate-900/50 rounded-lg px-3 py-2">"{a}"</p>
                ))}
              </div>
            </div>
          )
        }

        return null
      })}
    </div>
  )
}

// ─── Survey Card ──────────────────────────────────────────────────────────────

function SurveyCard({ survey }: { survey: Survey }) {
  const [expanded, setExpanded] = useState(false)
  const { updateSurvey } = useSurveysStore()

  const toggleActive = () => updateSurvey({ ...survey, active: !survey.active })

  return (
    <div className="card p-4">
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-0.5">
            <h3 className="font-semibold text-white truncate">{survey.title}</h3>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${
              survey.active ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-700 text-slate-500'
            }`}>
              {survey.active ? 'Ativa' : 'Inativa'}
            </span>
          </div>
          {survey.description && <p className="text-xs text-slate-500">{survey.description}</p>}
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={toggleActive}
            className={`w-10 h-6 rounded-full transition-colors relative flex-shrink-0 ${survey.active ? 'bg-blue-600' : 'bg-slate-600'}`}
            aria-label={survey.active ? 'Desativar pesquisa' : 'Ativar pesquisa'}
          >
            <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${survey.active ? 'translate-x-4' : ''}`} />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-3 text-xs text-slate-500 mb-3">
        <span className="flex items-center gap-1"><ClipboardCheck size={11} /> {survey.questions.length} perguntas</span>
        <span className="flex items-center gap-1"><BarChart2 size={11} /> {survey.responses.length} respostas</span>
      </div>

      <button
        onClick={() => setExpanded(e => !e)}
        className="flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 transition-colors"
      >
        {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        {expanded ? 'Ocultar resultados' : 'Ver resultados'}
      </button>

      {expanded && <SurveyResults survey={survey} />}
    </div>
  )
}

// ─── New Survey Form ──────────────────────────────────────────────────────────

function NewSurveyModal({ onClose }: { onClose: () => void }) {
  const { addSurvey } = useSurveysStore()
  const { user } = useAuthStore()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [questions, setQuestions] = useState<Omit<SurveyQuestion, 'id'>[]>([
    { text: '', type: 'scale', required: true },
  ])

  const addQuestion = () =>
    setQuestions(q => [...q, { text: '', type: 'scale', required: false }])

  const removeQuestion = (i: number) =>
    setQuestions(q => q.filter((_, idx) => idx !== i))

  const updateQuestion = (i: number, updates: Partial<Omit<SurveyQuestion, 'id'>>) =>
    setQuestions(q => q.map((item, idx) => idx === i ? { ...item, ...updates } : item))

  const handleSave = async () => {
    if (!title.trim()) return
    const survey: Survey = {
      id: `survey-${Date.now()}`,
      title: title.trim(),
      description: description.trim() || undefined,
      questions: questions.filter(q => q.text.trim()).map((q, i) => ({ ...q, id: `q${i + 1}` })),
      active: true,
      responses: [],
      createdById: user?.id || '',
      createdAt: new Date().toISOString(),
    }
    await addSurvey(survey)
    onClose()
  }

  const questionTypes: Array<{ value: QuestionType; label: string }> = [
    { value: 'scale', label: 'Escala 1-5' },
    { value: 'yesno', label: 'Sim/Não' },
    { value: 'text', label: 'Texto livre' },
    { value: 'multiple', label: 'Múltipla escolha' },
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/80 backdrop-blur-sm">
      <div className="w-full sm:max-w-lg bg-slate-900 border border-slate-700/50 rounded-t-3xl sm:rounded-3xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-slate-700/50 flex-shrink-0">
          <h2 className="text-lg font-bold text-white">Nova Pesquisa</h2>
          <button onClick={onClose} className="btn-ghost w-10 h-10 !px-0 !py-0"><X size={20} /></button>
        </div>

        <div className="overflow-y-auto flex-1 px-5 py-4 space-y-4">
          <div>
            <label className="label">Título *</label>
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Ex: Pesquisa de Clima" className="input" />
          </div>
          <div>
            <label className="label">Descrição</label>
            <input value={description} onChange={e => setDescription(e.target.value)} placeholder="Descrição opcional" className="input" />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="label !mb-0">Perguntas</label>
              <button onClick={addQuestion} className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1">
                <Plus size={12} /> Adicionar
              </button>
            </div>
            <div className="space-y-3">
              {questions.map((q, i) => (
                <div key={i} className="bg-slate-800/50 rounded-xl p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500 font-medium">Pergunta {i + 1}</span>
                    {questions.length > 1 && (
                      <button onClick={() => removeQuestion(i)} className="text-red-400 hover:text-red-300">
                        <X size={14} />
                      </button>
                    )}
                  </div>
                  <input
                    value={q.text}
                    onChange={e => updateQuestion(i, { text: e.target.value })}
                    placeholder="Texto da pergunta..."
                    className="input text-sm"
                  />
                  <div className="flex gap-2">
                    <select
                      value={q.type}
                      onChange={e => updateQuestion(i, { type: e.target.value as QuestionType })}
                      className="input text-sm flex-1"
                    >
                      {questionTypes.map(t => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                      ))}
                    </select>
                    <label className="flex items-center gap-1.5 text-xs text-slate-400 flex-shrink-0">
                      <input
                        type="checkbox"
                        checked={q.required}
                        onChange={e => updateQuestion(i, { required: e.target.checked })}
                        className="accent-blue-500"
                      />
                      Obrigatória
                    </label>
                  </div>
                  {q.type === 'multiple' && (
                    <input
                      placeholder="Opções separadas por vírgula"
                      className="input text-sm"
                      onChange={e => updateQuestion(i, { options: e.target.value.split(',').map(s => s.trim()) })}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="px-5 pb-5 pt-3 border-t border-slate-700/50 flex-shrink-0">
          <button onClick={handleSave} disabled={!title.trim()} className="btn-primary w-full disabled:opacity-40">
            Criar Pesquisa
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SurveysPage() {
  const { surveys, fetchSurveys } = useSurveysStore()
  const [showForm, setShowForm] = useState(false)

  useEffect(() => { fetchSurveys() }, [])

  const active = surveys.filter(s => s.active)
  const inactive = surveys.filter(s => !s.active)

  return (
    <div className="px-4 py-4 space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white mb-1">Pesquisas</h2>
          <p className="text-sm text-slate-500">{surveys.length} pesquisa{surveys.length !== 1 ? 's' : ''} criada{surveys.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary px-4 py-2.5 text-sm !min-h-0">
          <Plus size={16} /> Nova
        </button>
      </div>

      {surveys.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <span className="text-5xl">📊</span>
          <p className="text-slate-500">Nenhuma pesquisa criada</p>
          <button onClick={() => setShowForm(true)} className="btn-primary">
            <Plus size={16} /> Criar Pesquisa
          </button>
        </div>
      ) : (
        <>
          {active.length > 0 && (
            <div>
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wide mb-2">Ativas</p>
              <div className="space-y-3">
                {active.map(s => <SurveyCard key={s.id} survey={s} />)}
              </div>
            </div>
          )}
          {inactive.length > 0 && (
            <div>
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wide mb-2">Inativas</p>
              <div className="space-y-3">
                {inactive.map(s => <SurveyCard key={s.id} survey={s} />)}
              </div>
            </div>
          )}
        </>
      )}

      {showForm && <NewSurveyModal onClose={() => setShowForm(false)} />}
    </div>
  )
}
