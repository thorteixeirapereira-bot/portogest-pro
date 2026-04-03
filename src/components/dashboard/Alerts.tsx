import { AlertTriangle, Clock } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import type { Event } from '../../types'

export default function Alerts({ events }: { events: Event[] }) {
  const critical = events
    .filter(e => e.criticality === 'crítico' && !e.hasFeedback)
    .slice(0, 5)

  if (critical.length === 0) return null

  return (
    <div className="card border-red-500/30 p-4">
      <div className="flex items-center gap-2 mb-3">
        <AlertTriangle size={16} className="text-red-400" />
        <h3 className="text-sm font-semibold text-red-400">Alertas — Eventos Críticos sem Feedback</h3>
        <span className="ml-auto bg-red-500/20 text-red-400 text-xs font-bold px-2 py-0.5 rounded-full">
          {critical.length}
        </span>
      </div>
      <div className="space-y-2">
        {critical.map(e => (
          <div key={e.id} className="bg-red-500/5 border border-red-500/20 rounded-xl p-3">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-sm font-medium text-white truncate">{e.employeeName}</p>
                <p className="text-xs text-slate-500 truncate">{e.category} — {e.sector}</p>
              </div>
              <div className="flex items-center gap-1 text-xs text-slate-500 flex-shrink-0">
                <Clock size={10} />
                {formatDistanceToNow(new Date(e.date), { locale: ptBR, addSuffix: true })}
              </div>
            </div>
            <p className="text-xs text-slate-400 mt-1 line-clamp-2">{e.description}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
