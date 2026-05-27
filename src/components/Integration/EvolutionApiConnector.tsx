import React, { useState, useEffect } from 'react';
import { MessageCircle, CheckCircle, XCircle, RefreshCw, Send } from 'lucide-react';
import { getInstanceStatus, sendWhatsAppMessage } from '../../services/evolutionApiService';

const EvolutionApiConnector: React.FC = () => {
  const [instanceStatus, setInstanceStatus] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [testMessage, setTestMessage] = useState('');
  const [testNumber, setTestNumber] = useState('');
  const [lastCheck, setLastCheck] = useState<Date | null>(null);

  const checkInstanceStatus = async () => {
    setIsLoading(true);
    try {
      const result = await getInstanceStatus();
      setInstanceStatus(result);
      setLastCheck(new Date());
    } catch (error) {
      console.error('Erro ao verificar status:', error);
      setInstanceStatus({ success: false, error: 'Erro ao conectar' });
    } finally {
      setIsLoading(false);
    }
  };

  const sendTestMessage = async () => {
    if (!testNumber || !testMessage) {
      alert('Preencha o número e a mensagem');
      return;
    }

    setIsLoading(true);
    try {
      const result = await sendWhatsAppMessage(testNumber, testMessage);
      if (result.success) {
        alert('Mensagem enviada com sucesso!');
        setTestMessage('');
        setTestNumber('');
      } else {
        alert(`Erro ao enviar: ${result.error}`);
      }
    } catch (error) {
      alert('Erro ao enviar mensagem');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkInstanceStatus();
  }, []);

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-4 bg-green-600 text-white">
        <h2 className="text-lg font-semibold flex items-center">
          <MessageCircle size={24} className="mr-2" />
          Evolution API WhatsApp Integration
        </h2>
        <p className="text-sm text-green-100">
          Instância: vendas
        </p>
      </div>

      <div className="p-6 space-y-6">
        {/* Status da Instância */}
        <div className="border rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium">Status da Instância</h3>
            <button
              onClick={checkInstanceStatus}
              disabled={isLoading}
              className="flex items-center px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              <RefreshCw size={16} className={`mr-1 ${isLoading ? 'animate-spin' : ''}`} />
              Verificar
            </button>
          </div>

          {instanceStatus ? (
            <div className="space-y-2">
              <div className="flex items-center">
                {instanceStatus.success ? (
                  <CheckCircle size={20} className="text-green-600 mr-2" />
                ) : (
                  <XCircle size={20} className="text-red-600 mr-2" />
                )}
                <span className={instanceStatus.success ? 'text-green-800' : 'text-red-800'}>
                  {instanceStatus.success ? 'Conectado' : 'Desconectado'}
                </span>
              </div>

              {instanceStatus.data && (
                <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                  <pre>{JSON.stringify(instanceStatus.data, null, 2)}</pre>
                </div>
              )}

              {instanceStatus.error && (
                <div className="text-sm text-red-600 bg-red-50 p-3 rounded">
                  Erro: {instanceStatus.error}
                </div>
              )}

              {lastCheck && (
                <div className="text-xs text-gray-500">
                  Última verificação: {lastCheck.toLocaleString('pt-BR')}
                </div>
              )}
            </div>
          ) : (
            <div className="text-gray-500">Verificando status...</div>
          )}
        </div>

        {/* Configurações da API */}
        <div className="border rounded-lg p-4">
          <h3 className="font-medium mb-3">Configurações</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Instância:</span>
              <div className="font-mono">vendas</div>
            </div>
            <div>
              <span className="text-gray-500">API Version:</span>
              <div className="font-mono text-xs">Evolution API v2</div>
            </div>
            <div>
              <span className="text-gray-500">Status:</span>
              <div className="font-mono">Configurado via ENV</div>
            </div>
            <div>
              <span className="text-gray-500">Provider:</span>
              <div className="font-mono">Evolution API</div>
            </div>
          </div>
        </div>

        {/* Teste de Mensagem */}
        <div className="border rounded-lg p-4">
          <h3 className="font-medium mb-3">Teste de Mensagem</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Número (com código do país)
              </label>
              <input
                type="text"
                value={testNumber}
                onChange={(e) => setTestNumber(e.target.value)}
                placeholder="5571999999999"
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mensagem
              </label>
              <textarea
                value={testMessage}
                onChange={(e) => setTestMessage(e.target.value)}
                placeholder="Digite sua mensagem de teste..."
                rows={3}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
              />
            </div>
            <button
              onClick={sendTestMessage}
              disabled={isLoading || !testNumber || !testMessage}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
            >
              <Send size={16} className="mr-2" />
              Enviar Teste
            </button>
          </div>
        </div>

        {/* Webhook Info */}
        <div className="border rounded-lg p-4 bg-blue-50">
          <h3 className="font-medium mb-2">Configuração do Webhook</h3>
          <p className="text-sm text-gray-600 mb-2">
            Configure este endpoint no seu painel da Evolution API:
          </p>
          <div className="bg-white p-2 rounded border font-mono text-sm">
            https://seu-dominio.com/api/webhook/evolution-api
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Este webhook receberá as mensagens do WhatsApp automaticamente
          </p>
        </div>
      </div>
    </div>
  );
};

export default EvolutionApiConnector;
