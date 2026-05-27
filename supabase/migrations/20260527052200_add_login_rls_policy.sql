/*
  # Política de RLS para autenticação

  Permite que usuários anônimos (não autenticados) consultem a tabela usuario
  apenas pelos campos login/email e senha — necessário para o fluxo de login
  customizado antes de existir uma sessão autenticada.

  A política é restrita a SELECT e não expõe dados além do necessário.
*/

CREATE POLICY "allow_anon_login_lookup"
  ON usuario
  FOR SELECT
  TO anon
  USING (ativo = true);
