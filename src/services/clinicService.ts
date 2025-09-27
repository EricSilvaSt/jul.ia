import { supabase } from '../lib/supabase';

export interface ClinicaCompleta {
  clinica_id: string;
  nome_fantasia: string;
  email: string;
  telefone_contato: string;
  telefone_julia?: string;
  cnpj?: string;
  razao_social?: string;
  endereco?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
  convenios?: any;
  plano: {
    id: number;
    nome: string;
    descricao?: string;
    preco_mensal: number;
    preco_anual?: number;
    max_dentistas?: number;
    max_agendamentos_mes?: number;
    recursos: any;
  };
}

/**
 * Busca informações completas da clínica com plano
 */
export const buscarClinicaCompleta = async (clinicaId: string): Promise<ClinicaCompleta> => {
  const { data, error } = await supabase
    .from('clinica')
    .select(`
      clinica_id,
      nome_fantasia,
      email,
      telefone_contato,
      telefone_julia,
      cnpj,
      razao_social,
      endereco,
      numero,
      complemento,
      bairro,
      cidade,
      estado,
      cep,
      convenios,
      planos (
        id,
        nome,
        descricao,
        preco_mensal,
        preco_anual,
        max_dentistas,
        max_agendamentos_mes,
        recursos
      )
    `)
    .eq('clinica_id', clinicaId)
    .single();

  if (error || !data) {
    throw new Error('Erro ao buscar informações da clínica');
  }

  return {
    ...data,
    plano: data.planos,
  };
};

/**
 * Atualiza informações da clínica
 */
export const atualizarClinica = async (
  clinicaId: string, 
  updates: Partial<Omit<ClinicaCompleta, 'clinica_id' | 'plano'>>
): Promise<void> => {
  const { error } = await supabase
    .from('clinica')
    .update(updates)
    .eq('clinica_id', clinicaId);

  if (error) {
    throw new Error(`Erro ao atualizar clínica: ${error.message}`);
  }
};