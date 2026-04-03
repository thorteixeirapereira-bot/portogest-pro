import { useEffect } from 'react'
import { useEventsStore } from '../store/eventsStore'
import { useEmployeesStore } from '../store/employeesStore'
import { useUIStore } from '../store/uiStore'
import KPICards from '../components/dashboard/KPICards'
import { EventsByCategoryChart, ScoreTrendChart, CriticalityDonutChart } from '../components/dashboard/Charts'
import TopRanking from '../components/dashboard/TopRanking'
import Alerts from '../components/dashboard/Alerts'

export default function DashboardPage() {
  const { events, fetchEvents, dateFilter, setDateFilter, getFilteredEvents } = useEventsStore()
  const { employees, fetchEmployees } = useEmployeesStore()
  const { managerName } = useUIStore()

  useEffect(() => {
    fetchEvents()
    fetchEmployees()
  }, [])

  const filtered = getFilteredEvents()
  const totalEvents = filtered.length
  const avgScore = filtered.length ? filtered.reduce((a, b) => a + b.score, 0) / filtered.length : 0
  const pendingFeedbacks = filtered.filter(e => !e.hasFeedback).length
  const criticalEvents = filtered.filter(e => e.criticality === 'crítico').length

  const filters: Array<{ key: typeof dateFilter; label: string }> = [
    { key: 'hoje', label: 'Hoje' },
    { key: 'semana', label: 'Semana' },
    { key: 'mês', label: 'Mês' },
  ]

  return (
    <div className="px-4 py-4 space-y-4 animate-fade-in">
      {/* Welcome */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-slate-500 text-sm">Bem-vindo,</p>
          <h2 className="text-xl font-bold text-white">{managerName?.split(' ')[0] || 'Gestor'} 👋</h2>
        </div>
        {/* Period filter */}
        <div className="flex bg-slate-800/60 rounded-xl p-0.5 gap-0.5">
          {filters.map(f => (
            <button
              key={f.key}
              onClick={() => setDateFilter(f.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 ${
                dateFilter === f.key
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* KPIs */}
      <KPICards
        totalEvents={totalEvents}
        avgScore={avgScore}
        pendingFeedbacks={pendingFeedbacks}
        criticalEvents={criticalEvents}
        totalEmployees={employees.length}
      />

      {/* Alerts */}
      <Alerts events={filtered} />

      {/* Charts */}
      <EventsByCategoryChart events={filtered} />
      <ScoreTrendChart events={events} />
      <CriticalityDonutChart events={filtered} />

      {/* Ranking */}
      <TopRanking events={filtered} />
    </div>
  )
}
