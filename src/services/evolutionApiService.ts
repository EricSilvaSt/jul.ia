/**
 * Serviço para integração com a Evolution API
 * Instância: lia-agenda
 */

const EVOLUTION_API_CONFIG = {
  instanceId: import.meta.env.VITE_EVOLUTION_INSTANCE || 'vendas',
  baseUrl: import.meta.env.VITE_EVOLUTION_API_URL || 'https://evoapi.julia.app.br',
  apiKey: import.meta.env.VITE_EVOLUTION_API_KEY || '2E3642CE66FF-43FA-BB7E-0CB89294099F',
  phoneNumber: import.meta.env.VITE_EVOLUTION_PHONE || '557196293388',
};

interface EvolutionApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

interface SendMessageRequest {
  number: string;
  message: string;
  instanceId?: string;
}

interface WebhookData {
  instanceId: string;
  data: {
    key: {
      remoteJid: string;
      fromMe: boolean;
      id: string;
    };
    message: {
      conversation?: string;
      extendedTextMessage?: {
        text: string;
      };
    };
    messageTimestamp: number;
    pushName: string;
  };
}

/**
 * Headers padrão para requisições à Evolution API
 */
const getHeaders = () => ({
  'Content-Type': 'application/json',
  'apikey': EVOLUTION_API_CONFIG.apiKey,
});

/**
 * Envia mensagem via WhatsApp
 */
export const sendWhatsAppMessage = async (
  number: string,
  message: string
): Promise<EvolutionApiResponse> => {
  try {
    const response = await fetch(`${EVOLUTION_API_CONFIG.baseUrl}/message/sendText/${EVOLUTION_API_CONFIG.instanceId}`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        number: number,
        text: message,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Erro ao enviar mensagem');
    }

    return {
      success: true,
      data: data,
    };
  } catch (error) {
    console.error('Erro ao enviar mensagem WhatsApp:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    };
  }
};

/**
 * Verifica status da instância
 */
export const getInstanceStatus = async (): Promise<EvolutionApiResponse> => {
  try {
    const response = await fetch(`${EVOLUTION_API_CONFIG.baseUrl}/instance/connectionState/${EVOLUTION_API_CONFIG.instanceId}`, {
      method: 'GET',
      headers: getHeaders(),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Erro ao verificar status');
    }

    return {
      success: true,
      data: data,
    };
  } catch (error) {
    console.error('Erro ao verificar status da instância:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    };
  }
};

/**
 * Processa webhook recebido da Evolution API
 */
export const processWebhook = async (webhookData: WebhookData): Promise<void> => {
  try {
    console.log('📱 Webhook recebido da Evolution API:', webhookData);

    // Extrair informações da mensagem
    const { data } = webhookData;
    const phoneNumber = data.key.remoteJid.replace('@s.whatsapp.net', '');
    const isFromMe = data.key.fromMe;
    const senderName = data.pushName;

    // Ignorar mensagens enviadas por nós
    if (isFromMe) {
      console.log('📱 Ignorando mensagem enviada por nós');
      return;
    }

    // Extrair texto da mensagem
    let messageText = '';
    if (data.message.conversation) {
      messageText = data.message.conversation;
    } else if (data.message.extendedTextMessage?.text) {
      messageText = data.message.extendedTextMessage.text;
    }

    if (!messageText) {
      console.log('📱 Mensagem sem texto, ignorando');
      return;
    }

    console.log('📱 Processando mensagem:', {
      from: phoneNumber,
      name: senderName,
      message: messageText,
    });

    // Aqui você pode implementar a lógica de processamento da Lia
    // Por exemplo, detectar intenções de agendamento, responder automaticamente, etc.

    // Exemplo de resposta automática simples
    if (messageText.toLowerCase().includes('agendar') ||
        messageText.toLowerCase().includes('compromisso')) {

      const responseMessage = `Olá ${senderName}! 👋\n\nVi que você quer agendar um compromisso. Vou te ajudar com isso!\n\nPor favor, me informe:\n1️⃣ Que tipo de atendimento você precisa?\n2️⃣ Qual data você prefere?\n3️⃣ Qual horário funciona melhor para você?\n\nEstou aqui para facilitar seu agendamento! ✨`;

      await sendWhatsAppMessage(phoneNumber, responseMessage);
    }

  } catch (error) {
    console.error('❌ Erro ao processar webhook:', error);
  }
};

/**
 * Envia confirmação de agendamento
 */
export const sendAppointmentConfirmation = async (
  phoneNumber: string,
  clientName: string,
  appointmentDate: string,
  appointmentTime: string,
  serviceType: string,
  companyName: string = 'Sua Empresa'
): Promise<EvolutionApiResponse> => {
  const message = `✅ *${companyName}*

Olá ${clientName}!

Seu agendamento foi confirmado:

📅 *Data:* ${appointmentDate}
🕐 *Horário:* ${appointmentTime}
📋 *Serviço:* ${serviceType}

⚠️ *Importante:*
• Chegue 15 minutos antes
• Traga documento com foto
• Em caso de cancelamento, avise com 24h de antecedência

Nos vemos em breve! 😊`;

  return await sendWhatsAppMessage(phoneNumber, message);
};

/**
 * Envia lembrete de compromisso
 */
export const sendAppointmentReminder = async (
  phoneNumber: string,
  clientName: string,
  appointmentDate: string,
  appointmentTime: string,
  companyName: string = 'Sua Empresa'
): Promise<EvolutionApiResponse> => {
  const message = `🔔 *Lembrete - ${companyName}*

Olá ${clientName}!

Lembrando que você tem compromisso agendado:

📅 *Amanhã - ${appointmentDate}*
🕐 *Horário:* ${appointmentTime}

Confirme sua presença respondendo:
✅ *SIM* - para confirmar
❌ *NÃO* - para cancelar

Aguardamos você! 😊`;

  return await sendWhatsAppMessage(phoneNumber, message);
};

export default {
  sendWhatsAppMessage,
  getInstanceStatus,
  processWebhook,
  sendAppointmentConfirmation,
  sendAppointmentReminder,
  config: EVOLUTION_API_CONFIG,
};
