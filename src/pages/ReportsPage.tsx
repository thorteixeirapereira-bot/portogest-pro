import { useEffect, useState } from 'react'
import { FileText, Download, Share2, FileSpreadsheet, Users, AlertTriangle } from 'lucide-react'
import { useEventsStore } from '../store/eventsStore'
import { useEmployeesStore } from '../store/employeesStore'
import { exportGeneralReport, exportEmployeeReport, exportPendingFeedbacks, exportCSV } from '../lib/pdf'
import type { Employee } from '../types'

function ReportCard({
  icon,
  title,
  description,
  onExportPDF,
  onExportCSV,
  onShare,
}: {
  icon: React.ReactNode
  title: string
  description: string
  onExportPDF?: () => void
  onExportCSV?: () => void
  onShare?: () => void
}) {
  return (
    <div className="card p-4">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-10 h-10 bg-blue-600/20 rounded-xl flex items-center justify-center flex-shrink-0">
          {icon}
        </div>
        <div>
          <h3 className="font-semibold text-white">{title}</h3>
          <p className="text-xs text-slate-500 mt-0.5">{description}</p>
        </div>
      </div>
      <div className="flex gap-2 flex-wrap">
        {onExportPDF && (
          <button onClick={onExportPDF} className="btn-primary flex-1 text-sm py-2.5 !min-h-0">
            <Download size={15} /> PDF
          </button>
        )}
        {onExportCSV && (
          <button onClick={onExportCSV} className="btn-secondary flex-1 text-sm py-2.5 !min-h-0">
            <FileSpreadsheet size={15} /> CSV
          </button>
        )}
        {onShare && (
          <button onClick={onShare} className="btn-secondary px-4 text-sm py-2.5 !min-h-0">
            <Share2 size={15} />
          </button>
        )}
      </div>
    </div>
  )
}

export default function ReportsPage() {
  const { events, fetchEvents, dateFilter, setDateFilter, getFilteredEvents } = useEventsStore()
  const { employees, fetchEmployees } = useEmployeesStore()
  const [selectedEmployee, setSelectedEmployee] = useState<string>('')

  useEffect(() => { fetchEvents(); fetchEmployees() }, [])

  const filtered = getFilteredEvents()

  const shareOnWhatsApp = (text: string) => {
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`
    window.open(url, '_blank')
  }

  const generalSummary = `*PortoGest Pro — Relatório Geral*\n\n📊 Total de eventos: ${filtered.length}\n⭐ Pontuação média: ${filtered.length ? (filtered.reduce((a, b) => a + b.score, 0) / filtered.length).toFixed(1) : 0}\n⏳ Feedbacks pendentes: ${filtered.filter(e => !e.hasFeedback).length}\n🚨 Eventos críticos: ${filtered.filter(e => e.criticality === 'crítico').length}\n\nGerado pelo PortoGest Pro`

  const selectedEmp = employees.find(e => e.id === selectedEmployee)
  const empEvents = selectedEmp ? events.filter(e => e.employeeId === selectedEmployee) : []

  const periods: Array<{ key: typeof dateFilter; label: string }> = [
    { key: 'hoje', label: 'Hoje' },
    { key: 'semana', label: 'Semana' },
    { key: 'mês', label: 'Mês' },
  ]

  return (
    <div className="px-4 py-4 space-y-4 animate-fade-in">
      <div>
        <h2 className="text-xl font-bold text-white mb-1">Relatórios</h2>
        <p className="text-sm text-slate-500">Exporte dados em PDF ou CSV</p>
      </div>

      {/* Period filter */}
      <div className="flex bg-slate-800/60 rounded-xl p-0.5 gap-0.5 w-full">
        {periods.map(f => (
          <button
            key={f.key}
            onClick={() => setDateFilter(f.key)}
            className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${
              dateFilter === f.key ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Stats summary */}
      <div className="card p-4">
        <p className="text-xs text-slate-500 font-medium mb-3 uppercase tracking-wide">Resumo do período</p>
        <div className="grid grid-cols-2 gap-4">
          {[
            { label: 'Eventos', value: filtered.length },
            { label: 'Pontuação Média', value: filtered.length ? (filtered.reduce((a, b) => a + b.score, 0) / filtered.length).toFixed(1) : '—' },
            { label: 'Pendentes', value: filtered.filter(e => !e.hasFeedback).length },
            { label: 'Críticos', value: filtered.filter(e => e.criticality === 'crítico').length },
          ].map(item => (
            <div key={item.label}>
              <p className="text-xl font-bold text-white">{item.value}</p>
              <p className="text-xs text-slate-500">{item.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Report cards */}
      <ReportCard
        icon={<FileText size={18} className="text-blue-400" />}
        title="Relatório Geral"
        description="Todos os eventos do período com estatísticas"
        onExportPDF={() => exportGeneralReport(filtered)}
        onExportCSV={() => exportCSV(filtered)}
        onShare={() => shareOnWhatsApp(generalSummary)}
      />

      <ReportCard
        icon={<AlertTriangle size={18} className="text-red-400" />}
        title="Feedbacks Pendentes"
        description="Eventos sem feedback registrado"
        onExportPDF={() => exportPendingFeedbacks(events)}
        onExportCSV={() => exportCSV(events.filter(e => !e.hasFeedback))}
      />

      {/* Individual report */}
      <div className="card p-4">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 bg-emerald-600/20 rounded-xl flex items-center justify-center flex-shrink-0">
            <Users size={18} className="text-emerald-400" />
          </div>
          <div>
            <h3 className="font-semibold text-white">Relatório Individual</h3>
            <p className="text-xs text-slate-500 mt-0.5">Histórico completo por colaborador</p>
          </div>
        </div>
        <select
          value={selectedEmployee}
          onChange={e => setSelectedEmployee(e.target.value)}
          className="input mb-3 text-sm"
          aria-label="Selecionar colaborador"
        >
          <option value="">Selecionar colaborador...</option>
          {employees.map(e => (
            <option key={e.id} value={e.id}>{e.name} — {e.matricula}</option>
          ))}
        </select>
        <div className="flex gap-2">
          <button
            onClick={() => selectedEmp && exportEmployeeReport(selectedEmp, empEvents)}
            disabled={!selectedEmployee}
            className="btn-primary flex-1 text-sm py-2.5 !min-h-0 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Download size={15} /> Exportar PDF
          </button>
          <button
            onClick={() => selectedEmp && exportCSV(empEvents)}
            disabled={!selectedEmployee}
            className="btn-secondary flex-1 text-sm py-2.5 !min-h-0 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <FileSpreadsheet size={15} /> CSV
          </button>
        </div>
        {selectedEmployee && (
          <p className="text-xs text-slate-500 mt-2 text-center">
            {empEvents.length} evento{empEvents.length !== 1 ? 's' : ''} encontrado{empEvents.length !== 1 ? 's' : ''}
          </p>
        )}
      </div>
    </div>
  )
}
