/*
  # Criar tabela de clínicas

  1. New Tables
    - `clinicas`
      - `id` (uuid, primary key)
      - `nome` (text, nome da clínica)
      - `email` (text, email da clínica)
      - `telefone` (text, telefone da clínica)
      - `login` (text, login único para acesso)
      - `codigo_acesso` (text, código de acesso/senha)
      - `criada_em` (timestamp)

  2. Security
    - Enable RLS on `clinicas` table
    - Add policy for authenticated users to read their own clinic data
*/

CREATE TABLE IF NOT EXISTS clinicas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  email text,
  telefone text,
  login text UNIQUE,
  codigo_acesso text,
  criada_em timestamptz DEFAULT now()
);

ALTER TABLE clinicas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own clinic data"
  ON clinicas
  FOR SELECT
  TO authenticated
  USING (true);

-- Inserir clínica de teste
INSERT INTO clinicas (nome, email, telefone, login, codigo_acesso) VALUES
('Clínica Odontológica Sorriso Brilhante', 'admin@dental.com', '(11) 3456-7890', 'admin@dental.com', 'password');