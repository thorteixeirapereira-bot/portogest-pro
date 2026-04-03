import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import type { DbGestor } from '../lib/supabase'

const GESTOR_ID_KEY = 'portogest-gestor-id'

interface GestorState {
  gestor: DbGestor | null
  loading: boolean
  getOrCreateGestor: (nome: string) => Promise<DbGestor>
  loadGestor: () => Promise<void>
  updateNome: (nome: string) => Promise<void>
}

export const useGestorStore = create<GestorState>((set, get) => ({
  gestor: null,
  loading: false,

  getOrCreateGestor: async (nome) => {
    const existingId = localStorage.getItem(GESTOR_ID_KEY)
    if (existingId) {
      const { data } = await supabase.from('gestores').select('*').eq('id', existingId).single()
      if (data) {
        set({ gestor: data })
        return data
      }
    }
    // Create new gestor
    const { data, error } = await supabase.from('gestores').insert({ nome }).select().single()
    if (error || !data) throw error
    localStorage.setItem(GESTOR_ID_KEY, data.id)
    set({ gestor: data })
    return data
  },

  loadGestor: async () => {
    const existingId = localStorage.getItem(GESTOR_ID_KEY)
    if (!existingId) return
    set({ loading: true })
    const { data } = await supabase.from('gestores').select('*').eq('id', existingId).single()
    set({ gestor: data ?? null, loading: false })
  },

  updateNome: async (nome) => {
    const { gestor } = get()
    if (!gestor) return
    const { data } = await supabase.from('gestores').update({ nome }).eq('id', gestor.id).select().single()
    if (data) set({ gestor: data })
  },
}))

export function getGestorId(): string | null {
  return localStorage.getItem(GESTOR_ID_KEY)
}
