import { supabase } from '../lib/supabase';

export interface JuliaAgendamento {
  id: string;
  nome_paciente: string;
  telefone_paciente: string;
  email_paciente?: string;
  data_solicitada: string; // formato YYYY-MM-DD
  horario_solicitado: string; // formato HH:mm
  procedimento: string;
  status: 'pending' | 'approved' | 'rejected' | 'scheduled';
  status: 'agendado' | 'confirmado' | 'cancelado' | 'realizado' | 'ausente';
  origem: 'whatsapp' | 'telegram' | 'web';
  conversa_id?: string;
  observacoes?: string;
  criado_em: string;
  atualizado_em: string;
}

/**
 * Busca agendamentos da Júl.IA
 */
export const buscarAgendamentosJulia = async (clinicaId?: string, status?: string): Promise<JuliaAgendamento[]> => {
  console.log('🔍 DEBUG - buscarAgendamentosJulia iniciado');
  console.log('  - clinicaId recebido:', clinicaId);
  console.log('  - status recebido:', status);
  
  let query = supabase
    .from('julia_agendamentos')
    .select('*')
    .order('criado_em', { ascending: false });

  console.log('🔍 DEBUG - Query inicial criada');

  if (clinicaId && clinicaId !== 'test-clinic-id') {
    console.log('🔍 DEBUG - Aplicando filtro por clinica_id:', clinicaId);
    query = query.eq('clinica_id', clinicaId);
  } else {
    console.log('🔍 DEBUG - SEM filtro por clinica_id - buscando TODOS os registros');
  }

  if (status && status !== 'all') {
    console.log('🔍 DEBUG - Aplicando filtro por status:', status);
    query = query.eq('status', status);
  } else {
    console.log('🔍 DEBUG - SEM filtro por status');
  }

  console.log('🔍 DEBUG - Executando query no Supabase...');
  const { data, error } = await query;

  if (error) {
    console.error('❌ DEBUG - Erro na query do Supabase:', error);
    console.error('❌ DEBUG - Detalhes do erro:', {
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint
    });
    throw new Error(`Erro ao buscar agendamentos da Júl.IA: ${error.message}`);
  }

  console.log('✅ DEBUG - Query executada com sucesso');
  console.log('  - Total de registros encontrados:', data?.length || 0);
  console.log('  - Todos os registros encontrados:', data);
  
  return data || [];
};

/**
 * Atualiza status de um agendamento da Júl.IA
 */
export const atualizarStatusJulia = async (
  id: string, 
  status: 'agendado' | 'confirmado' | 'cancelado' | 'realizado' | 'ausente'
): Promise<void> => {
  const { error } = await supabase
    .from('julia_agendamentos')
    .update({ 
      status,
      atualizado_em: new Date().toISOString()
    })
    .eq('id', id);

  if (error) {
    throw new Error(`Erro ao atualizar status: ${error.message}`);
  }
};

/**
 * Transfere agendamento aprovado da Júl.IA para agenda principal
 */
export const transferirParaAgenda = async (juliaAgendamento: JuliaAgendamento, clinicId: string): Promise<boolean> => {
  try {
    // Primeiro, buscar dados do paciente ou criar se não existir
    // (implementação simplificada - em produção seria mais robusta)
    
    // Converter horário local para UTC
    const dataHoraLocal = `${juliaAgendamento.data_solicitada} ${juliaAgendamento.horario_solicitado}`;
    const inicioUtc = convertToUTC(juliaAgendamento.data_solicitada, juliaAgendamento.horario_solicitado);
    
    // Usar a função RPC para marcar o agendamento
    const params = {
      p_clinica: clinicId,
      p_dentista: 'uuid-do-dentista', // Você precisará implementar a lógica de seleção
      p_paciente: 'uuid-do-paciente', // Você precisará implementar busca/criação de paciente
      p_especialidade: 1, // Você precisará mapear procedimento para especialidade
      p_inicio: inicioUtc,
      p_duracao: 60, // duração padrão, pode ser configurável
      p_nome_consulta: juliaAgendamento.procedimento,
      p_origem: 'julia' as const
    };

    const resultado = await marcarAgendamento(params);
    
    if (resultado.reservado) {
      // Atualizar status do agendamento da Júl.IA para 'scheduled'
      await atualizarStatusJulia(juliaAgendamento.id, 'agendado');
      return true;
    } else {
      throw new Error(resultado.mensagem || 'Horário não disponível');
    }
  } catch (error) {
    console.error('Erro ao transferir agendamento:', error);
    throw error;
  }
};

// Importar função do appointmentService
import { marcarAgendamento } from './appointmentService';
import { convertToUTC } from '../utils/timezone';