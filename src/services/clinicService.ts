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
}

/**
 * Busca informações completas da clínica
 */
export const buscarClinicaCompleta = async (clinicaId: string): Promise<ClinicaCompleta> => {
  console.log('🏥 DEBUG - buscarClinicaCompleta iniciado');
  console.log('  - clinicaId:', clinicaId);
  
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
      convenios
    `)
    .eq('clinica_id', clinicaId)
    .maybeSingle();

  console.log('🏥 DEBUG - Resultado da query:', { data, error });
  
  if (error || !data) {
    console.error('❌ DEBUG - Erro ao buscar clínica:', error);
    throw new Error(`Erro ao buscar informações da clínica: ${error?.message || 'Clínica não encontrada'}`);
  }

  console.log('✅ DEBUG - Clínica encontrada:', data.nome_fantasia);
  return data;
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