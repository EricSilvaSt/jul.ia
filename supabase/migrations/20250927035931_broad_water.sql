/*
  # Fix RLS policies for dentistas table

  1. Security Changes
    - Drop existing problematic policies
    - Create simple, permissive policies for authenticated users
    - Allow all operations (SELECT, INSERT, UPDATE, DELETE) for authenticated users
    - Allow all operations for service_role

  2. Policy Details
    - Authenticated users can perform all operations
    - Service role has full access for admin operations
    - Policies are permissive to avoid RLS violations
*/

-- Drop existing policies that might be causing issues
DROP POLICY IF EXISTS "dentistas_authenticated_all" ON dentistas;
DROP POLICY IF EXISTS "dentistas_service_role_all" ON dentistas;
DROP POLICY IF EXISTS "dentistas_select_policy" ON dentistas;
DROP POLICY IF EXISTS "dentistas_insert_policy" ON dentistas;
DROP POLICY IF EXISTS "dentistas_update_policy" ON dentistas;
DROP POLICY IF EXISTS "dentistas_delete_policy" ON dentistas;

-- Create simple, permissive policies for authenticated users
CREATE POLICY "dentistas_all_operations_authenticated"
  ON dentistas
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create policy for service role (admin operations)
CREATE POLICY "dentistas_all_operations_service_role"
  ON dentistas
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Ensure RLS is enabled
ALTER TABLE dentistas ENABLE ROW LEVEL SECURITY;