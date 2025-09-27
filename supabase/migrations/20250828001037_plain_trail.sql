/*
  # Tabela para agendamentos da Júl.IA

  1. Nova Tabela
    - `julia_agendamentos`
      - `id` (uuid, primary key)
      - `nome_paciente` (text)
      - `telefone_paciente` (text)
      - `email_paciente` (text, opcional)
      - `data_solicitada` (date)
      - `horario_solicitado` (time)
      - `procedimento` (text)
      - `status` (text) - pending, approved, rejected, scheduled
      - `origem` (text) - whatsapp, telegram, web
      - `conversa_id` (text, opcional)
      - `observacoes` (text, opcional)
      - `criado_em` (timestamp)
      - `atualizado_em` (timestamp)

  2. Segurança
    - Enable RLS na tabela
    - Políticas para usuários autenticados

  3. Índices
    - Por status para filtros
    - Por data de criação
    - Por origem
*/

-- Criar tabela para agendamentos da Júl.IA
CREATE TABLE IF NOT EXISTS julia_agendamentos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome_paciente text NOT NULL,
  telefone_paciente text NOT NULL,
  email_paciente text,
  data_solicitada date NOT NULL,
  horario_solicitado time NOT NULL,
  procedimento text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'scheduled')),
  origem text NOT NULL DEFAULT 'whatsapp' CHECK (origem IN ('whatsapp', 'telegram', 'web')),
  conversa_id text,
  observacoes text,
  criado_em timestamptz DEFAULT now(),
  atualizado_em timestamptz DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE julia_agendamentos ENABLE ROW LEVEL SECURITY;

-- Política para usuários autenticados lerem todos os agendamentos da Júl.IA
CREATE POLICY "Usuários autenticados podem ver agendamentos da Júl.IA"
  ON julia_agendamentos
  FOR SELECT
  TO authenticated
  USING (true);

-- Política para usuários autenticados atualizarem status
CREATE POLICY "Usuários autenticados podem atualizar status"
  ON julia_agendamentos
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Política para inserção via webhook (service role)
CREATE POLICY "Service role pode inserir agendamentos"
  ON julia_agendamentos
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_julia_agendamentos_status ON julia_agendamentos(status);
CREATE INDEX IF NOT EXISTS idx_julia_agendamentos_criado_em ON julia_agendamentos(criado_em DESC);
CREATE INDEX IF NOT EXISTS idx_julia_agendamentos_origem ON julia_agendamentos(origem);
CREATE INDEX IF NOT EXISTS idx_julia_agendamentos_data_solicitada ON julia_agendamentos(data_solicitada);

-- Trigger para atualizar timestamp
CREATE OR REPLACE FUNCTION update_julia_agendamentos_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.atualizado_em = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_julia_agendamentos_updated_at
  BEFORE UPDATE ON julia_agendamentos
  FOR EACH ROW
  EXECUTE FUNCTION update_julia_agendamentos_updated_at();

-- Inserir alguns dados de exemplo
INSERT INTO julia_agendamentos (
  nome_paciente,
  telefone_paciente,
  email_paciente,
  data_solicitada,
  horario_solicitado,
  procedimento,
  status,
  origem,
  conversa_id,
  observacoes,
  criado_em
) VALUES 
(
  'Maria Silva',
  '(11) 99999-1234',
  'maria@exemplo.com',
  CURRENT_DATE,
  '14:00',
  'Limpeza',
  'pending',
  'whatsapp',
  'wa_123456',
  'Paciente solicitou via WhatsApp. Primeira consulta.',
  now() - interval '2 hours'
),
(
  'João Santos',
  '(11) 99999-5678',
  null,
  CURRENT_DATE + interval '1 day',
  '10:30',
  'Consulta',
  'approved',
  'whatsapp',
  'wa_789012',
  'Paciente retornando. Já tem histórico na clínica.',
  now() - interval '4 hours'
),
(
  'Ana Costa',
  '(11) 99999-9012',
  'ana@exemplo.com',
  CURRENT_DATE + interval '2 days',
  '16:00',
  'Canal',
  'rejected',
  'telegram',
  'tg_345678',
  'Horário não disponível. Sugerido reagendamento.',
  now() - interval '6 hours'
),
(
  'Pedro Oliveira',
  '(11) 99999-3456',
  null,
  CURRENT_DATE + interval '3 days',
  '09:00',
  'Ortodontia',
  'scheduled',
  'whatsapp',
  'wa_901234',
  'Agendamento confirmado e transferido para a agenda principal.',
  now() - interval '8 hours'
);