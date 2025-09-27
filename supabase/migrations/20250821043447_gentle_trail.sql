/*
  # Criar tabela de procedimentos

  1. New Tables
    - `procedimentos`
      - `id` (uuid, primary key)
      - `clinica_id` (uuid, foreign key to clinicas)
      - `nome` (text, nome do procedimento)
      - `duracao_minutos` (integer, duração em minutos)
      - `preco` (decimal, preço do procedimento)
      - `criado_em` (timestamp)

  2. Security
    - Enable RLS on `procedimentos` table
    - Add policies for CRUD operations based on clinic
*/

CREATE TABLE IF NOT EXISTS procedimentos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinica_id uuid REFERENCES clinicas(id) ON DELETE CASCADE,
  nome text NOT NULL,
  duracao_minutos integer,
  preco decimal(10,2),
  criado_em timestamptz DEFAULT now()
);

ALTER TABLE procedimentos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own clinic procedures"
  ON procedimentos
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert own clinic procedures"
  ON procedimentos
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update own clinic procedures"
  ON procedimentos
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Users can delete own clinic procedures"
  ON procedimentos
  FOR DELETE
  TO authenticated
  USING (true);

-- Inserir procedimentos de teste
INSERT INTO procedimentos (clinica_id, nome, duracao_minutos, preco)
SELECT id, 'Consulta', 30, 80.00
FROM clinicas WHERE login = 'admin@dental.com';

INSERT INTO procedimentos (clinica_id, nome, duracao_minutos, preco)
SELECT id, 'Limpeza', 45, 120.00
FROM clinicas WHERE login = 'admin@dental.com';

INSERT INTO procedimentos (clinica_id, nome, duracao_minutos, preco)
SELECT id, 'Canal', 90, 350.00
FROM clinicas WHERE login = 'admin@dental.com';

INSERT INTO procedimentos (clinica_id, nome, duracao_minutos, preco)
SELECT id, 'Obturação', 60, 150.00
FROM clinicas WHERE login = 'admin@dental.com';