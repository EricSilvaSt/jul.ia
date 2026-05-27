/*
  # Renomear tabelas e colunas para nova nomenclatura

  ## Tabelas renomeadas
  - `clinica` → `empresas`
  - `dentistas` → `colaboradores`
  - `paciente` → `clientes_empresas`
  - `julia_agendamentos` → `lia_agendamentos`

  ## Colunas renomeadas
  - Em `empresas`: `clinica_id` → `empresa_id`, `telefone_julia` → `telefone_lia`
  - Em `colaboradores`: `dentista_id` → `colaborador_id`, `clinica_id` → `empresa_id`
  - Em `clientes_empresas`: `clinica_id` → `empresa_id`
  - Em `lia_agendamentos`: `clinica_id` → `empresa_id`
  - Em `agendamento`: `dentista_id` → `colaborador_id`
  - Em `usuario`: `clinica_id` → `empresa_id`, `dentista_id` → `colaborador_id`

  ## Funções RPC recriadas com novos nomes de tabelas/colunas
  ## Triggers recriados
  ## RLS policies recriadas
*/

-- ============================================================
-- 1. RENOMEAR TABELAS
-- ============================================================
ALTER TABLE IF EXISTS public.clinica RENAME TO empresas;
ALTER TABLE IF EXISTS public.dentistas RENAME TO colaboradores;
ALTER TABLE IF EXISTS public.paciente RENAME TO clientes_empresas;
ALTER TABLE IF EXISTS public.julia_agendamentos RENAME TO lia_agendamentos;

-- ============================================================
-- 2. RENOMEAR COLUNAS em empresas (ex-clinica)
-- ============================================================
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='empresas' AND column_name='clinica_id') THEN
    ALTER TABLE public.empresas RENAME COLUMN clinica_id TO empresa_id;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='empresas' AND column_name='telefone_julia') THEN
    ALTER TABLE public.empresas RENAME COLUMN telefone_julia TO telefone_lia;
  END IF;
END $$;

-- ============================================================
-- 3. RENOMEAR COLUNAS em colaboradores (ex-dentistas)
-- ============================================================
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='colaboradores' AND column_name='dentista_id') THEN
    ALTER TABLE public.colaboradores RENAME COLUMN dentista_id TO colaborador_id;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='colaboradores' AND column_name='clinica_id') THEN
    ALTER TABLE public.colaboradores RENAME COLUMN clinica_id TO empresa_id;
  END IF;
END $$;

-- ============================================================
-- 4. RENOMEAR COLUNAS em clientes_empresas (ex-paciente)
-- ============================================================
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='clientes_empresas' AND column_name='clinica_id') THEN
    ALTER TABLE public.clientes_empresas RENAME COLUMN clinica_id TO empresa_id;
  END IF;
END $$;

-- ============================================================
-- 5. RENOMEAR COLUNAS em lia_agendamentos (ex-julia_agendamentos)
-- ============================================================
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='lia_agendamentos' AND column_name='clinica_id') THEN
    ALTER TABLE public.lia_agendamentos RENAME COLUMN clinica_id TO empresa_id;
  END IF;
END $$;

-- ============================================================
-- 6. RENOMEAR COLUNAS em agendamento
-- ============================================================
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='agendamento' AND column_name='dentista_id') THEN
    ALTER TABLE public.agendamento RENAME COLUMN dentista_id TO colaborador_id;
  END IF;
END $$;

-- ============================================================
-- 7. RENOMEAR COLUNAS em usuario
-- ============================================================
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='usuario' AND column_name='clinica_id') THEN
    ALTER TABLE public.usuario RENAME COLUMN clinica_id TO empresa_id;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='usuario' AND column_name='dentista_id') THEN
    ALTER TABLE public.usuario RENAME COLUMN dentista_id TO colaborador_id;
  END IF;
END $$;

-- ============================================================
-- 8. ATUALIZAR TRIGGERS
-- ============================================================

DROP TRIGGER IF EXISTS trigger_update_julia_agendamentos_updated_at ON public.lia_agendamentos;
DROP TRIGGER IF EXISTS clinica_set_default_plano ON public.empresas;

CREATE OR REPLACE FUNCTION public.update_lia_agendamentos_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.atualizado_em = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_update_lia_agendamentos_updated_at
  BEFORE UPDATE ON public.lia_agendamentos
  FOR EACH ROW EXECUTE FUNCTION public.update_lia_agendamentos_updated_at();

CREATE TRIGGER empresas_set_default_plano
  BEFORE INSERT ON public.empresas
  FOR EACH ROW EXECUTE FUNCTION public.default_plano_id();

-- ============================================================
-- 9. RECRIAR FUNÇÕES RPC com novos nomes de tabelas/colunas
-- ============================================================

-- Dropar funções existentes para poder alterar assinaturas
DROP FUNCTION IF EXISTS public.marcar_agendamento(uuid, uuid, uuid, bigint, timestamptz, integer, text, text);
DROP FUNCTION IF EXISTS public.obter_horarios_disponiveis(uuid, date, integer);

CREATE OR REPLACE FUNCTION public.verificar_conflito_agendamento(
  p_dentista_id uuid,
  p_data_inicio timestamptz,
  p_data_fim timestamptz,
  p_agendamento_id bigint DEFAULT NULL
)
RETURNS boolean LANGUAGE plpgsql AS $$
DECLARE
  v_conflitos integer;
BEGIN
  SELECT COUNT(*) INTO v_conflitos
  FROM public.agendamento
  WHERE colaborador_id = p_dentista_id
    AND status IN ('pendente', 'confirmado')
    AND (
      (data_agendamento <= p_data_inicio AND fim_agendamento > p_data_inicio) OR
      (data_agendamento < p_data_fim AND fim_agendamento >= p_data_fim) OR
      (data_agendamento >= p_data_inicio AND fim_agendamento <= p_data_fim)
    )
    AND (p_agendamento_id IS NULL OR id != p_agendamento_id);

  RETURN v_conflitos > 0;
END;
$$;

CREATE OR REPLACE FUNCTION public.validar_horario_dentista(
  p_dentista_id uuid,
  p_data_agendamento timestamptz
)
RETURNS boolean LANGUAGE plpgsql AS $$
DECLARE
  v_disponibilidade jsonb;
  v_dia_semana text;
  v_horario_inicio time;
  v_horario_fim time;
  v_horario_agendamento time;
  v_dia_disponivel jsonb;
BEGIN
  v_horario_agendamento := (p_data_agendamento AT TIME ZONE 'America/Sao_Paulo')::time;
  v_dia_semana := CASE EXTRACT(dow FROM p_data_agendamento AT TIME ZONE 'America/Sao_Paulo')
    WHEN 0 THEN 'domingo' WHEN 1 THEN 'segunda' WHEN 2 THEN 'terca'
    WHEN 3 THEN 'quarta' WHEN 4 THEN 'quinta' WHEN 5 THEN 'sexta' WHEN 6 THEN 'sabado'
  END;

  SELECT disponibilidade INTO v_disponibilidade
  FROM public.colaboradores
  WHERE colaborador_id = p_dentista_id AND ativo = true;

  IF v_disponibilidade IS NULL THEN RETURN false; END IF;

  v_dia_disponivel := v_disponibilidade -> v_dia_semana;
  IF v_dia_disponivel IS NULL THEN RETURN false; END IF;

  v_horario_inicio := (v_dia_disponivel ->> 'inicio')::time;
  v_horario_fim := (v_dia_disponivel ->> 'fim')::time;

  RETURN v_horario_agendamento >= v_horario_inicio AND v_horario_agendamento <= v_horario_fim;
END;
$$;

CREATE OR REPLACE FUNCTION public.validar_agendamento_trigger()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF NOT validar_horario_dentista(NEW.colaborador_id, NEW.data_agendamento) THEN
    RAISE EXCEPTION 'Colaborador não está disponível neste horário. Verifique a agenda do profissional.';
  END IF;

  IF verificar_conflito_agendamento(
    NEW.colaborador_id,
    NEW.data_agendamento,
    NEW.fim_agendamento,
    CASE WHEN TG_OP = 'UPDATE' THEN NEW.id ELSE NULL END
  ) THEN
    RAISE EXCEPTION 'Conflito de horário detectado. Já existe um agendamento neste período.';
  END IF;

  RETURN NEW;
END;
$$;

CREATE FUNCTION public.marcar_agendamento(
  p_clinica uuid,
  p_dentista uuid,
  p_paciente uuid,
  p_especialidade bigint,
  p_inicio timestamptz,
  p_duracao integer,
  p_nome_consulta text,
  p_origem text
)
RETURNS TABLE(agendamento_id bigint, reservado boolean)
LANGUAGE plpgsql AS $$
DECLARE v_id bigint;
BEGIN
  INSERT INTO public.agendamento (
    usuario_id, paciente_id, especialidade, colaborador_id,
    nome_consulta, data_agendamento, fim_agendamento,
    status, motivo_cancelamento, criado_em, observacoes, origem
  )
  VALUES (
    null, p_paciente, p_especialidade, p_dentista,
    p_nome_consulta,
    p_inicio,
    p_inicio + (p_duracao || ' minutes')::interval,
    'confirmado', null, now(), p_origem, p_origem
  )
  ON CONFLICT ON CONSTRAINT uniq_agendamento_slot DO NOTHING
  RETURNING id INTO v_id;

  IF v_id IS NULL THEN
    RETURN QUERY SELECT null::bigint, false;
  ELSE
    UPDATE public.agendamento SET duracao_minutos = p_duracao WHERE id = v_id;
    RETURN QUERY SELECT v_id, true;
  END IF;
END;
$$;

CREATE FUNCTION public.obter_horarios_disponiveis(
  p_dentista_id uuid,
  p_data date,
  p_duracao_minutos integer
)
RETURNS TABLE(horario time) LANGUAGE plpgsql AS $$
DECLARE
  v_disponibilidade jsonb;
  v_dia_semana text;
  v_horario_inicio time;
  v_horario_fim time;
  v_horario_atual time;
  v_data_completa timestamptz;
  v_dia_disponivel jsonb;
BEGIN
  v_dia_semana := CASE EXTRACT(dow FROM p_data)
    WHEN 0 THEN 'domingo' WHEN 1 THEN 'segunda' WHEN 2 THEN 'terca'
    WHEN 3 THEN 'quarta' WHEN 4 THEN 'quinta' WHEN 5 THEN 'sexta' WHEN 6 THEN 'sabado'
  END;

  SELECT d.disponibilidade INTO v_disponibilidade
  FROM public.colaboradores d
  WHERE d.colaborador_id = p_dentista_id AND d.ativo = true;

  IF v_disponibilidade IS NULL THEN RETURN; END IF;

  v_dia_disponivel := v_disponibilidade -> v_dia_semana;
  IF v_dia_disponivel IS NULL THEN RETURN; END IF;

  v_horario_inicio := (v_dia_disponivel ->> 'inicio')::time;
  v_horario_fim := (v_dia_disponivel ->> 'fim')::time;
  v_horario_atual := v_horario_inicio;

  WHILE v_horario_atual + (p_duracao_minutos || ' minutes')::interval <= v_horario_fim LOOP
    v_data_completa := (p_data || ' ' || v_horario_atual)::timestamptz;

    IF NOT verificar_conflito_agendamento(p_dentista_id, v_data_completa,
        v_data_completa + (p_duracao_minutos || ' minutes')::interval) THEN
      horario := v_horario_atual;
      RETURN NEXT;
    END IF;

    v_horario_atual := v_horario_atual + '30 minutes'::interval;
  END LOOP;

  RETURN;
END;
$$;

-- ============================================================
-- 10. RECRIAR RLS POLICIES
-- ============================================================

-- EMPRESAS
ALTER TABLE public.empresas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "clinica_all_service_role" ON public.empresas;
DROP POLICY IF EXISTS "clinica_all_authenticated" ON public.empresas;
DROP POLICY IF EXISTS "empresas_all_service_role" ON public.empresas;
DROP POLICY IF EXISTS "empresas_all_authenticated" ON public.empresas;

CREATE POLICY "empresas_all_authenticated"
  ON public.empresas FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "empresas_all_service_role"
  ON public.empresas FOR ALL TO service_role USING (true) WITH CHECK (true);

-- COLABORADORES
ALTER TABLE public.colaboradores ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow service role full access" ON public.colaboradores;
DROP POLICY IF EXISTS "Allow clinic users to select dentists" ON public.colaboradores;
DROP POLICY IF EXISTS "Allow clinic users to update dentists" ON public.colaboradores;
DROP POLICY IF EXISTS "Allow clinic users to delete dentists" ON public.colaboradores;
DROP POLICY IF EXISTS "Allow clinic users to insert dentists" ON public.colaboradores;
DROP POLICY IF EXISTS "read_dentistas" ON public.colaboradores;
DROP POLICY IF EXISTS "colaboradores_all_service_role" ON public.colaboradores;
DROP POLICY IF EXISTS "colaboradores_select_authenticated" ON public.colaboradores;
DROP POLICY IF EXISTS "colaboradores_insert_authenticated" ON public.colaboradores;
DROP POLICY IF EXISTS "colaboradores_update_authenticated" ON public.colaboradores;
DROP POLICY IF EXISTS "colaboradores_delete_authenticated" ON public.colaboradores;

CREATE POLICY "colaboradores_all_service_role"
  ON public.colaboradores FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "colaboradores_select_authenticated"
  ON public.colaboradores FOR SELECT TO authenticated USING (true);

CREATE POLICY "colaboradores_insert_authenticated"
  ON public.colaboradores FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "colaboradores_update_authenticated"
  ON public.colaboradores FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "colaboradores_delete_authenticated"
  ON public.colaboradores FOR DELETE TO authenticated USING (true);

-- CLIENTES_EMPRESAS
ALTER TABLE public.clientes_empresas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "paciente_all_authenticated" ON public.clientes_empresas;
DROP POLICY IF EXISTS "paciente_all_service_role" ON public.clientes_empresas;
DROP POLICY IF EXISTS "clientes_empresas_all_authenticated" ON public.clientes_empresas;
DROP POLICY IF EXISTS "clientes_empresas_all_service_role" ON public.clientes_empresas;

CREATE POLICY "clientes_empresas_all_authenticated"
  ON public.clientes_empresas FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "clientes_empresas_all_service_role"
  ON public.clientes_empresas FOR ALL TO service_role USING (true) WITH CHECK (true);

-- LIA_AGENDAMENTOS
ALTER TABLE public.lia_agendamentos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "julia_agendamentos_all_authenticated" ON public.lia_agendamentos;
DROP POLICY IF EXISTS "julia_agendamentos_all_service_role" ON public.lia_agendamentos;
DROP POLICY IF EXISTS "julia_agendamentos_all_public" ON public.lia_agendamentos;
DROP POLICY IF EXISTS "lia_agendamentos_all_authenticated" ON public.lia_agendamentos;
DROP POLICY IF EXISTS "lia_agendamentos_all_service_role" ON public.lia_agendamentos;
DROP POLICY IF EXISTS "lia_agendamentos_all_public" ON public.lia_agendamentos;

CREATE POLICY "lia_agendamentos_all_authenticated"
  ON public.lia_agendamentos FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "lia_agendamentos_all_service_role"
  ON public.lia_agendamentos FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "lia_agendamentos_all_public"
  ON public.lia_agendamentos FOR ALL TO anon USING (true) WITH CHECK (true);
