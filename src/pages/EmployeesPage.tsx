import { useEffect, useState } from 'react'
import { Search, Plus, User, Phone, X } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useEmployeesStore } from '../store/employeesStore'
import { useEventsStore } from '../store/eventsStore'
import type { Employee } from '../types'

const empSchema = z.object({
  name: z.string().min(2, 'Nome obrigatório'),
  matricula: z.string().min(2, 'Matrícula obrigatória'),
  sector: z.string().min(2, 'Setor obrigatório'),
  role: z.string().min(2, 'Função obrigatória'),
  shift: z.string().min(1),
  contact: z.string().optional(),
})

type EmpForm = z.infer<typeof empSchema>

const SECTORS = [
  'Terminal de Contêineres', 'Terminal de Granel', 'Operações Portuárias',
  'Segurança', 'Manutenção', 'Logística', 'Administração', 'TI', 'RH', 'Financeiro',
]

function EmployeeFormModal({ onClose, toEdit }: { onClose: () => void; toEdit?: Employee }) {
  const { addEmployee, updateEmployee } = useEmployeesStore()
  const { register, handleSubmit, formState: { errors } } = useForm<EmpForm>({
    resolver: zodResolver(empSchema),
    defaultValues: toEdit ? {
      name: toEdit.name,
      matricula: toEdit.matricula,
      sector: toEdit.sector,
      role: toEdit.role,
      shift: toEdit.shift,
      contact: toEdit.contact,
    } : { shift: 'manhã' },
  })

  const onSubmit = async (data: EmpForm) => {
    if (toEdit) {
      await updateEmployee({ ...toEdit, ...data } as Employee)
    } else {
      const emp: Employee = {
        id: `emp-${Date.now()}`,
        name: data.name,
        matricula: data.matricula.toUpperCase(),
        sector: data.sector,
        role: data.role,
        shift: data.shift as any,
        contact: data.contact,
        active: true,
        createdAt: new Date().toISOString(),
      }
      await addEmployee(emp)
    }
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/80 backdrop-blur-sm">
      <div className="w-full sm:max-w-md bg-slate-900 border border-slate-700/50 rounded-t-3xl sm:rounded-3xl">
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-slate-700/50">
          <h2 className="text-lg font-bold text-white">{toEdit ? 'Editar Colaborador' : 'Novo Colaborador'}</h2>
          <button onClick={onClose} className="btn-ghost w-10 h-10 !px-0 !py-0"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="px-5 py-4 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="label">Nome completo *</label>
              <input {...register('name')} placeholder="Ex: João Silva" className="input" />
              {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>}
            </div>
            <div>
              <label className="label">Matrícula *</label>
              <input {...register('matricula')} placeholder="COL001" className="input uppercase" />
              {errors.matricula && <p className="text-red-400 text-xs mt-1">{errors.matricula.message}</p>}
            </div>
            <div>
              <label className="label">Turno</label>
              <select {...register('shift')} className="input">
                <option value="manhã">Manhã</option>
                <option value="tarde">Tarde</option>
                <option value="noite">Noite</option>
                <option value="dia">Dia</option>
              </select>
            </div>
            <div>
              <label className="label">Setor *</label>
              <select {...register('sector')} className="input">
                <option value="">Selecionar...</option>
                {SECTORS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              {errors.sector && <p className="text-red-400 text-xs mt-1">{errors.sector.message}</p>}
            </div>
            <div>
              <label className="label">Função *</label>
              <input {...register('role')} placeholder="Ex: Estivador" className="input" />
              {errors.role && <p className="text-red-400 text-xs mt-1">{errors.role.message}</p>}
            </div>
            <div className="col-span-2">
              <label className="label">Contato</label>
              <input {...register('contact')} placeholder="(13) 9..." className="input" type="tel" />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancelar</button>
            <button type="submit" className="btn-primary flex-1">
              {toEdit ? 'Salvar' : 'Cadastrar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function EmployeeCard({ emp, events, onEdit, onDelete }: {
  emp: Employee
  events: { count: number; avgScore: number }
  onEdit: () => void
  onDelete: () => void
}) {
  const scoreColor = events.avgScore >= 7 ? 'text-emerald-400' : events.avgScore >= 4 ? 'text-amber-400' : 'text-red-400'
  const initials = emp.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()

  return (
    <div className="card p-4">
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center flex-shrink-0">
          <span className="text-white font-bold text-sm">{initials}</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="font-semibold text-white leading-tight">{emp.name}</p>
              <p className="text-xs text-slate-500">{emp.matricula}</p>
            </div>
            <div className="text-right flex-shrink-0">
              <p className={`text-xl font-bold leading-none ${scoreColor}`}>
                {events.avgScore > 0 ? events.avgScore.toFixed(1) : '—'}
              </p>
              <p className="text-xs text-slate-600 mt-0.5">média</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5 mt-2">
            <span className="text-xs bg-slate-700/60 text-slate-400 px-2 py-0.5 rounded-full">{emp.sector}</span>
            <span className="text-xs bg-slate-700/60 text-slate-400 px-2 py-0.5 rounded-full">{emp.role}</span>
            <span className="text-xs bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded-full capitalize">{emp.shift}</span>
          </div>
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-3 text-xs text-slate-500">
              {emp.contact && (
                <a href={`tel:${emp.contact}`} className="flex items-center gap-1 hover:text-slate-300">
                  <Phone size={11} /> {emp.contact}
                </a>
              )}
              <span>{events.count} evento{events.count !== 1 ? 's' : ''}</span>
            </div>
            <div className="flex gap-1">
              <button onClick={onEdit} className="text-xs text-blue-400 hover:text-blue-300 px-2 py-1 rounded-lg hover:bg-blue-500/10 transition-colors">
                Editar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function EmployeesPage() {
  const { employees, fetchEmployees, searchQuery, setSearchQuery, getFilteredEmployees } = useEmployeesStore()
  const { events, fetchEvents } = useEventsStore()
  const [showForm, setShowForm] = useState(false)
  const [editTarget, setEditTarget] = useState<Employee | undefined>()

  useEffect(() => { fetchEmployees(); fetchEvents() }, [])

  const filtered = getFilteredEmployees()

  const getStats = (empId: string) => {
    const empEvents = events.filter(e => e.employeeId === empId)
    const avgScore = empEvents.length ? empEvents.reduce((a, b) => a + b.score, 0) / empEvents.length : 0
    return { count: empEvents.length, avgScore }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="sticky top-0 z-20 bg-slate-950/80 backdrop-blur-sm px-4 py-3 border-b border-slate-800/50">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Buscar colaboradores..."
              className="input pl-9 text-sm"
              aria-label="Buscar colaboradores"
            />
          </div>
          <button onClick={() => { setEditTarget(undefined); setShowForm(true) }} className="btn-primary px-3">
            <Plus size={18} />
          </button>
        </div>
      </div>

      <div className="px-4 py-2">
        <p className="text-xs text-slate-500">{filtered.length} colaborador{filtered.length !== 1 ? 'es' : ''}</p>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-3">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <span className="text-5xl">👥</span>
            <p className="text-slate-500">Nenhum colaborador encontrado</p>
            <button onClick={() => setShowForm(true)} className="btn-primary">
              <Plus size={16} /> Cadastrar Colaborador
            </button>
          </div>
        ) : (
          filtered.map(emp => (
            <EmployeeCard
              key={emp.id}
              emp={emp}
              events={getStats(emp.id)}
              onEdit={() => { setEditTarget(emp); setShowForm(true) }}
              onDelete={() => {}}
            />
          ))
        )}
      </div>

      {showForm && (
        <EmployeeFormModal
          onClose={() => { setShowForm(false); setEditTarget(undefined) }}
          toEdit={editTarget}
        />
      )}
    </div>
  )
}
