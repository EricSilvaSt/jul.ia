export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'dentist';
  phoneNumber?: string;
  specialization?: string;
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
  linkedDentistId?: string; // Para usuários do tipo dentista
}

export interface Appointment {
  id: string;
  patientName: string;
  patientEmail: string;
  patientPhone: string;
  dentistId: string;
  data_agendamento: string; // UTC ISO string
  fim_agendamento: string; // UTC ISO string
  status: 'pendente' | 'confirmado' | 'concluido' | 'cancelado' | 'falta';
  procedure: string;
  notes?: string;
  duracao_minutos: number;
  origem: 'app' | 'julia';
  motivo_cancelamento?: string;
}

export interface Dentist {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  specialization: string;
  cro: string; // Registro no Conselho Regional de Odontologia
  isActive: boolean;
  createdAt: string;
  availability: {
    [key: string]: {
      inicio: string;
      fim: string;
    };
  };
}

export interface Clinic {
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