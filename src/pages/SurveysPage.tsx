import { useEffect, useState } from 'react'
import { Plus, ChevronDown, ChevronUp, X, Link2, Copy, CheckCircle, ClipboardCheck, BarChart2, Loader2 } from 'lucide-react'
import { usePesquisasStore } from '../store/pesquisasSupabase'
import { useColaboradoresStore } from '../store/colaboradoresSupabase'
import type { DbPesquisa, DbPergunta, DbRespostaPesquisa } from '../lib/supabase'

// ─── Survey Results ───────────────────────────────────────────────────────────

function SurveyResults({ pesquisa, respostas }: { pesquisa: DbPesquisa; respostas: DbRespostaPesquisa[] }) {
  return (
    <div className="space-y-4 mt-3">
      <p className="text-xs text-slate-500">{respostas.length} resposta{respostas.length !== 1 ? 's' : ''}</p>
      {pesquisa.perguntas.map(q => {
        const answers = respostas.map(r => r.respostas[q.id]).filter(v => v !== undefined && v !== '')
        if (answers.length === 0) return null

        if (q.tipo === 'scale') {
          const avg = answers.reduce((a: number, b) => a + Number(b), 0) / answers.length
          const dist = [1, 2, 3, 4, 5].map(v => ({ value: v, count: answers.filter(a => Number(a) === v).length }))
          const max = Math.max(...dist.map(d => d.count), 1)
          return (
            <div key={q.id} className="bg-slate-800/50 rounded-xl p-4">
              <p className="text-sm font-medium text-white mb-2">{q.texto}</p>
              <p className="text-2xl font-bold text-amber-400 mb-2">{avg.toFixed(1)} <span className="text-sm text-slate-500">/ 5</span></p>
              <div className="flex items-end gap-1 h-10">
                {dist.map(d => (
                  <div key={d.value} className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-full bg-blue-600 rounded-sm" style={{ height: `${(d.count / max) * 32}px`, minHeight: d.count > 0 ? 4 : 0 }} />
                    <span className="text-[9px] text-slate-500">{d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )
        }
        if (q.tipo === 'yesno') {
          const sim = answers.filter(a => a === 'sim').length
          const nao = answers.filter(a => a === 'não').length
          return (
            <div key={q.id} className="bg-slate-800/50 rounded-xl p-4">
              <p className="text-sm font-medium text-white mb-3">{q.texto}</p>
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
        if (q.tipo === 'multiple') {
          const countMap: Record<string, number> = {}
          answers.forEach(a => { const s = String(a); countMap[s] = (countMap[s] || 0) + 1 })
          const max = Math.max(...Object.values(countMap), 1)
          return (
            <div key={q.id} className="bg-slate-800/50 rounded-xl p-4">
              <p className="text-sm font-medium text-white mb-3">{q.texto}</p>
              <div className="space-y-2">
                {Object.entries(countMap).sort((a, b) => b[1] - a[1]).map(([opt, count]) => (
                  <div key={opt} className="flex items-center gap-2">
                    <span className="text-xs text-slate-400 w-24 truncate">{opt}</span>
                    <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full" style={{ width: `${(count / max) * 100}%` }} />
                    </div>
                    <span className="text-xs text-white font-medium w-4 text-right">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          )
        }
        if (q.tipo === 'text') {
          return (
            <div key={q.id} className="bg-slate-800/50 rounded-xl p-4">
              <p className="text-sm font-medium text-white mb-2">{q.texto}</p>
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

function SurveyCard({ pesquisa }: { pesquisa: DbPesquisa }) {
  const [expanded, setExpanded] = useState(false)
  const [showLinks, setShowLinks] = useState(false)
  const [respostas, setRespostas] = useState<DbRespostaPesquisa[]>([])
  const [loadingRes, setLoadingRes] = useState(false)
  const [copied, setCopied] = useState(false)
  const { updatePesquisa, deletePesquisa, getRespostas, subscribeRespostas } = usePesquisasStore()
  const { colaboradores } = useColaboradoresStore()

  const toggleActive = () => updatePesquisa(pesquisa.id, { ativa: !pesquisa.ativa })

  const loadRespostas = async () => {
    setLoadingRes(true)
    const r = await getRespostas(pesquisa.id)
    setRespostas(r)
    setLoadingRes(false)
  }

  useEffect(() => {
    if (expanded && respostas.length === 0) loadRespostas()
    // Real-time subscription
    const unsub = subscribeRespostas(pesquisa.id, (newResp) => {
      setRespostas(prev => [newResp, ...prev])
    })
    return unsub
  }, [pesquisa.id])

  const publicUrl = `${window.location.origin}/p/${pesquisa.id}`

  const copy = () => {
    navigator.clipboard.writeText(publicUrl).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="card p-4">
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-0.5">
            <h3 className="font-semibold text-white truncate">{pesquisa.titulo}</h3>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${
              pesquisa.ativa ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-700 text-slate-500'
            }`}>
              {pesquisa.ativa ? 'Ativa' : 'Inativa'}
            </span>
          </div>
          {pesquisa.descricao && <p className="text-xs text-slate-500">{pesquisa.descricao}</p>}
        </div>
        <button
          onClick={toggleActive}
          className={`w-10 h-6 rounded-full transition-colors relative flex-shrink-0 ${pesquisa.ativa ? 'bg-blue-600' : 'bg-slate-600'}`}
        >
          <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${pesquisa.ativa ? 'translate-x-4' : ''}`} />
        </button>
      </div>

      <div className="flex items-center gap-3 text-xs text-slate-500 mb-3">
        <span className="flex items-center gap-1"><ClipboardCheck size={11} /> {pesquisa.perguntas.length} perguntas</span>
        <span className="flex items-center gap-1"><BarChart2 size={11} /> {respostas.length} respostas</span>
      </div>

      <div className="flex gap-2 flex-wrap mb-2">
        {pesquisa.ativa && (
          <button
            onClick={() => setShowLinks(l => !l)}
            className="flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 bg-blue-400/10 px-3 py-1.5 rounded-lg transition-colors"
          >
            <Link2 size={12} /> Links
          </button>
        )}
        <button
          onClick={() => { setExpanded(e => !e); if (!expanded) loadRespostas() }}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-300 transition-colors"
        >
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          {expanded ? 'Ocultar' : 'Ver resultados'}
        </button>
        <button
          onClick={() => deletePesquisa(pesquisa.id)}
          className="flex items-center gap-1 text-xs text-red-400/60 hover:text-red-400 transition-colors ml-auto"
        >
          Excluir
        </button>
      </div>

      {/* Links panel */}
      {showLinks && (
        <div className="bg-slate-800/60 rounded-xl p-3 mb-2 space-y-2">
          <p className="text-xs text-slate-500 font-medium">Link geral (qualquer pessoa responde):</p>
          <div className="flex gap-2">
            <input readOnly value={publicUrl} className="input text-xs py-1.5 flex-1" />
            <button onClick={copy} className="btn-primary px-3 py-1.5 text-xs !min-h-0">
              {copied ? <CheckCircle size={12} /> : <Copy size={12} />}
            </button>
          </div>
          {colaboradores.length > 0 && (
            <>
              <p className="text-xs text-slate-500 font-medium mt-2">Links por colaborador (rastreável):</p>
              <div className="space-y-1 max-h-40 overflow-y-auto">
                {colaboradores.map(col => {
                  const url = `${window.location.origin}/c/${col.token_acesso}/pesquisa/${pesquisa.id}`
                  return (
                    <div key={col.id} className="flex items-center gap-2">
                      <span className="text-xs text-slate-300 flex-1 truncate">{col.nome}</span>
                      <button onClick={() => { navigator.clipboard.writeText(url).catch(() => {}) }}
                        className="text-xs text-blue-400 hover:text-blue-300 flex-shrink-0 flex items-center gap-1">
                        <Copy size={10} /> Copiar
                      </button>
                    </div>
                  )
                })}
              </div>
            </>
          )}
          <p className="text-xs text-slate-600">Colaboradores não precisam de login para responder.</p>
        </div>
      )}

      {expanded && (
        loadingRes ? (
          <div className="flex justify-center py-4"><Loader2 size={20} className="animate-spin text-slate-500" /></div>
        ) : (
          <SurveyResults pesquisa={pesquisa} respostas={respostas} />
        )
      )}
    </div>
  )
}

// ─── New Survey Modal ─────────────────────────────────────────────────────────

function NewSurveyModal({ onClose }: { onClose: () => void }) {
  const { addPesquisa } = usePesquisasStore()
  const [titulo, setTitulo] = useState('')
  const [descricao, setDescricao] = useState('')
  const [perguntas, setPerguntas] = useState<Omit<DbPergunta, 'id'>[]>([{ texto: '', tipo: 'scale', obrigatoria: true }])
  const [saving, setSaving] = useState(false)

  const addQ = () => setPerguntas(q => [...q, { texto: '', tipo: 'scale', obrigatoria: false }])
  const removeQ = (i: number) => setPerguntas(q => q.filter((_, idx) => idx !== i))
  const updateQ = (i: number, u: Partial<Omit<DbPergunta, 'id'>>) =>
    setPerguntas(q => q.map((item, idx) => idx === i ? { ...item, ...u } : item))

  const handleSave = async () => {
    if (!titulo.trim()) return
    setSaving(true)
    await addPesquisa({
      titulo: titulo.trim(),
      descricao: descricao.trim(),
      tipo: 'custom',
      perguntas: perguntas.filter(q => q.texto.trim()).map((q, i) => ({ ...q, id: `q${i + 1}` })),
      ativa: true,
    })
    setSaving(false)
    onClose()
  }

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
            <input value={titulo} onChange={e => setTitulo(e.target.value)} placeholder="Ex: Pesquisa de Clima" className="input" autoFocus />
          </div>
          <div>
            <label className="label">Descrição</label>
            <input value={descricao} onChange={e => setDescricao(e.target.value)} placeholder="Opcional" className="input" />
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="label !mb-0">Perguntas</label>
              <button onClick={addQ} className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1">
                <Plus size={12} /> Adicionar
              </button>
            </div>
            <div className="space-y-3">
              {perguntas.map((q, i) => (
                <div key={i} className="bg-slate-800/50 rounded-xl p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500 font-medium">Pergunta {i + 1}</span>
                    {perguntas.length > 1 && (
                      <button onClick={() => removeQ(i)} className="text-red-400 hover:text-red-300"><X size={14} /></button>
                    )}
                  </div>
                  <input value={q.texto} onChange={e => updateQ(i, { texto: e.target.value })} placeholder="Texto da pergunta..." className="input text-sm" />
                  <div className="flex gap-2">
                    <select value={q.tipo} onChange={e => updateQ(i, { tipo: e.target.value as DbPergunta['tipo'] })} className="input text-sm flex-1">
                      <option value="scale">Escala 1-5</option>
                      <option value="yesno">Sim/Não</option>
                      <option value="text">Texto livre</option>
                      <option value="multiple">Múltipla escolha</option>
                    </select>
                    <label className="flex items-center gap-1.5 text-xs text-slate-400 flex-shrink-0">
                      <input type="checkbox" checked={q.obrigatoria} onChange={e => updateQ(i, { obrigatoria: e.target.checked })} className="accent-blue-500" />
                      Obrigatória
                    </label>
                  </div>
                  {q.tipo === 'multiple' && (
                    <input placeholder="Opções separadas por vírgula" className="input text-sm"
                      onChange={e => updateQ(i, { opcoes: e.target.value.split(',').map(s => s.trim()) })} />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="px-5 pb-5 pt-3 border-t border-slate-700/50 flex-shrink-0">
          <button onClick={handleSave} disabled={!titulo.trim() || saving} className="btn-primary w-full disabled:opacity-40">
            {saving ? <><Loader2 size={16} className="animate-spin" /> Criando...</> : 'Criar Pesquisa'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SurveysPage() {
  const { pesquisas, fetchPesquisas, loading } = usePesquisasStore()
  const { fetchColaboradores } = useColaboradoresStore()
  const [showForm, setShowForm] = useState(false)

  useEffect(() => { fetchPesquisas(); fetchColaboradores() }, [])

  const active = pesquisas.filter(p => p.ativa)
  const inactive = pesquisas.filter(p => !p.ativa)

  return (
    <div className="px-4 py-4 space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white mb-1">Pesquisas</h2>
          <p className="text-sm text-slate-500">{pesquisas.length} pesquisa{pesquisas.length !== 1 ? 's' : ''} criada{pesquisas.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary px-4 py-2.5 text-sm !min-h-0">
          <Plus size={16} /> Nova
        </button>
      </div>

      {loading && pesquisas.length === 0 ? (
        <div className="flex justify-center py-16"><Loader2 size={24} className="animate-spin text-slate-500" /></div>
      ) : pesquisas.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <span className="text-5xl">📊</span>
          <p className="text-slate-500">Nenhuma pesquisa criada</p>
          <button onClick={() => setShowForm(true)} className="btn-primary"><Plus size={16} /> Criar Pesquisa</button>
        </div>
      ) : (
        <>
          {active.length > 0 && (
            <div>
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wide mb-2">Ativas</p>
              <div className="space-y-3">{active.map(p => <SurveyCard key={p.id} pesquisa={p} />)}</div>
            </div>
          )}
          {inactive.length > 0 && (
            <div>
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wide mb-2">Inativas</p>
              <div className="space-y-3">{inactive.map(p => <SurveyCard key={p.id} pesquisa={p} />)}</div>
            </div>
          )}
        </>
      )}

      {showForm && <NewSurveyModal onClose={() => setShowForm(false)} />}
    </div>
  )
}
