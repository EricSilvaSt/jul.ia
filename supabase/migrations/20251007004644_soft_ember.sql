/*
  # Fix Dentist RLS Policy

  1. Security Changes
    - Drop existing problematic policies on dentistas table
    - Create new policy allowing clinic users to insert dentists
    - Create policies for select, update, and delete operations
    - Ensure proper access control based on clinic ownership

  2. Policy Details
    - INSERT: Allow if user owns the clinic (via clinica table)
    - SELECT: Allow if user owns the clinic or is a dentist in that clinic
    - UPDATE: Allow if user owns the clinic
    - DELETE: Allow if user owns the clinic
*/

-- Drop existing policies that might be causing conflicts
DROP POLICY IF EXISTS "dentistas_admin_full_access" ON public.dentistas;
DROP POLICY IF EXISTS "dentistas_own_data" ON public.dentistas;
DROP POLICY IF EXISTS "dentistas_service_role" ON public.dentistas;

-- Create new policies for dentistas table
CREATE POLICY "Allow clinic users to insert dentists"
ON public.dentistas
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM usuario
    WHERE usuario.clinica_id = dentistas.clinica_id
      AND usuario.usuario_id = auth.uid()
      AND usuario.tipo_usuario IN ('admin', 'clinic')
      AND usuario.ativo = true
  )
);

CREATE POLICY "Allow clinic users to select dentists"
ON public.dentistas
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM usuario
    WHERE usuario.clinica_id = dentistas.clinica_id
      AND usuario.usuario_id = auth.uid()
      AND usuario.ativo = true
  )
);

CREATE POLICY "Allow clinic users to update dentists"
ON public.dentistas
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM usuario
    WHERE usuario.clinica_id = dentistas.clinica_id
      AND usuario.usuario_id = auth.uid()
      AND usuario.tipo_usuario IN ('admin', 'clinic')
      AND usuario.ativo = true
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM usuario
    WHERE usuario.clinica_id = dentistas.clinica_id
      AND usuario.usuario_id = auth.uid()
      AND usuario.tipo_usuario IN ('admin', 'clinic')
      AND usuario.ativo = true
  )
);

CREATE POLICY "Allow clinic users to delete dentists"
ON public.dentistas
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM usuario
    WHERE usuario.clinica_id = dentistas.clinica_id
      AND usuario.usuario_id = auth.uid()
      AND usuario.tipo_usuario IN ('admin', 'clinic')
      AND usuario.ativo = true
  )
);

-- Allow service role full access for administrative operations
CREATE POLICY "Allow service role full access"
ON public.dentistas
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);