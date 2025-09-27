import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Bot } from 'lucide-react';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: Date;
}

const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'assistant',
      text: 'Olá! Eu sou a Júl.IA, sua assistente virtual. Como posso ajudá-lo hoje?',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() === '') return;

    const userMessage: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');

    // Simular resposta da IA
    setTimeout(() => {
      let responseText = '';
      
      if (input.toLowerCase().includes('consulta') || input.toLowerCase().includes('agendar')) {
        responseText = "Ficarei feliz em ajudá-lo a agendar uma consulta. Que dia e horário funcionam melhor para você?";
      } else if (input.toLowerCase().includes('dentista')) {
        responseText = "Temos vários dentistas disponíveis. Você tem alguma preferência ou um procedimento específico em mente?";
      } else if (input.toLowerCase().includes('cancelar')) {
        responseText = "Posso ajudá-lo a cancelar sua consulta. Poderia confirmar seu nome e a data da consulta?";
      } else if (input.toLowerCase().includes('reagendar')) {
        responseText = "Posso ajudá-lo a reagendar. Qual é a data atual da sua consulta e para quando gostaria de reagendar?";
      } else {
        responseText = "Obrigada pela sua mensagem. Como posso ajudá-lo com sua consulta odontológica hoje?";
      }

      const assistantMessage: Message = {
        id: Date.now().toString(),
        sender: 'assistant',
        text: responseText,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    }, 1000);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex flex-col bg-white rounded-lg shadow-md h-[600px] overflow-hidden">
      <div className="p-4 bg-blue-600 text-white">
        <h2 className="text-lg font-semibold">Chat com Júl.IA</h2>
        <p className="text-sm text-blue-100">Sua assistente para agendamentos odontológicos</p>
      </div>

      <div className="flex-1 p-4 overflow-y-auto">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex mb-4 ${
              message.sender === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {message.sender === 'assistant' && (
              <div className="bg-blue-100 p-2 rounded-full mr-2">
                <Bot size={20} className="text-blue-600" />
              </div>
            )}
            <div
              className={`max-w-[70%] p-3 rounded-lg ${
                message.sender === 'user'
                  ? 'bg-blue-600 text-white rounded-tr-none'
                  : 'bg-gray-100 text-gray-800 rounded-tl-none'
              }`}
            >
              <p>{message.text}</p>
              <p className={`text-xs mt-1 ${message.sender === 'user' ? 'text-blue-100' : 'text-gray-500'}`}>
                {formatTime(message.timestamp)}
              </p>
            </div>
            {message.sender === 'user' && (
              <div className="bg-gray-200 p-2 rounded-full ml-2">
                <User size={20} className="text-gray-600" />
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form
        onSubmit={handleSubmit}
        className="p-4 border-t border-gray-200 flex items-center"
      >
        <input
          type="text"
          value={input}
          onChange={handleInputChange}
          placeholder="Digite sua mensagem..."
          className="flex-1 border border-gray-300 rounded-l-md py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <button
          type="submit"
          className="bg-blue-600 text-white py-2 px-4 rounded-r-md hover:bg-blue-700 transition-colors duration-200"
        >
          <Send size={20} />
        </button>
      </form>
    </div>
  );
};

export default ChatInterface;