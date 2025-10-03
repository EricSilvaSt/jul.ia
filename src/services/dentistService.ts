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
      ),
      usuario (
        usuario_id,
        nome,
        email,
        ativo
      )
    `)
    .eq('clinica_id', clinicaId);

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

/**
 * Alterna status ativo/inativo do dentista
 */
export const alternarStatusDentista = async (dentistaId: string): Promise<void> => {
  // Primeiro buscar o status atual
  const { data: currentDentist, error: fetchError } = await supabase
    .from('dentistas')
    .select('ativo')
    .eq('dentista_id', dentistaId)
    .single();

  if (fetchError) {
    throw new Error(`Erro ao buscar dentista: ${fetchError.message}`);
  }

  // Alternar o status
  const { error } = await supabase
    .from('dentistas')
    .update({ ativo: !currentDentist.ativo })
    .eq('dentista_id', dentistaId);

  if (error) {
    throw new Error(`Erro ao alterar status: ${error.message}`);
  }
};

/**
 * Obter horários disponíveis de um dentista em uma data
 */
export const obterHorariosDisponiveis = async (
  dentistaId: string,
  data: string,
  duracaoMinutos: number = 60
): Promise<string[]> => {
  const { data: horarios, error } = await supabase
    .rpc('obter_horarios_disponiveis', {
      p_dentista_id: dentistaId,
      p_data: data,
      p_duracao_minutos: duracaoMinutos
    });

  if (error) {
    throw new Error(`Erro ao obter horários disponíveis: ${error.message}`);
  }

  return (horarios || []).map((h: any) => h.horario);
};