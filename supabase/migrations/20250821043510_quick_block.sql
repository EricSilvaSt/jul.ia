/*
  # Criar tabela de logs de agendamentos

  1. New Tables
    - `logs_agendamentos`
      - `id` (uuid, primary key)
      - `agendamento_id` (uuid, foreign key to agendamentos)
      - `usuario_id` (uuid, foreign key to usuarios)
      - `acao` (text, ação realizada)
      - `data` (timestamp, quando a ação foi realizada)

  2. Security
    - Enable RLS on `logs_agendamentos` table
    - Add policies for reading logs
*/

CREATE TABLE IF NOT EXISTS logs_agendamentos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agendamento_id uuid REFERENCES agendamentos(id) ON DELETE CASCADE,
  usuario_id uuid REFERENCES usuarios(id) ON DELETE SET NULL,
  acao text,
  data timestamptz DEFAULT now()
);

ALTER TABLE logs_agendamentos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read appointment logs"
  ON logs_agendamentos
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert appointment logs"
  ON logs_agendamentos
  FOR INSERT
  TO authenticated
  WITH CHECK (true);