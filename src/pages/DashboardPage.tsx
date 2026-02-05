import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, User, PlusCircle, CalendarCheck, CalendarX, Users } from 'lucide-react';
import AppointmentCalendar from '../components/Calendar/AppointmentCalendar';
import AppointmentModal from '../components/Calendar/AppointmentModal';
import StatCard from '../components/Dashboard/StatCard';
import { Appointment, Dentist } from '../types';
import { formatDateTimeBR } from '../utils/timezone';
import { useAuth } from '../hooks/useAuth';
import { buscarAgendamentos } from '../services/appointmentService';
import { buscarProfissionais } from '../services/professionalService';


const DashboardPage: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [dentists, setDentists] = useState<Dentist[]>([]);
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { user, permissions } = useAuth();

  // Carregar dados reais do Supabase
  useEffect(() => {
    const loadData = async () => {
      if (!user?.clinicId || user.clinicId === 'test-clinic-id') {
        setIsLoading(false);
        return;
      }
      
      try {
        setIsLoading(true);
        
        // Carregar dentistas (apenas se tiver permissão)
        if (permissions.canViewAllDentists) {
          const dentistData = await buscarProfissionais(user.clinicId);
          setDentists(dentistData.map(d => ({
            id: d.dentista_id,
            name: d.nome,
            email: d.email || '',
            phoneNumber: '',
            specialization: d.especialidades?.nome_especialidade || 'Não informado',
            cro: d.cro,
            isActive: d.ativo ?? true,
            createdAt: d.criado_em,
            availability: d.disponibilidade || {},
          })));
        }
        
        // Carregar agendamentos
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

  const handleAddAppointment = (appointment: Omit<Appointment, 'id'>) => {
    const newAppointment: Appointment = {
      ...appointment,
      id: Date.now().toString(),
    };
    setAppointments([...appointments, newAppointment]);
    setIsAppointmentModalOpen(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  // Calcular estatísticas
  const todaysAppointments = visibleAppointments.filter(
    (apt) => {
      const appointmentDate = new Date(apt.data_agendamento);
      const today = new Date();
      return appointmentDate.toDateString() === today.toDateString();
    }
  );
  const confirmedAppointments = visibleAppointments.filter(
    (apt) => apt.status === 'confirmado'
  );
  const cancelledAppointments = visibleAppointments.filter(
    (apt) => apt.status === 'cancelado'
  );

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {permissions.canViewAllAppointments ? 'Painel Administrativo' : 'Minha Agenda'}
        </h1>
        <p className="text-gray-600">
          {permissions.canViewAllAppointments
            ? 'Visão geral' 
            : 'Seus compromissos e agenda pessoal'
          }
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Compromissos Hoje"
          value={todaysAppointments.length}
          icon={<Calendar size={24} />}
          change={{ value: 5, type: 'increase' }}
          bgColor="bg-blue-100"
          iconColor="text-blue-600"
        />
        {permissions.canViewAllDentists && (
          <StatCard
          title="Total de Profissionais"
            value={dentists.filter(d => d.isActive).length}
          icon={<User size={24} />}
          bgColor="bg-green-100"
          iconColor="text-green-600"
        />
        )}
        <StatCard
          title="Compromissos Confirmadas"
          value={confirmedAppointments.length}
          icon={<CalendarCheck size={24} />}
          change={{ value: 8, type: 'increase' }}
          bgColor="bg-teal-100"
          iconColor="text-teal-600"
        />
        <StatCard
          title="Compromissos Cancelados"
          value={cancelledAppointments.length}
          icon={<CalendarX size={24} />}
          change={{ value: 2, type: 'decrease' }}
          bgColor="bg-red-100"
          iconColor="text-red-600"
        />
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">
            Próximos Compromissos
          </h2>
          <div className="flex space-x-2">
            <button 
              onClick={() => setIsAppointmentModalOpen(true)}
              className="flex items-center text-blue-600 hover:text-blue-800"
            >
              <PlusCircle size={20} className="mr-1" />
              Novo Compromisso
            </button>
            <Link 
              to="/appointments"
              className="flex items-center text-gray-600 hover:text-gray-800"
            >
              <Calendar size={20} className="mr-1" />
              Ver Todos
            </Link>
          </div>
        </div>
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
                  Assunto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {visibleAppointments.slice(0, 5).map((appointment) => {
                const dentist = dentists.find((d) => d.id === appointment.dentistId);
                return (
                  <tr key={appointment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {appointment.patientName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {appointment.patientEmail}
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
                        {appointment.origem === 'app' ? 'Sistema' : 'Júl.IA'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        Dr. {dentist?.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {dentist?.specialization}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {appointment.procedure}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          appointment.status === 'confirmado'
                            ? 'bg-green-100 text-green-800'
                            : appointment.status === 'cancelado'
                            ? 'bg-red-100 text-red-800'
                            : appointment.status === 'concluido'
                            ? 'bg-gray-100 text-gray-800'
                            : appointment.status === 'falta'
                            ? 'bg-orange-100 text-orange-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {appointment.status === 'confirmado' ? 'Confirmado' :
                         appointment.status === 'cancelado' ? 'Cancelado' :
                         appointment.status === 'concluido' ? 'Concluído' :
                         appointment.status === 'falta' ? 'Falta' : 'Pendente'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          {permissions.canViewAllAppointments ? 'Calendário Geral' : 'Meu Calendário'}
        </h2>
        <AppointmentCalendar
          appointments={visibleAppointments}
          dentists={dentists}
          onAddAppointment={handleAddAppointment}
        />
      </div>

      {permissions.canViewAllDentists && (
        <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">
              Profissionais
          </h2>
          <button className="flex items-center text-blue-600 hover:text-blue-800">
            <Users size={20} className="mr-1" />
            Ver Todos
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {dentists.filter(d => d.isActive).slice(0, 6).map((dentist) => (
            <div
              key={dentist.id}
              className="p-4 border rounded-lg flex items-center"
            >
              <div className="bg-blue-100 p-3 rounded-full mr-3">
                <User size={20} className="text-blue-600" />
              </div>
              <div>
                <h3 className="font-medium">Dr. {dentist.name}</h3>
                <p className="text-sm text-gray-500">
                  {dentist.specialization}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
      )}

      {isAppointmentModalOpen && (
        <AppointmentModal
          isOpen={isAppointmentModalOpen}
          onClose={() => setIsAppointmentModalOpen(false)}
          date={new Date()}
          dentists={dentists}
          onSave={handleAddAppointment}
        />
      )}

    </div>
  );
};

export default DashboardPage;