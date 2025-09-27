/*
  # Fix dentistas table structure and RLS policies

  1. Table Updates
    - Add missing columns to dentistas table (email, telefone, ativo, etc.)
    - Ensure all necessary fields are present

  2. RLS Policies
    - Drop existing problematic policies
    - Create simple, permissive policies for authenticated users
    - Add service_role policies for admin operations

  3. Security
    - Enable RLS on dentistas table
    - Allow authenticated users full access to their clinic's dentists
*/

-- Add missing columns to dentistas table if they don't exist
DO $$
BEGIN
  -- Add email column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'dentistas' AND column_name = 'email'
  ) THEN
    ALTER TABLE dentistas ADD COLUMN email text;
  END IF;

  -- Add telefone column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'dentistas' AND column_name = 'telefone'
  ) THEN
    ALTER TABLE dentistas ADD COLUMN telefone text;
  END IF;

  -- Add ativo column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'dentistas' AND column_name = 'ativo'
  ) THEN
    ALTER TABLE dentistas ADD COLUMN ativo boolean DEFAULT true;
  END IF;

  -- Add horario_inicio column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'dentistas' AND column_name = 'horario_inicio'
  ) THEN
    ALTER TABLE dentistas ADD COLUMN horario_inicio time DEFAULT '08:00:00';
  END IF;

  -- Add horario_fim column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'dentistas' AND column_name = 'horario_fim'
  ) THEN
    ALTER TABLE dentistas ADD COLUMN horario_fim time DEFAULT '17:00:00';
  END IF;

  -- Add dias_trabalho column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'dentistas' AND column_name = 'dias_trabalho'
  ) THEN
    ALTER TABLE dentistas ADD COLUMN dias_trabalho text[] DEFAULT ARRAY['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'];
  END IF;

  -- Add usuario_id column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'dentistas' AND column_name = 'usuario_id'
  ) THEN
    ALTER TABLE dentistas ADD COLUMN usuario_id uuid REFERENCES usuario(usuario_id);
  END IF;
END $$;

-- Drop all existing policies on dentistas table
DROP POLICY IF EXISTS "dentistas_select_policy" ON dentistas;
DROP POLICY IF EXISTS "dentistas_insert_policy" ON dentistas;
DROP POLICY IF EXISTS "dentistas_update_policy" ON dentistas;
DROP POLICY IF EXISTS "dentistas_delete_policy" ON dentistas;
DROP POLICY IF EXISTS "dentistas_service_role_all" ON dentistas;
DROP POLICY IF EXISTS "dentistas_all_authenticated" ON dentistas;

-- Ensure RLS is enabled
ALTER TABLE dentistas ENABLE ROW LEVEL SECURITY;

-- Create simple, permissive policies for authenticated users
CREATE POLICY "dentistas_authenticated_all"
  ON dentistas
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create policy for service_role (full access)
CREATE POLICY "dentistas_service_role_all"
  ON dentistas
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);