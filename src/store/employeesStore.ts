import { create } from 'zustand'
import type { Employee } from '../types'
import { dbGetAll, dbPut, dbDelete } from '../lib/db'

interface EmployeesState {
  employees: Employee[]
  loading: boolean
  searchQuery: string
  selectedSector: string
  fetchEmployees: () => Promise<void>
  addEmployee: (emp: Employee) => Promise<void>
  updateEmployee: (emp: Employee) => Promise<void>
  deleteEmployee: (id: string) => Promise<void>
  setSearchQuery: (q: string) => void
  setSelectedSector: (s: string) => void
  getFilteredEmployees: () => Employee[]
}

export const useEmployeesStore = create<EmployeesState>((set, get) => ({
  employees: [],
  loading: false,
  searchQuery: '',
  selectedSector: '',

  fetchEmployees: async () => {
    set({ loading: true })
    const employees = await dbGetAll<Employee>('employees')
    employees.sort((a, b) => a.name.localeCompare(b.name))
    set({ employees, loading: false })
  },

  addEmployee: async (emp) => {
    await dbPut('employees', emp)
    set(s => ({ employees: [...s.employees, emp].sort((a, b) => a.name.localeCompare(b.name)) }))
  },

  updateEmployee: async (emp) => {
    await dbPut('employees', emp)
    set(s => ({ employees: s.employees.map(e => e.id === emp.id ? emp : e) }))
  },

  deleteEmployee: async (id) => {
    await dbDelete('employees', id)
    set(s => ({ employees: s.employees.filter(e => e.id !== id) }))
  },

  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setSelectedSector: (selectedSector) => set({ selectedSector }),

  getFilteredEmployees: () => {
    const { employees, searchQuery, selectedSector } = get()
    return employees.filter(e => {
      if (!e.active) return false
      if (searchQuery) {
        const q = searchQuery.toLowerCase()
        if (!e.name.toLowerCase().includes(q) &&
            !e.matricula.toLowerCase().includes(q) &&
            !e.sector.toLowerCase().includes(q) &&
            !e.role.toLowerCase().includes(q)) return false
      }
      if (selectedSector && e.sector !== selectedSector) return false
      return true
    })
  },
}))
