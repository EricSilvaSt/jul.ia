import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Appointment, Dentist } from '../../types';
import { convertToUTC, convertFromUTC, calculateEndTime } from '../../utils/timezone';
import { marcarAgendamento } from '../../services/appointmentService';

interface AppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  date: Date;
  dentists: Dentist[];
  onSave: (appointment: Omit<Appointment, 'id'>) => void;
  appointment?: Appointment;
}

const procedures = [
  'Limpeza',
  'Consulta',
  'Obturação',
  'Canal',
  'Extração',
  'Clareamento',
  'Coroa',
  'Ponte',
  'Implante',
  'Ortodontia',
];

const AppointmentModal: React.FC<AppointmentModalProps> = ({
  isOpen,
  onClose,
  date,
  dentists,
  onSave,
  appointment,
}) => {
  const formattedDate = date.toISOString().split('T')[0];
  
  const [formData, setFormData] = useState<Omit<Appointment, 'id'>>({
    patientName: appointment?.patientName || '',
    patientEmail: appointment?.patientEmail || '',
    patientPhone: appointment?.patientPhone || '',
    dentistId: appointment?.dentistId || '',
    data_agendamento: appointment?.data_agendamento || '',
    fim_agendamento: appointment?.fim_agendamento || '',
    status: appointment?.status || 'pendente',
    procedure: appointment?.procedure || 'Consulta',
    notes: appointment?.notes || '',
    duracao_minutos: appointment?.duracao_minutos || 60,
    origem: 'app',
  });

  // Estados locais para o formulário (em horário local)
  const [localDate, setLocalDate] = useState(() => {
    if (appointment?.data_agendamento) {
      const converted = convertFromUTC(appointment.data_agendamento);
      return converted.date;
    }
    return formattedDate;
  });
  
  const [localTime, setLocalTime] = useState(() => {
    if (appointment?.data_agendamento) {
      const converted = convertFromUTC(appointment.data_agendamento);
      return converted.time;
    }
    return '09:00';
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    
    if (name === 'localDate') {
      setLocalDate(value);
    } else if (name === 'localTime') {
      setLocalTime(value);
    } else if (name === 'duracao_minutos') {
      setFormData((prev) => ({ ...prev, [name]: parseInt(value) }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Converter horário local para UTC
      const inicioUtc = convertToUTC(localDate, localTime);
      const fimUtc = calculateEndTime(inicioUtc, formData.duracao_minutos);
      
      const appointmentData = {
        ...formData,
        data_agendamento: inicioUtc,
        fim_agendamento: fimUtc,
      };
      
      if (appointment) {
        // Editar agendamento existente
        onSave(appointmentData);
      } else {
        // Criar novo agendamento usando RPC
        const resultado = await marcarAgendamento({
          p_clinica: 'uuid-da-clinica', // TODO: pegar da sessão/contexto
          p_dentista: formData.dentistId,
          p_paciente: 'uuid-do-paciente', // TODO: buscar/criar paciente
          p_especialidade: 1, // TODO: mapear procedimento para especialidade
          p_inicio: inicioUtc,
          p_duracao: formData.duracao_minutos,
          p_nome_consulta: formData.procedure,
          p_origem: 'app'
        });
        
        if (!resultado.reservado) {
          alert(`Horário indisponível: ${resultado.mensagem || 'Conflito de horário'}`);
          return;
        }
        
        onSave(appointmentData);
      }
    } catch (error) {
      console.error('Erro ao salvar agendamento:', error);
      alert('Erro ao salvar agendamento. Tente novamente.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-semibold text-gray-800">
            {appointment ? 'Editar Consulta' : 'Nova Consulta'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 focus:outline-none"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Data
            </label>
            <input
              type="date"
              name="localDate"
              value={localDate}
              onChange={handleChange}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
              required
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Horário
              </label>
              <input
                type="time"
                name="localTime"
                value={localTime}
                onChange={handleChange}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Duração (min)
              </label>
              <select
                name="duracao_minutos"
                value={formData.duracao_minutos}
                onChange={handleChange}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                required
              >
                <option value={30}>30 min</option>
                <option value={60}>1 hora</option>
                <option value={90}>1h 30min</option>
                <option value={120}>2 horas</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                required
              >
                <option value="pendente">Pendente</option>
                <option value="confirmado">Confirmado</option>
                <option value="concluido">Concluído</option>
                <option value="cancelado">Cancelado</option>
                <option value="falta">Falta</option>
              </select>
            </div>
          </div>

          <div className="text-sm text-gray-500 bg-blue-50 p-3 rounded-md">
            <p className="text-xs text-gray-500 mt-1">
              <strong>Fuso horário:</strong> Horários são exibidos em horário de São Paulo e convertidos automaticamente para UTC no banco de dados.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Dentista
            </label>
            <select
              name="dentistId"
              value={formData.dentistId}
              onChange={handleChange}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
              required
            >
              <option value="">Selecione um dentista</option>
              {dentists.map((dentist) => (
                <option key={dentist.id} value={dentist.id}>
                  Dr. {dentist.name} {dentist.specialization ? `(${dentist.specialization})` : ''}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Procedimento
            </label>
            <select
              name="procedure"
              value={formData.procedure}
              onChange={handleChange}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
              required
            >
              <option value="">Selecione um procedimento</option>
              {procedures.map((procedure) => (
                <option key={procedure} value={procedure}>
                  {procedure}
                </option>
              ))}
            </select>
          </div>

          <div className="pt-2 border-t">
            <h3 className="text-sm font-medium text-gray-700 mb-2">
              Informações do Paciente
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome
                </label>
                <input
                  type="text"
                  name="patientName"
                  value={formData.patientName}
                  onChange={handleChange}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  name="patientEmail"
                  value={formData.patientEmail}
                  onChange={handleChange}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Telefone
                </label>
                <input
                  type="tel"
                  name="patientPhone"
                  value={formData.patientPhone}
                  onChange={handleChange}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                  required
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Observações
            </label>
            <textarea
              name="observacoes"
              value={formData.notes || ''}
              onChange={handleChange}
              rows={3}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
              placeholder="Observações sobre a consulta..."
            ></textarea>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {appointment ? 'Atualizar' : 'Criar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AppointmentModal;