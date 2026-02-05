export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'professional';
  phoneNumber?: string;
  specialization?: string;
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
  linkedProfessionalId?: string;
}

export interface Appointment {
  id: string;
  patientName: string;
  patientEmail: string;
  patientPhone: string;
  professionalId: string;
  data_agendamento: string; // UTC ISO string
  fim_agendamento: string; // UTC ISO string
  status: 'pendente' | 'confirmado' | 'concluido' | 'cancelado' | 'falta';
  procedure: string;
  notes?: string;
  duracao_minutos: number;
  origem: 'app' | 'lia';
  motivo_cancelamento?: string;
}

// Interface que representa profissionais de qualquer área
export interface Dentist {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  specialization: string;
  cro: string; // ID de registro profissional
  isActive: boolean;
  createdAt: string;
  availability: {
    [key: string]: {
      inicio: string;
      fim: string;
    };
  };
}

// Alias para melhor semântica
export type Professional = Dentist;

export interface Organization {
  id: string;
  name: string;
  address: string;
  phoneNumber: string;
  email: string;
  openingHours: {
    start: string;
    end: string;
  };
  workingDays: string[];
}

export interface CalendarIntegration {
  provider: 'google' | 'microsoft';
  connected: boolean;
  lastSynced?: string;
}