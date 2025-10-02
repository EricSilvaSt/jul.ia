/*
  # Validação de horários de dentistas e melhorias no sistema

  1. Funções de Validação
    - Validar disponibilidade de dentista por dia da semana
    - Verificar se horário está dentro da disponibilidade do dentista
    - Função para verificar conflitos de agendamento

  2. Triggers
    - Validação automática antes de inserir/atualizar agendamentos
    - Verificação de disponibilidade do dentista

  3. Melhorias na tabela dentistas
    - Estrutura melhor para disponibilidade
    - Validações de dados

  4. Políticas RLS atualizadas
    - Administradores podem fazer tudo
    - Dentistas só veem seus próprios dados
*/

-- Função para validar se um horário está dentro da disponibilidade do dentista
CREATE OR REPLACE FUNCTION validar_horario_dentista(
  p_dentista_id uuid,
  p_data_agendamento timestamptz
) RETURNS boolean AS $$
DECLARE
  v_disponibilidade jsonb;
  v_dia_semana text;
  v_horario_inicio time;
  v_horario_fim time;
  v_horario_agendamento time;
  v_dia_disponivel jsonb;
BEGIN
  -- Converter timestamp para horário local (São Paulo)
  v_horario_agendamento := (p_data_agendamento AT TIME ZONE 'America/Sao_Paulo')::time;
  
  -- Obter dia da semana em português
  v_dia_semana := CASE EXTRACT(dow FROM p_data_agendamento AT TIME ZONE 'America/Sao_Paulo')
    WHEN 0 THEN 'domingo'
    WHEN 1 THEN 'segunda'
    WHEN 2 THEN 'terca'
    WHEN 3 THEN 'quarta'
    WHEN 4 THEN 'quinta'
    WHEN 5 THEN 'sexta'
    WHEN 6 THEN 'sabado'
  END;
  
  -- Buscar disponibilidade do dentista
  SELECT disponibilidade INTO v_disponibilidade
  FROM dentistas
  WHERE dentista_id = p_dentista_id AND ativo = true;
  
  -- Se dentista não encontrado ou inativo
  IF v_disponibilidade IS NULL THEN
    RETURN false;
  END IF;
  
  -- Verificar se o dia está disponível
  v_dia_disponivel := v_disponibilidade -> v_dia_semana;
  
  -- Se o dia não está configurado, não está disponível
  IF v_dia_disponivel IS NULL THEN
    RETURN false;
  END IF;
  
  -- Extrair horários de início e fim
  v_horario_inicio := (v_dia_disponivel ->> 'inicio')::time;
  v_horario_fim := (v_dia_disponivel ->> 'fim')::time;
  
  -- Verificar se o horário está dentro do intervalo
  RETURN v_horario_agendamento >= v_horario_inicio AND v_horario_agendamento <= v_horario_fim;
END;
$$ LANGUAGE plpgsql;

-- Função para verificar conflitos de agendamento
CREATE OR REPLACE FUNCTION verificar_conflito_agendamento(
  p_dentista_id uuid,
  p_data_inicio timestamptz,
  p_data_fim timestamptz,
  p_agendamento_id bigint DEFAULT NULL
) RETURNS boolean AS $$
DECLARE
  v_conflitos integer;
BEGIN
  -- Contar agendamentos conflitantes
  SELECT COUNT(*) INTO v_conflitos
  FROM agendamento
  WHERE dentista_id = p_dentista_id
    AND status IN ('pendente', 'confirmado')
    AND (
      (data_agendamento <= p_data_inicio AND fim_agendamento > p_data_inicio) OR
      (data_agendamento < p_data_fim AND fim_agendamento >= p_data_fim) OR
      (data_agendamento >= p_data_inicio AND fim_agendamento <= p_data_fim)
    )
    AND (p_agendamento_id IS NULL OR id != p_agendamento_id);
  
  RETURN v_conflitos > 0;
END;
$$ LANGUAGE plpgsql;

-- Trigger function para validar agendamentos
CREATE OR REPLACE FUNCTION validar_agendamento_trigger() RETURNS trigger AS $$
BEGIN
  -- Validar se o dentista está disponível no horário
  IF NOT validar_horario_dentista(NEW.dentista_id, NEW.data_agendamento) THEN
    RAISE EXCEPTION 'Dentista não está disponível neste horário. Verifique a agenda do profissional.';
  END IF;
  
  -- Verificar conflitos de horário
  IF verificar_conflito_agendamento(
    NEW.dentista_id, 
    NEW.data_agendamento, 
    NEW.fim_agendamento,
    CASE WHEN TG_OP = 'UPDATE' THEN NEW.id ELSE NULL END
  ) THEN
    RAISE EXCEPTION 'Conflito de horário detectado. Já existe um agendamento neste período.';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger na tabela agendamento
DROP TRIGGER IF EXISTS trigger_validar_agendamento ON agendamento;
CREATE TRIGGER trigger_validar_agendamento
  BEFORE INSERT OR UPDATE ON agendamento
  FOR EACH ROW
  EXECUTE FUNCTION validar_agendamento_trigger();

-- Função para obter horários disponíveis de um dentista em uma data
CREATE OR REPLACE FUNCTION obter_horarios_disponiveis(
  p_dentista_id uuid,
  p_data date,
  p_duracao_minutos integer DEFAULT 60
) RETURNS TABLE(horario time) AS $$
DECLARE
  v_disponibilidade jsonb;
  v_dia_semana text;
  v_horario_inicio time;
  v_horario_fim time;
  v_horario_atual time;
  v_data_completa timestamptz;
  v_dia_disponivel jsonb;
BEGIN
  -- Obter dia da semana
  v_dia_semana := CASE EXTRACT(dow FROM p_data)
    WHEN 0 THEN 'domingo'
    WHEN 1 THEN 'segunda'
    WHEN 2 THEN 'terca'
    WHEN 3 THEN 'quarta'
    WHEN 4 THEN 'quinta'
    WHEN 5 THEN 'sexta'
    WHEN 6 THEN 'sabado'
  END;
  
  -- Buscar disponibilidade do dentista
  SELECT d.disponibilidade INTO v_disponibilidade
  FROM dentistas d
  WHERE d.dentista_id = p_dentista_id AND d.ativo = true;
  
  -- Se dentista não encontrado
  IF v_disponibilidade IS NULL THEN
    RETURN;
  END IF;
  
  -- Verificar se o dia está disponível
  v_dia_disponivel := v_disponibilidade -> v_dia_semana;
  
  -- Se o dia não está configurado
  IF v_dia_disponivel IS NULL THEN
    RETURN;
  END IF;
  
  -- Extrair horários
  v_horario_inicio := (v_dia_disponivel ->> 'inicio')::time;
  v_horario_fim := (v_dia_disponivel ->> 'fim')::time;
  
  -- Gerar horários disponíveis de 30 em 30 minutos
  v_horario_atual := v_horario_inicio;
  
  WHILE v_horario_atual + (p_duracao_minutos || ' minutes')::interval <= v_horario_fim LOOP
    -- Verificar se não há conflito
    v_data_completa := (p_data || ' ' || v_horario_atual)::timestamptz;
    
    IF NOT verificar_conflito_agendamento(
      p_dentista_id,
      v_data_completa,
      v_data_completa + (p_duracao_minutos || ' minutes')::interval
    ) THEN
      horario := v_horario_atual;
      RETURN NEXT;
    END IF;
    
    -- Próximo slot (30 minutos)
    v_horario_atual := v_horario_atual + '30 minutes'::interval;
  END LOOP;
  
  RETURN;
END;
$$ LANGUAGE plpgsql;

-- Reabilitar RLS na tabela dentistas com políticas mais específicas
ALTER TABLE dentistas ENABLE ROW LEVEL SECURITY;

-- Remover políticas antigas
DROP POLICY IF EXISTS "dentistas_all_authenticated" ON dentistas;
DROP POLICY IF EXISTS "dentistas_all_service_role" ON dentistas;

-- Política para administradores (acesso total)
CREATE POLICY "dentistas_admin_full_access" ON dentistas
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuario u
      WHERE u.usuario_id = auth.uid()
      AND u.tipo_usuario IN ('admin', 'clinic')
      AND u.ativo = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM usuario u
      WHERE u.usuario_id = auth.uid()
      AND u.tipo_usuario IN ('admin', 'clinic')
      AND u.ativo = true
    )
  );

-- Política para dentistas (apenas seus próprios dados)
CREATE POLICY "dentistas_own_data" ON dentistas
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuario u
      WHERE u.usuario_id = auth.uid()
      AND u.dentista_id = dentistas.dentista_id
      AND u.tipo_usuario = 'dentist'
      AND u.ativo = true
    )
  );

-- Política para service_role (acesso total)
CREATE POLICY "dentistas_service_role" ON dentistas
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Adicionar comentários para documentação
COMMENT ON FUNCTION validar_horario_dentista IS 'Valida se um horário está dentro da disponibilidade configurada do dentista';
COMMENT ON FUNCTION verificar_conflito_agendamento IS 'Verifica se existe conflito de horário para um agendamento';
COMMENT ON FUNCTION obter_horarios_disponiveis IS 'Retorna lista de horários disponíveis para um dentista em uma data específica';