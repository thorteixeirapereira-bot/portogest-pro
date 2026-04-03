import { create } from 'zustand'
import type { PsychTestResult, PsychTestType } from '../types'

const STORAGE_KEY = 'portogest-psych-results'

function loadResults(): PsychTestResult[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
  } catch {
    return []
  }
}

function saveResults(results: PsychTestResult[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(results))
}

interface PsychState {
  results: PsychTestResult[]
  addResult: (result: PsychTestResult) => void
  getResultsForEmployee: (employeeId: string) => PsychTestResult[]
  getLatestResult: (employeeId: string, testType: PsychTestType) => PsychTestResult | null
  deleteResult: (id: string) => void
}

export const usePsychStore = create<PsychState>((set, get) => ({
  results: loadResults(),

  addResult: (result) => {
    const results = get().results
    // Replace if same employee + testType already exists
    const filtered = results.filter(r => !(r.employeeId === result.employeeId && r.testType === result.testType))
    const updated = [...filtered, result]
    saveResults(updated)
    set({ results: updated })
  },

  getResultsForEmployee: (employeeId) =>
    get().results.filter(r => r.employeeId === employeeId),

  getLatestResult: (employeeId, testType) =>
    get().results
      .filter(r => r.employeeId === employeeId && r.testType === testType)
      .sort((a, b) => b.completedAt.localeCompare(a.completedAt))[0] ?? null,

  deleteResult: (id) => {
    const updated = get().results.filter(r => r.id !== id)
    saveResults(updated)
    set({ results: updated })
  },
}))
