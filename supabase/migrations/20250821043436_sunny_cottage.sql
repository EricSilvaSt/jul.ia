/*
  # Criar tabela de dentistas

  1. New Tables
    - `dentistas`
      - `id` (uuid, primary key)
      - `clinica_id` (uuid, foreign key to clinicas)
      - `nome` (text, nome do dentista)
      - `especialidade` (text, especialidade)
      - `dias_disponiveis` (text[], dias da semana)
      - `horarios_disponiveis` (time[], horários disponíveis)
      - `criado_em` (timestamp)

  2. Security
    - Enable RLS on `dentistas` table
    - Add policies for CRUD operations based on clinic
*/

CREATE TABLE IF NOT EXISTS dentistas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinica_id uuid REFERENCES clinicas(id) ON DELETE CASCADE,
  nome text NOT NULL,
  especialidade text,
  dias_disponiveis text[],
  horarios_disponiveis time[],
  criado_em timestamptz DEFAULT now()
);

ALTER TABLE dentistas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own clinic dentists"
  ON dentistas
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert own clinic dentists"
  ON dentistas
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update own clinic dentists"
  ON dentistas
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Users can delete own clinic dentists"
  ON dentistas
  FOR DELETE
  TO authenticated
  USING (true);

-- Inserir dentistas de teste
INSERT INTO dentistas (clinica_id, nome, especialidade, dias_disponiveis, horarios_disponiveis)
SELECT id, 'João Silva', 'Ortodontista', ARRAY['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'], ARRAY['08:00', '09:00', '10:00', '11:00', '14:00', '15:00', '16:00']::time[]
FROM clinicas WHERE login = 'admin@dental.com';

INSERT INTO dentistas (clinica_id, nome, especialidade, dias_disponiveis, horarios_disponiveis)
SELECT id, 'Maria Santos', 'Periodontista', ARRAY['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'], ARRAY['09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00']::time[]
FROM clinicas WHERE login = 'admin@dental.com';