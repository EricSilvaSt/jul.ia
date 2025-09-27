import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Dentist } from '../../types';

interface DentistModalProps {
  isOpen: boolean;
  onClose: () => void;
  dentist?: Dentist | null;
  onSave: (dentist: Omit<Dentist, 'id' | 'createdAt'>) => void;
}

const specializations = [
  'Clínico Geral',
  'Ortodontista',
  'Periodontista',
  'Endodontista',
  'Cirurgião Oral',
  'Odontopediatra',
  'Protesista',
  'Implantodontista',
  'Radiologista',
  'Patologista Oral',
];

const weekDays = [
  'Segunda',
  'Terça',
  'Quarta',
  'Quinta',
  'Sexta',
  'Sábado',
  'Domingo',
];

const DentistModal: React.FC<DentistModalProps> = ({
  isOpen,
  onClose,
  dentist,
  onSave,
}) => {
  const [formData, setFormData] = useState<Omit<Dentist, 'id' | 'createdAt'>>({
    name: '',
    email: '',
    phoneNumber: '',
    specialization: 'Clínico Geral',
    cro: '',
    isActive: true,
    workingHours: { start: '08:00', end: '17:00' },
    workingDays: ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'],
    linkedUserId: undefined,
  });

  useEffect(() => {
    if (dentist) {
      setFormData({
        name: dentist.name,
        email: dentist.email,
        phoneNumber: dentist.phoneNumber,
        specialization: dentist.specialization,
        cro: dentist.cro,
        isActive: dentist.isActive,
        workingHours: dentist.workingHours,
        workingDays: dentist.workingDays,
        linkedUserId: dentist.linkedUserId,
      });
    } else {
      setFormData({
        name: '',
        email: '',
        phoneNumber: '',
        specialization: 'Clínico Geral',
        cro: '',
        isActive: true,
        workingHours: { start: '08:00', end: '17:00' },
        workingDays: ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'],
        linkedUserId: undefined,
      });
    }
  }, [dentist]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    
    if (name === 'workingHours.start' || name === 'workingHours.end') {
      const field = name.split('.')[1] as 'start' | 'end';
      setFormData(prev => ({
        ...prev,
        workingHours: {
          ...prev.workingHours,
          [field]: value,
        },
      }));
    } else if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      if (name === 'isActive') {
        setFormData(prev => ({ ...prev, isActive: checked }));
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleWorkingDayChange = (day: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      workingDays: checked
        ? [...prev.workingDays, day]
        : prev.workingDays.filter(d => d !== day),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('🦷 DEBUG - Salvando dentista:', formData);
    onSave(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
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
                {specializations.map((spec) => (
                  <option key={spec} value={spec}>
                    {spec}
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

          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Horário de Trabalho</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Início
                </label>
                <input
                  type="time"
                  name="workingHours.start"
                  value={formData.workingHours.start}
                  onChange={handleChange}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fim
                </label>
                <input
                  type="time"
                  name="workingHours.end"
                  value={formData.workingHours.end}
                  onChange={handleChange}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                />
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Dias de Trabalho</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {weekDays.map((day) => (
                <div key={day} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`day-${day}`}
                    checked={formData.workingDays.includes(day)}
                    onChange={(e) => handleWorkingDayChange(day, e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor={`day-${day}`} className="ml-2 block text-sm text-gray-700">
                    {day}
                  </label>
                </div>
              ))}
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