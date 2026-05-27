import { supabase } from '../lib/supabase';
import { convertToUTC, convertFromUTC, calculateEndTime } from '../utils/timezone';

export interface AgendamentoData {
  id?: number;
  usuario_id?: string;
  paciente_id?: string;
  especialidade?: number;
  colaborador_id: string;
  nome_consulta: string;
  data_agendamento: string;
  fim_agendamento: string;
  status: 'pendente' | 'confirmado' | 'cancelado' | 'falta' | 'concluido';
  motivo_cancelamento?: string;
  observacoes?: string;
  duracao_minutos: number;
  origem: 'app' | 'lia';
}

export interface MarcarAgendamentoParams {
  p_clinica: string;
  p_dentista: string;
  p_paciente: string;
  p_especialidade: number;
  p_inicio: string;
  p_duracao: number;
  p_nome_consulta: string;
  p_origem: 'app' | 'lia';
}

export interface MarcarAgendamentoResponse {
  reservado: boolean;
  agendamento_id?: number;
  mensagem?: string;
}

export const marcarAgendamento = async (params: MarcarAgendamentoParams): Promise<MarcarAgendamentoResponse> => {
  const { data, error } = await supabase.rpc('marcar_agendamento', params);

  if (error) {
    throw new Error(`Erro ao marcar agendamento: ${error.message}`);
  }

  return data;
};

export const buscarAgendamentos = async (filtros?: {
  colaborador_id?: string;
  paciente_id?: string;
  data_inicio?: string;
  data_fim?: string;
  status?: string;
  origem?: 'app' | 'lia';
}): Promise<AgendamentoData[]> => {
  let query = supabase
    .from('agendamento')
    .select('*')
    .order('data_agendamento', { ascending: true });

  if (filtros?.colaborador_id) {
    query = query.eq('colaborador_id', filtros.colaborador_id);
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

export const cancelarAgendamento = async (id: number, motivo: string): Promise<void> => {
  const { error } = await supabase
    .from('agendamento')
    .update({ status: 'cancelado', motivo_cancelamento: motivo })
    .eq('id', id);

  if (error) {
    throw new Error(`Erro ao cancelar agendamento: ${error.message}`);
  }
};

export const deletarAgendamento = async (id: number): Promise<void> => {
  const { error } = await supabase
    .from('agendamento')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(`Erro ao deletar agendamento: ${error.message}`);
  }
};
