/*
  # Fix RLS policies for dentistas table

  1. Security Changes
    - Drop existing policies that may be causing conflicts
    - Create new comprehensive policies for dentistas table
    - Allow authenticated users to perform CRUD operations
    - Ensure clinic_id matching for data isolation

  2. New Policies
    - INSERT: Allow authenticated users to create dentists for their clinic
    - SELECT: Allow authenticated users to view their clinic's dentists  
    - UPDATE: Allow authenticated users to update their clinic's dentists
    - DELETE: Allow authenticated users to delete their clinic's dentists
*/

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "dentistas_all_authenticated" ON public.dentistas;
DROP POLICY IF EXISTS "dentistas_all_service_role" ON public.dentistas;

-- Ensure RLS is enabled
ALTER TABLE public.dentistas ENABLE ROW LEVEL SECURITY;

-- Create comprehensive policies for dentistas table
CREATE POLICY "dentistas_select_policy"
ON public.dentistas
FOR SELECT
TO authenticated
USING (
  clinica_id IN (
    SELECT clinica_id 
    FROM public.usuario 
    WHERE usuario_id = auth.uid()
  )
);

CREATE POLICY "dentistas_insert_policy"
ON public.dentistas
FOR INSERT
TO authenticated
WITH CHECK (
  clinica_id IN (
    SELECT clinica_id 
    FROM public.usuario 
    WHERE usuario_id = auth.uid()
  )
);

CREATE POLICY "dentistas_update_policy"
ON public.dentistas
FOR UPDATE
TO authenticated
USING (
  clinica_id IN (
    SELECT clinica_id 
    FROM public.usuario 
    WHERE usuario_id = auth.uid()
  )
)
WITH CHECK (
  clinica_id IN (
    SELECT clinica_id 
    FROM public.usuario 
    WHERE usuario_id = auth.uid()
  )
);

CREATE POLICY "dentistas_delete_policy"
ON public.dentistas
FOR DELETE
TO authenticated
USING (
  clinica_id IN (
    SELECT clinica_id 
    FROM public.usuario 
    WHERE usuario_id = auth.uid()
  )
);

-- Service role policies (for admin operations)
CREATE POLICY "dentistas_service_role_all"
ON public.dentistas
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);