import { create } from 'zustand'
import type { Event, DateFilter } from '../types'
import { dbGetAll, dbPut, dbDelete } from '../lib/db'
import { subDays, isAfter, startOfDay, startOfWeek, startOfMonth } from 'date-fns'

interface EventsState {
  events: Event[]
  loading: boolean
  dateFilter: DateFilter
  searchQuery: string
  selectedCategory: string
  selectedCriticality: string
  selectedStatus: string
  fetchEvents: () => Promise<void>
  addEvent: (event: Event) => Promise<void>
  updateEvent: (event: Event) => Promise<void>
  deleteEvent: (id: string) => Promise<void>
  setDateFilter: (filter: DateFilter) => void
  setSearchQuery: (q: string) => void
  setSelectedCategory: (c: string) => void
  setSelectedCriticality: (c: string) => void
  setSelectedStatus: (s: string) => void
  getFilteredEvents: () => Event[]
}

function getDateBoundary(filter: DateFilter): Date | null {
  const now = new Date()
  switch (filter) {
    case 'hoje': return startOfDay(now)
    case 'semana': return startOfWeek(now, { weekStartsOn: 1 })
    case 'mês': return startOfMonth(now)
    default: return null
  }
}

export const useEventsStore = create<EventsState>((set, get) => ({
  events: [],
  loading: false,
  dateFilter: 'mês',
  searchQuery: '',
  selectedCategory: '',
  selectedCriticality: '',
  selectedStatus: '',

  fetchEvents: async () => {
    set({ loading: true })
    const events = await dbGetAll<Event>('events')
    events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    set({ events, loading: false })
  },

  addEvent: async (event) => {
    await dbPut('events', event)
    set(s => ({ events: [event, ...s.events].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()) }))
  },

  updateEvent: async (event) => {
    await dbPut('events', event)
    set(s => ({ events: s.events.map(e => e.id === event.id ? event : e) }))
  },

  deleteEvent: async (id) => {
    await dbDelete('events', id)
    set(s => ({ events: s.events.filter(e => e.id !== id) }))
  },

  setDateFilter: (dateFilter) => set({ dateFilter }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setSelectedCategory: (selectedCategory) => set({ selectedCategory }),
  setSelectedCriticality: (selectedCriticality) => set({ selectedCriticality }),
  setSelectedStatus: (selectedStatus) => set({ selectedStatus }),

  getFilteredEvents: () => {
    const { events, dateFilter, searchQuery, selectedCategory, selectedCriticality, selectedStatus } = get()
    const boundary = getDateBoundary(dateFilter)

    return events.filter(e => {
      if (boundary && !isAfter(new Date(e.date), boundary)) return false
      if (searchQuery) {
        const q = searchQuery.toLowerCase()
        if (!e.employeeName.toLowerCase().includes(q) &&
            !e.category.toLowerCase().includes(q) &&
            !e.description.toLowerCase().includes(q) &&
            !e.sector.toLowerCase().includes(q)) return false
      }
      if (selectedCategory && e.category !== selectedCategory) return false
      if (selectedCriticality && e.criticality !== selectedCriticality) return false
      if (selectedStatus && e.status !== selectedStatus) return false
      return true
    })
  },
}))
