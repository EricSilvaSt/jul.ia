import React, { useState, useEffect } from 'react';
import { Bot, Calendar, Clock, User, Phone, Mail, CheckCircle, XCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { buscarAgendamentosJulia, atualizarStatusJulia, transferirParaAgenda } from '../services/juliaAppointmentService';
import { formatDateTimeBR } from '../utils/timezone';
import { useAuth } from '../hooks/useAuth';

import { JuliaAgendamento } from '../services/juliaAppointmentService';


const JuliaAppointmentsPage: React.FC = () => {
  const [appointments, setAppointments] = useState<JuliaAgendamento[]>([]);
  const [statusFilter, setStatusFilter] = useState<'all' | 'agendado' | 'confirmado' | 'cancelado' | 'realizado' | 'ausente'>('all');
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  // Carregar dados reais do Supabase
  const loadAppointments = async () => {
    console.log('🔍 DEBUG - loadAppointments iniciado');
    console.log('🔍 DEBUG - Timestamp:', new Date().toISOString());
    console.log('🔍 DEBUG - user:', user);
    console.log('🔍 DEBUG - user.clinicId:', user?.clinicId);
    console.log('🔍 DEBUG - statusFilter:', statusFilter);
    
    if (!user?.clinicId) {
      console.log('❌ DEBUG - Sem clinicId, parando execução');
      setIsLoading(false);
      return;
    }
    
    try {
      setIsLoading(true);
      
      const clinicIdToUse = user.clinicId;
      const statusToUse = statusFilter === 'all' ? undefined : statusFilter;
      
      console.log('🔍 DEBUG - Parâmetros da busca:');
      console.log('  - clinicIdToUse:', clinicIdToUse);
      console.log('  - statusToUse:', statusToUse);
      console.log('  - Tipo do clinicIdToUse:', typeof clinicIdToUse);
      
      console.log('🔍 DEBUG - Chamando buscarAgendamentosJulia...');
      const data = await buscarAgendamentosJulia(
        clinicIdToUse,
        statusToUse
      );
      
      console.log('🔍 DEBUG - Dados retornados do Supabase:');
      console.log('  - Total de registros:', data?.length || 0);
      console.log('  - Todos os registros:', data);
      
      setAppointments(data);
    } catch (error) {
      console.error('❌ DEBUG - Erro ao carregar agendamentos:', error);
      console.error('❌ DEBUG - Stack trace:', error instanceof Error ? error.stack : 'No stack trace');
      // Em caso de erro, manter array vazio
      setAppointments([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Carregar dados na inicialização
  useEffect(() => {
    loadAppointments();
  }, [statusFilter, user?.clinicId]);

  // Refresh dos dados
  const handleRefresh = async () => {
    await loadAppointments();
  };

  const handleStatusChange = async (appointmentId: string, newStatus: JuliaAgendamento['status']) => {
    try {
      await atualizarStatusJulia(appointmentId, newStatus);
      setAppointments(appointments.map(apt => 
        apt.id === appointmentId ? { ...apt, status: newStatus, atualizado_em: new Date().toISOString() } : apt
      ));
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      alert('Erro ao atualizar status. Tente novamente.');
    }
  };

  const handleTransferToMainAgenda = async (appointment: JuliaAgendamento) => {
    if (!user?.clinicId || user.clinicId === 'test-clinic-id') {
      alert('Funcionalidade não disponível no modo de teste');
      return;
    }
    
    try {
      const sucesso = await transferirParaAgenda(appointment, user.clinicId);
      if (sucesso) {
        alert('Agendamento transferido com sucesso para a agenda principal!');
        await handleRefresh(); // Recarregar dados
      }
    } catch (error) {
      console.error('Erro ao transferir agendamento:', error);
      alert(`Erro ao transferir: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  };

  const filteredAppointments = appointments.filter(appointment => 
    statusFilter === 'all' || appointment.status === statusFilter
  );

  const getStatusColor = (status: JuliaAppointment['status']) => {
    switch (status) {
      case 'agendado':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmado':
        return 'bg-green-100 text-green-800';
      case 'cancelado':
        return 'bg-red-100 text-red-800';
      case 'realizado':
        return 'bg-blue-100 text-blue-800';
      case 'ausente':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: JuliaAgendamento['status']) => {
    switch (status) {
      case 'agendado':
        return 'Agendado';
      case 'confirmado':
        return 'Confirmado';
      case 'cancelado':
        return 'Cancelado';
      case 'realizado':
        return 'Realizado';
      case 'ausente':
        return 'Ausente';
      default:
        return status;
    }
  };

  const getStatusIcon = (status: JuliaAgendamento['status']) => {
    switch (status) {
      case 'agendado':
        return <AlertCircle size={16} />;
      case 'confirmado':
        return <CheckCircle size={16} />;
      case 'cancelado':
        return <XCircle size={16} />;
      case 'realizado':
        return <Calendar size={16} />;
      case 'ausente':
        return <XCircle size={16} />;
      default:
        return <AlertCircle size={16} />;
    }
  };

  const getSourceIcon = (origem: JuliaAgendamento['origem']) => {
    switch (origem) {
      case 'whatsapp':
        return '💬';
      case 'telegram':
        return '✈️';
      case 'web':
        return '🌐';
      default:
        return '📱';
    }
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div className="flex items-center">
          <div className="bg-blue-100 p-3 rounded-full mr-4">
            <Bot size={24} className="text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Agendamentos da Júl.IA</h1>
            <p className="text-gray-600">Solicitações de agendamento recebidas via assistente virtual</p>
          </div>
        </div>
        <button
          onClick={handleRefresh}
          disabled={isLoading}
          className="mt-4 md:mt-0 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 disabled:opacity-50"
        >
          <RefreshCw size={20} className={`mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Atualizar
        </button>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="bg-blue-100 p-2 rounded-full mr-3">
              <Calendar size={20} className="text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Agendados</p>
              <p className="text-xl font-bold">{appointments.filter(a => a.status === 'agendado').length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="bg-green-100 p-2 rounded-full mr-3">
              <CheckCircle size={20} className="text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Confirmados</p>
              <p className="text-xl font-bold">{appointments.filter(a => a.status === 'confirmado').length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="bg-gray-100 p-2 rounded-full mr-3">
              <CheckCircle size={20} className="text-gray-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Realizados</p>
              <p className="text-xl font-bold">{appointments.filter(a => a.status === 'realizado').length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="bg-orange-100 p-2 rounded-full mr-3">
              <XCircle size={20} className="text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Ausentes</p>
              <p className="text-xl font-bold">{appointments.filter(a => a.status === 'ausente').length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
              statusFilter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Todos ({appointments.length})
          </button>
          <button
            onClick={() => setStatusFilter('agendado')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
              statusFilter === 'agendado'
                ? 'bg-yellow-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Agendados ({appointments.filter(a => a.status === 'agendado').length})
          </button>
          <button
            onClick={() => setStatusFilter('confirmado')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
              statusFilter === 'confirmado'
                ? 'bg-green-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Confirmados ({appointments.filter(a => a.status === 'confirmado').length})
          </button>
          <button
            onClick={() => setStatusFilter('cancelado')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
              statusFilter === 'cancelado'
                ? 'bg-red-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Cancelados ({appointments.filter(a => a.status === 'cancelado').length})
          </button>
          <button
            onClick={() => setStatusFilter('realizado')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
              statusFilter === 'realizado'
                ? 'bg-gray-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Realizados ({appointments.filter(a => a.status === 'realizado').length})
          </button>
          <button
            onClick={() => setStatusFilter('ausente')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
              statusFilter === 'ausente'
                ? 'bg-orange-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Ausentes ({appointments.filter(a => a.status === 'ausente').length})
          </button>
        </div>
      </div>

      {/* Lista de Agendamentos */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        {filteredAppointments.length === 0 ? (
          <div className="text-center py-8">
            <Bot size={48} className="mx-auto text-gray-400 mb-2" />
            <p className="text-gray-500">Nenhum agendamento encontrado com os filtros aplicados.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Paciente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data/Hora Solicitada
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Procedimento
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Origem
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Recebido
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAppointments.map((appointment) => (
                  <tr key={appointment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="bg-blue-100 p-2 rounded-full mr-3">
                          <User size={16} className="text-blue-600" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {appointment.nome_paciente}
                          </div>
                          <div className="text-sm text-gray-500 flex items-center">
                            <Phone size={12} className="mr-1" />
                            {appointment.telefone_paciente}
                          </div>
                          {appointment.email_paciente && (
                            <div className="text-sm text-gray-500 flex items-center">
                              <Mail size={12} className="mr-1" />
                              {appointment.email_paciente}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 flex items-center">
                        <Calendar size={14} className="mr-1" />
                        {new Date(appointment.data_solicitada).toLocaleDateString('pt-BR')}
                      </div>
                      <div className="text-sm text-gray-500 flex items-center">
                        <Clock size={14} className="mr-1" />
                        {appointment.horario_solicitado}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{appointment.procedimento}</div>
                      {appointment.observacoes && (
                        <div className="text-sm text-gray-500 truncate max-w-xs">
                          {appointment.observacoes}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="text-lg mr-2">{getSourceIcon(appointment.origem)}</span>
                        <span className="text-sm text-gray-900 capitalize">{appointment.origem}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={appointment.status}
                        onChange={(e) => handleStatusChange(appointment.id, e.target.value as JuliaAgendamento['status'])}
                        className={`px-2 py-1 text-xs font-semibold rounded-full border-0 focus:ring-2 focus:ring-blue-500 ${getStatusColor(appointment.status)}`}
                      >
                        <option value="agendado">Agendado</option>
                        <option value="confirmado">Confirmado</option>
                        <option value="cancelado">Cancelado</option>
                        <option value="realizado">Realizado</option>
                        <option value="ausente">Ausente</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(appointment.criado_em).toLocaleString('pt-BR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex space-x-2">
                        {appointment.status === 'agendado' && (
                          <>
                            <button 
                              onClick={() => handleStatusChange(appointment.id, 'confirmado')}
                              className="text-green-600 hover:text-green-800 transition-colors duration-200"
                              title="Confirmar agendamento"
                            >
                              <CheckCircle size={16} />
                            </button>
                            <button 
                              onClick={() => handleStatusChange(appointment.id, 'cancelado')}
                              className="text-red-600 hover:text-red-800 transition-colors duration-200"
                              title="Cancelar agendamento"
                            >
                              <XCircle size={16} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Informações sobre integração */}
      <div className="mt-6 bg-blue-50 border-l-4 border-blue-500 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <Bot size={20} className="text-blue-600" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">Integração com a Júlia</h3>
            <div className="mt-2 text-sm text-blue-700">
              <p>Esta página recebe automaticamente os agendamentos processados pela Júl.IA via WhatsApp.</p>
            
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JuliaAppointmentsPage;