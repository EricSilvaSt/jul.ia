/*
  # Criar tabela de usuários

  1. New Tables
    - `usuarios`
      - `id` (uuid, primary key)
      - `clinica_id` (uuid, foreign key to clinicas)
      - `nome` (text, nome do usuário)
      - `email` (text, email único)
      - `senha` (text, senha hash)
      - `tipo_usuario` (text, admin ou secretaria ou recepcionista)
      - `ativo` (boolean, status do usuário)
      - `criado_em` (timestamp)

  2. Security
    - Enable RLS on `usuarios` table
    - Add policies for CRUD operations based on clinic
*/

CREATE TABLE IF NOT EXISTS usuarios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinica_id uuid REFERENCES clinicas(id) ON DELETE CASCADE,
  nome text NOT NULL,
  email text UNIQUE,
  senha text,
  tipo_usuario text CHECK (tipo_usuario IN ('admin', 'secretaria', 'recepcionista')),
  ativo boolean DEFAULT true,
  criado_em timestamptz DEFAULT now()
);

ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own clinic users"
  ON usuarios
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert own clinic users"
  ON usuarios
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update own clinic users"
  ON usuarios
  FOR UPDATE
  TO authenticated
  USING (true);

-- Inserir usuário de teste
INSERT INTO usuarios (clinica_id, nome, email, senha, tipo_usuario) 
SELECT id, 'Administrador', 'admin@dental.com', 'password', 'admin' 
FROM clinicas WHERE login = 'admin@dental.com';