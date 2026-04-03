import { useState, useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X, Mic, MicOff, Loader2 } from 'lucide-react'
import { format } from 'date-fns'
import { useEventsStore } from '../../store/eventsStore'
import { useEmployeesStore } from '../../store/employeesStore'
import { useAuthStore } from '../../store/authStore'
import { useVoice } from '../../hooks/useVoice'
import type { Event, EventCategory, Criticality, EventStatus, Shift } from '../../types'

const CATEGORIES: EventCategory[] = [
  'Segurança do Trabalho', 'DDS', 'Quase-acidente', 'Comportamento Seguro',
  'Não-conformidade', 'Desempenho Operacional', 'Embarque/Desembarque',
  'Movimentação de Carga', 'Produtividade', 'Assiduidade', 'Qualidade',
  'Comportamento', 'Treinamento', 'Feedback Positivo', 'Ocorrência',
]

const eventSchema = z.object({
  employeeId: z.string().min(1, 'Selecione um colaborador'),
  category: z.string().min(1, 'Selecione uma categoria'),
  subcategory: z.string().optional(),
  description: z.string().min(5, 'Descrição muito curta'),
  score: z.number().min(1).max(10),
  shift: z.string().min(1, 'Selecione um turno'),
  location: z.string().optional(),
  criticality: z.string().min(1),
  status: z.string().min(1),
  hasFeedback: z.boolean(),
  feedbackText: z.string().optional(),
})

type EventForm = z.infer<typeof eventSchema>

interface Props {
  onClose: () => void
  initialData?: Partial<EventForm>
  eventToEdit?: Event
}

export default function EventFormModal({ onClose, initialData, eventToEdit }: Props) {
  const { addEvent, updateEvent } = useEventsStore()
  const { employees, fetchEmployees } = useEmployeesStore()
  const { user } = useAuthStore()
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const { register, handleSubmit, control, setValue, watch, formState: { errors } } = useForm<EventForm>({
    resolver: zodResolver(eventSchema),
    defaultValues: eventToEdit ? {
      employeeId: eventToEdit.employeeId,
      category: eventToEdit.category,
      subcategory: eventToEdit.subcategory,
      description: eventToEdit.description,
      score: eventToEdit.score,
      shift: eventToEdit.shift,
      location: eventToEdit.location,
      criticality: eventToEdit.criticality,
      status: eventToEdit.status,
      hasFeedback: eventToEdit.hasFeedback,
      feedbackText: eventToEdit.feedback?.text,
    } : {
      score: 7,
      criticality: 'médio',
      status: 'aberto',
      hasFeedback: false,
      shift: 'manhã',
      ...initialData,
    },
  })

  const hasFeedback = watch('hasFeedback')
  const score = watch('score')

  const { isListening, transcript, startListening, stopListening, supported } = useVoice((cmd) => {
    if (cmd.category) setValue('category', cmd.category)
    if (cmd.score) setValue('score', cmd.score)
    if (cmd.shift) setValue('shift', cmd.shift)
    if (cmd.criticality) setValue('criticality', cmd.criticality)
    if (cmd.description) setValue('description', cmd.description)
    if (cmd.employeeName) {
      const emp = employees.find(e => e.name.toLowerCase().includes(cmd.employeeName!.toLowerCase()))
      if (emp) setValue('employeeId', emp.id)
    }
  })

  useEffect(() => {
    fetchEmployees()
  }, [])

  const onSubmit = async (data: EventForm) => {
    setSaving(true)
    const emp = employees.find(e => e.id === data.employeeId)
    const now = new Date().toISOString()
    const id = eventToEdit?.id || `evt-${Date.now()}`

    const event: Event = {
      id,
      employeeId: data.employeeId,
      employeeName: emp?.name || '',
      sector: emp?.sector || '',
      role: emp?.role || '',
      category: data.category as EventCategory,
      subcategory: data.subcategory,
      description: data.description,
      score: data.score,
      date: eventToEdit?.date || now,
      shift: data.shift as Shift,
      location: data.location,
      criticality: data.criticality as Criticality,
      status: data.status as EventStatus,
      hasFeedback: data.hasFeedback,
      feedback: data.hasFeedback && data.feedbackText ? {
        id: `fb-${Date.now()}`,
        text: data.feedbackText,
        date: now,
        responsibleId: user?.id || '',
        responsibleName: user?.name || '',
      } : undefined,
      registeredById: user?.id || '',
      registeredByName: user?.name || '',
      createdAt: eventToEdit?.createdAt || now,
      updatedAt: now,
    }

    if (eventToEdit) await updateEvent(event)
    else await addEvent(event)

    if (navigator.vibrate) navigator.vibrate([50, 30, 100])
    setSaved(true)
    setTimeout(onClose, 1200)
  }

  if (saved) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80">
        <div className="card p-8 flex flex-col items-center gap-4 animate-scale-in">
          <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center">
            <span className="text-3xl">✅</span>
          </div>
          <p className="text-white font-semibold">Evento salvo com sucesso!</p>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/80 backdrop-blur-sm">
      <div className="w-full sm:max-w-lg bg-slate-900 border border-slate-700/50 rounded-t-3xl sm:rounded-3xl max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-slate-700/50 flex-shrink-0">
          <h2 className="text-lg font-bold text-white">{eventToEdit ? 'Editar Evento' : 'Novo Evento'}</h2>
          <div className="flex items-center gap-2">
            {supported && (
              <button
                type="button"
                onClick={isListening ? stopListening : startListening}
                className={`relative w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                  isListening
                    ? 'bg-red-600 text-white pulse-ring'
                    : 'bg-slate-700 text-slate-400 hover:text-white'
                }`}
                aria-label={isListening ? 'Parar gravação' : 'Iniciar comando de voz'}
              >
                {isListening ? <MicOff size={18} /> : <Mic size={18} />}
              </button>
            )}
            <button onClick={onClose} className="btn-ghost w-10 h-10 !px-0 !py-0">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Voice transcript */}
        {isListening && (
          <div className="mx-5 mt-3 bg-blue-500/10 border border-blue-500/30 rounded-xl px-4 py-2.5 flex-shrink-0">
            <p className="text-xs text-blue-400 font-medium">🎤 Ouvindo...</p>
            {transcript && <p className="text-sm text-white mt-1">"{transcript}"</p>}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="overflow-y-auto flex-1 px-5 py-4 space-y-4">
          {/* Employee */}
          <div>
            <label className="label">Colaborador *</label>
            <select {...register('employeeId')} className="input">
              <option value="">Selecionar colaborador...</option>
              {employees.map(e => (
                <option key={e.id} value={e.id}>{e.name} — {e.matricula}</option>
              ))}
            </select>
            {errors.employeeId && <p className="text-red-400 text-xs mt-1">{errors.employeeId.message}</p>}
          </div>

          {/* Category */}
          <div>
            <label className="label">Categoria *</label>
            <select {...register('category')} className="input">
              <option value="">Selecionar categoria...</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            {errors.category && <p className="text-red-400 text-xs mt-1">{errors.category.message}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="label">Descrição do Evento *</label>
            <textarea
              {...register('description')}
              rows={3}
              placeholder="Descreva o evento ocorrido..."
              className="input resize-none"
            />
            {errors.description && <p className="text-red-400 text-xs mt-1">{errors.description.message}</p>}
          </div>

          {/* Score */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="label !mb-0">Pontuação *</label>
              <span className="text-2xl font-bold text-white">{score}</span>
            </div>
            <Controller
              name="score"
              control={control}
              render={({ field }) => (
                <input
                  type="range"
                  min={1}
                  max={10}
                  step={1}
                  value={field.value}
                  onChange={e => field.onChange(Number(e.target.value))}
                  className="w-full h-2 bg-slate-700 rounded-full accent-blue-500 cursor-pointer"
                  aria-label="Pontuação de 1 a 10"
                />
              )}
            />
            <div className="flex justify-between text-xs text-slate-600 mt-1">
              <span>1 — Baixo</span>
              <span>10 — Excelente</span>
            </div>
          </div>

          {/* Row: Shift + Criticality */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Turno *</label>
              <select {...register('shift')} className="input">
                <option value="manhã">Manhã</option>
                <option value="tarde">Tarde</option>
                <option value="noite">Noite</option>
                <option value="dia">Dia</option>
              </select>
            </div>
            <div>
              <label className="label">Criticidade *</label>
              <select {...register('criticality')} className="input">
                <option value="baixo">Baixo</option>
                <option value="médio">Médio</option>
                <option value="alto">Alto</option>
                <option value="crítico">Crítico</option>
              </select>
            </div>
          </div>

          {/* Row: Status + Location */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Status</label>
              <select {...register('status')} className="input">
                <option value="aberto">Aberto</option>
                <option value="em_acompanhamento">Em Acompanhamento</option>
                <option value="encerrado">Encerrado</option>
              </select>
            </div>
            <div>
              <label className="label">Localização</label>
              <input {...register('location')} placeholder="Ex: Berço 3" className="input" />
            </div>
          </div>

          {/* Feedback toggle */}
          <div className="bg-slate-800/50 rounded-xl p-4 space-y-3">
            <Controller
              name="hasFeedback"
              control={control}
              render={({ field }) => (
                <label className="flex items-center gap-3 cursor-pointer">
                  <div
                    onClick={() => field.onChange(!field.value)}
                    className={`w-11 h-6 rounded-full transition-colors relative flex-shrink-0 ${
                      field.value ? 'bg-blue-600' : 'bg-slate-600'
                    }`}
                  >
                    <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                      field.value ? 'translate-x-5' : ''
                    }`} />
                  </div>
                  <span className="text-sm font-medium text-white">Feedback realizado</span>
                </label>
              )}
            />
            {hasFeedback && (
              <textarea
                {...register('feedbackText')}
                rows={2}
                placeholder="Texto do feedback realizado..."
                className="input resize-none"
              />
            )}
          </div>
        </form>

        {/* Footer */}
        <div className="px-5 pb-5 pt-3 border-t border-slate-700/50 flex-shrink-0">
          <button onClick={handleSubmit(onSubmit)} disabled={saving} className="btn-primary w-full">
            {saving ? <Loader2 size={18} className="animate-spin" /> : null}
            {saving ? 'Salvando...' : (eventToEdit ? 'Atualizar Evento' : 'Registrar Evento')}
          </button>
        </div>
      </div>
    </div>
  )
}
