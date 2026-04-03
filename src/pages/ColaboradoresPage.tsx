import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Plus, Phone, Mic, MicOff, X, ChevronRight, Trophy, Star } from 'lucide-react'
import { useColaboradoresStore } from '../store/colaboradoresSupabase'
import { useVoice } from '../hooks/useVoice'
import type { DbColaborador } from '../lib/supabase'

// ─── Form Modal ───────────────────────────────────────────────────────────────

function ColaboradorFormModal({
  onClose,
  toEdit,
}: {
  onClose: () => void
  toEdit?: DbColaborador
}) {
  const { addColaborador, updateColaborador } = useColaboradoresStore()
  const [nome, setNome] = useState(toEdit?.nome ?? '')
  const [cargo, setCargo] = useState(toEdit?.cargo ?? '')
  const [email, setEmail] = useState(toEdit?.email ?? '')
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    if (!nome.trim()) return
    setSaving(true)
    if (toEdit) {
      await updateColaborador(toEdit.id, { nome: nome.trim(), cargo: cargo.trim(), email: email.trim() })
    } else {
      await addColaborador({ nome: nome.trim(), cargo: cargo.trim(), email: email.trim(), foto_url: null })
    }
    setSaving(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/80 backdrop-blur-sm">
      <div className="w-full sm:max-w-md bg-slate-900 border border-slate-700/50 rounded-t-3xl sm:rounded-3xl">
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-slate-700/50">
          <h2 className="text-lg font-bold text-white">{toEdit ? 'Editar' : 'Novo'} Colaborador</h2>
          <button onClick={onClose} className="btn-ghost w-10 h-10 !px-0 !py-0"><X size={20} /></button>
        </div>
        <div className="px-5 py-4 space-y-4">
          <div>
            <label className="label">Nome completo *</label>
            <input value={nome} onChange={e => setNome(e.target.value)} placeholder="Ex: João Silva" className="input" autoFocus />
          </div>
          <div>
            <label className="label">Cargo / Função</label>
            <input value={cargo} onChange={e => setCargo(e.target.value)} placeholder="Ex: Operador de Guindaste" className="input" />
          </div>
          <div>
            <label className="label">E-mail</label>
            <input value={email} onChange={e => setEmail(e.target.value)} placeholder="colaborador@empresa.com" className="input" type="email" />
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={onClose} className="btn-ghost flex-1">Cancelar</button>
            <button onClick={handleSave} disabled={!nome.trim() || saving} className="btn-primary flex-1 disabled:opacity-40">
              {saving ? 'Salvando...' : toEdit ? 'Salvar' : 'Cadastrar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Colaborador Card ─────────────────────────────────────────────────────────

function ColaboradorCard({ col, onEdit }: { col: DbColaborador; onEdit: () => void }) {
  const navigate = useNavigate()
  const initials = col.nome.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()

  const pointColor = col.pontos_total >= 200 ? 'text-amber-400' :
    col.pontos_total >= 100 ? 'text-blue-400' : 'text-slate-400'

  return (
    <button
      onClick={() => navigate(`/colaboradores/${col.id}`)}
      className="card p-4 w-full text-left active:scale-[0.98] transition-transform"
    >
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center flex-shrink-0">
          <span className="text-white font-bold text-sm">{initials}</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-white leading-tight truncate">{col.nome}</p>
          <p className="text-xs text-slate-500 truncate">{col.cargo || 'Sem cargo definido'}</p>
          {col.email && (
            <p className="text-xs text-slate-600 truncate">{col.email}</p>
          )}
        </div>
        <div className="flex flex-col items-end gap-1 flex-shrink-0">
          <div className={`flex items-center gap-1 font-bold text-sm ${pointColor}`}>
            <Trophy size={12} />
            {col.pontos_total}
          </div>
          <span className="text-xs text-slate-600">pts</span>
        </div>
        <ChevronRight size={16} className="text-slate-600 flex-shrink-0" />
      </div>
    </button>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ColaboradoresPage() {
  const { colaboradores, loading, fetchColaboradores, searchQuery, setSearchQuery, getFiltered, subscribeRealtime } = useColaboradoresStore()
  const [showForm, setShowForm] = useState(false)
  const [editTarget, setEditTarget] = useState<DbColaborador | undefined>()

  const { isListening, startListening, stopListening, supported } = useVoice((_, text) => {
    if (text.trim()) setSearchQuery(text.trim())
  })

  useEffect(() => {
    fetchColaboradores()
    const unsub = subscribeRealtime()
    return unsub
  }, [])

  const filtered = getFiltered()

  const totalPontos = colaboradores.reduce((a, c) => a + c.pontos_total, 0)

  return (
    <div className="flex flex-col h-full">
      {/* Search bar */}
      <div className="sticky top-0 z-20 bg-slate-950/80 backdrop-blur-sm px-4 py-3 border-b border-slate-800/50">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Buscar colaboradores..."
              className="input pl-9 text-sm"
            />
          </div>
          {supported && (
            <button
              onClick={isListening ? stopListening : startListening}
              className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${
                isListening ? 'bg-red-600' : 'bg-slate-700 hover:bg-slate-600'
              }`}
            >
              {isListening ? <MicOff size={16} className="text-white" /> : <Mic size={16} className="text-slate-300" />}
            </button>
          )}
          <button onClick={() => { setEditTarget(undefined); setShowForm(true) }} className="btn-primary px-3">
            <Plus size={18} />
          </button>
        </div>
      </div>

      {/* Stats bar */}
      <div className="px-4 py-2 flex items-center gap-4">
        <p className="text-xs text-slate-500">{filtered.length} colaborador{filtered.length !== 1 ? 'es' : ''}</p>
        {totalPontos > 0 && (
          <p className="text-xs text-amber-400 flex items-center gap-1">
            <Star size={10} /> {totalPontos} pontos no total
          </p>
        )}
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-3">
        {loading && colaboradores.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <span className="text-5xl">👥</span>
            <p className="text-slate-500">
              {searchQuery ? 'Nenhum resultado' : 'Nenhum colaborador cadastrado'}
            </p>
            {!searchQuery && (
              <button onClick={() => setShowForm(true)} className="btn-primary">
                <Plus size={16} /> Cadastrar Colaborador
              </button>
            )}
          </div>
        ) : (
          filtered.map(col => (
            <ColaboradorCard
              key={col.id}
              col={col}
              onEdit={() => { setEditTarget(col); setShowForm(true) }}
            />
          ))
        )}
      </div>

      {showForm && (
        <ColaboradorFormModal
          onClose={() => { setShowForm(false); setEditTarget(undefined) }}
          toEdit={editTarget}
        />
      )}
    </div>
  )
}
