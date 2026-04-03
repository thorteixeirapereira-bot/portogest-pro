import { Trophy } from 'lucide-react'
import type { Event } from '../../types'

export default function TopRanking({ events }: { events: Event[] }) {
  const scoreMap: Record<string, { name: string; total: number; count: number }> = {}

  events.forEach(e => {
    if (!scoreMap[e.employeeId]) {
      scoreMap[e.employeeId] = { name: e.employeeName, total: 0, count: 0 }
    }
    scoreMap[e.employeeId].total += e.score
    scoreMap[e.employeeId].count++
  })

  const ranking = Object.values(scoreMap)
    .map(({ name, total, count }) => ({ name, avg: total / count, count }))
    .sort((a, b) => b.avg - a.avg)
    .slice(0, 5)

  const medalColors = ['text-amber-400', 'text-slate-400', 'text-amber-700', 'text-slate-500', 'text-slate-500']
  const medalBg = ['bg-amber-500/20', 'bg-slate-500/20', 'bg-amber-700/20', 'bg-slate-700/20', 'bg-slate-700/20']

  return (
    <div className="card p-4">
      <div className="flex items-center gap-2 mb-4">
        <Trophy size={16} className="text-amber-400" />
        <h3 className="text-sm font-semibold text-white">Ranking de Desempenho</h3>
      </div>
      <div className="space-y-2.5">
        {ranking.map((item, i) => (
          <div key={item.name} className="flex items-center gap-3">
            <div className={`w-7 h-7 rounded-full ${medalBg[i]} flex items-center justify-center flex-shrink-0`}>
              <span className={`text-xs font-bold ${medalColors[i]}`}>{i + 1}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{item.name}</p>
              <p className="text-xs text-slate-500">{item.count} evento{item.count !== 1 ? 's' : ''}</p>
            </div>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <div className="h-1.5 bg-slate-700 rounded-full w-16 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-600 to-blue-400 rounded-full"
                  style={{ width: `${(item.avg / 10) * 100}%` }}
                />
              </div>
              <span className="text-sm font-bold text-white w-6 text-right">{item.avg.toFixed(1)}</span>
            </div>
          </div>
        ))}
        {ranking.length === 0 && (
          <p className="text-sm text-slate-500 text-center py-4">Nenhum dado disponível</p>
        )}
      </div>
    </div>
  )
}
