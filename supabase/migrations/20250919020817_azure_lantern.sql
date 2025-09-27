/*
  # Remover tabela clinicas conflitante

  1. Limpeza
    - Remove tabela `clinicas` que estava causando conflito
    - Mantém apenas a tabela `clinica` principal
    
  2. Segurança
    - Remove policies da tabela antiga
    - Limpa referências desnecessárias
*/

-- Remover tabela clinicas (conflitante)
DROP TABLE IF EXISTS public.clinicas CASCADE;

-- Comentário para documentar a remoção
COMMENT ON TABLE public.clinica IS 'Tabela principal de clínicas - tabela clinicas removida para evitar conflitos';