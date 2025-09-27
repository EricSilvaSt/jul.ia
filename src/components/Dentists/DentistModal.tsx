import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { Dentist } from '../../types';
import { buscarEspecialidades } from '../../services/dentistService';

interface DentistModalProps {
  isOpen: boolean;
  onClose: () => void;
  dentist?: Dentist | null;
  onSave: (dentist: Omit<Dentist, 'id' | 'createdAt'>) => void;
}

interface Especialidade {
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

const DentistModal: React.FC<DentistModalProps> = ({
  isOpen,
  onClose,
  dentist,
  onSave,
}) => {
  const [especialidades, setEspecialidades] = useState<Especialidade[]>([]);
  const [formData, setFormData] = useState<Omit<Dentist, 'id' | 'createdAt'>>({
    name: '',
    email: '',
    phoneNumber: '',
    specialization: '',
    cro: '',
    isActive: true,
    availability: {},
    linkedUserId: undefined,
  });

  // Carregar especialidades
  useEffect(() => {
    const loadEspecialidades = async () => {
      try {
        const data = await buscarEspecialidades();
        setEspecialidades(data);
      } catch (error) {
        console.error('Erro ao carregar especialidades:', error);
      }
    };

    if (isOpen) {
      loadEspecialidades();
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
    console.log('🦷 DEBUG - Salvando dentista:', formData);
    onSave(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-800">
            {dentist ? 'Editar Dentista' : 'Novo Dentista'}
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
                  CRO *
                </label>
                <input
                  type="text"
                  name="cro"
                  value={formData.cro}
                  onChange={handleChange}
                  placeholder="Ex: CRO-SP 12345"
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Especialização *
                </label>
                <select
                  name="specialization"
                  value={formData.specialization}
                  onChange={handleChange}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                  required
                >
                  <option value="">Selecione uma especialização</option>
                  {especialidades.map((esp) => (
                    <option key={esp.id_especialidade} value={esp.nome_especialidade}>
                      {esp.nome_especialidade}
                    </option>
                  ))}
                </select>
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
                  Dentista ativo
                </label>
              </div>
            </div>
          </div>

          {/* Horários de Trabalho */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Horários de Trabalho por Dia</h3>
            
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
              {dentist ? 'Atualizar' : 'Criar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DentistModal;