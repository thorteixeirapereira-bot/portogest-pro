import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend,
} from 'recharts'
import { format, subDays, eachDayOfInterval } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import type { Event } from '../../types'

const COLORS = {
  blue: '#2563EB',
  amber: '#F59E0B',
  emerald: '#10B981',
  red: '#EF4444',
  orange: '#F97316',
  purple: '#8B5CF6',
  cyan: '#06B6D4',
  pink: '#EC4899',
}

const CRITICALITY_COLORS: Record<string, string> = {
  baixo: '#10B981',
  médio: '#F59E0B',
  alto: '#F97316',
  crítico: '#EF4444',
}

// ─── Events by Category ──────────────────────────────────────────────────────

export function EventsByCategoryChart({ events }: { events: Event[] }) {
  const countMap: Record<string, number> = {}
  events.forEach(e => {
    countMap[e.category] = (countMap[e.category] || 0) + 1
  })

  const data = Object.entries(countMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([name, value]) => ({ name: name.length > 16 ? name.substring(0, 14) + '…' : name, value }))

  return (
    <div className="card p-4">
      <h3 className="text-sm font-semibold text-white mb-4">Eventos por Categoria</h3>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} margin={{ left: -20, right: 4, top: 4, bottom: 40 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
          <XAxis
            dataKey="name"
            tick={{ fill: '#64748B', fontSize: 9 }}
            angle={-35}
            textAnchor="end"
            interval={0}
          />
          <YAxis tick={{ fill: '#64748B', fontSize: 10 }} allowDecimals={false} />
          <Tooltip
            contentStyle={{ background: '#1E293B', border: '1px solid #334155', borderRadius: 8, fontSize: 12 }}
            labelStyle={{ color: '#94A3B8' }}
            itemStyle={{ color: '#60A5FA' }}
          />
          <Bar dataKey="value" fill={COLORS.blue} radius={[6, 6, 0, 0]} name="Eventos" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

// ─── Score Trend ─────────────────────────────────────────────────────────────

export function ScoreTrendChart({ events }: { events: Event[] }) {
  const now = new Date()
  const days = eachDayOfInterval({ start: subDays(now, 29), end: now })

  const data = days.map(day => {
    const dayStr = format(day, 'yyyy-MM-dd')
    const dayEvents = events.filter(e => e.date.startsWith(dayStr))
    const avg = dayEvents.length
      ? dayEvents.reduce((a, b) => a + b.score, 0) / dayEvents.length
      : null
    return {
      date: format(day, 'dd/MM', { locale: ptBR }),
      score: avg ? parseFloat(avg.toFixed(1)) : null,
      count: dayEvents.length,
    }
  })

  return (
    <div className="card p-4">
      <h3 className="text-sm font-semibold text-white mb-4">Tendência de Pontuação (30 dias)</h3>
      <ResponsiveContainer width="100%" height={180}>
        <LineChart data={data} margin={{ left: -20, right: 8, top: 4, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
          <XAxis
            dataKey="date"
            tick={{ fill: '#64748B', fontSize: 9 }}
            interval={6}
          />
          <YAxis domain={[0, 10]} tick={{ fill: '#64748B', fontSize: 10 }} />
          <Tooltip
            contentStyle={{ background: '#1E293B', border: '1px solid #334155', borderRadius: 8, fontSize: 12 }}
            labelStyle={{ color: '#94A3B8' }}
            itemStyle={{ color: '#F59E0B' }}
            formatter={(v: number) => [v?.toFixed(1) || '-', 'Pontuação média']}
          />
          <Line
            type="monotone"
            dataKey="score"
            stroke={COLORS.amber}
            strokeWidth={2}
            dot={false}
            connectNulls
            activeDot={{ r: 5, fill: COLORS.amber }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

// ─── Criticality Donut ───────────────────────────────────────────────────────

export function CriticalityDonutChart({ events }: { events: Event[] }) {
  const countMap: Record<string, number> = { baixo: 0, médio: 0, alto: 0, crítico: 0 }
  events.forEach(e => { countMap[e.criticality] = (countMap[e.criticality] || 0) + 1 })

  const data = Object.entries(countMap)
    .filter(([, v]) => v > 0)
    .map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value,
      key: name,
    }))

  const total = data.reduce((a, b) => a + b.value, 0)

  return (
    <div className="card p-4">
      <h3 className="text-sm font-semibold text-white mb-2">Distribuição por Criticidade</h3>
      <div className="flex items-center gap-2">
        <ResponsiveContainer width="55%" height={160}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={45}
              outerRadius={70}
              paddingAngle={3}
              dataKey="value"
            >
              {data.map((entry) => (
                <Cell key={entry.key} fill={CRITICALITY_COLORS[entry.key]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{ background: '#1E293B', border: '1px solid #334155', borderRadius: 8, fontSize: 12 }}
              itemStyle={{ color: '#fff' }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="flex-1 space-y-2">
          {data.map(entry => (
            <div key={entry.key} className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: CRITICALITY_COLORS[entry.key] }} />
                <span className="text-xs text-slate-400">{entry.name}</span>
              </div>
              <div className="text-right">
                <span className="text-xs font-semibold text-white">{entry.value}</span>
                <span className="text-xs text-slate-600 ml-1">({total > 0 ? Math.round(entry.value / total * 100) : 0}%)</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
