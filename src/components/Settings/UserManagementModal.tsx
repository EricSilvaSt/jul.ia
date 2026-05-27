import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { buscarProfissionais } from '../../services/professionalService';
import { useAuth } from '../../hooks/useAuth';

interface Usuario {
  usuario_id: string;
  nome: string;
  email?: string;
  tipo_usuario: 'admin' | 'dentist';
  ativo: boolean;
  criado_em: string;
  dentista_id?: string;
  senha?: string;
}

interface UserManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  user?: Usuario | null;
  onSave: (user: any) => void;
}

const UserManagementModal: React.FC<UserManagementModalProps> = ({
  isOpen,
  onClose,
  user,
  onSave,
}) => {
  const { user: currentUser } = useAuth();
  const [availableProfessionals, setAvailableProfessionals] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    nome: '',
    email: undefined as string | undefined,
    tipo_usuario: 'dentist' as 'admin' | 'dentist',
    ativo: true,
    dentista_id: undefined as string | undefined,
    senha: '',
  });

  useEffect(() => {
    const loadProfessionals = async () => {
      if (!currentUser?.clinicId || currentUser.clinicId === 'test-clinic-id') return;

      try {
        const profissionais = await buscarProfissionais(currentUser.clinicId);
        setAvailableProfessionals(profissionais);
      } catch (error) {
        console.error('Erro ao carregar profissionais:', error);
      }
    };

    if (isOpen) {
      loadProfessionals();
    }
  }, [isOpen, currentUser?.clinicId]);

  useEffect(() => {
    if (user) {
      setFormData({
        nome: user.nome,
        email: user.email,
        tipo_usuario: user.tipo_usuario,
        ativo: user.ativo,
        dentista_id: user.dentista_id,
        senha: '',
      });
    } else {
      setFormData({
        nome: '',
        email: undefined,
        tipo_usuario: 'dentist',
        ativo: true,
        dentista_id: undefined,
        senha: '',
      });
    }
  }, [user]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, ativo: checked }));
    } else if (name === 'tipo_usuario') {
      setFormData(prev => ({
        ...prev,
        tipo_usuario: value as 'admin' | 'dentist',
        dentista_id: value === 'admin' ? undefined : prev.dentista_id,
        email: value === 'dentist' ? undefined : prev.email,
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value || undefined }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-800">
            {user ? 'Editar Usuário' : 'Novo Usuário'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 focus:outline-none"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nome Completo *
            </label>
            <input
              type="text"
              name="nome"
              value={formData.nome}
              onChange={handleChange}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de Usuário *
            </label>
            <select
              name="tipo_usuario"
              value={formData.tipo_usuario}
              onChange={handleChange}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
              required
            >
              <option value="admin">Administrador</option>
              <option value="dentist">Usuário</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">
              {formData.tipo_usuario === 'admin'
                ? 'Acesso completo ao sistema. Login com email + senha.'
                : 'Acesso somente aos próprios compromissos. Login com identificador + senha.'}
            </p>
          </div>

          {formData.tipo_usuario === 'admin' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email * <span className="text-gray-400 font-normal">(obrigatório para administradores)</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email || ''}
                onChange={handleChange}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                required={formData.tipo_usuario === 'admin'}
              />
            </div>
          )}

          {formData.tipo_usuario === 'dentist' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Vincular ao Profissional
              </label>
              <select
                name="dentista_id"
                value={formData.dentista_id || ''}
                onChange={handleChange}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
              >
                <option value="">Selecione um profissional</option>
                {availableProfessionals.map((prof) => (
                  <option key={prof.dentista_id} value={prof.dentista_id}>
                    {prof.nome} {prof.cro ? `(${prof.cro})` : ''}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                O usuário terá acesso apenas aos compromissos do profissional vinculado.
              </p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Senha *
            </label>
            <input
              type="password"
              name="senha"
              value={formData.senha || ''}
              onChange={handleChange}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
              required={!user}
              placeholder={user ? 'Deixe em branco para manter a senha atual' : 'Digite a senha'}
            />
            {user && (
              <p className="text-xs text-gray-500 mt-1">
                Deixe em branco para manter a senha atual
              </p>
            )}
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              name="ativo"
              checked={formData.ativo}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label className="ml-2 block text-sm text-gray-700">
              Usuário ativo
            </label>
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
              {user ? 'Atualizar' : 'Criar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserManagementModal;
