import { supabase } from '../lib/supabase';
import { hashPassword } from './authService';

export interface Usuario {
  usuario_id: string;
  clinica_id: string;
  dentista_id?: string;
  nome: string;
  email?: string;
  tipo_usuario: 'admin' | 'dentist';
  ativo: boolean;
  criado_em: string;
}

export interface CreateUserData {
  nome: string;
  email?: string;
  senha: string;
  tipo_usuario: 'admin' | 'dentist';
  clinica_id: string;
  dentista_id?: string;
  ativo: boolean;
}

/**
 * Busca usuários da clínica
 */
export const buscarUsuarios = async (clinicaId: string): Promise<Usuario[]> => {
  const { data, error } = await supabase
    .from('usuario')
    .select(`
      usuario_id,
      clinica_id,
      dentista_id,
      nome,
      email,
      tipo_usuario,
      ativo,
      criado_em,
      dentistas (
        nome,
        cro
      )
    `)
    .eq('clinica_id', clinicaId)
    .order('criado_em', { ascending: false });

  if (error) {
    throw new Error(`Erro ao buscar usuários: ${error.message}`);
  }

  return data || [];
};

/**
 * Cria novo usuário
 */
export const criarUsuario = async (userData: CreateUserData): Promise<Usuario> => {
  // Criptografar senha antes de salvar
  const hashedPassword = await hashPassword(userData.senha);
  const userDataWithHashedPassword = {
    ...userData,
    senha: hashedPassword,
  };

  const { data, error } = await supabase
    .from('usuario')
    .insert([userDataWithHashedPassword])
    .select()
    .single();

  if (error) {
    throw new Error(`Erro ao criar usuário: ${error.message}`);
  }

  return data;
};

/**
 * Atualiza usuário existente
 */
export const atualizarUsuario = async (
  usuarioId: string, 
  updates: Partial<CreateUserData>
): Promise<void> => {
  // Se a senha está sendo atualizada, criptografar
  let finalUpdates = { ...updates };
  if (updates.senha) {
    finalUpdates.senha = await hashPassword(updates.senha);
  }

  const { error } = await supabase
    .from('usuario')
    .update(finalUpdates)
    .eq('usuario_id', usuarioId);

  if (error) {
    throw new Error(`Erro ao atualizar usuário: ${error.message}`);
  }
};

/**
 * Deleta usuário
 */
export const deletarUsuario = async (usuarioId: string): Promise<void> => {
  const { error } = await supabase
    .from('usuario')
    .delete()
    .eq('usuario_id', usuarioId);

  if (error) {
    throw new Error(`Erro ao deletar usuário: ${error.message}`);
  }
};

/**
 * Alterna status ativo/inativo do usuário
 */
export const alternarStatusUsuario = async (usuarioId: string): Promise<void> => {
  // Primeiro buscar o status atual
  const { data: currentUser, error: fetchError } = await supabase
    .from('usuario')
    .select('ativo')
    .eq('usuario_id', usuarioId)
    .single();

  if (fetchError) {
    throw new Error(`Erro ao buscar usuário: ${fetchError.message}`);
  }

  // Alternar o status
  const { error } = await supabase
    .from('usuario')
    .update({ ativo: !currentUser.ativo })
    .eq('usuario_id', usuarioId);

  if (error) {
    throw new Error(`Erro ao alterar status: ${error.message}`);
  }
};