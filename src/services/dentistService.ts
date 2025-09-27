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
 * Busca dentistas da clínica
 */
export const buscarDentistas = async (clinicaId: string): Promise<DentistaCompleto[]> => {
  const { data, error } = await supabase
    .from('dentistas')
    .select(`
      dentista_id,
      clinica_id,
      nome,
      especialidade,
      cro,
      disponibilidade,
      criado_em,
      especialidades (
        id_especialidade,
        nome_especialidade
      ),
      usuario (
        usuario_id,
        nome,
        email,
        ativo
      )
    `)
    .eq('clinica_id', clinicaId)
    .order('criado_em', { ascending: false });

  if (error) {
    throw new Error(`Erro ao buscar dentistas: ${error.message}`);
  }

  return data || [];
};

/**
 * Cria novo dentista
 */
export const criarDentista = async (dentistaData: CreateDentistaData): Promise<DentistaCompleto> => {
  const { data, error } = await supabase
    .from('dentistas')
    .insert([dentistaData])
    .select(`
      dentista_id,
      clinica_id,
      nome,
      especialidade,
      cro,
      disponibilidade,
      criado_em,
      especialidades (
        id_especialidade,
        nome_especialidade
      )
    `)
    .single();

  if (error) {
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
  const { error } = await supabase
    .from('dentistas')
    .update(updates)
    .eq('dentista_id', dentistaId);

  if (error) {
    throw new Error(`Erro ao atualizar dentista: ${error.message}`);
  }
};

/**
 * Deleta dentista
 */
export const deletarDentista = async (dentistaId: string): Promise<void> => {
  const { error } = await supabase
    .from('dentistas')
    .delete()
    .eq('dentista_id', dentistaId);

  if (error) {
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