import React, { useState, useEffect } from 'react';
import { Plus, CreditCard as Edit, Trash2, UserCheck, UserX, Crown } from 'lucide-react';
import { CalendarIntegration } from '../types';
import CalendarConnector from '../components/Integration/CalendarConnector';
import UserManagementModal from '../components/Settings/UserManagementModal';
import { useAuth } from '../hooks/useAuth';
import { buscarUsuarios, criarUsuario, atualizarUsuario, deletarUsuario, alternarStatusUsuario } from '../services/userService';
import { buscarClinicaCompleta } from '../services/clinicService';

// Dados simulados para integrações
const mockIntegrations: CalendarIntegration[] = [
  {
    provider: 'google',
    connected: false,
  },
  {
    provider: 'microsoft',
    connected: false,
  },
];

const SettingsPage: React.FC = () => {
  const { user, clinic } = useAuth();
  const [integrations, setIntegrations] = useState<CalendarIntegration[]>(mockIntegrations);
  const [users, setUsers] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'general' | 'integrations' | 'notifications' | 'users'>('general');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [clinicData, setClinicData] = useState<any>(null);
  const { permissions } = useAuth();

  // Carregar dados da clínica
  const loadClinicData = async () => {
    console.log('⚙️ DEBUG - loadClinicData iniciado');
    console.log('  - user.clinicId:', user?.clinicId);
    
    if (!user?.clinicId) {
      console.log('❌ DEBUG - Sem clinicId, parando execução');
      setClinicData(null);
      return;
    }
    
    try {
      console.log('⚙️ DEBUG - Chamando buscarClinicaCompleta...');
      const data = await buscarClinicaCompleta(user.clinicId);
      console.log('⚙️ DEBUG - Dados da clínica retornados:', data);
      setClinicData(data);
    } catch (error) {
      console.error('❌ DEBUG - Erro ao carregar dados da clínica:', error);
      // Em caso de erro, usar dados básicos da clínica do contexto
      setClinicData(clinic);
    }
  };

  // Carregar usuários da clínica
  const loadUsers = async () => {
    console.log('👥 DEBUG - loadUsers iniciado');
    console.log('  - user.clinicId:', user?.clinicId);
    
    if (!user?.clinicId) {
      console.log('❌ DEBUG - Sem clinicId, parando execução');
      setUsers([]);
      return;
    }
    
    try {
      setIsLoading(true);
      console.log('👥 DEBUG - Chamando buscarUsuarios...');
      const userData = await buscarUsuarios(user.clinicId);
      console.log('👥 DEBUG - Dados de usuários retornados:', userData);
      setUsers(userData);
    } catch (error) {
      console.error('❌ DEBUG - Erro ao carregar usuários:', error);
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadClinicData();
    loadUsers();
  }, [user?.clinicId]);

  const handleConnect = (provider: 'google' | 'microsoft') => {
    // Em uma aplicação real, isso redirecionaria para o fluxo OAuth
    setIntegrations(
      integrations.map((integration) =>
        integration.provider === provider
          ? { ...integration, connected: true, lastSynced: new Date().toISOString() }
          : integration
      )
    );
  };

  const handleDisconnect = (provider: 'google' | 'microsoft') => {
    setIntegrations(
      integrations.map((integration) =>
        integration.provider === provider
          ? { ...integration, connected: false, lastSynced: undefined }
          : integration
      )
    );
  };

  const handleAddUser = () => {
    setSelectedUser(null);
    setIsUserModalOpen(true);
  };

  const handleEditUser = (user: any) => {
    setSelectedUser(user);
    setIsUserModalOpen(true);
  };

  const handleToggleUserActive = (userId: string) => {
    alternarStatusUsuario(userId)
      .then(() => loadUsers())
      .catch(error => {
        console.error('Erro ao alterar status:', error);
        alert('Erro ao alterar status do usuário');
      });
  };

  const handleDeleteUser = (userId: string) => {
    if (window.confirm('Tem certeza que deseja excluir este usuário? Esta ação não pode ser desfeita.')) {
      deletarUsuario(userId)
        .then(() => loadUsers())
        .catch(error => {
          console.error('Erro ao deletar usuário:', error);
          alert('Erro ao deletar usuário');
        });
    }
  };

  const handleSaveUser = async (userData: any) => {
    if (!user?.clinicId) {
      alert('Erro: ID da clínica não encontrado');
      return;
    }
    
    try {
      if (selectedUser) {
        await atualizarUsuario(selectedUser.usuario_id, userData);
      } else {
        await criarUsuario({ ...userData, clinica_id: user.clinicId });
      }
      await loadUsers();
      setIsUserModalOpen(false);
      setSelectedUser(null);
    } catch (error) {
      console.error('Erro ao salvar usuário:', error);
      alert('Erro ao salvar usuário');
    }
  };

  // Usar dados da clínica do Supabase ou fallback para dados do contexto
  const displayClinic = clinicData || clinic;

  if (!displayClinic) {
    return <div>Carregando...</div>;
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Configurações</h1>
        <p className="text-gray-600">Gerencie as configurações e preferências da sua clínica</p>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('general')}
              className={`px-6 py-4 text-sm font-medium ${
                activeTab === 'general'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Geral
            </button>
            <button
              onClick={() => setActiveTab('integrations')}
              className={`px-6 py-4 text-sm font-medium ${
                activeTab === 'integrations'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Integrações
            </button>
            <button
              onClick={() => setActiveTab('notifications')}
              className={`px-6 py-4 text-sm font-medium ${
                activeTab === 'notifications'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Notificações
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`px-6 py-4 text-sm font-medium ${
                activeTab === 'users'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              disabled={!permissions.canManageUsers}
            >
              Usuários e Permissões
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'general' && (
            <div className="space-y-6">
              <h2 className="text-lg font-medium text-gray-900">Informações da Clínica</h2>
              
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
                <div className="flex">
                  <div className="ml-3">
                    <p className="text-sm text-blue-700">
                      <strong>Informação:</strong> Os dados da clínica são gerenciados pelo administrador da plataforma. 
                      Para alterações, entre em contato com o suporte.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Nome Fantasia
                  </label>
                  <input
                    type="text"
                    name="nome_fantasia"
                    value={displayClinic.nome_fantasia || ''}
                    readOnly
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Razão Social
                  </label>
                  <input
                    type="text"
                    name="razao_social"
                    value={displayClinic?.razao_social || 'Não informado'}
                    readOnly
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={displayClinic.email || ''}
                    readOnly
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    CNPJ
                  </label>
                  <input
                    type="text"
                    name="cnpj"
                    value={displayClinic?.cnpj || 'Não informado'}
                    readOnly
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Telefone de Contato
                  </label>
                  <input
                    type="tel"
                    name="telefone_contato"
                    value={displayClinic.telefone_contato || ''}
                    readOnly
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Telefone da Júl.IA
                  </label>
                  <input
                    type="tel"
                    name="telefone_julia"
                    value={displayClinic.telefone_julia || 'Não configurado'}
                    readOnly
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 bg-gray-50"
                  />
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Endereço</h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Endereço
                    </label>
                    <input
                      type="text"
                      name="endereco"
                      value={displayClinic?.endereco || 'Não informado'}
                      readOnly
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 bg-gray-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Número
                    </label>
                    <input
                      type="text"
                      name="numero"
                      value={displayClinic?.numero || 'S/N'}
                      readOnly
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 bg-gray-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Complemento
                    </label>
                    <input
                      type="text"
                      name="complemento"
                      value={displayClinic?.complemento || 'Não informado'}
                      readOnly
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 bg-gray-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Bairro
                    </label>
                    <input
                      type="text"
                      name="bairro"
                      value={displayClinic?.bairro || 'Não informado'}
                      readOnly
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 bg-gray-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Cidade
                    </label>
                    <input
                      type="text"
                      name="cidade"
                      value={displayClinic?.cidade || 'Não informado'}
                      readOnly
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 bg-gray-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Estado
                    </label>
                    <input
                      type="text"
                      name="estado"
                      value={displayClinic?.estado || 'Não informado'}
                      readOnly
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 bg-gray-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      CEP
                    </label>
                    <input
                      type="text"
                      name="cep"
                      value={displayClinic?.cep || 'Não informado'}
                      readOnly
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 bg-gray-50"
                    />
                  </div>
                </div>
              </div>

              {displayClinic?.convenios && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Convênios Aceitos</h3>
                  <div className="bg-gray-50 p-4 rounded-md">
                    <div className="flex flex-wrap gap-2">
                      {Array.isArray(displayClinic?.convenios) ? (
                        displayClinic?.convenios.map((convenio: string, index: number) => (
                          <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                            {convenio}
                          </span>
                        ))
                      ) : (
                        <span className="text-sm text-gray-600">Nenhum convênio configurado</span>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="pt-5 border-t border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Alterar Senha</h3>
                <form className="space-y-4 max-w-md">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Senha Atual
                    </label>
                    <input
                      type="password"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                      placeholder="Digite sua senha atual"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Nova Senha
                    </label>
                    <input
                      type="password"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                      placeholder="Digite a nova senha"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Confirmar Nova Senha
                    </label>
                    <input
                      type="password"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                      placeholder="Confirme a nova senha"
                    />
                  </div>
                  <div className="flex justify-start">
                    <button
                      type="submit"
                      className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Alterar Senha
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {activeTab === 'integrations' && (
            <CalendarConnector
              integrations={integrations}
              onConnect={handleConnect}
              onDisconnect={handleDisconnect}
            />
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <h2 className="text-lg font-medium text-gray-900">Configurações de Notificação</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-md font-medium text-gray-700 mb-2">Notificações por Email</h3>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <input
                        id="email-appointments"
                        type="checkbox"
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        defaultChecked
                      />
                      <label htmlFor="email-appointments" className="ml-2 block text-sm text-gray-700">
                        Notificações de novas consultas
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        id="email-cancellations"
                        type="checkbox"
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        defaultChecked
                      />
                      <label htmlFor="email-cancellations" className="ml-2 block text-sm text-gray-700">
                        Cancelamentos de consultas
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        id="email-reminders"
                        type="checkbox"
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        defaultChecked
                      />
                      <label htmlFor="email-reminders" className="ml-2 block text-sm text-gray-700">
                        Lembretes diários da agenda
                      </label>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-md font-medium text-gray-700 mb-2">Notificações por SMS</h3>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <input
                        id="sms-patient-reminder"
                        type="checkbox"
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        defaultChecked
                      />
                      <label htmlFor="sms-patient-reminder" className="ml-2 block text-sm text-gray-700">
                        Enviar lembretes de consulta para pacientes
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        id="sms-confirmation"
                        type="checkbox"
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        defaultChecked
                      />
                      <label htmlFor="sms-confirmation" className="ml-2 block text-sm text-gray-700">
                        Solicitar confirmações de consulta
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-5 border-t border-gray-200">
                <div className="flex justify-end">
                  <button
                    type="button"
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="ml-3 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Salvar
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <>
              {!permissions.canManageUsers ? (
                <div className="text-center py-8">
                  <UserCheck size={48} className="mx-auto text-gray-400 mb-2" />
                  <p className="text-gray-500">Você não tem permissão para gerenciar usuários.</p>
                </div>
              ) : (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-medium text-gray-900">Usuários e Permissões</h2>
                  <p className="text-sm text-gray-500">
                    Gerencie contas de usuário e permissões para a equipe da sua clínica.
                  </p>
                </div>
                <button
                  onClick={handleAddUser}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <Plus size={16} className="mr-2" />
                  Novo Usuário
                </button>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Nome
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Login
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Função
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Criado em
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.map((user) => (
                      <tr key={user.usuario_id} className={!user.ativo ? 'opacity-60' : ''}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{user.nome}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            {user.tipo_usuario === 'admin' ? user.email : user.dentistas?.cro || 'CRO não definido'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            user.tipo_usuario === 'admin' 
                              ? 'bg-purple-100 text-purple-800' 
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {user.tipo_usuario === 'admin' ? 'Administrador' : 'Dentista'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            user.ativo 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {user.ativo ? 'Ativo' : 'Inativo'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(user.criado_em).toLocaleDateString('pt-BR')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className="flex space-x-2">
                            <button 
                              onClick={() => handleEditUser(user)}
                              className="text-blue-600 hover:text-blue-800"
                              title="Editar usuário"
                            >
                              <Edit size={16} />
                            </button>
                            <button 
                              onClick={() => handleToggleUserActive(user.usuario_id)}
                              className={user.ativo ? 'text-yellow-600 hover:text-yellow-800' : 'text-green-600 hover:text-green-800'}
                              title={user.ativo ? 'Desativar usuário' : 'Ativar usuário'}
                            >
                              {user.ativo ? <UserX size={16} /> : <UserCheck size={16} />}
                            </button>
                            <button 
                              onClick={() => handleDeleteUser(user.usuario_id)}
                              className="text-red-600 hover:text-red-800"
                              title="Excluir usuário"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {users.length === 0 && (
                <div className="text-center py-8">
                  <UserCheck size={48} className="mx-auto text-gray-400 mb-2" />
                  <p className="text-gray-500">Nenhum usuário encontrado.</p>
                </div>
              )}
            </div>
              )}
            </>
          )}
        </div>
      </div>

      {isUserModalOpen && (
        <UserManagementModal
          isOpen={isUserModalOpen}
          onClose={() => {
            setIsUserModalOpen(false);
            setSelectedUser(null);
          }}
          user={selectedUser}
          onSave={handleSaveUser}
        />
      )}
    </div>
  );
};

export default SettingsPage;