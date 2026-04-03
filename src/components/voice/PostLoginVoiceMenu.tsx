import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { X, Mic, MicOff, LayoutDashboard, FileBarChart2, CalendarPlus, ClipboardList, Search } from 'lucide-react'
import { useVoice } from '../../hooks/useVoice'
import { useEmployeesStore } from '../../store/employeesStore'

interface Props {
  managerName: string | null
  onClose: () => void
  onNewEvent: () => void
}

const NAV_OPTIONS = [
  { label: 'Dashboard', icon: LayoutDashboard, route: '/', color: 'bg-blue-600' },
  { label: 'Relatório', icon: FileBarChart2, route: '/relatorios', color: 'bg-purple-600' },
  { label: 'Novo Evento', icon: CalendarPlus, route: null, color: 'bg-emerald-600' },
  { label: 'Pesquisas', icon: ClipboardList, route: '/pesquisas', color: 'bg-amber-600' },
]

export default function PostLoginVoiceMenu({ managerName, onClose, onNewEvent }: Props) {
  const navigate = useNavigate()
  const { employees, fetchEmployees } = useEmployeesStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [voiceListening, setVoiceListening] = useState(false)
  const [searchResults, setSearchResults] = useState<typeof employees>([])

  useEffect(() => { fetchEmployees() }, [])

  const { isListening, transcript, startListening, stopListening, supported } = useVoice((cmd, text) => {
    // Navigation commands
    if (cmd.action === 'abrir_dashboard') { navigate('/'); onClose(); return }
    if (cmd.action === 'relatorio') { navigate('/relatorios'); onClose(); return }
    if (cmd.action === 'pesquisa') { navigate('/pesquisas'); onClose(); return }
    if (cmd.action === 'registrar_evento') { onNewEvent(); onClose(); return }
    // Employee name search
    if (text.trim()) {
      const q = text.toLowerCase()
      const found = employees.filter(e => e.name.toLowerCase().includes(q))
      setSearchResults(found)
      setSearchQuery(text)
      setVoiceListening(false)
    }
  })

  const handleSearchChange = (v: string) => {
    setSearchQuery(v)
    if (v.trim()) {
      setSearchResults(employees.filter(e => e.name.toLowerCase().includes(v.toLowerCase())))
    } else {
      setSearchResults([])
    }
  }

  const handleNav = (option: typeof NAV_OPTIONS[0]) => {
    if (!option.route) { onNewEvent(); onClose(); return }
    navigate(option.route)
    onClose()
  }

  const toggleVoiceSearch = () => {
    if (isListening) { stopListening(); setVoiceListening(false) }
    else { startListening(); setVoiceListening(true) }
  }

  const firstName = managerName?.split(' ')[0] || 'Gestor'

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/80 backdrop-blur-sm">
      <div className="w-full max-w-md bg-slate-900 border border-slate-700/50 rounded-t-3xl p-5 animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-white">Olá, {firstName}! 👋</h2>
            <p className="text-xs text-slate-500">O que deseja fazer hoje?</p>
          </div>
          <button onClick={onClose} className="btn-ghost w-9 h-9 !px-0 !py-0">
            <X size={20} />
          </button>
        </div>

        {/* Nav grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {NAV_OPTIONS.map(opt => (
            <button
              key={opt.label}
              onClick={() => handleNav(opt)}
              className="flex items-center gap-3 bg-slate-800/60 hover:bg-slate-700/60 border border-slate-700/40 rounded-2xl p-4 transition-all active:scale-95"
            >
              <div className={`w-9 h-9 ${opt.color} rounded-xl flex items-center justify-center flex-shrink-0`}>
                <opt.icon size={18} className="text-white" />
              </div>
              <span className="text-sm font-semibold text-white">{opt.label}</span>
            </button>
          ))}
        </div>

        {/* Employee voice/text search */}
        <div className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700/40">
          <p className="text-xs text-slate-500 font-medium mb-2">Pesquisar Colaborador</p>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                value={searchQuery}
                onChange={e => handleSearchChange(e.target.value)}
                placeholder="Nome do colaborador..."
                className="input pl-8 text-sm py-2"
              />
            </div>
            {supported && (
              <button
                onClick={toggleVoiceSearch}
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors flex-shrink-0 ${
                  isListening ? 'bg-red-600' : 'bg-blue-600 hover:bg-blue-700'
                }`}
                aria-label="Pesquisa por voz"
              >
                {isListening ? <MicOff size={16} className="text-white" /> : <Mic size={16} className="text-white" />}
              </button>
            )}
          </div>

          {isListening && (
            <p className="text-xs text-blue-400 animate-pulse mt-2">Ouvindo... diga o nome do colaborador</p>
          )}
          {transcript && voiceListening && (
            <p className="text-xs text-slate-400 mt-1">"{transcript}"</p>
          )}

          {searchResults.length > 0 && (
            <div className="mt-3 space-y-1.5">
              {searchResults.slice(0, 4).map(emp => (
                <button
                  key={emp.id}
                  onClick={() => { navigate('/colaboradores'); onClose() }}
                  className="w-full flex items-center gap-2 bg-slate-700/50 hover:bg-slate-700 rounded-xl px-3 py-2 transition-colors"
                >
                  <div className="w-7 h-7 rounded-lg bg-blue-600/20 flex items-center justify-center">
                    <span className="text-blue-400 font-bold text-xs">{emp.name.split(' ').map(n => n[0]).join('').slice(0, 2)}</span>
                  </div>
                  <div className="text-left min-w-0">
                    <p className="text-sm text-white font-medium truncate">{emp.name}</p>
                    <p className="text-xs text-slate-500 truncate">{emp.sector}</p>
                  </div>
                </button>
              ))}
              {searchResults.length > 4 && (
                <p className="text-xs text-slate-500 text-center">+{searchResults.length - 4} mais</p>
              )}
            </div>
          )}
        </div>

        <button
          onClick={onClose}
          className="w-full mt-3 text-sm text-slate-500 hover:text-slate-400 py-2"
        >
          Pular
        </button>
      </div>
    </div>
  )
}
