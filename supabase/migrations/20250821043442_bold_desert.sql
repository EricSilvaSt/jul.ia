/*
  # Criar tabela de pacientes

  1. New Tables
    - `pacientes`
      - `id` (uuid, primary key)
      - `nome` (text, nome do paciente)
      - `cpf` (text, CPF único)
      - `telefone` (text, telefone)
      - `email` (text, email)
      - `data_nascimento` (date, data de nascimento)
      - `criado_em` (timestamp)

  2. Security
    - Enable RLS on `pacientes` table
    - Add policies for CRUD operations
*/

CREATE TABLE IF NOT EXISTS pacientes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  cpf text UNIQUE,
  telefone text,
  email text,
  data_nascimento date,
  criado_em timestamptz DEFAULT now()
);

ALTER TABLE pacientes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read patients"
  ON pacientes
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert patients"
  ON pacientes
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update patients"
  ON pacientes
  FOR UPDATE
  TO authenticated
  USING (true);

-- Inserir pacientes de teste
INSERT INTO pacientes (nome, cpf, telefone, email, data_nascimento) VALUES
('Ana Costa', '123.456.789-01', '(11) 99999-1234', 'ana@exemplo.com', '1985-03-15'),
('Pedro Almeida', '987.654.321-02', '(11) 99999-5678', 'pedro@exemplo.com', '1990-07-22'),
('Lucia Ferreira', '456.789.123-03', '(11) 99999-9012', 'lucia@exemplo.com', '1978-11-08');