-- PortoGest Pro — Schema Supabase
-- Cole este SQL no SQL Editor do Supabase e execute (Run)

-- Extensão UUID (geralmente já ativa)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─── GESTORES ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS gestores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  email TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── COLABORADORES ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS colaboradores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gestor_id UUID REFERENCES gestores(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  cargo TEXT DEFAULT '',
  email TEXT DEFAULT '',
  foto_url TEXT,
  ativo BOOLEAN DEFAULT true,
  token_acesso TEXT UNIQUE DEFAULT encode(gen_random_bytes(16), 'hex'),
  pontos_total INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── TESTES DE PERFIL ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS testes_perfil (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  colaborador_id UUID REFERENCES colaboradores(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL,
  scores JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── PESQUISAS ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS pesquisas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gestor_id UUID REFERENCES gestores(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  descricao TEXT DEFAULT '',
  tipo TEXT DEFAULT 'custom',
  perguntas JSONB NOT NULL DEFAULT '[]',
  ativa BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── RESPOSTAS PESQUISAS ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS respostas_pesquisas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pesquisa_id UUID REFERENCES pesquisas(id) ON DELETE CASCADE,
  colaborador_id UUID REFERENCES colaboradores(id) ON DELETE SET NULL,
  nome_respondente TEXT DEFAULT 'Anônimo',
  respostas JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── FEEDBACKS ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS feedbacks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  colaborador_id UUID REFERENCES colaboradores(id) ON DELETE CASCADE,
  gestor_id UUID REFERENCES gestores(id),
  texto TEXT NOT NULL,
  tipo TEXT DEFAULT 'geral',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── PONTUAÇÕES ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS pontuacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  colaborador_id UUID REFERENCES colaboradores(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL,
  descricao TEXT,
  pontos INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── DESABILITAR RLS (acesso via anon key) ────────────────────────────────────
ALTER TABLE gestores DISABLE ROW LEVEL SECURITY;
ALTER TABLE colaboradores DISABLE ROW LEVEL SECURITY;
ALTER TABLE testes_perfil DISABLE ROW LEVEL SECURITY;
ALTER TABLE pesquisas DISABLE ROW LEVEL SECURITY;
ALTER TABLE respostas_pesquisas DISABLE ROW LEVEL SECURITY;
ALTER TABLE feedbacks DISABLE ROW LEVEL SECURITY;
ALTER TABLE pontuacoes DISABLE ROW LEVEL SECURITY;

-- ─── REALTIME (para atualizações em tempo real) ───────────────────────────────
ALTER PUBLICATION supabase_realtime ADD TABLE respostas_pesquisas;
ALTER PUBLICATION supabase_realtime ADD TABLE testes_perfil;
ALTER PUBLICATION supabase_realtime ADD TABLE pontuacoes;
ALTER PUBLICATION supabase_realtime ADD TABLE colaboradores;

-- ─── TRIGGER: atualizar pontos_total automaticamente ─────────────────────────
CREATE OR REPLACE FUNCTION atualizar_pontos_total()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE colaboradores
  SET pontos_total = (
    SELECT COALESCE(SUM(pontos), 0)
    FROM pontuacoes
    WHERE colaborador_id = NEW.colaborador_id
  )
  WHERE id = NEW.colaborador_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trigger_atualizar_pontos
  AFTER INSERT OR UPDATE OR DELETE ON pontuacoes
  FOR EACH ROW EXECUTE FUNCTION atualizar_pontos_total();

-- ─── TRIGGER: atualizar updated_at em colaboradores ──────────────────────────
CREATE OR REPLACE FUNCTION atualizar_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trigger_updated_at
  BEFORE UPDATE ON colaboradores
  FOR EACH ROW EXECUTE FUNCTION atualizar_updated_at();
