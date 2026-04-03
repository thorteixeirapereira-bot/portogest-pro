import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Edit2, Trash2, Link2, Trophy, CheckCircle, Brain, ClipboardList, MessageSquarePlus, X, Copy, ChevronRight } from 'lucide-react'
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts'
import { useColaboradoresStore, getPontuacoes } from '../store/colaboradoresSupabase'
import { useTestesStore } from '../store/testesSupabase'
import { getFeedbacks, addFeedback, usePesquisasStore } from '../store/pesquisasSupabase'
import { getTestDef, ALL_TESTS } from '../lib/psychTests'
import type { DbColaborador, DbTestePerfil, DbFeedback, DbPontuacao } from '../lib/supabase'
import type { PsychTestType } from '../types'

const POINTS_COLOR = (pts: number) =>
  pts >= 200 ? 'text-amber-400' : pts >= 100 ? 'text-blue-400' : 'text-slate-400'

const TEST_ICONS: Record<string, string> = {
  disc: '🎯', bigfive: '🧠', vac: '📚', ikigai: '🌸', ie: '❤️',
}

// ─── Links Panel ──────────────────────────────────────────────────────────────

function LinksPanel({ colaborador }: { colaborador: DbColaborador }) {
  const { pesquisas } = usePesquisasStore()
  const [copied, setCopied] = useState<string | null>(null)
  const base = `${window.location.origin}/c/${colaborador.token_acesso}`

  const links = [
    ...ALL_TESTS.map(t => ({ label: `${TEST_ICONS[t.type]} ${t.title}`, url: `${base}/teste/${t.type}` })),
    ...pesquisas.filter(p => p.ativa).map(p => ({ label: `📋 ${p.titulo}`, url: `${base}/pesquisa/${p.id}` })),
  ]

  const copy = (url: string, key: string) => {
    navigator.clipboard.writeText(url).catch(() => {})
    setCopied(key)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <div className="card p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Link2 size={16} className="text-blue-400" />
        <p className="font-semibold text-white text-sm">Links para o Colaborador</p>
      </div>
      <p className="text-xs text-slate-500">Compartilhe estes links com {colaborador.nome.split(' ')[0]}. Não precisa de login.</p>
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {links.map(link => (
          <div key={link.url} className="flex items-center gap-2 bg-slate-800/50 rounded-xl p-2.5">
            <span className="text-xs text-slate-300 flex-1 truncate">{link.label}</span>
            <button
              onClick={() => copy(link.url, link.url)}
              className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 flex-shrink-0"
            >
              {copied === link.url ? <CheckCircle size={12} className="text-emerald-400" /> : <Copy size={12} />}
              {copied === link.url ? 'Copiado' : 'Copiar'}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Test Result Card ─────────────────────────────────────────────────────────

function TestResultCard({ result }: { result: DbTestePerfil }) {
  const test = getTestDef(result.tipo as PsychTestType)
  const interpretation = test.interpret(result.scores)

  const data = test.dimensions.map(d => ({
    subject: d.label,
    value: Number(((result.scores[d.key] ?? 0) * (test.questions[0].type === 'scale5' ? 1 : 5)).toFixed(1)),
    fullMark: 5,
  }))

  return (
    <div className="bg-slate-800/50 rounded-2xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xl">{TEST_ICONS[result.tipo]}</span>
        <div>
          <p className="font-semibold text-white text-sm">{test.title}</p>
          <p className="text-xs text-slate-500">{new Date(result.created_at).toLocaleDateString('pt-BR')}</p>
        </div>
      </div>
      <div className="h-36">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={data}>
            <PolarGrid stroke="#334155" />
            <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 9 }} />
            <Radar dataKey="value" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.25} strokeWidth={2} />
          </RadarChart>
        </ResponsiveContainer>
      </div>
      <p className="text-xs text-slate-400 mt-2">{interpretation.profile}</p>
    </div>
  )
}

// ─── Feedback Modal ───────────────────────────────────────────────────────────

function FeedbackModal({ colaboradorId, onClose, onSaved }: { colaboradorId: string; onClose: () => void; onSaved: () => void }) {
  const [texto, setTexto] = useState('')
  const [tipo, setTipo] = useState<'geral' | 'positivo' | 'desenvolvimento'>('positivo')
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    if (!texto.trim()) return
    setSaving(true)
    await addFeedback(colaboradorId, texto.trim(), tipo)
    setSaving(false)
    onSaved()
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/80 backdrop-blur-sm">
      <div className="w-full sm:max-w-md bg-slate-900 border border-slate-700/50 rounded-t-3xl sm:rounded-3xl">
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-slate-700/50">
          <h2 className="text-lg font-bold text-white">Novo Feedback</h2>
          <button onClick={onClose} className="btn-ghost w-10 h-10 !px-0 !py-0"><X size={20} /></button>
        </div>
        <div className="px-5 py-4 space-y-4">
          <div className="flex gap-2">
            {(['positivo', 'desenvolvimento', 'geral'] as const).map(t => (
              <button
                key={t}
                onClick={() => setTipo(t)}
                className={`flex-1 py-2 rounded-xl text-xs font-medium capitalize transition-all ${
                  tipo === t ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                }`}
              >
                {t === 'positivo' ? '⭐ Positivo' : t === 'desenvolvimento' ? '📈 Desenvolvimento' : '💬 Geral'}
              </button>
            ))}
          </div>
          <textarea
            value={texto}
            onChange={e => setTexto(e.target.value)}
            placeholder="Escreva o feedback..."
            rows={4}
            className="input resize-none"
            autoFocus
          />
          <button onClick={handleSave} disabled={!texto.trim() || saving} className="btn-primary w-full disabled:opacity-40">
            {saving ? 'Salvando...' : 'Salvar Feedback'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ColaboradorProfilePage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { colaboradores, deleteColaborador } = useColaboradoresStore()
  const { fetchForColaborador } = useTestesStore()
  const { fetchPesquisas } = usePesquisasStore()

  const [col, setCol] = useState<DbColaborador | null>(null)
  const [testes, setTestes] = useState<DbTestePerfil[]>([])
  const [feedbacks, setFeedbacks] = useState<DbFeedback[]>([])
  const [pontuacoes, setPontuacoes] = useState<DbPontuacao[]>([])
  const [showFeedbackModal, setShowFeedbackModal] = useState(false)
  const [showLinks, setShowLinks] = useState(false)
  const [activeTab, setActiveTab] = useState<'testes' | 'feedbacks' | 'pontos'>('testes')

  const testesFaltando = ALL_TESTS.filter(t => !testes.some(r => r.tipo === t.type))

  const loadData = async () => {
    if (!id) return
    const found = colaboradores.find(c => c.id === id)
    if (found) setCol(found)

    const [t, f, p] = await Promise.all([
      fetchForColaborador(id),
      getFeedbacks(id),
      getPontuacoes(id),
    ])
    setTestes(t)
    setFeedbacks(f)
    setPontuacoes(p)
  }

  useEffect(() => {
    fetchPesquisas()
    loadData()
  }, [id, colaboradores])

  const handleDelete = async () => {
    if (!col || !confirm(`Excluir ${col.nome}? Esta ação não pode ser desfeita.`)) return
    await deleteColaborador(col.id)
    navigate('/colaboradores')
  }

  if (!col) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const initials = col.nome.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
  const completedCount = testes.length
  const progressPct = Math.round((completedCount / ALL_TESTS.length) * 100)

  return (
    <div className="px-4 py-4 space-y-4 animate-fade-in pb-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/colaboradores')} className="btn-ghost w-9 h-9 !px-0 !py-0">
          <ArrowLeft size={18} />
        </button>
        <div className="flex-1">
          <h2 className="text-lg font-bold text-white leading-tight">{col.nome}</h2>
          <p className="text-xs text-slate-500">{col.cargo || 'Sem cargo'}</p>
        </div>
        <button onClick={handleDelete} className="btn-ghost w-9 h-9 !px-0 !py-0 text-red-400">
          <Trash2 size={16} />
        </button>
      </div>

      {/* Profile card */}
      <div className="card p-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-xl">{initials}</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Trophy size={14} className={POINTS_COLOR(col.pontos_total)} />
              <span className={`text-lg font-bold ${POINTS_COLOR(col.pontos_total)}`}>{col.pontos_total} pts</span>
            </div>
            {col.email && <p className="text-xs text-slate-500 truncate">{col.email}</p>}
            <div className="mt-2">
              <div className="flex justify-between text-xs text-slate-500 mb-1">
                <span>Testes completos</span>
                <span>{completedCount}/{ALL_TESTS.length}</span>
              </div>
              <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full transition-all duration-500" style={{ width: `${progressPct}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* Quick actions */}
        <div className="flex gap-2 mt-4">
          <button
            onClick={() => setShowLinks(l => !l)}
            className="flex-1 flex items-center justify-center gap-2 bg-blue-600/10 border border-blue-500/30 text-blue-400 rounded-xl py-2.5 text-sm font-medium hover:bg-blue-600/20 transition-colors"
          >
            <Link2 size={14} /> Links
          </button>
          <button
            onClick={() => setShowFeedbackModal(true)}
            className="flex-1 flex items-center justify-center gap-2 bg-emerald-600/10 border border-emerald-500/30 text-emerald-400 rounded-xl py-2.5 text-sm font-medium hover:bg-emerald-600/20 transition-colors"
          >
            <MessageSquarePlus size={14} /> Feedback
          </button>
          <button
            onClick={() => navigate(`/testes?colaborador=${col.id}`)}
            className="flex-1 flex items-center justify-center gap-2 bg-purple-600/10 border border-purple-500/30 text-purple-400 rounded-xl py-2.5 text-sm font-medium hover:bg-purple-600/20 transition-colors"
          >
            <Brain size={14} /> Testar
          </button>
        </div>
      </div>

      {/* Links panel */}
      {showLinks && <LinksPanel colaborador={col} />}

      {/* Testes faltando */}
      {testesFaltando.length > 0 && activeTab === 'testes' && (
        <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-3">
          <p className="text-xs text-amber-400 font-medium mb-2">Testes pendentes:</p>
          <div className="flex flex-wrap gap-1.5">
            {testesFaltando.map(t => (
              <button
                key={t.type}
                onClick={() => navigate(`/testes?colaborador=${col.id}&tipo=${t.type}`)}
                className="flex items-center gap-1 bg-amber-500/10 text-amber-300 text-xs px-2.5 py-1 rounded-lg hover:bg-amber-500/20 transition-colors"
              >
                {TEST_ICONS[t.type]} {t.title} <ChevronRight size={10} />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex bg-slate-800/60 rounded-xl p-0.5 gap-0.5">
        {([['testes', Brain, 'Testes'], ['feedbacks', ClipboardList, 'Feedbacks'], ['pontos', Trophy, 'Pontos']] as const).map(([key, Icon, label]) => (
          <button
            key={key}
            onClick={() => setActiveTab(key as typeof activeTab)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === key ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <Icon size={13} /> {label}
          </button>
        ))}
      </div>

      {/* Testes tab */}
      {activeTab === 'testes' && (
        <div className="space-y-3">
          {testes.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-sm">Nenhum teste realizado ainda.</div>
          ) : (
            testes.map(r => <TestResultCard key={r.id} result={r} />)
          )}
        </div>
      )}

      {/* Feedbacks tab */}
      {activeTab === 'feedbacks' && (
        <div className="space-y-3">
          {feedbacks.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-sm">Nenhum feedback registrado.</div>
          ) : (
            feedbacks.map(fb => (
              <div key={fb.id} className="bg-slate-800/50 rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-slate-700 text-slate-400">
                    {fb.tipo === 'positivo' ? '⭐ Positivo' : fb.tipo === 'desenvolvimento' ? '📈 Desenvolvimento' : '💬 Geral'}
                  </span>
                  <span className="text-xs text-slate-600">{new Date(fb.created_at).toLocaleDateString('pt-BR')}</span>
                </div>
                <p className="text-sm text-slate-300">{fb.texto}</p>
              </div>
            ))
          )}
          <button onClick={() => setShowFeedbackModal(true)} className="btn-primary w-full gap-2">
            <MessageSquarePlus size={16} /> Novo Feedback
          </button>
        </div>
      )}

      {/* Pontos tab */}
      {activeTab === 'pontos' && (
        <div className="space-y-2">
          {pontuacoes.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-sm">Nenhuma pontuação registrada.</div>
          ) : (
            pontuacoes.map(p => (
              <div key={p.id} className="flex items-center gap-3 bg-slate-800/50 rounded-xl px-4 py-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-300 capitalize">{p.descricao || p.tipo}</p>
                  <p className="text-xs text-slate-600">{new Date(p.created_at).toLocaleDateString('pt-BR')}</p>
                </div>
                <span className="text-sm font-bold text-emerald-400">+{p.pontos}</span>
              </div>
            ))
          )}
        </div>
      )}

      {showFeedbackModal && (
        <FeedbackModal
          colaboradorId={col.id}
          onClose={() => setShowFeedbackModal(false)}
          onSaved={loadData}
        />
      )}
    </div>
  )
}
