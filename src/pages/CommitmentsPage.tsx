import React, { useState, useEffect } from 'react';
import { Search, Filter, Plus, CreditCard as Edit, Trash2, Calendar, Clock, User, Phone, Mail } from 'lucide-react';
import AppointmentModal from '../components/Calendar/AppointmentModal';
import { Appointment, Dentist } from '../types';
import { formatDateTimeBR, convertFromUTC } from '../utils/timezone';
import { buscarAgendamentos } from '../services/appointmentService';
import { buscarProfissionais } from '../services/professionalService';
import { useAuth } from '../hooks/useAuth';

const CommitmentsPage: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [professionals, setProfessionals] = useState<Dentist[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pendente' | 'confirmado' | 'concluido' | 'cancelado' | 'falta'>('all');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const { user, permissions } = useAuth();

  // Carregar dados do Supabase
  useEffect(() => {
    const loadData = async () => {
      if (!user?.clinicId || user.clinicId === 'test-clinic-id') {
        setIsLoading(false);
        return;
      }
      
      try {
        setIsLoading(true);
        
        // Carregar profissionais
        const professionalData = await buscarProfissionais(user.clinicId);
        setProfessionals(professionalData.map(d => ({
          id: d.dentista_id,
          name: d.nome,
          email: d.usuario?.email || '',
          phoneNumber: '',
          specialization: d.especialidades?.nome_especialidade || 'Não informado',
          cro: d.cro,
          isActive: d.usuario?.ativo ?? true,
          createdAt: d.criado_em,
          workingHours: { start: '08:00', end: '17:00' },
          workingDays: ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'],
          linkedUserId: d.usuario?.usuario_id,
        })));
        
        // Carregar compromissos
        const filtros = permissions.dentistId 
          ? { dentista_id: permissions.dentistId }
          : {};
          
        const appointmentData = await buscarAgendamentos(filtros);
        setAppointments(appointmentData.map(a => ({
          id: a.id?.toString() || '',
          patientName: a.nome_consulta || 'Cliente não informado',
          patientEmail: '',
          patientPhone: '',
          professionalId: a.dentista_id || '',
          data_agendamento: a.data_agendamento || '',
          fim_agendamento: a.fim_agendamento || '',
          status: a.status || 'pendente',
          procedure: a.nome_consulta || '',
          notes: a.observacoes,
          duracao_minutos: a.duracao_minutos || 60,
          origem: a.origem || 'app',
          motivo_cancelamento: a.motivo_cancelamento,
        })));
        
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [user?.clinicId, permissions]);

  // Filtrar compromissos baseado nas permissões do usuário
  const visibleAppointments = permissions.canViewAllAppointments
    ? appointments
    : appointments.filter(apt => apt.professionalId === permissions.dentistId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const handleEditAppointment = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setIsModalOpen(true);
  };

  const handleAddAppointment = () => {
    setSelectedAppointment(null);
    setIsModalOpen(true);
  };

  const handleSaveAppointment = (appointmentData: Omit<Appointment, 'id'>) => {
    if (selectedAppointment) {
      // Editar compromisso existente
      setAppointments(appointments.map(apt => 
        apt.id === selectedAppointment.id 
          ? { ...appointmentData, id: selectedAppointment.id }
          : apt
      ));
    } else {
      // Adicionar novo compromisso
      const newAppointment: Appointment = {
        ...appointmentData,
        id: Date.now().toString(),
      };
      setAppointments([...appointments, newAppointment]);
    }
    setIsModalOpen(false);
    setSelectedAppointment(null);
  };

  const handleDeleteAppointment = (appointmentId: string) => {
    if (window.confirm('Tem certeza que deseja excluir este compromisso? Esta ação não pode ser desfeita.')) {
      setAppointments(appointments.filter(apt => apt.id !== appointmentId));
    }
  };

  const handleStatusChange = (appointmentId: string, newStatus: Appointment['status']) => {
    setAppointments(appointments.map(apt => 
      apt.id === appointmentId ? { ...apt, status: newStatus } : apt
    ));
  };

  // Filtros
  const filteredAppointments = visibleAppointments.filter((appointment) => {
    const matchesSearch = 
      appointment.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.patientEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.procedure.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || appointment.status === statusFilter;

    let matchesDate = true;
    const appointmentDate = new Date(appointment.data_agendamento);
    const today = new Date();
    
    if (dateFilter === 'today') {
      matchesDate = appointmentDate.toDateString() === today.toDateString();
    } else if (dateFilter === 'week') {
      const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
      matchesDate = appointmentDate >= today && appointmentDate <= weekFromNow;
    } else if (dateFilter === 'month') {
      const monthFromNow = new Date(today.getFullYear(), today.getMonth() + 1, today.getDate());
      matchesDate = appointmentDate >= today && appointmentDate <= monthFromNow;
    }

    return matchesSearch && matchesStatus && matchesDate;
  });

  const getStatusColor = (status: Appointment['status']) => {
    switch (status) {
      case 'confirmado':
        return 'bg-green-100 text-green-800';
      case 'pendente':
        return 'bg-blue-100 text-blue-800';
      case 'concluido':
        return 'bg-gray-100 text-gray-800';
      case 'cancelado':
        return 'bg-red-100 text-red-800';
      case 'falta':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: Appointment['status']) => {
    switch (status) {
      case 'confirmado':
        return 'Confirmado';
      case 'pendente':
        return 'Pendente';
      case 'concluido':
        return 'Concluído';
      case 'cancelado':
        return 'Cancelado';
      case 'falta':
        return 'Falta';
      default:
        return status;
    }
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Compromissos</h1>
          <p className="text-gray-600">Gerencie todos os compromissos da organização</p>
        </div>
        <button
          onClick={handleAddAppointment}
          className="mt-4 md:mt-0 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
        >
          <Plus size={20} className="mr-2" />
          Novo Compromisso
        </button>
      </div>

      {/* Filtros */}
      <div className="mb-6 space-y-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={20} className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Buscar por cliente, email ou serviço/assunto..."
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">Todos os Status</option>
            <option value="pendente">Pendentes</option>
            <option value="confirmado">Confirmados</option>
            <option value="concluido">Concluídos</option>
            <option value="cancelado">Cancelados</option>
            <option value="falta">Faltas</option>
          </select>

          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">Todas as Datas</option>
            <option value="today">Hoje</option>
            <option value="week">Próximos 7 dias</option>
            <option value="month">Próximo mês</option>
          </select>
        </div>
      </div>

      {/* Lista de Compromissos */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cliente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Data e Horário
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Profissional
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Serviço/Assunto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAppointments.map((appointment) => {
                const professional = professionals.find((d) => d.id === appointment.dentistId);
                return (
                  <tr key={appointment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="bg-blue-100 p-2 rounded-full mr-3">
                          <User size={16} className="text-blue-600" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {appointment.patientName}
                          </div>
                          <div className="text-sm text-gray-500 flex items-center">
                            <Mail size={12} className="mr-1" />
                            {appointment.patientEmail}
                          </div>
                          <div className="text-sm text-gray-500 flex items-center">
                            <Phone size={12} className="mr-1" />
                            {appointment.patientPhone}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatDateTimeBR(appointment.data_agendamento)}
                      </div>
                      <div className="text-sm text-gray-500">
                        Duração: {appointment.duracao_minutos} min
                      </div>
                      <div className="text-sm text-gray-400">
                        Origem: {appointment.origem === 'app' ? 'Sistema' : 'Lia'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        Prof. {professional?.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {professional?.specialization}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{appointment.procedure}</div>
                      {appointment.notes && (
                        <div className="text-sm text-gray-500 truncate max-w-xs">
                          {appointment.notes}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={appointment.status}
                        onChange={(e) => handleStatusChange(appointment.id, e.target.value as Appointment['status'])}
                        className={`px-2 py-1 text-xs font-semibold rounded-full border-0 focus:ring-2 focus:ring-blue-500 ${getStatusColor(appointment.status)}`}
                      >
                        <option value="pendente">Pendente</option>
                        <option value="confirmado">Confirmado</option>
                        <option value="concluido">Concluído</option>
                        <option value="cancelado">Cancelado</option>
                        <option value="falta">Falta</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => handleEditAppointment(appointment)}
                          className="text-blue-600 hover:text-blue-800 transition-colors duration-200"
                          title="Editar compromisso"
                        >
                          <Edit size={16} />
                        </button>
                        <button 
                          onClick={() => handleDeleteAppointment(appointment.id)}
                          className="text-red-600 hover:text-red-800 transition-colors duration-200"
                          title="Excluir compromisso"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredAppointments.length === 0 && (
          <div className="text-center py-8">
            <Calendar size={48} className="mx-auto text-gray-400 mb-2" />
            <p className="text-gray-500">Nenhum compromisso encontrado com os filtros aplicados.</p>
          </div>
        )}
      </div>

      {/* Modal de Compromisso */}
      {isModalOpen && (
        <AppointmentModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedAppointment(null);
          }}
          date={selectedAppointment ? new Date(selectedAppointment.date) : new Date()}
          dentists={professionals}
          onSave={handleSaveAppointment}
          appointment={selectedAppointment}
        />
      )}
    </div>
  );
};

export default CommitmentsPage;