import { useEffect, useState } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, Radar, LineChart, Line, Legend,
} from 'recharts'
import { format, subDays, getDay, getHours, eachDayOfInterval, startOfWeek } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useEventsStore } from '../store/eventsStore'
import { useEmployeesStore } from '../store/employeesStore'

const DAY_NAMES = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

export default function AnalyticsPage() {
  const { events, fetchEvents, getFilteredEvents } = useEventsStore()
  const { employees, fetchEmployees } = useEmployeesStore()
  const [selectedEmployee, setSelectedEmployee] = useState<string>('')

  useEffect(() => { fetchEvents(); fetchEmployees() }, [])

  const allEvents = events
  const filtered = getFilteredEvents()

  // ─── Sector performance ──────────────────────────────────────────────────
  const sectorMap: Record<string, { total: number; count: number }> = {}
  allEvents.forEach(e => {
    if (!sectorMap[e.sector]) sectorMap[e.sector] = { total: 0, count: 0 }
    sectorMap[e.sector].total += e.score
    sectorMap[e.sector].count++
  })

  const sectorData = Object.entries(sectorMap)
    .map(([name, { total, count }]) => ({ name: name.length > 18 ? name.substring(0, 16) + '…' : name, avg: parseFloat((total / count).toFixed(1)), count }))
    .sort((a, b) => b.avg - a.avg)
    .slice(0, 7)

  // ─── Heatmap: day x hour ─────────────────────────────────────────────────
  const heatmap: Record<string, Record<number, number>> = {}
  DAY_NAMES.forEach(d => { heatmap[d] = {} })
  allEvents.forEach(e => {
    const day = DAY_NAMES[getDay(new Date(e.date))]
    const hour = getHours(new Date(e.date))
    const bucket = Math.floor(hour / 4) * 4 // 4-hour buckets: 0, 4, 8, 12, 16, 20
    heatmap[day][bucket] = (heatmap[day][bucket] || 0) + 1
  })

  const maxHeat = Math.max(...DAY_NAMES.flatMap(d => Object.values(heatmap[d])), 1)
  const hourBuckets = [0, 4, 8, 12, 16, 20]

  // ─── Employee trend ───────────────────────────────────────────────────────
  const empEvents = selectedEmployee ? allEvents.filter(e => e.employeeId === selectedEmployee) : []
  const empTrendData = eachDayOfInterval({ start: subDays(new Date(), 29), end: new Date() }).map(day => {
    const dayStr = format(day, 'yyyy-MM-dd')
    const dayEvents = empEvents.filter(e => e.date.startsWith(dayStr))
    return {
      date: format(day, 'dd/MM'),
      score: dayEvents.length ? parseFloat((dayEvents.reduce((a, b) => a + b.score, 0) / dayEvents.length).toFixed(1)) : null,
    }
  })

  // ─── Category radar ───────────────────────────────────────────────────────
  const catMap: Record<string, number> = {}
  filtered.forEach(e => { catMap[e.category] = (catMap[e.category] || 0) + 1 })
  const radarData = Object.entries(catMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([name, value]) => ({ subject: name.length > 14 ? name.substring(0, 12) + '…' : name, value }))

  return (
    <div className="px-4 py-4 space-y-4 animate-fade-in">
      <div>
        <h2 className="text-xl font-bold text-white mb-1">Analytics & BI</h2>
        <p className="text-sm text-slate-500">Análises avançadas do período</p>
      </div>

      {/* Sector performance */}
      <div className="card p-4">
        <h3 className="text-sm font-semibold text-white mb-4">Desempenho por Setor</h3>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={sectorData} layout="vertical" margin={{ left: 0, right: 24 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" horizontal={false} />
            <XAxis type="number" domain={[0, 10]} tick={{ fill: '#64748B', fontSize: 9 }} />
            <YAxis type="category" dataKey="name" tick={{ fill: '#94A3B8', fontSize: 9 }} width={90} />
            <Tooltip
              contentStyle={{ background: '#1E293B', border: '1px solid #334155', borderRadius: 8, fontSize: 11 }}
              formatter={(v: number) => [v.toFixed(1), 'Pontuação média']}
            />
            <Bar dataKey="avg" fill="#2563EB" radius={[0, 6, 6, 0]} name="Média" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Heatmap */}
      <div className="card p-4">
        <h3 className="text-sm font-semibold text-white mb-4">Heatmap — Ocorrências por Dia/Hora</h3>
        <div className="overflow-x-auto">
          <div className="min-w-[300px]">
            <div className="flex gap-1 mb-1 ml-7">
              {hourBuckets.map(h => (
                <div key={h} className="flex-1 text-center text-[9px] text-slate-600">
                  {String(h).padStart(2, '0')}h
                </div>
              ))}
            </div>
            {DAY_NAMES.map(day => (
              <div key={day} className="flex gap-1 mb-1 items-center">
                <span className="text-[9px] text-slate-600 w-7">{day}</span>
                {hourBuckets.map(bucket => {
                  const count = heatmap[day][bucket] || 0
                  const intensity = count / maxHeat
                  return (
                    <div
                      key={bucket}
                      className="flex-1 h-7 rounded flex items-center justify-center transition-all"
                      style={{
                        background: count === 0
                          ? '#1E293B'
                          : `rgba(37, 99, 235, ${0.2 + intensity * 0.8})`,
                      }}
                      title={`${day} ${bucket}h-${bucket + 4}h: ${count} evento${count !== 1 ? 's' : ''}`}
                    >
                      {count > 0 && (
                        <span className="text-[9px] font-bold text-white">{count}</span>
                      )}
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Category radar */}
      {radarData.length > 0 && (
        <div className="card p-4">
          <h3 className="text-sm font-semibold text-white mb-2">Distribuição por Categoria</h3>
          <ResponsiveContainer width="100%" height={220}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#1E293B" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748B', fontSize: 9 }} />
              <Radar dataKey="value" stroke="#2563EB" fill="#2563EB" fillOpacity={0.25} />
              <Tooltip
                contentStyle={{ background: '#1E293B', border: '1px solid #334155', borderRadius: 8, fontSize: 11 }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Employee trend */}
      <div className="card p-4">
        <h3 className="text-sm font-semibold text-white mb-3">Tendência Individual (30 dias)</h3>
        <select
          value={selectedEmployee}
          onChange={e => setSelectedEmployee(e.target.value)}
          className="input text-sm mb-4"
          aria-label="Selecionar colaborador para análise"
        >
          <option value="">Selecionar colaborador...</option>
          {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
        </select>
        {selectedEmployee && (
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={empTrendData} margin={{ left: -20, right: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
              <XAxis dataKey="date" tick={{ fill: '#64748B', fontSize: 9 }} interval={6} />
              <YAxis domain={[0, 10]} tick={{ fill: '#64748B', fontSize: 10 }} />
              <Tooltip
                contentStyle={{ background: '#1E293B', border: '1px solid #334155', borderRadius: 8, fontSize: 11 }}
                formatter={(v: number) => [v?.toFixed(1), 'Pontuação']}
              />
              <Line
                type="monotone"
                dataKey="score"
                stroke="#10B981"
                strokeWidth={2}
                dot={false}
                connectNulls
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
        {!selectedEmployee && (
          <div className="h-20 flex items-center justify-center">
            <p className="text-slate-600 text-sm">Selecione um colaborador para ver a tendência</p>
          </div>
        )}
      </div>
    </div>
  )
}
