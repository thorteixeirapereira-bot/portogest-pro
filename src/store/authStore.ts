import { create } from 'zustand'
import type { User } from '../types'
import { dbGetAll, saveSession, clearSession } from '../lib/db'
import { DEMO_CREDENTIALS } from '../lib/demoData'

interface AuthState {
  user: User | null
  loading: boolean
  error: string | null
  login: (matricula: string, password: string) => Promise<boolean>
  logout: () => Promise<void>
  setUser: (user: User | null) => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: false,
  error: null,

  login: async (matricula, password) => {
    set({ loading: true, error: null })
    try {
      const users = await dbGetAll<User>('users')
      const user = users.find(u => u.matricula.toUpperCase() === matricula.toUpperCase())
      if (!user) {
        set({ error: 'Matrícula não encontrada', loading: false })
        return false
      }
      const validPassword = DEMO_CREDENTIALS[user.matricula] === password
      if (!validPassword) {
        set({ error: 'Senha incorreta', loading: false })
        return false
      }
      await saveSession(user.id)
      set({ user, loading: false, error: null })
      return true
    } catch (e) {
      set({ error: 'Erro ao fazer login', loading: false })
      return false
    }
  },

  logout: async () => {
    await clearSession()
    set({ user: null })
  },

  setUser: (user) => set({ user }),
}))
