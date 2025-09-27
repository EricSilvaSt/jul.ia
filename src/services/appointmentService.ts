import { supabase } from '../lib/supabase';
import { convertToUTC, convertFromUTC, calculateEndTime } from '../utils/timezone';

export interface AgendamentoData {
  id?: number;
  usuario_id?: string;
  paciente_id?: string;
  especialidade?: number;
  dentista_id: string;
  nome_consulta: string;
  data_agendamento: string; // UTC ISO string
  fim_agendamento: string; // UTC ISO string
  status: 'pendente' | 'confirmado' | 'cancelado' | 'falta' | 'concluido';
  motivo_cancelamento?: string;
  observacoes?: string;
  duracao_minutos: number;
  origem: 'app' | 'julia';
}

export interface MarcarAgendamentoParams {
  p_clinica: string;
  p_dentista: string;
  p_paciente: string;
  p_especialidade: number;
  p_inicio: string; // ISO string com timezone
  p_duracao: number;
  p_nome_consulta: string;
  p_origem: 'app' | 'julia';
}

export interface MarcarAgendamentoResponse {
  reservado: boolean;
  agendamento_id?: number;
  mensagem?: string;
}

/**
 * Marca um agendamento usando a função RPC
 */
export const marcarAgendamento = async (params: MarcarAgendamentoParams): Promise<MarcarAgendamentoResponse> => {
  const { data, error } = await supabase
    .rpc('marcar_agendamento', params);

  if (error) {
    throw new Error(`Erro ao marcar agendamento: ${error.message}`);
  }

  return data;
};

/**
 * Busca agendamentos com filtros
 */
export const buscarAgendamentos = async (filtros?: {
  dentista_id?: string;
  paciente_id?: string;
  data_inicio?: string;
  data_fim?: string;
  status?: string;
  origem?: 'app' | 'julia';
}): Promise<AgendamentoData[]> => {
  let query = supabase
    .from('agendamento')
    .select('*')
    .order('data_agendamento', { ascending: true });

  if (filtros?.dentista_id) {
    query = query.eq('dentista_id', filtros.dentista_id);
  }

  if (filtros?.paciente_id) {
    query = query.eq('paciente_id', filtros.paciente_id);
  }

  if (filtros?.data_inicio) {
    query = query.gte('data_agendamento', filtros.data_inicio);
  }

  if (filtros?.data_fim) {
    query = query.lt('data_agendamento', filtros.data_fim);
  }

  if (filtros?.status) {
    query = query.eq('status', filtros.status);
  }

  if (filtros?.origem) {
    query = query.eq('origem', filtros.origem);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Erro ao buscar agendamentos: ${error.message}`);
  }

  return data || [];
};

/**
 * Atualiza um agendamento existente
 */
export const atualizarAgendamento = async (
  id: number, 
  updates: Partial<AgendamentoData>
): Promise<void> => {
  const { error } = await supabase
    .from('agendamento')
    .update(updates)
    .eq('id', id);

  if (error) {
    throw new Error(`Erro ao atualizar agendamento: ${error.message}`);
  }
};

/**
 * Cancela um agendamento
 */
export const cancelarAgendamento = async (
  id: number, 
  motivo: string
): Promise<void> => {
  const { error } = await supabase
    .from('agendamento')
    .update({
      status: 'cancelado',
      motivo_cancelamento: motivo
    })
    .eq('id', id);

  if (error) {
    throw new Error(`Erro ao cancelar agendamento: ${error.message}`);
  }
};

/**
 * Deleta um agendamento (use apenas se necessário, prefira cancelar)
 */
export const deletarAgendamento = async (id: number): Promise<void> => {
  const { error } = await supabase
    .from('agendamento')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(`Erro ao deletar agendamento: ${error.message}`);
  }
};