import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { CheckCircle, Anchor } from 'lucide-react'
import { getPesquisaById, submitResposta } from '../store/pesquisasSupabase'
import type { DbPesquisa } from '../lib/supabase'

export default function PesquisaPublicaPage() {
  const { pesquisaId } = useParams<{ pesquisaId: string }>()
  const [pesquisa, setPesquisa] = useState<DbPesquisa | null>(null)
  const [notFound, setNotFound] = useState(false)
  const [answers, setAnswers] = useState<Record<string, string | number>>({})
  const [nome, setNome] = useState('')
  const [step, setStep] = useState<'name' | 'questions' | 'done'>('name')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!pesquisaId) return
    getPesquisaById(pesquisaId).then(p => {
      if (!p) setNotFound(true)
      else setPesquisa(p)
    })
  }, [pesquisaId])

  const canSubmit = () => {
    if (!pesquisa) return false
    return pesquisa.perguntas.filter(q => q.obrigatoria).every(q => answers[q.id] !== undefined && answers[q.id] !== '')
  }

  const handleSubmit = async () => {
    if (!pesquisa) return
    setSubmitting(true)
    await submitResposta(pesquisa.id, null, nome.trim() || 'Anônimo', answers)
    setSubmitting(false)
    setStep('done')
  }

  if (notFound) return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 gap-4">
      <span className="text-5xl">🔍</span>
      <p className="text-white font-semibold">Pesquisa não encontrada</p>
    </div>
  )

  if (!pesquisa) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (!pesquisa.ativa) return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 gap-4">
      <span className="text-5xl">🔒</span>
      <p className="text-white font-semibold">Pesquisa encerrada</p>
    </div>
  )

  if (step === 'done') return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 gap-6 animate-fade-in">
      <div className="w-20 h-20 bg-emerald-500/10 border-2 border-emerald-500/40 rounded-full flex items-center justify-center">
        <CheckCircle size={40} className="text-emerald-400" />
      </div>
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2">Obrigado!</h2>
        <p className="text-slate-400">Sua resposta foi registrada.</p>
      </div>
      <div className="flex items-center gap-2 text-slate-600 text-sm">
        <Anchor size={14} /><span>PortoGest Pro</span>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="bg-slate-900 border-b border-slate-800 px-4 py-4">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl flex items-center justify-center">
            <Anchor size={16} className="text-white" />
          </div>
          <div>
            <p className="text-xs text-slate-500">PortoGest Pro</p>
            <h1 className="text-sm font-semibold text-white">{pesquisa.titulo}</h1>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-5">
        {step === 'name' && (
          <div className="space-y-5 animate-fade-in">
            <div>
              <h2 className="text-xl font-bold text-white mb-1">{pesquisa.titulo}</h2>
              {pesquisa.descricao && <p className="text-slate-500 text-sm">{pesquisa.descricao}</p>}
            </div>
            <div>
              <label className="label">Seu nome <span className="text-slate-600">(opcional)</span></label>
              <input value={nome} onChange={e => setNome(e.target.value)} placeholder="Anônimo" className="input" />
            </div>
            <button onClick={() => setStep('questions')} className="btn-primary w-full">Iniciar</button>
          </div>
        )}

        {step === 'questions' && (
          <div className="animate-fade-in space-y-4">
            {pesquisa.perguntas.map((q, i) => (
              <div key={q.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
                <p className="text-sm font-medium text-white mb-3">
                  <span className="text-blue-400 mr-2">{i + 1}.</span>{q.texto}
                  {q.obrigatoria && <span className="text-red-400 ml-1">*</span>}
                </p>
                {q.tipo === 'scale' && (
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map(n => (
                      <button key={n} onClick={() => setAnswers(a => ({ ...a, [q.id]: n }))}
                        className={`flex-1 h-12 rounded-xl font-bold text-lg transition-all ${Number(answers[q.id]) === n ? 'bg-blue-600 text-white scale-105' : 'bg-slate-800 text-slate-400'}`}>
                        {n}
                      </button>
                    ))}
                  </div>
                )}
                {q.tipo === 'yesno' && (
                  <div className="flex gap-3">
                    {['sim', 'não'].map(opt => (
                      <button key={opt} onClick={() => setAnswers(a => ({ ...a, [q.id]: opt }))}
                        className={`flex-1 py-3 rounded-xl font-semibold transition-all ${answers[q.id] === opt ? (opt === 'sim' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white') : 'bg-slate-800 text-slate-400'}`}>
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
            <button onClick={handleSubmit} disabled={!canSubmit() || submitting} className="btn-primary w-full disabled:opacity-40">
              {submitting ? 'Enviando...' : 'Enviar Respostas'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
