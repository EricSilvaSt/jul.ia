import React from 'react';
import { User, Clock, Phone, Mail, CreditCard as Edit, Trash2, UserX, UserCheck, Badge } from 'lucide-react';
import { Dentist } from '../../types';

interface ProfessionalCardProps {
  dentist: Dentist;
  onEdit: (dentist: Dentist) => void;
  onToggleActive: (professionalId: string) => void;
  onDelete: (professionalId: string) => void;
}

const ProfessionalCard: React.FC<ProfessionalCardProps> = ({
  dentist,
  onEdit,
  onToggleActive,
  onDelete
}) => {
  return (
    <div className={`bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg ${
      !dentist.isActive ? 'opacity-75 border-l-4 border-red-400' : 'border-l-4 border-green-400'
    }`}>
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className={`rounded-full p-3 mr-4 ${
              dentist.isActive ? 'bg-blue-100' : 'bg-gray-100'
            }`}>
              <User size={24} className={dentist.isActive ? 'text-blue-600' : 'text-gray-400'} />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Prof. {dentist.name}</h3>
              <p className="text-sm text-gray-600">{dentist.specialization}</p>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            {dentist.isActive ? (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                <UserCheck size={12} className="mr-1" />
                Ativo
              </span>
            ) : (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                <UserX size={12} className="mr-1" />
                Inativo
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="p-4 space-y-3">
        <div className="flex items-center text-sm">
          <Mail size={16} className="text-gray-500 mr-2" />
          <span>{dentist.email}</span>
        </div>

        <div className="flex items-center text-sm">
          <Phone size={16} className="text-gray-500 mr-2" />
          <span>{dentist.phoneNumber}</span>
        </div>

        <div className="flex items-center text-sm">
          <Badge size={16} className="text-gray-500 mr-2" />
          <span>{dentist.cro}</span>
        </div>

        <div className="text-sm">
          <span className="text-gray-500 flex items-center mb-1">
            <Clock size={16} className="mr-1" />
            Disponibilidade:
          </span>
          <div className="text-xs space-y-1">
            {Object.keys(dentist.availability).length > 0 ? (
              Object.entries(dentist.availability).map(([day, schedule]) => (
                <div key={day} className="flex justify-between">
                  <span className="capitalize">{day}:</span>
                  <span>{schedule.inicio} - {schedule.fim}</span>
                </div>
              ))
            ) : (
              <span className="text-gray-400">Horários não definidos</span>
            )}
          </div>
        </div>

      </div>

      <div className="p-4 bg-gray-50 border-t border-gray-200">
        <div className="flex space-x-2">
          <button
            onClick={() => onEdit(dentist)}
            className="flex-1 flex items-center justify-center py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors duration-200 text-sm"
          >
            <Edit size={16} className="mr-1" />
            Editar
          </button>
          <button
            onClick={() => onToggleActive(dentist.id)}
            className={`flex-1 flex items-center justify-center py-2 px-3 rounded-md transition-colors duration-200 text-sm ${
              dentist.isActive
                ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
                : 'bg-green-600 hover:bg-green-700 text-white'
            }`}
          >
            {dentist.isActive ? (
              <>
                <UserX size={16} className="mr-1" />
                Desativar
              </>
            ) : (
              <>
                <UserCheck size={16} className="mr-1" />
                Ativar
              </>
            )}
          </button>
          <button
            onClick={() => onDelete(dentist.id)}
            className="flex items-center justify-center py-2 px-3 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors duration-200 text-sm"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfessionalCard;