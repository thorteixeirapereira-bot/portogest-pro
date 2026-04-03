import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import type { DbColaborador } from '../lib/supabase'
import { getGestorId } from './gestorStore'

const POINTS_MAP: Record<string, number> = {
  disc: 50,
  bigfive: 50,
  vac: 30,
  ikigai: 40,
  ie: 50,
  pesquisa: 20,
  nps: 15,
  clima: 15,
}

interface ColaboradoresState {
  colaboradores: DbColaborador[]
  loading: boolean
  searchQuery: string
  fetchColaboradores: () => Promise<void>
  addColaborador: (data: Pick<DbColaborador, 'nome' | 'cargo' | 'email' | 'foto_url'>) => Promise<DbColaborador | null>
  updateColaborador: (id: string, data: Partial<DbColaborador>) => Promise<void>
  deleteColaborador: (id: string) => Promise<void>
  setSearchQuery: (q: string) => void
  getFiltered: () => DbColaborador[]
  addPontos: (colaboradorId: string, tipo: string, descricao?: string) => Promise<void>
  subscribeRealtime: () => () => void
}

export const useColaboradoresStore = create<ColaboradoresState>((set, get) => ({
  colaboradores: [],
  loading: false,
  searchQuery: '',

  fetchColaboradores: async () => {
    set({ loading: true })
    const gestorId = getGestorId()
    const query = gestorId
      ? supabase.from('colaboradores').select('*').eq('gestor_id', gestorId).eq('ativo', true).order('nome')
      : supabase.from('colaboradores').select('*').eq('ativo', true).order('nome')
    const { data, error } = await query
    if (!error && data) set({ colaboradores: data })
    set({ loading: false })
  },

  addColaborador: async (fields) => {
    const gestorId = getGestorId()
    const { data, error } = await supabase
      .from('colaboradores')
      .insert({ ...fields, gestor_id: gestorId })
      .select()
      .single()
    if (error || !data) { console.error(error); return null }
    set(s => ({ colaboradores: [...s.colaboradores, data].sort((a, b) => a.nome.localeCompare(b.nome)) }))
    return data
  },

  updateColaborador: async (id, fields) => {
    const { data } = await supabase.from('colaboradores').update(fields).eq('id', id).select().single()
    if (data) set(s => ({ colaboradores: s.colaboradores.map(c => c.id === id ? data : c) }))
  },

  deleteColaborador: async (id) => {
    await supabase.from('colaboradores').update({ ativo: false }).eq('id', id)
    set(s => ({ colaboradores: s.colaboradores.filter(c => c.id !== id) }))
  },

  setSearchQuery: (searchQuery) => set({ searchQuery }),

  getFiltered: () => {
    const { colaboradores, searchQuery } = get()
    if (!searchQuery.trim()) return colaboradores
    const q = searchQuery.toLowerCase()
    return colaboradores.filter(c =>
      c.nome.toLowerCase().includes(q) ||
      c.cargo.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q)
    )
  },

  addPontos: async (colaboradorId, tipo, descricao) => {
    const pontos = POINTS_MAP[tipo] ?? 10
    await supabase.from('pontuacoes').insert({
      colaborador_id: colaboradorId,
      tipo,
      descricao: descricao ?? tipo,
      pontos,
    })
    // Refresh the collaborator to get updated points
    const { data } = await supabase.from('colaboradores').select('*').eq('id', colaboradorId).single()
    if (data) set(s => ({ colaboradores: s.colaboradores.map(c => c.id === colaboradorId ? data : c) }))
  },

  subscribeRealtime: () => {
    const channel = supabase
      .channel('colaboradores-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'colaboradores' }, () => {
        get().fetchColaboradores()
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  },
}))

// Load a single collaborator by token (for public page)
export async function getColaboradorByToken(token: string): Promise<DbColaborador | null> {
  const { data } = await supabase
    .from('colaboradores')
    .select('*')
    .eq('token_acesso', token)
    .eq('ativo', true)
    .single()
  return data ?? null
}

// Get all pontuacoes for a collaborator
export async function getPontuacoes(colaboradorId: string) {
  const { data } = await supabase
    .from('pontuacoes')
    .select('*')
    .eq('colaborador_id', colaboradorId)
    .order('created_at', { ascending: false })
  return data ?? []
}
