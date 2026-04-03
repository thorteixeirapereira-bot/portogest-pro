import { useState } from 'react'
import { User, ArrowRight } from 'lucide-react'
import { useUIStore } from '../../store/uiStore'
import { useGestorStore } from '../../store/gestorStore'

interface Props {
  onDone: () => void
}

export default function ManagerSetupModal({ onDone }: Props) {
  const { setManagerName } = useUIStore()
  const { getOrCreateGestor } = useGestorStore()
  const [name, setName] = useState('')
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) return
    setSaving(true)
    setManagerName(trimmed)
    try {
      await getOrCreateGestor(trimmed)
    } catch {
      // non-fatal: gestor creation failure doesn't block the app
    }
    setSaving(false)
    onDone()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-sm p-6">
      <div className="w-full max-w-sm card p-6 animate-slide-up">
        <div className="flex flex-col items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl flex items-center justify-center shadow-lg">
            <User size={28} className="text-white" />
          </div>
          <div className="text-center">
            <h2 className="text-xl font-bold text-white">Bem-vindo!</h2>
            <p className="text-slate-500 text-sm mt-1">Como você gostaria de ser chamado no app?</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Seu nome</label>
            <input
              autoFocus
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Ex: Carlos, Ana, Roberto..."
              className="input text-center text-lg"
              maxLength={40}
            />
          </div>
          <button
            type="submit"
            disabled={!name.trim() || saving}
            className="btn-primary w-full disabled:opacity-40 gap-2"
          >
            {saving ? 'Configurando...' : <>Começar <ArrowRight size={16} /></>}
          </button>
        </form>
      </div>
    </div>
  )
}
