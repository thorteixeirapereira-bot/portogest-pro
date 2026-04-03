import { useState } from 'react'
import { Plus, Mic, X, ClipboardList, UserPlus, FileBarChart } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import EventFormModal from '../events/EventFormModal'
import VoiceModal from '../voice/VoiceModal'

export default function FAB() {
  const [open, setOpen] = useState(false)
  const [showEventForm, setShowEventForm] = useState(false)
  const [showVoice, setShowVoice] = useState(false)
  const navigate = useNavigate()

  const actions = [
    {
      icon: ClipboardList,
      label: 'Novo Evento',
      color: 'bg-blue-600',
      onClick: () => { setOpen(false); setShowEventForm(true) },
    },
    {
      icon: Mic,
      label: 'Comando de Voz',
      color: 'bg-purple-600',
      onClick: () => { setOpen(false); setShowVoice(true) },
    },
    {
      icon: UserPlus,
      label: 'Novo Colaborador',
      color: 'bg-emerald-600',
      onClick: () => { setOpen(false); navigate('/colaboradores') },
    },
    {
      icon: FileBarChart,
      label: 'Gerar Relatório',
      color: 'bg-amber-600',
      onClick: () => { setOpen(false); navigate('/relatorios') },
    },
  ]

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Action buttons */}
      <div className="fixed bottom-20 right-4 z-50 flex flex-col-reverse gap-3 items-end">
        {open && actions.map(({ icon: Icon, label, color, onClick }, i) => (
          <div
            key={label}
            className="flex items-center gap-3 animate-slide-up"
            style={{ animationDelay: `${i * 50}ms` }}
          >
            <span className="glass text-white text-sm font-medium px-3 py-1.5 rounded-full border border-slate-700/50 whitespace-nowrap">
              {label}
            </span>
            <button
              onClick={onClick}
              className={`${color} w-12 h-12 rounded-full shadow-lg flex items-center justify-center text-white transition-all duration-150 active:scale-90`}
              aria-label={label}
            >
              <Icon size={20} />
            </button>
          </div>
        ))}

        {/* Main FAB */}
        <button
          onClick={() => setOpen(o => !o)}
          className={`w-14 h-14 rounded-full shadow-xl shadow-blue-900/40 flex items-center justify-center text-white transition-all duration-200 active:scale-90 ${
            open ? 'bg-slate-700 rotate-45' : 'bg-blue-600 hover:bg-blue-700'
          }`}
          aria-label={open ? 'Fechar menu' : 'Ações rápidas'}
          aria-expanded={open}
        >
          {open ? <X size={24} /> : <Plus size={24} />}
        </button>
      </div>

      {showEventForm && <EventFormModal onClose={() => setShowEventForm(false)} />}
      {showVoice && <VoiceModal onClose={() => setShowVoice(false)} />}
    </>
  )
}
