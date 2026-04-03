import { useEffect, useState } from 'react'
import { X, Mic, MicOff, Info } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useVoice } from '../../hooks/useVoice'
import type { ParsedVoiceCommand } from '../../lib/voiceParser'
import EventFormModal from '../events/EventFormModal'

interface Props {
  onClose: () => void
}

export default function VoiceModal({ onClose }: Props) {
  const navigate = useNavigate()
  const [parsedResult, setParsedResult] = useState<ParsedVoiceCommand | null>(null)
  const [showEventForm, setShowEventForm] = useState(false)
  const [actionTaken, setActionTaken] = useState<string | null>(null)

  const { isListening, transcript, supported, error, startListening, stopListening, reset } = useVoice((cmd, text) => {
    setParsedResult(cmd)
    if (cmd.action === 'abrir_dashboard') {
      navigate('/')
      setActionTaken('Abrindo dashboard...')
      setTimeout(onClose, 1000)
    } else if (cmd.action === 'relatorio') {
      navigate('/relatorios')
      setActionTaken('Abrindo relatórios...')
      setTimeout(onClose, 1000)
    } else if (cmd.action === 'pesquisa') {
      navigate('/pesquisas')
      setActionTaken('Abrindo pesquisas...')
      setTimeout(onClose, 1000)
    }
  })

  useEffect(() => {
    if (supported) startListening()
    return () => stopListening()
  }, [])

  const handleOpenEventForm = () => {
    stopListening()
    setShowEventForm(true)
  }

  const hints = [
    '"registrar evento"',
    '"colaborador João categoria segurança pontuação 8"',
    '"abrir dashboard"',
    '"relatório"',
    '"pesquisa"',
  ]

  if (showEventForm) {
    return (
      <EventFormModal
        onClose={() => { setShowEventForm(false); onClose() }}
        initialData={parsedResult ? {
          category: parsedResult.category,
          score: parsedResult.score,
          shift: parsedResult.shift,
          criticality: parsedResult.criticality,
          description: parsedResult.description,
        } : undefined}
      />
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-sm p-6">
      <div className="w-full max-w-sm card p-6 flex flex-col items-center gap-5 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between w-full">
          <h2 className="text-lg font-bold text-white">Comando de Voz</h2>
          <button onClick={onClose} className="btn-ghost w-9 h-9 !px-0 !py-0">
            <X size={20} />
          </button>
        </div>

        {/* Mic button */}
        <div className="relative flex items-center justify-center my-4">
          {isListening && (
            <>
              <div className="absolute w-28 h-28 rounded-full border-2 border-blue-500/30 animate-ping" style={{ animationDuration: '1.5s' }} />
              <div className="absolute w-36 h-36 rounded-full border border-blue-500/20 animate-ping" style={{ animationDuration: '2s', animationDelay: '0.3s' }} />
            </>
          )}
          <button
            onClick={isListening ? stopListening : startListening}
            disabled={!supported}
            className={`w-20 h-20 rounded-full flex items-center justify-center text-white transition-all duration-200 shadow-lg z-10 ${
              isListening
                ? 'bg-red-600 shadow-red-900/40 scale-110'
                : 'bg-blue-600 shadow-blue-900/40 hover:bg-blue-700'
            }`}
            aria-label={isListening ? 'Parar' : 'Iniciar gravação'}
          >
            {isListening ? <MicOff size={32} /> : <Mic size={32} />}
          </button>
        </div>

        {/* Status */}
        <div className="text-center">
          {isListening ? (
            <p className="text-blue-400 font-semibold animate-pulse">Ouvindo... fale agora</p>
          ) : (
            <p className="text-slate-500">Toque no microfone para falar</p>
          )}
        </div>

        {/* Transcript */}
        {transcript && (
          <div className="w-full bg-slate-800/60 rounded-xl p-4">
            <p className="text-xs text-slate-500 mb-1 font-medium">Reconhecido:</p>
            <p className="text-white text-sm">"{transcript}"</p>
          </div>
        )}

        {/* Parsed result */}
        {parsedResult && !actionTaken && (
          <div className="w-full bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 space-y-2">
            <p className="text-xs text-blue-400 font-semibold uppercase tracking-wide">Campos detectados:</p>
            {parsedResult.category && <InfoRow label="Categoria" value={parsedResult.category} />}
            {parsedResult.score && <InfoRow label="Pontuação" value={String(parsedResult.score)} />}
            {parsedResult.shift && <InfoRow label="Turno" value={parsedResult.shift} />}
            {parsedResult.employeeName && <InfoRow label="Colaborador" value={parsedResult.employeeName} />}
            <button onClick={handleOpenEventForm} className="btn-primary w-full mt-2">
              Abrir Formulário de Evento
            </button>
          </div>
        )}

        {/* Action taken */}
        {actionTaken && (
          <div className="w-full bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 text-center">
            <p className="text-emerald-400 font-medium">{actionTaken}</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="w-full bg-red-500/10 border border-red-500/20 rounded-xl p-3">
            <p className="text-red-400 text-sm text-center">{error}</p>
          </div>
        )}

        {!supported && (
          <div className="w-full bg-amber-500/10 border border-amber-500/20 rounded-xl p-3">
            <p className="text-amber-400 text-sm text-center">
              Reconhecimento de voz não suportado neste navegador. Use Chrome ou Edge.
            </p>
          </div>
        )}

        {/* Hints */}
        <div className="w-full">
          <div className="flex items-center gap-1.5 mb-2">
            <Info size={12} className="text-slate-600" />
            <p className="text-xs text-slate-600 font-medium">Comandos disponíveis:</p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {hints.map(h => (
              <span key={h} className="text-xs bg-slate-800 text-slate-400 px-2 py-1 rounded-lg font-mono">
                {h}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-slate-500">{label}:</span>
      <span className="text-white font-medium">{value}</span>
    </div>
  )
}
