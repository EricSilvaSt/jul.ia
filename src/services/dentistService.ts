import { supabase } from '../lib/supabase';

export interface DentistaCompleto {
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

export interface CreateDentistaData {
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
 * Busca dentistas da clínica - VERSÃO SIMPLIFICADA
 */
export const buscarDentistas = async (clinicaId: string): Promise<DentistaCompleto[]> => {
  console.log('🦷 DEBUG - buscarDentistas TESTE BÁSICO');
  console.log('  - clinicaId:', clinicaId);
  console.log('  - Fazendo query SEM filtro primeiro...');
  
  // TESTE 1: Query sem filtro para ver se retorna ALGUM dentista
  const { data, error } = await supabase
    .from('dentistas')
    .select('*');

  console.log('🦷 DEBUG - TESTE SEM FILTRO:');
  console.log('  - Total de dentistas na tabela:', data?.length || 0);
  console.log('  - Erro:', error);
  console.log('  - Primeiros 3 registros:', data?.slice(0, 3));

  if (error) {
    console.error('❌ DEBUG - Erro:', error);
    throw new Error(`Erro ao buscar dentistas: ${error.message}`);
  }

  // TESTE 2: Agora com filtro da clínica
  console.log('🦷 DEBUG - Fazendo query COM filtro da clínica...');
  const { data: filteredData, error: filteredError } = await supabase
    .from('dentistas')
    .select('*')
    .eq('clinica_id', clinicaId);

  console.log('🦷 DEBUG - TESTE COM FILTRO:');
  console.log('  - Dentistas da clínica:', filteredData?.length || 0);
  console.log('  - Erro:', filteredError);
  console.log('  - Dados:', filteredData);

  if (filteredError) {
    console.error('❌ DEBUG - Erro no filtro:', filteredError);
    throw new Error(`Erro ao buscar dentistas: ${filteredError.message}`);
  }

  // Retornar dados básicos sem processamento
  return (filteredData || []).map(d => ({
    ...d,
    especialidades: {
      id_especialidade: d.especialidade,
      nome_especialidade: 'Teste'
    }
  }));
};

/**
 * Cria novo dentista
 */
export const criarDentista = async (dentistaData: CreateDentistaData): Promise<DentistaCompleto> => {
  console.log('🦷 DEBUG - Criando dentista:', dentistaData);
  
  const { data, error } = await supabase
    .from('dentistas')
    .insert([dentistaData])
    .select('*')
    .single();

  console.log('🦷 DEBUG - Resultado criação:', { data, error });

  if (error) {
    console.error('❌ DEBUG - Erro ao criar:', error);
    throw new Error(`Erro ao criar dentista: ${error.message}`);
  }

  return data;
};

/**
 * Atualiza dentista existente
 */
export const atualizarDentista = async (
  dentistaId: string, 
  updates: Partial<CreateDentistaData>
): Promise<void> => {
  console.log('🦷 DEBUG - Atualizando dentista:', dentistaId, updates);
  
  const { error } = await supabase
    .from('dentistas')
    .update(updates)
    .eq('dentista_id', dentistaId);

  if (error) {
    console.error('❌ DEBUG - Erro ao atualizar:', error);
    throw new Error(`Erro ao atualizar dentista: ${error.message}`);
  }
};

/**
 * Deleta dentista
 */
export const deletarDentista = async (dentistaId: string): Promise<void> => {
  console.log('🦷 DEBUG - Deletando dentista:', dentistaId);
  
  const { error } = await supabase
    .from('dentistas')
    .delete()
    .eq('dentista_id', dentistaId);

  if (error) {
    console.error('❌ DEBUG - Erro ao deletar:', error);
    throw new Error(`Erro ao deletar dentista: ${error.message}`);
  }
};

/**
 * Busca especialidades disponíveis
 */
export const buscarEspecialidades = async (): Promise<Array<{id_especialidade: number, nome_especialidade: string}>> => {
  console.log('🔍 DEBUG - Buscando especialidades...');
  
  const { data, error } = await supabase
    .from('especialidades')
    .select('id_especialidade, nome_especialidade')
    .order('nome_especialidade');

  console.log('🔍 DEBUG - Resultado especialidades:', { data, error });

  if (error) {
    console.error('❌ DEBUG - Erro ao buscar especialidades:', error);
    throw new Error(`Erro ao buscar especialidades: ${error.message}`);
  }

  console.log('✅ DEBUG - Especialidades encontradas:', data?.length || 0);
  return data || [];
};