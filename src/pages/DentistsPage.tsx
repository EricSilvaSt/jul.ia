import React, { useState, useEffect } from 'react';
import { Plus, Search, User, CreditCard as Edit, Trash2, UserX, UserCheck } from 'lucide-react';
import DentistCard from '../components/Dentists/DentistCard';
import DentistModal from '../components/Dentists/DentistModal';
import { Dentist } from '../types';
import { useAuth } from '../hooks/useAuth';
import { buscarDentistas, criarDentista, atualizarDentista, deletarDentista, buscarEspecialidades } from '../services/dentistService';


const DentistsPage: React.FC = () => {
  const [dentists, setDentists] = useState<Dentist[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDentist, setSelectedDentist] = useState<Dentist | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterActive, setFilterActive] = useState<'all' | 'active' | 'inactive'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const { user, permissions } = useAuth();

  console.log('🦷 DEBUG - DentistsPage iniciado');
  console.log('  - user:', user);
  console.log('  - user.clinicId:', user?.clinicId);
  console.log('  - permissions:', permissions);

  // Carregar dentistas do Supabase
  useEffect(() => {
    const loadDentists = async () => {
      console.log('🦷 DEBUG - loadDentists iniciado');
      console.log('  - user.clinicId:', user?.clinicId);
      console.log('  - permissions:', permissions);
      
      if (!user?.clinicId) {
        console.log('❌ DEBUG - Sem clinicId, parando execução');
        setIsLoading(false);
        return;
      }
      
      try {
        setIsLoading(true);
        console.log('🦷 DEBUG - Chamando buscarDentistas...');
        const data = await buscarDentistas(user.clinicId);
        console.log('🦷 DEBUG - Dados retornados:', data);
        console.log('🦷 DEBUG - Processando dados para o estado...');
        
        setDentists(data.map(d => ({
          id: d.dentista_id,
          name: d.nome,
          email: d.email || '',
          phoneNumber: d.telefone || '',
          specialization: d.especialidades?.nome_especialidade || 'Não informado',
          cro: d.cro,
          isActive: d.ativo ?? true,
          createdAt: d.criado_em,
          availability: d.disponibilidade || {},
        })));
        
        console.log('🦷 DEBUG - Estado atualizado com', data.length, 'dentistas');
      } catch (error) {
        console.error('❌ DEBUG - Erro ao carregar dentistas:', error);
        console.error('❌ DEBUG - Stack trace:', error instanceof Error ? error.stack : 'No stack trace');
        setDentists([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadDentists();
  }, [user?.clinicId]);

  // Verificar se usuário tem permissão para acessar esta página
  if (!permissions.canViewAllDentists) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="bg-red-50 border border-red-200 p-8 rounded-lg shadow-md">
            <User size={64} className="mx-auto text-red-400 mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Acesso Restrito</h1>
            <p className="text-lg text-gray-600 mb-6">
              Você não tem permissão para visualizar a lista de dentistas.
            </p>
            <p className="text-gray-500">
              Esta funcionalidade está disponível apenas para administradores da clínica.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const handleEditDentist = (dentist: Dentist) => {
    setSelectedDentist(dentist);
    setIsModalOpen(true);
  };

  const handleAddDentist = () => {
    setSelectedDentist(null);
    setIsModalOpen(true);
  };

  const handleSaveDentist = async (dentistData: Omit<Dentist, 'id' | 'createdAt'>) => {
    console.log('🦷 DEBUG - handleSaveDentist chamado:', dentistData);
    
    if (!user?.clinicId) {
      alert('Erro: ID da clínica não encontrado');
      return;
    }
    
    try {
      console.log('🦷 DEBUG - Preparando dados para salvar...');
      
      // Buscar ID da especialidade pelo nome
      const especialidades = await buscarEspecialidades();
      const especialidadeEncontrada = especialidades.find(e => e.nome_especialidade === dentistData.specialization);
      const especialidadeId = especialidadeEncontrada?.id_especialidade || 1;
      
      console.log('🦷 DEBUG - Especialidade mapeada:', dentistData.specialization, '->', especialidadeId);
      
      if (selectedDentist) {
        console.log('🦷 DEBUG - Editando dentista existente:', selectedDentist.id);
        // Editar dentista existente
        await atualizarDentista(selectedDentist.id, {
          nome: dentistData.name,
          email: dentistData.email,
          telefone: dentistData.phoneNumber,
          especialidade: especialidadeId,
          cro: dentistData.cro,
          ativo: dentistData.isActive,
          disponibilidade: dentistData.availability,
        });
      } else {
        console.log('🦷 DEBUG - Criando novo dentista');
        // Adicionar novo dentista
        await criarDentista({
          nome: dentistData.name,
          email: dentistData.email,
          telefone: dentistData.phoneNumber,
          especialidade: especialidadeId,
          cro: dentistData.cro,
          ativo: dentistData.isActive,
          disponibilidade: dentistData.availability,
          clinica_id: user.clinicId,
        });
      }
      
      console.log('🦷 DEBUG - Dentista salvo, recarregando lista...');
      // Recarregar lista
      const data = await buscarDentistas(user.clinicId);
      console.log('🦷 DEBUG - Lista recarregada:', data.length, 'dentistas');
      
      setDentists(data.map(d => ({
        id: d.dentista_id,
        name: d.nome,
        email: d.email || '',
        phoneNumber: d.telefone || '',
        specialization: d.especialidades?.nome_especialidade || 'Não informado',
        cro: d.cro,
        isActive: d.ativo ?? true,
        createdAt: d.criado_em,
        availability: d.disponibilidade || {},
      })));
      
      setIsModalOpen(false);
      setSelectedDentist(null);
      console.log('🦷 DEBUG - Modal fechado, operação concluída');
      
    } catch (error) {
      console.error('Erro ao salvar dentista:', error);
      alert('Erro ao salvar dentista. Tente novamente.');
      return; // Não fechar modal em caso de erro
    }
  };

  const handleToggleActive = async (dentistId: string) => {
    try {
      // Encontrar o dentista atual
      const dentist = dentists.find(d => d.id === dentistId);
      if (!dentist) return;
      
      // Alternar status
      await atualizarDentista(dentistId, {
        ativo: !dentist.isActive
      });
      
      // Recarregar lista
      const data = await buscarDentistas(user.clinicId!);
      setDentists(data.map(d => ({
        id: d.dentista_id,
        name: d.nome,
        email: d.email || '',
        phoneNumber: d.telefone || '',
        specialization: d.especialidades?.nome_especialidade || 'Não informado',
        cro: d.cro,
        isActive: d.ativo ?? true,
        createdAt: d.criado_em,
        availability: d.disponibilidade || {},
      })));
      
    } catch (error) {
      console.error('Erro ao alterar status:', error);
      alert('Erro ao alterar status do dentista. Tente novamente.');
    }
  };

  const handleDeleteDentist = async (dentistId: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este dentista? Esta ação não pode ser desfeita.')) {
      return;
    }
    
    try {
      await deletarDentista(dentistId);
      setDentists(dentists.filter(d => d.id !== dentistId));
    } catch (error) {
      console.error('Erro ao deletar dentista:', error);
      alert('Erro ao deletar dentista. Tente novamente.');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  const filteredDentists = dentists.filter((dentist) => {
    const matchesSearch = 
      dentist.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dentist.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dentist.specialization.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dentist.cro.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter = 
      filterActive === 'all' ||
      (filterActive === 'active' && dentist.isActive) ||
      (filterActive === 'inactive' && !dentist.isActive);

    return matchesSearch && matchesFilter;
  });

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestão de Dentistas</h1>
          <p className="text-gray-600">Gerencie os profissionais da sua clínica</p>
        </div>
        <button
          onClick={handleAddDentist}
          className="mt-4 md:mt-0 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
        >
          <Plus size={20} className="mr-2" />
          Adicionar Dentista
        </button>
      </div>

      <div className="mb-6 space-y-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={20} className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Buscar dentistas por nome, email, especialização ou CRO..."
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex space-x-2">
          <button
            onClick={() => setFilterActive('all')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
              filterActive === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Todos ({dentists.length})
          </button>
          <button
            onClick={() => setFilterActive('active')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
              filterActive === 'active'
                ? 'bg-green-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Ativos ({dentists.filter(d => d.isActive).length})
          </button>
          <button
            onClick={() => setFilterActive('inactive')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
              filterActive === 'inactive'
                ? 'bg-red-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Inativos ({dentists.filter(d => !d.isActive).length})
          </button>
        </div>
      </div>

      {filteredDentists.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <User size={48} className="mx-auto text-gray-400 mb-2" />
          <p className="text-gray-500">Nenhum dentista encontrado com os filtros aplicados.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDentists.map((dentist) => (
            <DentistCard
              key={dentist.id}
              dentist={dentist}
              onEdit={handleEditDentist}
              onToggleActive={handleToggleActive}
              onDelete={handleDeleteDentist}
            />
          ))}
        </div>
      )}

      {isModalOpen && (
        <DentistModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedDentist(null);
          }}
          dentist={selectedDentist}
          onSave={handleSaveDentist}
        />
      )}
    </div>
  );
};

export default DentistsPage;