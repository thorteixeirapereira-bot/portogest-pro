import { useState } from 'react'
import { Trash2, Edit, MessageSquare, Clock } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import type { Event } from '../../types'
import EventFormModal from './EventFormModal'

const criticalityLabels: Record<string, string> = {
  baixo: 'Baixo',
  médio: 'Médio',
  alto: 'Alto',
  crítico: 'Crítico',
}

const statusLabels: Record<string, string> = {
  aberto: 'Aberto',
  em_acompanhamento: 'Em Acompanhamento',
  encerrado: 'Encerrado',
}

const statusColors: Record<string, string> = {
  aberto: 'text-orange-400 bg-orange-500/10',
  em_acompanhamento: 'text-blue-400 bg-blue-500/10',
  encerrado: 'text-emerald-400 bg-emerald-500/10',
}

interface Props {
  event: Event
  onDelete: (id: string) => void
}

export default function EventCard({ event, onDelete }: Props) {
  const [showEdit, setShowEdit] = useState(false)
  const [showConfirmDelete, setShowConfirmDelete] = useState(false)
  const [swipeX, setSwipeX] = useState(0)
  const [startX, setStartX] = useState(0)
  const [isSwiping, setIsSwiping] = useState(false)

  const handleTouchStart = (e: React.TouchEvent) => {
    setStartX(e.touches[0].clientX)
    setIsSwiping(true)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isSwiping) return
    const delta = e.touches[0].clientX - startX
    if (delta < 0) setSwipeX(Math.max(delta, -80))
  }

  const handleTouchEnd = () => {
    setIsSwiping(false)
    if (swipeX < -50) {
      setSwipeX(-72)
    } else {
      setSwipeX(0)
    }
  }

  const scoreColor = event.score >= 8 ? 'text-emerald-400' : event.score >= 5 ? 'text-amber-400' : 'text-red-400'

  return (
    <>
      <div className="relative overflow-hidden rounded-2xl">
        {/* Swipe delete bg */}
        <div className="absolute right-0 top-0 bottom-0 w-20 bg-red-600 flex items-center justify-center rounded-r-2xl">
          <Trash2 size={20} className="text-white" />
        </div>

        {/* Card content */}
        <div
          className="card relative z-10 p-4 transition-transform"
          style={{ transform: `translateX(${swipeX}px)` }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-white truncate">{event.employeeName}</p>
              <p className="text-xs text-slate-500 truncate">{event.sector} · {event.role}</p>
            </div>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <span className={`text-2xl font-bold leading-none ${scoreColor}`}>{event.score}</span>
              <span className="text-slate-600 text-xs">/10</span>
            </div>
          </div>

          {/* Category + Criticality */}
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className="text-xs bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded-full font-medium">
              {event.category}
            </span>
            <span className={`badge-${event.criticality}`}>
              {criticalityLabels[event.criticality]}
            </span>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[event.status]}`}>
              {statusLabels[event.status]}
            </span>
          </div>

          {/* Description */}
          <p className="text-sm text-slate-400 line-clamp-2 mb-3">{event.description}</p>

          {/* Footer */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 text-xs text-slate-600">
              <Clock size={11} />
              {formatDistanceToNow(new Date(event.date), { locale: ptBR, addSuffix: true })}
            </div>
            <div className="flex items-center gap-1">
              {event.hasFeedback && (
                <div className="flex items-center gap-1 text-xs text-emerald-500 mr-2">
                  <MessageSquare size={11} />
                  <span>Feedback</span>
                </div>
              )}
              <button
                onClick={() => setShowEdit(true)}
                className="btn-ghost !min-h-0 w-8 h-8 !px-0 !py-0 !gap-0"
                aria-label="Editar evento"
              >
                <Edit size={14} />
              </button>
              <button
                onClick={() => setShowConfirmDelete(true)}
                className="btn-ghost !min-h-0 w-8 h-8 !px-0 !py-0 !gap-0 hover:text-red-400"
                aria-label="Excluir evento"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Confirm delete */}
      {showConfirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 px-6">
          <div className="card p-6 w-full max-w-sm">
            <h3 className="text-lg font-bold text-white mb-2">Excluir Evento</h3>
            <p className="text-slate-400 text-sm mb-5">
              Tem certeza que deseja excluir o evento de <strong className="text-white">{event.employeeName}</strong>? Esta ação não pode ser desfeita.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setShowConfirmDelete(false)} className="btn-secondary flex-1">
                Cancelar
              </button>
              <button
                onClick={() => { onDelete(event.id); setShowConfirmDelete(false) }}
                className="btn-danger flex-1"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}

      {showEdit && <EventFormModal onClose={() => setShowEdit(false)} eventToEdit={event} />}
    </>
  )
}
