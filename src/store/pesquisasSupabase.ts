import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import type { DbPesquisa, DbRespostaPesquisa } from '../lib/supabase'
import { getGestorId } from './gestorStore'

interface PesquisasState {
  pesquisas: DbPesquisa[]
  loading: boolean
  fetchPesquisas: () => Promise<void>
  addPesquisa: (p: Omit<DbPesquisa, 'id' | 'gestor_id' | 'created_at'>) => Promise<DbPesquisa | null>
  updatePesquisa: (id: string, data: Partial<DbPesquisa>) => Promise<void>
  deletePesquisa: (id: string) => Promise<void>
  getRespostas: (pesquisaId: string) => Promise<DbRespostaPesquisa[]>
  addResposta: (pesquisaId: string, colaboradorId: string | null, nomeRespondente: string, respostas: Record<string, string | number>) => Promise<void>
  subscribeRespostas: (pesquisaId: string, onNew: (r: DbRespostaPesquisa) => void) => () => void
}

export const usePesquisasStore = create<PesquisasState>((set, get) => ({
  pesquisas: [],
  loading: false,

  fetchPesquisas: async () => {
    set({ loading: true })
    const gestorId = getGestorId()
    const query = gestorId
      ? supabase.from('pesquisas').select('*').eq('gestor_id', gestorId).order('created_at', { ascending: false })
      : supabase.from('pesquisas').select('*').order('created_at', { ascending: false })
    const { data } = await query
    set({ pesquisas: data ?? [], loading: false })
  },

  addPesquisa: async (fields) => {
    const gestorId = getGestorId()
    const { data, error } = await supabase
      .from('pesquisas')
      .insert({ ...fields, gestor_id: gestorId })
      .select()
      .single()
    if (error || !data) { console.error(error); return null }
    set(s => ({ pesquisas: [data, ...s.pesquisas] }))
    return data
  },

  updatePesquisa: async (id, fields) => {
    const { data } = await supabase.from('pesquisas').update(fields).eq('id', id).select().single()
    if (data) set(s => ({ pesquisas: s.pesquisas.map(p => p.id === id ? data : p) }))
  },

  deletePesquisa: async (id) => {
    await supabase.from('pesquisas').delete().eq('id', id)
    set(s => ({ pesquisas: s.pesquisas.filter(p => p.id !== id) }))
  },

  getRespostas: async (pesquisaId) => {
    const { data } = await supabase
      .from('respostas_pesquisas')
      .select('*')
      .eq('pesquisa_id', pesquisaId)
      .order('created_at', { ascending: false })
    return data ?? []
  },

  addResposta: async (pesquisaId, colaboradorId, nomeRespondente, respostas) => {
    await supabase.from('respostas_pesquisas').insert({
      pesquisa_id: pesquisaId,
      colaborador_id: colaboradorId,
      nome_respondente: nomeRespondente,
      respostas,
    })
  },

  subscribeRespostas: (pesquisaId, onNew) => {
    const channel = supabase
      .channel(`respostas-${pesquisaId}`)
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'respostas_pesquisas', filter: `pesquisa_id=eq.${pesquisaId}` },
        (payload) => onNew(payload.new as DbRespostaPesquisa)
      )
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  },
}))

// Standalone — for public pages without store context
export async function getPesquisaById(id: string): Promise<DbPesquisa | null> {
  const { data } = await supabase.from('pesquisas').select('*').eq('id', id).eq('ativa', true).single()
  return data ?? null
}

export async function submitResposta(
  pesquisaId: string,
  colaboradorId: string | null,
  nomeRespondente: string,
  respostas: Record<string, string | number>
): Promise<void> {
  await supabase.from('respostas_pesquisas').insert({
    pesquisa_id: pesquisaId,
    colaborador_id: colaboradorId,
    nome_respondente: nomeRespondente,
    respostas,
  })
}

// Feedbacks
export async function getFeedbacks(colaboradorId: string) {
  const { data } = await supabase
    .from('feedbacks')
    .select('*')
    .eq('colaborador_id', colaboradorId)
    .order('created_at', { ascending: false })
  return data ?? []
}

export async function addFeedback(colaboradorId: string, texto: string, tipo: string = 'geral') {
  const gestorId = getGestorId()
  const { data } = await supabase
    .from('feedbacks')
    .insert({ colaborador_id: colaboradorId, gestor_id: gestorId, texto, tipo })
    .select()
    .single()
  return data
}
