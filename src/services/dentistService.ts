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
  console.log('🦷 DEBUG - buscarDentistas iniciado');
  console.log('  - clinicaId recebido:', clinicaId);
  console.log('  - Tipo do clinicaId:', typeof clinicaId);
  
  // Primeiro, testar query simples sem JOINs
  console.log('🦷 DEBUG - Testando query simples primeiro...');
  const { data: simpleData, error: simpleError } = await supabase
    .from('dentistas')
    .select('*')
    .eq('clinica_id', clinicaId);
    
  console.log('🦷 DEBUG - Query simples resultado:', { simpleData, simpleError });
  console.log('🦷 DEBUG - Registros encontrados na query simples:', simpleData?.length || 0);
  
  // Se a query simples funcionar, tentar com JOINs opcionais
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
      especialidades!dentistas_especialidade_fkey (
        id_especialidade,
        nome_especialidade
      ),
      usuario!dentistas_dentista_id_fkey (
        usuario_id,
        nome,
        email,
        ativo
      )
    `)
    .eq('clinica_id', clinicaId)
    .order('criado_em', { ascending: false });

  console.log('🦷 DEBUG - Resultado da query:');
  console.log('  - data:', data);
  console.log('  - error:', error);
  console.log('  - Total de registros encontrados:', data?.length || 0);

  if (error) {
    console.error('❌ DEBUG - Erro na query do Supabase:', error);
    console.error('❌ DEBUG - Detalhes do erro:', {
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint
    });
    throw new Error(`Erro ao buscar dentistas: ${error.message}`);
  }

  console.log('✅ DEBUG - Query executada com sucesso');
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