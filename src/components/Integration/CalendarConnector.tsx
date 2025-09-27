import React, { useState } from 'react';
import { CalendarDays, ExternalLink, Check, X } from 'lucide-react';
import { CalendarIntegration } from '../../types';

interface CalendarConnectorProps {
  integrations: CalendarIntegration[];
  onConnect: (provider: 'google' | 'microsoft') => void;
  onDisconnect: (provider: 'google' | 'microsoft') => void;
}

const CalendarConnector: React.FC<CalendarConnectorProps> = ({
  integrations,
  onConnect,
  onDisconnect,
}) => {
  const googleIntegration = integrations.find((i) => i.provider === 'google');
  const microsoftIntegration = integrations.find((i) => i.provider === 'microsoft');

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-4 bg-blue-600 text-white">
        <h2 className="text-lg font-semibold">Integrações de Calendário</h2>
        <p className="text-sm text-blue-100">
          Conecte seus calendários para sincronizar consultas
        </p>
      </div>

      <div className="p-6 space-y-6">
        {/* Google Calendar */}
        <div className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center">
            <div className="bg-red-100 p-3 rounded-full mr-4">
              <CalendarDays size={24} className="text-red-600" />
            </div>
            <div>
              <h3 className="font-medium">Google Calendar</h3>
              <p className="text-sm text-gray-500">
                Sincronize consultas com seu Google Calendar
              </p>
            </div>
          </div>
          {googleIntegration?.connected ? (
            <div className="flex items-center">
              <span className="flex items-center text-green-600 mr-4">
                <Check size={16} className="mr-1" />
                Conectado
              </span>
              <button
                onClick={() => onDisconnect('google')}
                className="px-3 py-1 border border-red-300 text-red-600 rounded-md hover:bg-red-50 transition-colors duration-200"
              >
                Desconectar
              </button>
            </div>
          ) : (
            <button
              onClick={() => onConnect('google')}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200 flex items-center"
            >
              <ExternalLink size={16} className="mr-2" />
              Conectar
            </button>
          )}
        </div>

        {/* Microsoft Outlook */}
        <div className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center">
            <div className="bg-blue-100 p-3 rounded-full mr-4">
              <CalendarDays size={24} className="text-blue-600" />
            </div>
            <div>
              <h3 className="font-medium">Microsoft Outlook</h3>
              <p className="text-sm text-gray-500">
                Sincronize consultas com seu Outlook Calendar
              </p>
            </div>
          </div>
          {microsoftIntegration?.connected ? (
            <div className="flex items-center">
              <span className="flex items-center text-green-600 mr-4">
                <Check size={16} className="mr-1" />
                Conectado
              </span>
              <button
                onClick={() => onDisconnect('microsoft')}
                className="px-3 py-1 border border-red-300 text-red-600 rounded-md hover:bg-red-50 transition-colors duration-200"
              >
                Desconectar
              </button>
            </div>
          ) : (
            <button
              onClick={() => onConnect('microsoft')}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200 flex items-center"
            >
              <ExternalLink size={16} className="mr-2" />
              Conectar
            </button>
          )}
        </div>

        {/* Configurações de Sincronização */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg border">
          <h3 className="font-medium mb-3">Configurações de Sincronização</h3>
          <div className="space-y-3">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="two-way-sync"
                className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                defaultChecked
              />
              <label htmlFor="two-way-sync" className="text-sm">
                Habilitar sincronização bidirecional
              </label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="notify-changes"
                className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                defaultChecked
              />
              <label htmlFor="notify-changes" className="text-sm">
                Notificar sobre conflitos de calendário
              </label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="auto-sync"
                className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                defaultChecked
              />
              <label htmlFor="auto-sync" className="text-sm">
                Sincronizar automaticamente a cada 15 minutos
              </label>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200">
            Salvar Configurações
          </button>
        </div>
      </div>
    </div>
  );
};

export default CalendarConnector;