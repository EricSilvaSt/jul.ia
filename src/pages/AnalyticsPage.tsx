import React from 'react';
import { BarChart2, TrendingUp, Users, Calendar, Crown, ArrowRight } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { hasPremiumAccess } from '../services/authService';

const AnalyticsPage: React.FC = () => {
  const { clinic } = useAuth();
  
  const hasAccess = clinic ? hasPremiumAccess(clinic.plano) : false;

  if (!hasAccess) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="bg-gradient-to-r from-yellow-100 to-orange-100 p-8 rounded-lg shadow-md">
            <Crown size={64} className="mx-auto text-yellow-500 mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Relatórios Avançados</h1>
            <p className="text-lg text-gray-600 mb-6">
              Desbloqueie insights poderosos para sua clínica
            </p>
            
            <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Plano Atual: {clinic?.plano.nome || 'Básico'}
              </h2>
              <p className="text-gray-600 mb-4">
                Para acessar relatórios detalhados e análises avançadas, 
                faça upgrade para o <strong>Plano Premium</strong> ou superior.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-white p-6 rounded-lg shadow-sm text-left">
                <div className="flex items-center mb-3">
                  <BarChart2 size={24} className="text-blue-600 mr-2" />
                  <h3 className="font-semibold text-gray-800">Relatórios Detalhados</h3>
                </div>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• Análise de receita mensal e anual</li>
                  <li>• Relatórios de produtividade por dentista</li>
                  <li>• Estatísticas de cancelamentos</li>
                  <li>• Análise de horários de pico</li>
                </ul>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm text-left">
                <div className="flex items-center mb-3">
                  <TrendingUp size={24} className="text-green-600 mr-2" />
                  <h3 className="font-semibold text-gray-800">Insights Avançados</h3>
                </div>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• Previsões de demanda</li>
                  <li>• Análise de satisfação do paciente</li>
                  <li>• Comparativos de performance</li>
                  <li>• Relatórios personalizáveis</li>
                </ul>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm text-left">
                <div className="flex items-center mb-3">
                  <Users size={24} className="text-purple-600 mr-2" />
                  <h3 className="font-semibold text-gray-800">Gestão de Equipe</h3>
                </div>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• Relatórios de produtividade individual</li>
                  <li>• Análise de utilização de agenda</li>
                  <li>• Métricas de eficiência</li>
                  <li>• Comparativos de performance</li>
                </ul>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm text-left">
                <div className="flex items-center mb-3">
                  <Calendar size={24} className="text-indigo-600 mr-2" />
                  <h3 className="font-semibold text-gray-800">Otimização de Agenda</h3>
                </div>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• Análise de slots vazios</li>
                  <li>• Sugestões de otimização</li>
                  <li>• Relatórios de ocupação</li>
                  <li>• Previsões de demanda</li>
                </ul>
              </div>
            </div>

            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-lg">
              <h3 className="text-xl font-semibold mb-2">Pronto para fazer upgrade?</h3>
              <p className="mb-4">
                Desbloqueie todo o potencial da sua clínica com relatórios avançados e muito mais.
              </p>
              <button className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors duration-200 flex items-center mx-auto">
                Fazer Upgrade para Premium
                <ArrowRight size={20} className="ml-2" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Conteúdo dos relatórios para usuários Premium
  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center">
          <Crown size={24} className="text-yellow-500 mr-2" />
          <h1 className="text-2xl font-bold text-gray-900">Relatórios Avançados</h1>
          <span className="ml-3 px-3 py-1 bg-yellow-100 text-yellow-800 text-sm font-medium rounded-full">
            Premium
          </span>
        </div>
        <p className="text-gray-600">Análises detalhadas e insights para sua clínica</p>
      </div>

      {/* Conteúdo dos relatórios seria implementado aqui */}
      <div className="bg-white p-8 rounded-lg shadow-md text-center">
        <BarChart2 size={48} className="mx-auto text-gray-400 mb-4" />
        <h2 className="text-xl font-semibold text-gray-800 mb-2">
          Relatórios em Desenvolvimento
        </h2>
        <p className="text-gray-600">
          Os relatórios avançados estão sendo desenvolvidos e estarão disponíveis em breve.
        </p>
      </div>
    </div>
  );
};

export default AnalyticsPage;