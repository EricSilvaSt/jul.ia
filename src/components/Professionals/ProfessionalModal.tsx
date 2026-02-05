import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { Dentist } from '../../types';
import { buscarAreasAtuacao } from '../../services/professionalService';

interface ProfessionalModalProps {
  isOpen: boolean;
  onClose: () => void;
  dentist?: Dentist | null;
  onSave: (dentist: Omit<Dentist, 'id' | 'createdAt'>) => void;
}

interface AreaAtuacao {
  id_especialidade: number;
  nome_especialidade: string;
}

const weekDays = [
  { key: 'segunda', label: 'Segunda-feira' },
  { key: 'terca', label: 'Terça-feira' },
  { key: 'quarta', label: 'Quarta-feira' },
  { key: 'quinta', label: 'Quinta-feira' },
  { key: 'sexta', label: 'Sexta-feira' },
  { key: 'sabado', label: 'Sábado' },
  { key: 'domingo', label: 'Domingo' },
];

const ProfessionalModal: React.FC<ProfessionalModalProps> = ({
  isOpen,
  onClose,
  dentist,
  onSave,
}) => {
  const [areasAtuacao, setAreasAtuacao] = useState<AreaAtuacao[]>([]);
  const [formData, setFormData] = useState<Omit<Dentist, 'id' | 'createdAt'>>({
    name: '',
    email: '',
    phoneNumber: '',
    specialization: '',
    cro: '',
    isActive: true,
    availability: {},
  });

  // Carregar áreas de atuação
  useEffect(() => {
    const loadAreasAtuacao = async () => {
      console.log('🦷 DEBUG - Modal: loadAreasAtuacao INICIADO');
      console.log('🦷 DEBUG - Modal: isOpen =', isOpen);
      
      try {
        console.log('🦷 DEBUG - Modal: Chamando buscarAreasAtuacao...');
        const data = await buscarAreasAtuacao();
        console.log('🦷 DEBUG - Modal: Dados retornados:', data);
        console.log('🦷 DEBUG - Modal: Quantidade:', data?.length);
        
        if (data && data.length > 0) {
          console.log('🦷 DEBUG - Modal: Setando áreas de atuação no estado');
          setAreasAtuacao(data);
        } else {
          console.log('🦷 DEBUG - Modal: Dados vazios, usando fallback');
          setAreasAtuacao([
            { id_especialidade: 1, nome_especialidade: 'Clínica Geral (Saúde)' },
            { id_especialidade: 2, nome_especialidade: 'Ortodontia (Saúde)' },
            { id_especialidade: 3, nome_especialidade: 'Endodontia (Saúde)' },
            { id_especialidade: 4, nome_especialidade: 'Periodontia (Saúde)' },
            { id_especialidade: 5, nome_especialidade: 'Implantodontia (Saúde)' },
            { id_especialidade: 6, nome_especialidade: 'Consultoria' },
            { id_especialidade: 7, nome_especialidade: 'Terapia' },
            { id_especialidade: 8, nome_especialidade: 'Educação' },
            { id_especialidade: 9, nome_especialidade: 'Tecnologia' },
            { id_especialidade: 10, nome_especialidade: 'Administração' },
          ]);
        }
        
      } catch (error) {
        console.error('❌ DEBUG - Modal: Erro ao carregar áreas de atuação:', error);
        console.log('🦷 DEBUG - Modal: Usando fallback devido ao erro');
        setAreasAtuacao([
          { id_especialidade: 1, nome_especialidade: 'Clínica Geral (Saúde)' },
          { id_especialidade: 2, nome_especialidade: 'Ortodontia (Saúde)' },
          { id_especialidade: 3, nome_especialidade: 'Endodontia (Saúde)' },
          { id_especialidade: 4, nome_especialidade: 'Periodontia (Saúde)' },
          { id_especialidade: 5, nome_especialidade: 'Implantodontia (Saúde)' },
          { id_especialidade: 6, nome_especialidade: 'Consultoria' },
          { id_especialidade: 7, nome_especialidade: 'Terapia' },
          { id_especialidade: 8, nome_especialidade: 'Educação' },
          { id_especialidade: 9, nome_especialidade: 'Tecnologia' },
          { id_especialidade: 10, nome_especialidade: 'Administração' },
        ]);
      }
      
      console.log('🦷 DEBUG - Modal: loadAreasAtuacao FINALIZADO');
    };

    if (isOpen) {
      console.log('🦷 DEBUG - Modal: Modal está aberto, iniciando carregamento...');
      loadAreasAtuacao();
    } else {
      console.log('🦷 DEBUG - Modal: Modal fechado, não carregando áreas de atuação');
    }
  }, [isOpen]);

  useEffect(() => {
    if (dentist) {
      setFormData({
        name: dentist.name,
        email: dentist.email,
        phoneNumber: dentist.phoneNumber,
        specialization: dentist.specialization,
        cro: dentist.cro,
        isActive: dentist.isActive,
        availability: dentist.availability || {},
        linkedUserId: dentist.linkedUserId,
      });
    } else {
      setFormData({
        name: '',
        email: '',
        phoneNumber: '',
        specialization: '',
        cro: '',
        isActive: true,
        availability: {},
        linkedUserId: undefined,
      });
    }
  }, [dentist]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      if (name === 'isActive') {
        setFormData(prev => ({ ...prev, isActive: checked }));
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleAvailabilityChange = (day: string, field: 'inicio' | 'fim', value: string) => {
    setFormData(prev => ({
      ...prev,
      availability: {
        ...prev.availability,
        [day]: {
          ...prev.availability[day],
          [field]: value,
        },
      },
    }));
  };

  const addWorkingDay = (day: string) => {
    setFormData(prev => ({
      ...prev,
      availability: {
        ...prev.availability,
        [day]: {
          inicio: '08:00',
          fim: '17:00',
        },
      },
    }));
  };

  const removeWorkingDay = (day: string) => {
    setFormData(prev => {
      const newAvailability = { ...prev.availability };
      delete newAvailability[day];
      return {
        ...prev,
        availability: newAvailability,
      };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('🦷 DEBUG - Salvando profissional:', formData);
    onSave(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-800">
            {dentist ? 'Editar Profissional' : 'Novo Profissional'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 focus:outline-none"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Informações Básicas */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Informações Básicas</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Telefone *
                </label>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Identificador *
                </label>
                <input
                  type="text"
                  name="cro"
                  value={formData.cro}
                  onChange={handleChange}
                  placeholder="Ex: ID-12345"
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Área de Atuação *
                </label>
                <select
                  name="specialization"
                  value={formData.specialization}
                  onChange={handleChange}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                  required
                >
                  <option value="">Selecione uma área de atuação</option>
                  {areasAtuacao.map((area) => (
                    <option key={area.id_especialidade} value={area.nome_especialidade}>
                      {area.nome_especialidade}
                    </option>
                  ))}
                </select>
                <div className="mt-1 text-xs text-gray-500">
                  DEBUG: {areasAtuacao.length} áreas de atuação carregadas
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-700">
                  Profissional ativo
                </label>
              </div>
            </div>
          </div>

          {/* Disponibilidade por Dia */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Disponibilidade por Dia</h3>
            
            <div className="space-y-4">
              {weekDays.map((day) => {
                const isWorking = formData.availability[day.key];
                
                return (
                  <div key={day.key} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-gray-800">{day.label}</h4>
                      {isWorking ? (
                        <button
                          type="button"
                          onClick={() => removeWorkingDay(day.key)}
                          className="flex items-center text-red-600 hover:text-red-800 text-sm"
                        >
                          <Trash2 size={16} className="mr-1" />
                          Remover
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => addWorkingDay(day.key)}
                          className="flex items-center text-blue-600 hover:text-blue-800 text-sm"
                        >
                          <Plus size={16} className="mr-1" />
                          Adicionar
                        </button>
                      )}
                    </div>
                    
                    {isWorking && (
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Horário de Início
                          </label>
                          <input
                            type="time"
                            value={formData.availability[day.key]?.inicio || '08:00'}
                            onChange={(e) => handleAvailabilityChange(day.key, 'inicio', e.target.value)}
                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Horário de Fim
                          </label>
                          <input
                            type="time"
                            value={formData.availability[day.key]?.fim || '17:00'}
                            onChange={(e) => handleAvailabilityChange(day.key, 'fim', e.target.value)}
                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-6 border-t">
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
              {professional ? 'Atualizar' : 'Criar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfessionalModal;