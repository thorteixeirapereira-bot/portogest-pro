import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import type { DbTestePerfil } from '../lib/supabase'
import type { PsychTestType } from '../types'

interface TestesState {
  results: DbTestePerfil[]
  loading: boolean
  fetchForColaborador: (colaboradorId: string) => Promise<DbTestePerfil[]>
  saveResult: (colaboradorId: string, tipo: PsychTestType, scores: Record<string, number>) => Promise<DbTestePerfil | null>
  deleteResult: (id: string) => Promise<void>
  subscribeRealtime: (colaboradorId: string, onNew: (r: DbTestePerfil) => void) => () => void
}

export const useTestesStore = create<TestesState>((set, get) => ({
  results: [],
  loading: false,

  fetchForColaborador: async (colaboradorId) => {
    const { data } = await supabase
      .from('testes_perfil')
      .select('*')
      .eq('colaborador_id', colaboradorId)
      .order('created_at', { ascending: false })
    const results = data ?? []
    set({ results })
    return results
  },

  saveResult: async (colaboradorId, tipo, scores) => {
    // Upsert: if same type exists, replace it
    const existing = get().results.find(r => r.colaborador_id === colaboradorId && r.tipo === tipo)
    if (existing) {
      const { data } = await supabase
        .from('testes_perfil')
        .update({ scores })
        .eq('id', existing.id)
        .select()
        .single()
      if (data) set(s => ({ results: s.results.map(r => r.id === existing.id ? data : r) }))
      return data ?? null
    }
    const { data, error } = await supabase
      .from('testes_perfil')
      .insert({ colaborador_id: colaboradorId, tipo, scores })
      .select()
      .single()
    if (error || !data) { console.error(error); return null }
    set(s => ({ results: [data, ...s.results] }))
    return data
  },

  deleteResult: async (id) => {
    await supabase.from('testes_perfil').delete().eq('id', id)
    set(s => ({ results: s.results.filter(r => r.id !== id) }))
  },

  subscribeRealtime: (colaboradorId, onNew) => {
    const channel = supabase
      .channel(`testes-${colaboradorId}`)
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'testes_perfil', filter: `colaborador_id=eq.${colaboradorId}` },
        (payload) => onNew(payload.new as DbTestePerfil)
      )
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  },
}))

// Standalone fetch for public page
export async function getTestesForColaborador(colaboradorId: string): Promise<DbTestePerfil[]> {
  const { data } = await supabase
    .from('testes_perfil')
    .select('*')
    .eq('colaborador_id', colaboradorId)
    .order('created_at', { ascending: false })
  return data ?? []
}
