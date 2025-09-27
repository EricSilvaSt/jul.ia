/*
  # Corrigir políticas RLS e configurar permissões

  1. Políticas RLS
    - Permitir operações na tabela dentistas para usuários autenticados
    - Permitir operações na tabela usuario para usuários autenticados
    - Permitir operações na tabela agendamento para usuários autenticados
    - Permitir operações na tabela paciente para usuários autenticados

  2. Segurança
    - Manter RLS habilitado mas com políticas mais permissivas para usuários autenticados
    - Permitir acesso total para service_role
*/

-- Remover políticas existentes que podem estar causando conflito
DROP POLICY IF EXISTS "Users can read own data" ON usuario;
DROP POLICY IF EXISTS "dentistas_select_auth" ON dentistas;
DROP POLICY IF EXISTS "dentistas_insert_auth" ON dentistas;
DROP POLICY IF EXISTS "dentistas_update_auth" ON dentistas;
DROP POLICY IF EXISTS "dentistas_delete_auth" ON dentistas;

-- Políticas para tabela usuario
CREATE POLICY "usuario_all_authenticated" ON usuario
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "usuario_all_service_role" ON usuario
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

-- Políticas para tabela dentistas
CREATE POLICY "dentistas_all_authenticated" ON dentistas
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "dentistas_all_service_role" ON dentistas
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

-- Políticas para tabela agendamento
DROP POLICY IF EXISTS "bot_pode_gerenciar_agendamentos" ON agendamento;

CREATE POLICY "agendamento_all_authenticated" ON agendamento
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "agendamento_all_service_role" ON agendamento
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

-- Políticas para tabela paciente
CREATE POLICY "paciente_all_authenticated" ON paciente
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "paciente_all_service_role" ON paciente
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

-- Políticas para tabela clinica
DROP POLICY IF EXISTS "clinica_select_auth" ON clinica;

CREATE POLICY "clinica_all_authenticated" ON clinica
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "clinica_all_service_role" ON clinica
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

-- Políticas para tabela especialidades
CREATE POLICY "especialidades_all_authenticated" ON especialidades
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "especialidades_all_service_role" ON especialidades
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

-- Políticas para tabela julia_agendamentos
DROP POLICY IF EXISTS "Service role pode inserir agendamentos" ON julia_agendamentos;
DROP POLICY IF EXISTS "Usuários autenticados podem atualizar status" ON julia_agendamentos;
DROP POLICY IF EXISTS "Usuários autenticados podem ver agendamentos da Júl.IA" ON julia_agendamentos;

CREATE POLICY "julia_agendamentos_all_authenticated" ON julia_agendamentos
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "julia_agendamentos_all_service_role" ON julia_agendamentos
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "julia_agendamentos_all_public" ON julia_agendamentos
  FOR ALL TO public
  USING (true)
  WITH CHECK (true);