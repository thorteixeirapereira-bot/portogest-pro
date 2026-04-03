import { create } from 'zustand'
import type { Theme } from '../types'

interface UIState {
  theme: Theme
  showFAB: boolean
  activeTab: string
  toggleTheme: () => void
  setTheme: (theme: Theme) => void
  setActiveTab: (tab: string) => void
}

const savedTheme = (localStorage.getItem('theme') as Theme) || 'dark'

export const useUIStore = create<UIState>((set) => ({
  theme: savedTheme,
  showFAB: true,
  activeTab: 'dashboard',

  toggleTheme: () =>
    set(s => {
      const next: Theme = s.theme === 'dark' ? 'light' : 'dark'
      localStorage.setItem('theme', next)
      if (next === 'dark') document.documentElement.classList.add('dark')
      else document.documentElement.classList.remove('dark')
      return { theme: next }
    }),

  setTheme: (theme) => {
    localStorage.setItem('theme', theme)
    if (theme === 'dark') document.documentElement.classList.add('dark')
    else document.documentElement.classList.remove('dark')
    set({ theme })
  },

  setActiveTab: (activeTab) => set({ activeTab }),
}))
