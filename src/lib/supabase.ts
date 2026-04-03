import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// ─── Database Types ───────────────────────────────────────────────────────────

export type DbGestor = {
  id: string
  nome: string
  email: string | null
  created_at: string
}

export type DbColaborador = {
  id: string
  gestor_id: string
  nome: string
  cargo: string
  email: string
  foto_url: string | null
  ativo: boolean
  token_acesso: string
  pontos_total: number
  created_at: string
  updated_at: string
}

export type DbTestePerfil = {
  id: string
  colaborador_id: string
  tipo: string
  scores: Record<string, number>
  created_at: string
}

export type DbPesquisa = {
  id: string
  gestor_id: string
  titulo: string
  descricao: string
  tipo: string
  perguntas: DbPergunta[]
  ativa: boolean
  created_at: string
}

export type DbPergunta = {
  id: string
  texto: string
  tipo: 'scale' | 'yesno' | 'text' | 'multiple'
  opcoes?: string[]
  obrigatoria: boolean
}

export type DbRespostaPesquisa = {
  id: string
  pesquisa_id: string
  colaborador_id: string | null
  nome_respondente: string
  respostas: Record<string, string | number>
  created_at: string
}

export type DbFeedback = {
  id: string
  colaborador_id: string
  gestor_id: string | null
  texto: string
  tipo: 'geral' | 'positivo' | 'desenvolvimento'
  created_at: string
}

export type DbPontuacao = {
  id: string
  colaborador_id: string
  tipo: string
  descricao: string | null
  pontos: number
  created_at: string
}
