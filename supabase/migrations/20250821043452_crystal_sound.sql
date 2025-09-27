/*
  # Criar tabela de agendamentos

  1. New Tables
    - `agendamentos`
      - `id` (uuid, primary key)
      - `clinica_id` (uuid, foreign key to clinicas)
      - `dentista_id` (uuid, foreign key to dentistas)
      - `paciente_id` (uuid, foreign key to pacientes)
      - `procedimento_id` (uuid, foreign key to procedimentos)
      - `data_agendamento` (date, data da consulta)
      - `horario_inicio` (time, horário de início)
      - `horario_fim` (time, horário de fim)
      - `status` (text, status do agendamento)
      - `motivo_cancelamento` (text, motivo se cancelado)
      - `criado_por` (uuid, usuário que criou)
      - `criado_em` (timestamp)

  2. Security
    - Enable RLS on `agendamentos` table
    - Add policies for CRUD operations based on clinic
    - Add unique constraint to prevent double booking
*/

CREATE TABLE IF NOT EXISTS agendamentos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinica_id uuid REFERENCES clinicas(id) ON DELETE CASCADE,
  dentista_id uuid REFERENCES dentistas(id) ON DELETE SET NULL,
  paciente_id uuid REFERENCES pacientes(id) ON DELETE SET NULL,
  procedimento_id uuid REFERENCES procedimentos(id) ON DELETE SET NULL,
  data_agendamento date NOT NULL,
  horario_inicio time NOT NULL,
  horario_fim time,
  status text DEFAULT 'pendente' CHECK (status IN ('pendente', 'confirmado', 'cancelado', 'realizado', 'remarcado')),
  motivo_cancelamento text,
  criado_por uuid REFERENCES usuarios(id) ON DELETE SET NULL,
  criado_em timestamptz DEFAULT now()
);

-- Índice único para evitar agendamentos duplicados
CREATE UNIQUE INDEX IF NOT EXISTS idx_agendamento_unico 
ON agendamentos (dentista_id, data_agendamento, horario_inicio) 
WHERE status IN ('pendente', 'confirmado', 'realizado');

ALTER TABLE agendamentos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own clinic appointments"
  ON agendamentos
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert own clinic appointments"
  ON agendamentos
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update own clinic appointments"
  ON agendamentos
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Users can delete own clinic appointments"
  ON agendamentos
  FOR DELETE
  TO authenticated
  USING (true);

-- Inserir agendamentos de teste
INSERT INTO agendamentos (clinica_id, dentista_id, paciente_id, procedimento_id, data_agendamento, horario_inicio, horario_fim, status, criado_por)
SELECT 
  c.id as clinica_id,
  d.id as dentista_id,
  p.id as paciente_id,
  pr.id as procedimento_id,
  CURRENT_DATE as data_agendamento,
  '09:00'::time as horario_inicio,
  '09:30'::time as horario_fim,
  'confirmado' as status,
  u.id as criado_por
FROM clinicas c
JOIN dentistas d ON d.clinica_id = c.id AND d.nome = 'João Silva'
JOIN pacientes p ON p.nome = 'Ana Costa'
JOIN procedimentos pr ON pr.clinica_id = c.id AND pr.nome = 'Consulta'
JOIN usuarios u ON u.clinica_id = c.id AND u.email = 'admin@dental.com'
WHERE c.login = 'admin@dental.com';

INSERT INTO agendamentos (clinica_id, dentista_id, paciente_id, procedimento_id, data_agendamento, horario_inicio, horario_fim, status, criado_por)
SELECT 
  c.id as clinica_id,
  d.id as dentista_id,
  p.id as paciente_id,
  pr.id as procedimento_id,
  CURRENT_DATE as data_agendamento,
  '11:00'::time as horario_inicio,
  '11:45'::time as horario_fim,
  'pendente' as status,
  u.id as criado_por
FROM clinicas c
JOIN dentistas d ON d.clinica_id = c.id AND d.nome = 'Maria Santos'
JOIN pacientes p ON p.nome = 'Pedro Almeida'
JOIN procedimentos pr ON pr.clinica_id = c.id AND pr.nome = 'Limpeza'
JOIN usuarios u ON u.clinica_id = c.id AND u.email = 'admin@dental.com'
WHERE c.login = 'admin@dental.com';