import React, { useState, useEffect } from 'react';
import { Plus, Search, User, CreditCard as Edit, Trash2, UserX, UserCheck } from 'lucide-react';
import ProfessionalCard from '../components/Professionals/ProfessionalCard';
import ProfessionalModal from '../components/Professionals/ProfessionalModal';
import { Dentist } from '../types';
import { useAuth } from '../hooks/useAuth';
import { buscarProfissionais, criarProfissional, atualizarProfissional, deletarProfissional, buscarAreasAtuacao } from '../services/professionalService';

const ProfessionalsPage: React.FC = () => {
  const [professionals, setProfessionals] = useState<Dentist[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProfessional, setSelectedProfessional] = useState<Dentist | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterActive, setFilterActive] = useState<'all' | 'active' | 'inactive'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const { user, permissions } = useAuth();

  console.log('DEBUG - ProfessionalsPage iniciado');
  console.log('  - user:', user);
  console.log('  - user.clinicId:', user?.clinicId);
  console.log('  - permissions:', permissions);

  // Carregar profissionais do Supabase
  useEffect(() => {
    const loadProfessionals = async () => {
      console.log('DEBUG - loadProfessionals iniciado');
      console.log('  - user.clinicId:', user?.clinicId);
      console.log('  - permissions:', permissions);
      
      if (!user?.clinicId) {
        console.log('❌ DEBUG - Sem clinicId, parando execução');
        setIsLoading(false);
        return;
      }
      
      try {
        setIsLoading(true);
        console.log('DEBUG - Chamando buscarProfissionais...');
        const data = await buscarProfissionais(user.clinicId);
        console.log('DEBUG - Dados retornados:', data);
        console.log('DEBUG - Processando dados para o estado...');
        
        setProfessionals(data.map(d => ({
          id: d.dentista_id,
          name: d.nome,
          email: d.email || 'Não informado',
          phoneNumber: d.telefone || 'Não informado',
          specialization: d.especialidades?.nome_especialidade || 'Não informado',
          cro: d.cro,
          isActive: d.ativo ?? true,
          createdAt: d.criado_em,
          availability: d.disponibilidade || {},
        })));
        
        console.log('DEBUG - Estado atualizado com', data.length, 'profissionais');
        console.log('DEBUG - Profissionais processados:', data.map(d => ({ id: d.dentista_id, nome: d.nome, clinica_id: d.clinica_id })));
      } catch (error) {
        console.error('❌ DEBUG - Erro ao carregar profissionais:', error);
        console.error('❌ DEBUG - Stack trace:', error instanceof Error ? error.stack : 'No stack trace');
        setProfessionals([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadProfessionals();
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
              Você não tem permissão para visualizar a lista de profissionais.
            </p>
            <p className="text-gray-500">
              Esta funcionalidade está disponível apenas para administradores da organização.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const handleEditProfessional = (professional: Dentist) => {
    setSelectedProfessional(professional);
    setIsModalOpen(true);
  };

  const handleAddProfessional = () => {
    setSelectedProfessional(null);
    setIsModalOpen(true);
  };

  const handleSaveProfessional = async (professionalData: Omit<Dentist, 'id' | 'createdAt'>) => {
    console.log('DEBUG - handleSaveProfessional chamado:', professionalData);
    
    if (!user?.clinicId) {
      alert('Erro: ID da organização não encontrado');
      return;
    }
    
    try {
      console.log('DEBUG - Preparando dados para salvar...');
      
      // Buscar ID da área de atuação pelo nome
      const areasAtuacao = await buscarAreasAtuacao();
      const areaEncontrada = areasAtuacao.find(e => e.nome_especialidade === professionalData.specialization);
      const areaId = areaEncontrada?.id_especialidade || 1;
      
      console.log('DEBUG - Área de atuação mapeada:', professionalData.specialization, '->', areaId);
      
      if (selectedProfessional) {
        console.log('DEBUG - Editando profissional existente:', selectedProfessional.id);
        // Editar profissional existente
        await atualizarProfissional(selectedProfessional.id, {
          nome: professionalData.name,
          email: professionalData.email,
          telefone: professionalData.phoneNumber,
          especialidade: areaId,
          cro: professionalData.cro,
          ativo: professionalData.isActive,
          disponibilidade: professionalData.availability,
        });
      } else {
        console.log('DEBUG - Criando novo profissional');
        // Adicionar novo profissional
        await criarProfissional({
          nome: professionalData.name,
          email: professionalData.email,
          telefone: professionalData.phoneNumber,
          especialidade: areaId,
          cro: professionalData.cro,
          ativo: professionalData.isActive,
          disponibilidade: professionalData.availability,
          clinica_id: user.clinicId,
        });
      }
      
      console.log('DEBUG - Profissional salvo, recarregando lista...');
      // Recarregar lista
      const data = await buscarProfissionais(user.clinicId);
      console.log('DEBUG - Lista recarregada:', data.length, 'profissionais');
      console.log('DEBUG - Dados recarregados:', data.map(d => ({ id: d.dentista_id, nome: d.nome })));
      
      setProfessionals(data.map(d => ({
        id: d.dentista_id,
        name: d.nome,
        email: d.email || 'Não informado',
        phoneNumber: d.telefone || 'Não informado',
        specialization: d.especialidades?.nome_especialidade || 'Não informado',
        cro: d.cro,
        isActive: d.ativo ?? true,
        createdAt: d.criado_em,
        availability: d.disponibilidade || {},
      })));
      
      setIsModalOpen(false);
      setSelectedProfessional(null);
      console.log('DEBUG - Modal fechado, operação concluída');
      
    } catch (error) {
      console.error('Erro ao salvar profissional:', error);
      alert('Erro ao salvar profissional. Tente novamente.');
    }
  };

  const handleToggleActive = async (professionalId: string) => {
    try {
      // Encontrar o profissional atual
      const professional = professionals.find(d => d.id === professionalId);
      if (!professional) return;
      
      // Alternar status
      await atualizarProfissional(professionalId, {
        ativo: !professional.isActive
      });
      
      // Recarregar lista
      const data = await buscarProfissionais(user.clinicId!);
      setProfessionals(data.map(d => ({
        id: d.dentista_id,
        name: d.nome,
        email: d.email || 'Não informado',
        phoneNumber: d.telefone || 'Não informado',
        specialization: d.especialidades?.nome_especialidade || 'Não informado',
        cro: d.cro,
        isActive: d.ativo ?? true,
        createdAt: d.criado_em,
        availability: d.disponibilidade || {},
      })));
      
    } catch (error) {
      console.error('Erro ao alterar status:', error);
      alert('Erro ao alterar status do profissional. Tente novamente.');
    }
  };

  const handleDeleteProfessional = async (professionalId: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este profissional? Esta ação não pode ser desfeita.')) {
      return;
    }
    
    try {
      await deletarProfissional(professionalId);
      setProfessionals(professionals.filter(d => d.id !== professionalId));
      alert('Profissional deletado com sucesso!');
    } catch (error) {
      console.error('Erro ao deletar profissional:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido ao deletar profissional';
      alert(errorMessage);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const filteredProfessionals = professionals.filter((professional) => {
    const matchesSearch =
      professional.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      professional.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      professional.specialization.toLowerCase().includes(searchTerm.toLowerCase()) ||
      professional.cro.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter =
      filterActive === 'all' ||
      (filterActive === 'active' && professional.isActive) ||
      (filterActive === 'inactive' && !professional.isActive);

    return matchesSearch && matchesFilter;
  });

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestão de Profissionais</h1>
          <p className="text-gray-600">Gerencie os profissionais da sua organização</p>
        </div>
        <button
          onClick={handleAddProfessional}
          className="mt-4 md:mt-0 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
        >
          <Plus size={20} className="mr-2" />
          Adicionar Profissional
        </button>
      </div>

      <div className="mb-6 space-y-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={20} className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Buscar profissionais por nome, email, área de atuação ou identificador..."
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
            Todos ({professionals.length})
          </button>
          <button
            onClick={() => setFilterActive('active')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
              filterActive === 'active'
                ? 'bg-green-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Ativos ({professionals.filter(d => d.isActive).length})
          </button>
          <button
            onClick={() => setFilterActive('inactive')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
              filterActive === 'inactive'
                ? 'bg-red-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Inativos ({professionals.filter(d => !d.isActive).length})
          </button>
        </div>
      </div>

      {filteredProfessionals.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <User size={48} className="mx-auto text-gray-400 mb-2" />
          <p className="text-gray-500">Nenhum profissional encontrado com os filtros aplicados.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProfessionals.map((professional) => (
            <ProfessionalCard
              key={professional.id}
              dentist={professional}
              onEdit={handleEditProfessional}
              onToggleActive={handleToggleActive}
              onDelete={handleDeleteProfessional}
            />
          ))}
        </div>
      )}

      {isModalOpen && (
        <ProfessionalModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedProfessional(null);
          }}
          dentist={selectedProfessional}
          onSave={handleSaveProfessional}
        />
      )}
    </div>
  );
};

export default ProfessionalsPage;