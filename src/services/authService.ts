import { supabase, supabaseAdmin } from '../lib/supabase';
import bcrypt from 'bcryptjs';

export interface LoginCredentials {
  identifier: string; // email para admin, CRO para dentista, login para clínica
  password: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email?: string;
  role: 'clinic' | 'admin' | 'dentist';
  clinicId?: string;
  dentistId?: string;
  isActive: boolean;
}

export interface ClinicInfo {
  id: string;
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
 * Autentica usuário
 */
export const authenticateUser = async (credentials: LoginCredentials): Promise<AuthUser> => {
  const { identifier, password } = credentials;

  console.log('Attempting authentication for identifier:', identifier);

  // Primeiro, tentar autenticação com Supabase Auth se o identifier for um email
  if (identifier.includes('@')) {
    try {
      console.log('DEBUG: Attempting Supabase Auth login with email:', identifier);
      
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: identifier,
        password: password,
      });

      if (authError) {
        console.log('DEBUG: Supabase Auth failed:', authError.message);
        // Fallback para autenticação customizada
      } else if (authData.user) {
        console.log('DEBUG: Supabase Auth successful, fetching user data...');
        
        // Buscar dados do usuário na tabela customizada
        const { data: userData, error: userError } = await supabase
          .from('usuario')
          .select(`
            usuario_id,
            nome,
            email,
            login,
            tipo_usuario,
            ativo,
            clinica_id,
            dentista_id
          `)
          .eq('email', identifier)
          .eq('ativo', true)
          .single();

        if (!userError && userData) {
          console.log('DEBUG: User data found via Supabase Auth');
          return {
            id: userData.usuario_id,
            name: userData.nome,
            email: userData.email,
            role: userData.tipo_usuario as 'admin' | 'dentist' | 'clinic',
            clinicId: userData.clinica_id,
            dentistId: userData.dentista_id,
            isActive: userData.ativo,
          };
        }
      }
    } catch (error) {
      console.log('DEBUG: Supabase Auth error, falling back to custom auth:', error);
    }
  }

  // Fallback para autenticação customizada
  try {
    // Buscar usuário apenas pelo campo login
    console.log('DEBUG: Searching user by login field:', identifier);
    
    const { data: userData, error: userError } = await supabaseAdmin
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
        dentista_id,
        dentistas (
          nome,
          cro
        )
      `)
      .eq('login', identifier)
      .eq('ativo', true)
      .single();

    if (userError || !userData) {
      console.log('No user found with login:', identifier);
      throw new Error('Credenciais inválidas');
    }

    console.log('User found:', userData.nome, 'Comparing password...');
    console.log('DEBUG: User password hash from DB:', userData.senha);
    
    // Verificar se a senha está hasheada (bcrypt) ou é texto plano
    let isPasswordValid = false;
    if (userData.senha.startsWith('$2a$') || userData.senha.startsWith('$2b$')) {
      // Senha hasheada com bcrypt
      isPasswordValid = await verifyPassword(password, userData.senha);
      console.log('DEBUG: Using bcrypt verification');
    } else {
      // Senha em texto plano (comparação direta)
      isPasswordValid = password === userData.senha;
      console.log('DEBUG: Using plain text verification');
    }
    
    console.log('DEBUG: isPasswordValid:', isPasswordValid);
    
    if (!isPasswordValid) {
      console.log('Password mismatch for user:', userData.nome);
      throw new Error('Credenciais inválidas');
    }

    console.log('DEBUG: Password valid, returning user');
    return {
      id: userData.usuario_id,
      name: userData.nome,
      email: userData.email,
      role: userData.tipo_usuario as 'admin' | 'dentist' | 'clinic',
      clinicId: userData.clinica_id,
      dentistId: userData.dentista_id,
      isActive: userData.ativo,
    };

  } catch (error) {
    console.error('Error during authentication process:', error);
    throw new Error('Credenciais inválidas');
  }
};

/**
 * Busca informações da clínica
 */
export const getClinicInfo = async (clinicId: string): Promise<ClinicInfo> => {
  console.log('DEBUG: getClinicInfo called with clinicId:', clinicId);
  
  try {
    console.log('DEBUG: Executing clinic query...');
    
    // Primeiro buscar dados básicos da clínica
    const { data: clinicData, error: clinicError } = await supabase
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
      .eq('clinica_id', clinicId)
      .maybeSingle();

    console.log('DEBUG: Clinic query result:', { clinicData, clinicError });

    if (clinicError) {
      console.error('DEBUG: Error fetching clinic:', clinicError);
      console.log('DEBUG: Falling back to test clinic data');
      // Fallback para dados de teste quando há erro na consulta
      return createTestClinicData(clinicId);
    }

    if (clinicData) {
      console.log('DEBUG: Clinic data found, processing...');
      
      // Buscar dados do plano separadamente
      const { data: planoData, error: planoError } = await supabase
        .from('planos')
        .select('*')
        .eq('id', clinicData.plano_id || 1)
        .maybeSingle();
      
      console.log('DEBUG: Plano query result:', { planoData, planoError });
      
      return {
        id: clinicData.clinica_id,
        nome_fantasia: clinicData.nome_fantasia,
        email: clinicData.email,
        telefone_contato: clinicData.telefone_contato,
        telefone_julia: clinicData.telefone_julia,
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
        plano: planoData || {
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
            backup_automatico: true
          }
        },
      };
    }
    
    console.log('DEBUG: No clinic data found, using test data');
    // Fallback para dados de teste quando não encontra a clínica
    return createTestClinicData(clinicId);
  } catch (error) {
    console.error('DEBUG: Exception in getClinicInfo:', error);
    console.log('DEBUG: Exception occurred, falling back to test data');
    // Fallback para dados de teste em caso de exceção
    return createTestClinicData(clinicId);
  }
};

/**
 * Cria dados de teste para clínica quando não encontrada no banco
 */
const createTestClinicData = (clinicId: string): ClinicInfo => {
  return {
    id: clinicId,
    nome_fantasia: 'Redeorto Salvador',
    email: 'redeortosalvador@gmail.com',
    telefone_contato: '(71) 3328-3229',
    telefone_julia: '553182174888@s.whatsapp.net',
    cnpj: '12.345.678/0001-90',
    razao_social: 'Redeorto Salvador Ltda.',
    endereco: 'Av. Sete de Setembro',
    numero: '906',
    complemento: '1º andar – Dois de Julho',
    bairro: 'Dois de Julho',
    cidade: 'Salvador',
    estado: 'BA',
    cep: '40050-000',
    convenios: [],
    plano: {
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
        backup_automatico: true
      }
    }
  };
};
/**
 * Determina permissões do usuário baseado no seu tipo e dados
 */
export const getUserPermissions = (user: AuthUser) => {
  const permissions = {
    canViewAllAppointments: false,
    canViewAllDentists: false,
    canManageUsers: false,
    dentistId: undefined as string | undefined,
  };

  switch (user.role) {
    case 'admin':
    case 'clinic':
      // Administradores e clínicas veem tudo da sua clínica
      permissions.canViewAllAppointments = true;
      permissions.canViewAllDentists = true;
      permissions.canManageUsers = true;
      break;
      
    case 'dentist':
      // Dentistas só veem sua própria agenda
      permissions.canViewAllAppointments = false;
      permissions.canViewAllDentists = false;
      permissions.canManageUsers = false;
      permissions.dentistId = user.dentistId;
      break;
  }

  return permissions;
};

/**
 * Verifica se a clínica tem acesso a uma funcionalidade baseada no plano
 */
export const hasFeatureAccess = (plano: any, feature: string): boolean => {
  if (!plano || !plano.recursos) return false;
  
  return plano.recursos[feature] === true;
};

/**
 * Criptografa senha usando bcrypt
 */
export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
};

/**
 * Verifica senha criptografada
 */
export const verifyPassword = async (password: string, hashedPassword: string): Promise<boolean> => {
  return await bcrypt.compare(password, hashedPassword);
};

/**
 * Verifica se a clínica tem plano Premium ou superior
 */
export const hasPremiumAccess = (plano: any): boolean => {
  if (!plano) return false;
  
  const premiumPlans = ['Premium', 'Enterprise', 'Pro'];
  return premiumPlans.includes(plano.nome);
};