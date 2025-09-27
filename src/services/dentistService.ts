import { supabase } from '../lib/supabase';

export interface DentistaCompleto {
  dentista_id: string;
  clinica_id: string;
  nome: string;
  especialidade: number;
  cro: string;
  disponibilidade?: any;
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
  disponibilidade?: any;
}

/**
 * Busca dentistas da clínica - VERSÃO SIMPLIFICADA
 */
export const buscarDentistas = async (clinicaId: string): Promise<DentistaCompleto[]> => {
  console.log('🦷 DEBUG - buscarDentistas SIMPLIFICADO');
  console.log('  - clinicaId:', clinicaId);
  
  // Query mais simples possível - só os dados básicos
  const { data, error } = await supabase
    .from('dentistas')
    .select('*')
    .eq('clinica_id', clinicaId)
    .order('criado_em', { ascending: false });

  console.log('🦷 DEBUG - Resultado simples:', { data, error });

  if (error) {
    console.error('❌ DEBUG - Erro:', error);
    throw new Error(`Erro ao buscar dentistas: ${error.message}`);
  }

  // Buscar especialidades separadamente para cada dentista
  const dentistasComEspecialidades = await Promise.all(
    (data || []).map(async (dentista) => {
      let especialidadeNome = 'Não informado';
      
      if (dentista.especialidade) {
        const { data: espData } = await supabase
          .from('especialidades')
          .select('nome_especialidade')
          .eq('id_especialidade', dentista.especialidade)
          .single();
        
        if (espData) {
          especialidadeNome = espData.nome_especialidade;
        }
      }

      return {
        ...dentista,
        especialidades: {
          id_especialidade: dentista.especialidade,
          nome_especialidade: especialidadeNome
        }
      };
    })
  );

  console.log('✅ DEBUG - Dentistas processados:', dentistasComEspecialidades.length);
  return dentistasComEspecialidades;
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
  const { data, error } = await supabase
    .from('especialidades')
    .select('id_especialidade, nome_especialidade')
    .order('nome_especialidade');

  if (error) {
    throw new Error(`Erro ao buscar especialidades: ${error.message}`);
  }

  return data || [];
};