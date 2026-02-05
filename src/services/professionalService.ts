import { supabase } from '../lib/supabase';

// Importar cliente admin separadamente
import { supabase, supabaseAdmin } from '../lib/supabase';

export interface ProfessionalComplete {
  dentista_id: string;
  clinica_id: string;
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
  clinica_id: string;
  email?: string;
  telefone?: string;
  ativo?: boolean;
  disponibilidade?: any;
  usuario_id?: string;
}

/**
 * Busca profissionais da organização - VERSÃO SIMPLIFICADA
 */
export const buscarProfissionais = async (clinicaId: string): Promise<ProfessionalComplete[]> => {
  console.log('🦷 DEBUG - buscarProfissionais iniciado');
  console.log('  - clinicaId:', clinicaId);
  console.log('  - clinicaId type:', typeof clinicaId);
  
  const { data, error } = await supabase
    .from('dentistas')
    .select(`
      dentista_id,
      clinica_id,
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
    .eq('clinica_id', clinicaId)
    .order('nome');

  console.log('🦷 DEBUG - Resultado da query:', { data, error });
  console.log('🦷 DEBUG - Dados encontrados:', data?.length || 0, 'profissionais');

  if (error) {
    console.error('❌ DEBUG - Erro:', error);
    throw new Error(`Erro ao buscar profissionais: ${error.message}`);
  }

  return data || [];
};

/**
 * Cria novo profissional
 */
export const criarProfissional = async (professionalData: CreateProfessionalData): Promise<ProfessionalComplete> => {
  console.log('🦷 DEBUG - Criando profissional:', professionalData);
  
  // Tentar usar admin client, fallback para client normal
  const client = supabaseAdmin || supabase;
  const { data, error } = await client
    .from('dentistas')
    .insert([professionalData])
    .select('*')
    .single();

  console.log('🦷 DEBUG - Resultado criação:', { data, error });

  if (error) {
    console.error('❌ DEBUG - Erro ao criar:', error);
    throw new Error(`Erro ao criar profissional: ${error.message}`);
  }

  return data;
};

/**
 * Atualiza profissional existente
 */
export const atualizarProfissional = async (
  professionalId: string, 
  updates: Partial<CreateProfessionalData>
): Promise<void> => {
  console.log('🦷 DEBUG - Atualizando profissional:', professionalId, updates);
  
  // Tentar usar admin client, fallback para client normal
  const client = supabaseAdmin || supabase;
  const { error } = await client
    .from('dentistas')
    .update(updates)
    .eq('dentista_id', professionalId);

  if (error) {
    console.error('❌ DEBUG - Erro ao atualizar:', error);
    throw new Error(`Erro ao atualizar profissional: ${error.message}`);
  }
};

/**
 * Deleta profissional
 */
export const deletarProfissional = async (professionalId: string): Promise<void> => {
  console.log('🦷 DEBUG - Deletando profissional:', professionalId);
  
  // Tentar usar admin client, fallback para client normal
  const client = supabaseAdmin || supabase;
  const { error } = await client
    .from('dentistas')
    .delete()
    .eq('dentista_id', professionalId);

  if (error) {
    console.error('❌ DEBUG - Erro ao deletar:', error);
    
    // Mensagem mais específica baseada no tipo de erro
    if (error.code === 'PGRST301') {
      throw new Error('Você não tem permissão para deletar este profissional. Verifique suas credenciais.');
    } else if (error.code === '23503') {
      throw new Error('Não é possível deletar este profissional pois ele possui agendamentos vinculados.');
    } else {
      throw new Error(`Erro ao deletar profissional: ${error.message}`);
    }
  }
};

/**
 * Busca áreas de atuação disponíveis
 */
export const buscarAreasAtuacao = async (): Promise<Array<{id_especialidade: number, nome_especialidade: string}>> => {
  console.log('🔍 DEBUG - buscarAreasAtuacao INICIADO');
  console.log('🔍 DEBUG - Supabase client:', supabase);
  
  try {
    console.log('🔍 DEBUG - Fazendo query na tabela especialidades...');
    
    const { data, error } = await supabase
      .from('especialidades')
      .select('id_especialidade, nome_especialidade')
      .order('nome_especialidade');
    console.log('🔍 DEBUG - Query executada');
    console.log('🔍 DEBUG - Data:', data);
    console.log('🔍 DEBUG - Error:', error);
    console.log('🔍 DEBUG - Data length:', data?.length);
    
    if (error) {
      console.error('❌ DEBUG - Erro na query:', error);
      console.error('❌ DEBUG - Error code:', error.code);
      console.error('❌ DEBUG - Error message:', error.message);
      console.error('❌ DEBUG - Error details:', error.details);
      throw new Error(`Erro ao buscar áreas de atuação: ${error.message}`);
    }

    if (!data || data.length === 0) {
      console.log('⚠️ DEBUG - Nenhuma área de atuação encontrada na tabela');
      return [];
    }

    console.log('✅ DEBUG - Áreas de atuação encontradas:', data.length);
    console.log('✅ DEBUG - Primeira área de atuação:', data[0]);
    return data;
    
  } catch (error) {
    console.error('❌ DEBUG - Exception em buscarAreasAtuacao:', error);
    throw error;
  }
};