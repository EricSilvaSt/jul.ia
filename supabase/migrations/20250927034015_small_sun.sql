/*
  # Sistema de horários por dia da semana para dentistas

  1. Alterações na tabela dentistas
    - Remove campos horario_inicio, horario_fim, dias_trabalho
    - Adiciona campo disponibilidade (jsonb) para armazenar horários por dia
    
  2. Estrutura do campo disponibilidade
    - JSON com dias da semana como chaves
    - Cada dia tem horario_inicio e horario_fim
    - Exemplo: {"segunda": {"inicio": "08:00", "fim": "17:00"}, "terca": {"inicio": "09:00", "fim": "16:00"}}
    
  3. Políticas RLS
    - Mantém políticas permissivas para usuários autenticados
    - Acesso total para service_role
*/

-- Remover colunas antigas de horário
ALTER TABLE dentistas DROP COLUMN IF EXISTS horario_inicio;
ALTER TABLE dentistas DROP COLUMN IF EXISTS horario_fim;
ALTER TABLE dentistas DROP COLUMN IF EXISTS dias_trabalho;

-- Adicionar campo disponibilidade como JSONB
ALTER TABLE dentistas ADD COLUMN IF NOT EXISTS disponibilidade jsonb DEFAULT '{}';

-- Garantir que todos os campos necessários existem
ALTER TABLE dentistas ADD COLUMN IF NOT EXISTS email text;
ALTER TABLE dentistas ADD COLUMN IF NOT EXISTS telefone text;
ALTER TABLE dentistas ADD COLUMN IF NOT EXISTS ativo boolean DEFAULT true;

-- Atualizar comentários
COMMENT ON COLUMN dentistas.disponibilidade IS 'Horários de trabalho por dia da semana em formato JSON';

-- Garantir RLS está habilitado
ALTER TABLE dentistas ENABLE ROW LEVEL SECURITY;

-- Remover políticas existentes
DROP POLICY IF EXISTS "dentistas_authenticated_all" ON dentistas;
DROP POLICY IF EXISTS "dentistas_service_role_all" ON dentistas;

-- Criar políticas RLS permissivas
CREATE POLICY "dentistas_authenticated_all"
  ON dentistas
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "dentistas_service_role_all"
  ON dentistas
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);