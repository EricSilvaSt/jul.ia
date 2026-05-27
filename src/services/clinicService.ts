import { supabase } from '../lib/supabase';

export interface ClinicaCompleta {
  empresa_id: string;
  nome_fantasia: string;
  email: string;
  telefone_contato: string;
  telefone_lia?: string;
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

export const buscarClinicaCompleta = async (clinicaId: string): Promise<ClinicaCompleta> => {
  const { data, error } = await supabase
    .from('empresas')
    .select(`
      empresa_id,
      nome_fantasia,
      email,
      telefone_contato,
      telefone_lia,
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
    .eq('empresa_id', clinicaId)
    .maybeSingle();

  if (error || !data) {
    throw new Error(`Erro ao buscar informações da organização: ${error?.message || 'Não encontrada'}`);
  }

  return data;
};

export const atualizarClinica = async (
  clinicaId: string,
  updates: Partial<Omit<ClinicaCompleta, 'empresa_id' | 'plano'>>
): Promise<void> => {
  const { error } = await supabase
    .from('empresas')
    .update(updates)
    .eq('empresa_id', clinicaId);

  if (error) {
    throw new Error(`Erro ao atualizar organização: ${error.message}`);
  }
};
