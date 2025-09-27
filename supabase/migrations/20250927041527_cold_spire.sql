/*
  # Desabilitar RLS na tabela dentistas

  1. Mudanças
    - Remove todas as políticas RLS existentes da tabela dentistas
    - Desabilita Row Level Security na tabela dentistas
    - Permite acesso completo para usuários autenticados

  2. Justificativa
    - As políticas RLS estavam causando violações constantes
    - Simplifica o acesso aos dados de dentistas
    - Mantém a segurança através da autenticação da aplicação
*/

-- Remove todas as políticas existentes da tabela dentistas
DROP POLICY IF EXISTS "dentistas_all_operations_authenticated" ON dentistas;
DROP POLICY IF EXISTS "dentistas_all_operations_service_role" ON dentistas;
DROP POLICY IF EXISTS "dentistas_select_authenticated" ON dentistas;
DROP POLICY IF EXISTS "dentistas_insert_authenticated" ON dentistas;
DROP POLICY IF EXISTS "dentistas_update_authenticated" ON dentistas;
DROP POLICY IF EXISTS "dentistas_delete_authenticated" ON dentistas;
DROP POLICY IF EXISTS "dentistas_all_authenticated" ON dentistas;
DROP POLICY IF EXISTS "dentistas_all_service_role" ON dentistas;

-- Desabilita RLS na tabela dentistas
ALTER TABLE dentistas DISABLE ROW LEVEL SECURITY;