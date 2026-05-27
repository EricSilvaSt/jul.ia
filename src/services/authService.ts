import { supabase } from '../lib/supabase';
import bcrypt from 'bcryptjs';

export interface LoginCredentials {
  identifier: string;
  password: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email?: string;
  role: 'clinic' | 'admin' | 'professional';
  clinicId?: string;
  professionalId?: string;
  isActive: boolean;
}

export interface ClinicInfo {
  id: string;
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

// Normaliza o tipo_usuario para os valores esperados pelo sistema
const normalizeTipoUsuario = (tipo: string): 'admin' | 'professional' | 'clinic' => {
  const t = (tipo || '').toLowerCase();
  if (t === 'admin' || t === 'adm' || t === 'administrador') return 'admin';
  if (t === 'dentist' || t === 'dentista' || t === 'professional' || t === 'profissional') return 'professional';
  if (t === 'clinic' || t === 'clinica' || t === 'clínica') return 'clinic';
  // Fallback: se tiver email, trata como admin
  return 'admin';
};

/**
 * Autentica usuário
 */
export const authenticateUser = async (credentials: LoginCredentials): Promise<AuthUser> => {
  const { identifier, password } = credentials;

  // Modo demo quando Supabase não está configurado
  if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
    if (identifier === 'demo@clinica.com' && password === 'demo123') {
      return {
        id: 'demo-user-id',
        name: 'Usuário Demo',
        email: 'demo@clinica.com',
        role: 'admin',
        clinicId: 'demo-clinic-id',
        isActive: true,
      };
    }
    throw new Error('Modo demo: Use demo@clinica.com / demo123');
  }

  // Busca pelo campo login OU email (usando anon key — sem RLS block)
  const { data: users, error } = await supabase
    .from('usuario')
    .select(`
      usuario_id,
      nome,
      email,
      login,
      senha,
      tipo_usuario,
      ativo,
      clinica_id,
      dentista_id
    `)
    .or(`login.eq.${identifier},email.eq.${identifier}`)
    .eq('ativo', true);

  if (error) {
    console.error('Erro ao buscar usuário:', error);
    throw new Error('Erro ao verificar credenciais. Tente novamente.');
  }

  if (!users || users.length === 0) {
    throw new Error('Usuário não encontrado ou inativo.');
  }

  const userData = users[0];

  // Verificar senha — suporta bcrypt e texto plano
  let senhaValida = false;
  const senha = userData.senha || '';

  if (senha.startsWith('$2a$') || senha.startsWith('$2b$') || senha.startsWith('$2y$')) {
    senhaValida = await bcrypt.compare(password, senha);
  } else {
    senhaValida = password === senha;
  }

  if (!senhaValida) {
    throw new Error('Senha incorreta.');
  }

  return {
    id: userData.usuario_id,
    name: userData.nome,
    email: userData.email,
    role: normalizeTipoUsuario(userData.tipo_usuario),
    clinicId: userData.clinica_id,
    professionalId: userData.dentista_id,
    isActive: userData.ativo,
  };
};

/**
 * Busca informações da clínica/organização
 */
export const getClinicInfo = async (clinicId: string): Promise<ClinicInfo> => {
  if (clinicId === 'demo-clinic-id' || !import.meta.env.VITE_SUPABASE_URL) {
    return createTestClinicData(clinicId);
  }

  try {
    const { data: clinicData, error: clinicError } = await supabase
      .from('clinica')
      .select(`
        clinica_id,
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
      .eq('clinica_id', clinicId)
      .maybeSingle();

    if (clinicError || !clinicData) {
      return createTestClinicData(clinicId);
    }

    const { data: planoData } = await supabase
      .from('planos')
      .select('*')
      .eq('id', 1)
      .maybeSingle();

    return {
      id: clinicData.clinica_id,
      nome_fantasia: clinicData.nome_fantasia,
      email: clinicData.email,
      telefone_contato: clinicData.telefone_contato,
      telefone_lia: clinicData.telefone_lia,
      cnpj: clinicData.cnpj,
      razao_social: clinicData.razao_social,
      endereco: clinicData.endereco,
      numero: clinicData.numero,
      complemento: clinicData.complemento,
      bairro: clinicData.bairro,
      cidade: clinicData.cidade,
      estado: clinicData.estado,
      cep: clinicData.cep,
      convenios: clinicData.convenios,
      plano: planoData || defaultPlano(),
    };
  } catch {
    return createTestClinicData(clinicId);
  }
};

const defaultPlano = () => ({
  id: 1,
  nome: 'Básico',
  descricao: 'Plano básico',
  preco_mensal: 99.90,
  preco_anual: 999.00,
  max_dentistas: 5,
  max_agendamentos_mes: 100,
  recursos: {
    relatorios_avancados: false,
    integracao_whatsapp: true,
    backup_automatico: true,
  },
});

const createTestClinicData = (clinicId: string): ClinicInfo => ({
  id: clinicId,
  nome_fantasia: 'ER.IA Tech',
  email: 'techeria3@gmail.com',
  telefone_contato: '(71) 96293-3388',
  cnpj: '',
  razao_social: 'ER.IA Tech',
  cidade: 'Salvador',
  estado: 'BA',
  convenios: [],
  plano: defaultPlano(),
});

export const getUserPermissions = (user: AuthUser) => {
  const permissions = {
    canViewAllAppointments: false,
    canViewAllProfessionals: false,
    canManageUsers: false,
    professionalId: undefined as string | undefined,
  };

  switch (user.role) {
    case 'admin':
    case 'clinic':
      permissions.canViewAllAppointments = true;
      permissions.canViewAllProfessionals = true;
      permissions.canManageUsers = true;
      break;
    case 'professional':
      permissions.professionalId = user.professionalId;
      break;
  }

  return permissions;
};

export const hasFeatureAccess = (plano: any, feature: string): boolean => {
  if (!plano || !plano.recursos) return false;
  return plano.recursos[feature] === true;
};

export const hashPassword = async (password: string): Promise<string> => {
  return await bcrypt.hash(password, 10);
};

export const verifyPassword = async (password: string, hashedPassword: string): Promise<boolean> => {
  return await bcrypt.compare(password, hashedPassword);
};

export const hasPremiumAccess = (plano: any): boolean => {
  if (!plano) return false;
  return ['Premium', 'Enterprise', 'Pro'].includes(plano.nome);
};
