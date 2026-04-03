import { useEffect, useState } from 'react'
import { Search, Filter, Plus, X } from 'lucide-react'
import { useEventsStore } from '../store/eventsStore'
import EventCard from '../components/events/EventCard'
import EventFormModal from '../components/events/EventFormModal'

const CATEGORIES = [
  'Segurança do Trabalho', 'DDS', 'Quase-acidente', 'Comportamento Seguro',
  'Não-conformidade', 'Desempenho Operacional', 'Embarque/Desembarque',
  'Movimentação de Carga', 'Produtividade', 'Qualidade', 'Ocorrência',
]

export default function EventsPage() {
  const {
    fetchEvents, deleteEvent, loading,
    searchQuery, setSearchQuery,
    selectedCategory, setSelectedCategory,
    selectedCriticality, setSelectedCriticality,
    selectedStatus, setSelectedStatus,
    getFilteredEvents,
  } = useEventsStore()

  const [showFilters, setShowFilters] = useState(false)
  const [showForm, setShowForm] = useState(false)

  useEffect(() => { fetchEvents() }, [])

  const filtered = getFilteredEvents()
  const hasActiveFilters = selectedCategory || selectedCriticality || selectedStatus

  return (
    <div className="flex flex-col h-full">
      {/* Search + Filter bar */}
      <div className="sticky top-0 z-20 bg-slate-950/80 backdrop-blur-sm px-4 py-3 space-y-2 border-b border-slate-800/50">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Buscar eventos..."
              className="input pl-9 text-sm"
              aria-label="Buscar eventos"
            />
          </div>
          <button
            onClick={() => setShowFilters(v => !v)}
            className={`btn-secondary px-3 relative ${hasActiveFilters ? 'text-blue-400' : ''}`}
            aria-label="Filtros"
            aria-expanded={showFilters}
          >
            <Filter size={18} />
            {hasActiveFilters && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full" />
            )}
          </button>
          <button onClick={() => setShowForm(true)} className="btn-primary px-3">
            <Plus size={18} />
          </button>
        </div>

        {/* Filters panel */}
        {showFilters && (
          <div className="grid grid-cols-1 gap-2 animate-slide-up">
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="input text-sm"
              aria-label="Filtrar por categoria"
            >
              <option value="">Todas as categorias</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <div className="grid grid-cols-2 gap-2">
              <select
                value={selectedCriticality}
                onChange={e => setSelectedCriticality(e.target.value)}
                className="input text-sm"
                aria-label="Filtrar por criticidade"
              >
                <option value="">Criticidade</option>
                <option value="baixo">Baixo</option>
                <option value="médio">Médio</option>
                <option value="alto">Alto</option>
                <option value="crítico">Crítico</option>
              </select>
              <select
                value={selectedStatus}
                onChange={e => setSelectedStatus(e.target.value)}
                className="input text-sm"
                aria-label="Filtrar por status"
              >
                <option value="">Status</option>
                <option value="aberto">Aberto</option>
                <option value="em_acompanhamento">Em Acompanhamento</option>
                <option value="encerrado">Encerrado</option>
              </select>
            </div>
            {hasActiveFilters && (
              <button
                onClick={() => { setSelectedCategory(''); setSelectedCriticality(''); setSelectedStatus('') }}
                className="flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300"
              >
                <X size={12} /> Limpar filtros
              </button>
            )}
          </div>
        )}
      </div>

      {/* Results count */}
      <div className="px-4 py-2 flex items-center justify-between">
        <p className="text-xs text-slate-500">
          {loading ? 'Carregando...' : `${filtered.length} evento${filtered.length !== 1 ? 's' : ''} encontrado${filtered.length !== 1 ? 's' : ''}`}
        </p>
      </div>

      {/* Event list */}
      <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-3">
        {filtered.length === 0 && !loading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <span className="text-5xl">📋</span>
            <p className="text-slate-500 text-center">Nenhum evento encontrado</p>
            <button onClick={() => setShowForm(true)} className="btn-primary">
              <Plus size={16} /> Registrar Evento
            </button>
          </div>
        ) : (
          filtered.map(event => (
            <EventCard key={event.id} event={event} onDelete={deleteEvent} />
          ))
        )}
      </div>

      {showForm && <EventFormModal onClose={() => setShowForm(false)} />}
    </div>
  )
}
