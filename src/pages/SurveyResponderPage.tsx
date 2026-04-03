import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { CheckCircle, Anchor } from 'lucide-react'
import { useSurveysStore } from '../store/surveysStore'
import type { Survey, SurveyResponse } from '../types'

function QuestionField({
  question,
  value,
  onChange,
}: {
  question: Survey['questions'][0]
  value: string | number | undefined
  onChange: (v: string | number) => void
}) {
  if (question.type === 'scale') {
    return (
      <div className="flex gap-2 flex-wrap">
        {[1, 2, 3, 4, 5].map(n => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            className={`w-12 h-12 rounded-xl font-bold text-lg transition-all ${
              Number(value) === n
                ? 'bg-blue-600 text-white shadow-lg scale-105'
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
            }`}
          >
            {n}
          </button>
        ))}
        <span className="text-xs text-slate-500 self-center ml-1">1 = Ruim · 5 = Ótimo</span>
      </div>
    )
  }

  if (question.type === 'yesno') {
    return (
      <div className="flex gap-3">
        {['sim', 'não'].map(opt => (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(opt)}
            className={`flex-1 py-3 rounded-xl font-semibold capitalize transition-all ${
              value === opt
                ? opt === 'sim' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
            }`}
          >
            {opt === 'sim' ? 'Sim' : 'Não'}
          </button>
        ))}
      </div>
    )
  }

  if (question.type === 'multiple' && question.options) {
    return (
      <div className="flex flex-col gap-2">
        {question.options.map(opt => (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(opt)}
            className={`py-3 px-4 rounded-xl text-left text-sm font-medium transition-all ${
              value === opt
                ? 'bg-blue-600 text-white'
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
    )
  }

  if (question.type === 'text') {
    return (
      <textarea
        value={String(value || '')}
        onChange={e => onChange(e.target.value)}
        placeholder="Escreva sua resposta aqui..."
        rows={3}
        className="input resize-none"
      />
    )
  }

  return null
}

export default function SurveyResponderPage() {
  const { surveyId } = useParams<{ surveyId: string }>()
  const { surveys, fetchSurveys, addResponse } = useSurveysStore()
  const [survey, setSurvey] = useState<Survey | null>(null)
  const [answers, setAnswers] = useState<Record<string, string | number>>({})
  const [respondentName, setRespondentName] = useState('')
  const [step, setStep] = useState<'name' | 'questions' | 'done'>('name')
  const [submitting, setSubmitting] = useState(false)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    fetchSurveys().then(() => {
      const s = surveys.find(sv => sv.id === surveyId)
      if (!s) setNotFound(true)
      else setSurvey(s)
    })
  }, [surveyId])

  // Re-find survey after fetch
  useEffect(() => {
    if (surveys.length > 0 && surveyId) {
      const s = surveys.find(sv => sv.id === surveyId)
      if (!s) setNotFound(true)
      else { setSurvey(s); setNotFound(false) }
    }
  }, [surveys, surveyId])

  const setAnswer = (qId: string, value: string | number) => {
    setAnswers(a => ({ ...a, [qId]: value }))
  }

  const canSubmit = () => {
    if (!survey) return false
    return survey.questions
      .filter(q => q.required)
      .every(q => answers[q.id] !== undefined && answers[q.id] !== '')
  }

  const handleSubmit = async () => {
    if (!survey || !canSubmit()) return
    setSubmitting(true)
    const response: SurveyResponse = {
      id: `resp-${Date.now()}`,
      surveyId: survey.id,
      respondentName: respondentName.trim() || 'Anônimo',
      answers,
      submittedAt: new Date().toISOString(),
    }
    await addResponse(survey.id, response)
    setSubmitting(false)
    setStep('done')
  }

  // Loading
  if (!survey && !notFound) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-slate-500">Carregando pesquisa...</div>
      </div>
    )
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 gap-4">
        <span className="text-5xl">🔍</span>
        <p className="text-white font-semibold">Pesquisa não encontrada</p>
        <p className="text-slate-500 text-sm text-center">Verifique o link ou peça ao gestor para abrir a pesquisa correta.</p>
      </div>
    )
  }

  if (!survey?.active) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 gap-4">
        <span className="text-5xl">🔒</span>
        <p className="text-white font-semibold">Pesquisa encerrada</p>
        <p className="text-slate-500 text-sm text-center">Esta pesquisa não está mais aceitando respostas.</p>
      </div>
    )
  }

  if (step === 'done') {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 gap-6 animate-fade-in">
        <div className="w-20 h-20 bg-emerald-500/10 border-2 border-emerald-500/40 rounded-full flex items-center justify-center">
          <CheckCircle size={40} className="text-emerald-400" />
        </div>
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-2">Obrigado!</h2>
          <p className="text-slate-400">Sua resposta foi registrada com sucesso.</p>
        </div>
        <div className="flex items-center gap-2 text-slate-600 text-sm">
          <Anchor size={14} />
          <span>PortoGest Pro</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <div className="bg-slate-900 border-b border-slate-800 px-4 py-4">
        <div className="flex items-center gap-3 max-w-lg mx-auto">
          <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl flex items-center justify-center">
            <Anchor size={16} className="text-white" />
          </div>
          <div>
            <p className="text-xs text-slate-500">PortoGest Pro</p>
            <h1 className="text-sm font-semibold text-white leading-tight">{survey.title}</h1>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-5">
        {step === 'name' && (
          <div className="animate-fade-in space-y-5">
            <div>
              <h2 className="text-xl font-bold text-white mb-1">{survey.title}</h2>
              {survey.description && <p className="text-slate-500 text-sm">{survey.description}</p>}
              <p className="text-slate-600 text-xs mt-2">{survey.questions.length} pergunta{survey.questions.length !== 1 ? 's' : ''}</p>
            </div>
            <div>
              <label className="label">Seu nome <span className="text-slate-600">(opcional)</span></label>
              <input
                value={respondentName}
                onChange={e => setRespondentName(e.target.value)}
                placeholder="Nome ou deixe em branco para responder anonimamente"
                className="input"
              />
            </div>
            <button onClick={() => setStep('questions')} className="btn-primary w-full">
              Iniciar Pesquisa
            </button>
          </div>
        )}

        {step === 'questions' && (
          <div className="animate-fade-in space-y-6">
            {survey.questions.map((q, i) => (
              <div key={q.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
                <div className="flex items-start gap-2 mb-3">
                  <span className="text-xs font-bold text-blue-400 bg-blue-400/10 px-2 py-0.5 rounded-full flex-shrink-0">
                    {i + 1}
                  </span>
                  <p className="text-sm font-medium text-white leading-snug">
                    {q.text}
                    {q.required && <span className="text-red-400 ml-1">*</span>}
                  </p>
                </div>
                <QuestionField
                  question={q}
                  value={answers[q.id]}
                  onChange={v => setAnswer(q.id, v)}
                />
              </div>
            ))}

            <button
              onClick={handleSubmit}
              disabled={!canSubmit() || submitting}
              className="btn-primary w-full disabled:opacity-40"
            >
              {submitting ? 'Enviando...' : 'Enviar Respostas'}
            </button>

            {!canSubmit() && (
              <p className="text-xs text-slate-500 text-center">Responda todas as perguntas obrigatórias (*) para enviar.</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
