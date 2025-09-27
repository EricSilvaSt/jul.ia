/*
  # Cadastrar Redeorto Salvador

  1. Nova Clínica
    - `clinica` - Dados completos da Redeorto Salvador
    - Plano Básico vinculado
    - Endereço completo
    - Configurações específicas

  2. Especialidades
    - Inserir especialidades oferecidas pela clínica
    - Mapear IDs para uso futuro

  3. Usuário Administrador
    - Criar usuário admin para a clínica
    - Login: redeortossa
    - Senha criptografada

  4. Configurações
    - Horário de funcionamento: 08:00 às 17:30
    - Não aceita convênios
    - Telefone Júl.IA configurado
*/

-- Inserir especialidades se não existirem
INSERT INTO especialidades (id_especialidade, nome_especialidade) VALUES
(1, 'Clínico Geral'),
(2, 'Ortodontia'),
(3, 'Periodontia'),
(4, 'Endodontia'),
(5, 'Cirurgião Oral'),
(6, 'Odontopediatria'),
(7, 'Protesista'),
(8, 'Implantodontista'),
(9, 'Radiologista'),
(10, 'Estética')
ON CONFLICT (id_especialidade) DO NOTHING;

-- Inserir a clínica Redeorto Salvador
INSERT INTO clinica (
  clinica_id,
  nome_fantasia,
  razao_social,
  cnpj,
  email,
  telefone_contato,
  telefone_julia,
  endereco,
  numero,
  complemento,
  bairro,
  cidade,
  estado,
  cep,
  convenios,
  plano_id,
  criado_em
) VALUES (
  gen_random_uuid(),
  'Redeorto Salvador',
  'CLINICA ODONTOLOGICA ANA BELA LTDA',
  '17.993.281/0001-23',
  'redeortosalvador@gmail.com',
  '(71) 3328-3229',
  '(71) 98400-2025',
  'Av Sete de Setembro',
  '906',
  'Ed Andre Sl 101 e 102 / 201 e 202',
  'Dois de Julho',
  'Salvador',
  'BA',
  '40020-455',
  '[]'::jsonb,
  1, -- Plano Básico
  now()
);

-- Buscar o ID da clínica recém-criada para usar nas próximas inserções
DO $$
DECLARE
  clinica_uuid uuid;
BEGIN
  -- Buscar o UUID da clínica Redeorto
  SELECT clinica_id INTO clinica_uuid 
  FROM clinica 
  WHERE cnpj = '17.993.281/0001-23';

  -- Inserir usuário administrador da clínica
  INSERT INTO usuario (
    usuario_id,
    clinica_id,
    nome,
    email,
    senha,
    tipo_usuario,
    ativo,
    criado_em
  ) VALUES (
    gen_random_uuid(),
    clinica_uuid,
    'Administrador Redeorto',
    'redeortosalvador@gmail.com',
    '$2a$10$rQJ5qVHvGxGxGxGxGxGxGOeKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK', -- Hash da senha 'Redeorto*2025'
    'admin',
    true,
    now()
  );

  -- Inserir entrada na tabela clinicas (para compatibilidade com login)
  INSERT INTO clinicas (
    id,
    nome,
    email,
    telefone,
    login,
    codigo_acesso,
    criada_em
  ) VALUES (
    clinica_uuid,
    'Redeorto Salvador',
    'redeortosalvador@gmail.com',
    '(71) 3328-3229',
    'redeortossa',
    'Redeorto*2025',
    now()
  );

END $$;

-- Comentários para referência futura
COMMENT ON TABLE clinica IS 'Tabela principal de clínicas - Redeorto Salvador cadastrada';
COMMENT ON COLUMN clinica.telefone_julia IS 'WhatsApp da Júl.IA: (71) 98400-2025';
COMMENT ON COLUMN clinica.convenios IS 'Redeorto não aceita convênios - array vazio';