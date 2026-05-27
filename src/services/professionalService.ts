import { supabase } from '../lib/supabase';

export interface ProfessionalComplete {
  colaborador_id: string;
  empresa_id: string;
  nome: string;
  especialidade: number;
  cro: string;
  email?: string;
  telefone?: string;
  ativo?: boolean;
  disponibilidade?: any;
  usuario_id?: string;
  criado_em: string;
  especialidades?: {
    id_especialidade: number;
    nome_especialidade: string;
  };
  usuario?: {
    usuario_id: string;
    nome: string;
    email?: string;
    ativo: boolean;
  };
}

export interface CreateProfessionalData {
  nome: string;
  especialidade: number;
  cro: string;
  empresa_id: string;
  email?: string;
  telefone?: string;
  ativo?: boolean;
  disponibilidade?: any;
  usuario_id?: string;
}

export const buscarProfissionais = async (clinicaId: string): Promise<ProfessionalComplete[]> => {
  if (!import.meta.env.VITE_SUPABASE_URL || clinicaId === 'demo-clinic-id') {
    return [
      {
        colaborador_id: 'prof-1',
        empresa_id: clinicaId,
        nome: 'Ana Silva',
        especialidade: 1,
        cro: 'ID-12345',
        email: 'ana.silva@exemplo.com',
        telefone: '(11) 99999-1111',
        ativo: true,
        disponibilidade: {
          segunda: { inicio: '08:00', fim: '17:00' },
          terca: { inicio: '08:00', fim: '17:00' },
          quarta: { inicio: '08:00', fim: '17:00' },
          quinta: { inicio: '08:00', fim: '17:00' },
          sexta: { inicio: '08:00', fim: '17:00' },
        },
        criado_em: '2024-01-01T00:00:00Z',
        especialidades: { id_especialidade: 1, nome_especialidade: 'Consultoria Geral' },
      },
      {
        colaborador_id: 'prof-2',
        empresa_id: clinicaId,
        nome: 'Carlos Santos',
        especialidade: 2,
        cro: 'ID-67890',
        email: 'carlos.santos@exemplo.com',
        telefone: '(11) 99999-2222',
        ativo: true,
        disponibilidade: {
          segunda: { inicio: '09:00', fim: '18:00' },
          terca: { inicio: '09:00', fim: '18:00' },
          quarta: { inicio: '09:00', fim: '18:00' },
          quinta: { inicio: '09:00', fim: '18:00' },
          sexta: { inicio: '09:00', fim: '18:00' },
        },
        criado_em: '2024-01-01T00:00:00Z',
        especialidades: { id_especialidade: 2, nome_especialidade: 'Análise Técnica' },
      },
    ];
  }

  const { data, error } = await supabase
    .from('colaboradores')
    .select(`
      colaborador_id,
      empresa_id,
      nome,
      especialidade,
      cro,
      email,
      telefone,
      ativo,
      disponibilidade,
      criado_em,
      especialidades (
        id_especialidade,
        nome_especialidade
      )
    `)
    .eq('empresa_id', clinicaId)
    .order('nome');

  if (error) {
    throw new Error(`Erro ao buscar profissionais: ${error.message}`);
  }

  return data || [];
};

export const criarProfissional = async (professionalData: CreateProfessionalData): Promise<ProfessionalComplete> => {
  if (!import.meta.env.VITE_SUPABASE_URL || professionalData.empresa_id === 'demo-clinic-id') {
    throw new Error('Operação não disponível no modo demonstração.');
  }

  const { data, error } = await supabase
    .from('colaboradores')
    .insert([professionalData])
    .select('*')
    .single();

  if (error) {
    throw new Error(`Erro ao criar profissional: ${error.message}`);
  }

  return data;
};

export const atualizarProfissional = async (
  professionalId: string,
  updates: Partial<CreateProfessionalData>
): Promise<void> => {
  if (!import.meta.env.VITE_SUPABASE_URL || professionalId.startsWith('prof-')) {
    throw new Error('Operação não disponível no modo demonstração.');
  }

  const { error } = await supabase
    .from('colaboradores')
    .update(updates)
    .eq('colaborador_id', professionalId);

  if (error) {
    throw new Error(`Erro ao atualizar profissional: ${error.message}`);
  }
};

export const deletarProfissional = async (professionalId: string): Promise<void> => {
  if (!import.meta.env.VITE_SUPABASE_URL || professionalId.startsWith('prof-')) {
    throw new Error('Operação não disponível no modo demonstração.');
  }

  const { error } = await supabase
    .from('colaboradores')
    .delete()
    .eq('colaborador_id', professionalId);

  if (error) {
    if (error.code === 'PGRST301') {
      throw new Error('Você não tem permissão para deletar este profissional.');
    } else if (error.code === '23503') {
      throw new Error('Não é possível deletar este profissional pois ele possui agendamentos vinculados.');
    } else {
      throw new Error(`Erro ao deletar profissional: ${error.message}`);
    }
  }
};

export const buscarAreasAtuacao = async (): Promise<Array<{id_especialidade: number, nome_especialidade: string}>> => {
  if (!import.meta.env.VITE_SUPABASE_URL) {
    return [
      { id_especialidade: 1, nome_especialidade: 'Consultoria Geral' },
      { id_especialidade: 2, nome_especialidade: 'Análise Técnica' },
      { id_especialidade: 3, nome_especialidade: 'Gestão de Projetos' },
      { id_especialidade: 4, nome_especialidade: 'Desenvolvimento' },
      { id_especialidade: 5, nome_especialidade: 'Suporte Técnico' },
      { id_especialidade: 6, nome_especialidade: 'Treinamento' },
      { id_especialidade: 7, nome_especialidade: 'Auditoria' },
      { id_especialidade: 8, nome_especialidade: 'Manutenção' },
    ];
  }

  const { data, error } = await supabase
    .from('especialidades')
    .select('id_especialidade, nome_especialidade')
    .order('nome_especialidade');

  if (error) {
    throw new Error(`Erro ao buscar áreas de atuação: ${error.message}`);
  }

  return data || [];
};
