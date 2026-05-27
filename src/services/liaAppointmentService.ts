import { supabase } from '../lib/supabase';
import { marcarAgendamento } from './appointmentService';
import { convertToUTC } from '../utils/timezone';

export interface LiaAppointment {
  id: string;
  nome_paciente: string;
  telefone_paciente: string;
  email_paciente?: string;
  data_solicitada: string;
  horario_solicitado: string;
  procedimento: string;
  status: 'agendado' | 'confirmado' | 'cancelado' | 'realizado' | 'ausente';
  origem: 'whatsapp' | 'telegram' | 'web';
  conversa_id?: string;
  observacoes?: string;
  criado_em: string;
  atualizado_em: string;
}

export const buscarAgendamentosLia = async (clinicaId?: string, status?: string): Promise<LiaAppointment[]> => {
  let query = supabase
    .from('lia_agendamentos')
    .select('*')
    .order('criado_em', { ascending: false });

  if (clinicaId && clinicaId !== 'test-clinic-id') {
    query = query.eq('empresa_id', clinicaId);
  }

  if (status && status !== 'all') {
    query = query.eq('status', status);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Erro ao buscar agendamentos da Lia: ${error.message}`);
  }

  return data || [];
};

export const atualizarStatusLia = async (
  id: string,
  status: 'agendado' | 'confirmado' | 'cancelado' | 'realizado' | 'ausente'
): Promise<void> => {
  const { error } = await supabase
    .from('lia_agendamentos')
    .update({ status, atualizado_em: new Date().toISOString() })
    .eq('id', id);

  if (error) {
    throw new Error(`Erro ao atualizar status: ${error.message}`);
  }
};

export const transferirParaAgendaLia = async (liaAppointment: LiaAppointment, clinicId: string): Promise<boolean> => {
  try {
    const inicioUtc = convertToUTC(liaAppointment.data_solicitada, liaAppointment.horario_solicitado);

    const params = {
      p_clinica: clinicId,
      p_dentista: 'uuid-do-colaborador',
      p_paciente: 'uuid-do-cliente',
      p_especialidade: 1,
      p_inicio: inicioUtc,
      p_duracao: 60,
      p_nome_consulta: liaAppointment.procedimento,
      p_origem: 'lia' as const,
    };

    const resultado = await marcarAgendamento(params);

    if (resultado.reservado) {
      await atualizarStatusLia(liaAppointment.id, 'agendado');
      return true;
    } else {
      throw new Error(resultado.mensagem || 'Horário não disponível');
    }
  } catch (error) {
    console.error('Erro ao transferir agendamento:', error);
    throw error;
  }
};
