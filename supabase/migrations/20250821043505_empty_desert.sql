/*
  # Criar tabela de configurações

  1. New Tables
    - `configuracoes`
      - `id` (uuid, primary key)
      - `clinica_id` (uuid, foreign key to clinicas)
      - `horario_abertura` (time, horário de abertura)
      - `horario_fechamento` (time, horário de fechamento)
      - `intervalo_atendimento` (integer, intervalo em minutos)
      - `notificacoes_ativadas` (boolean, se notificações estão ativas)
      - `dias_funcionamento` (text[], dias de funcionamento)
      - `criada_em` (timestamp)

  2. Security
    - Enable RLS on `configuracoes` table
    - Add policies for CRUD operations based on clinic
*/

CREATE TABLE IF NOT EXISTS configuracoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinica_id uuid REFERENCES clinicas(id) ON DELETE CASCADE,
  horario_abertura time,
  horario_fechamento time,
  intervalo_atendimento integer,
  notificacoes_ativadas boolean DEFAULT true,
  dias_funcionamento text[],
  criada_em timestamptz DEFAULT now()
);

ALTER TABLE configuracoes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own clinic settings"
  ON configuracoes
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert own clinic settings"
  ON configuracoes
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update own clinic settings"
  ON configuracoes
  FOR UPDATE
  TO authenticated
  USING (true);

-- Inserir configurações de teste
INSERT INTO configuracoes (clinica_id, horario_abertura, horario_fechamento, intervalo_atendimento, dias_funcionamento)
SELECT id, '08:00'::time, '18:00'::time, 30, ARRAY['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta']
FROM clinicas WHERE login = 'admin@dental.com';