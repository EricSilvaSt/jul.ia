const MEGA_API_CONFIG = {
  instanceId: 'lia-agenda',
  controlId: 'ec0e6a46-c717-4494-9a21-3f7a6433a8a3',
  instanceKey: 'megastart-MZYsnBG1aVs',
  token: 'MZYsnBG1aVs',
  baseUrl: 'https://api.megaapi.com.br', // Ajuste conforme a URL real da API
};

interface MegaApiResponse<T = any> {
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
 * Headers padrão para requisições à Mega-API
 */
const getHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${MEGA_API_CONFIG.token}`,
  'X-Instance-Key': MEGA_API_CONFIG.instanceKey,
});

/**
 * Envia mensagem via WhatsApp
 */
export const sendWhatsAppMessage = async (
  number: string, 
  message: string
): Promise<MegaApiResponse> => {
  try {
    const response = await fetch(`${MEGA_API_CONFIG.baseUrl}/message/sendText`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        number: number,
        message: message,
        instanceId: MEGA_API_CONFIG.instanceId,
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
export const getInstanceStatus = async (): Promise<MegaApiResponse> => {
  try {
    const response = await fetch(`${MEGA_API_CONFIG.baseUrl}/instance/status`, {
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
 * Processa webhook recebido da Mega-API
 */
export const processWebhook = async (webhookData: WebhookData): Promise<void> => {
  try {
    console.log('📱 Webhook recebido da Mega-API:', webhookData);
    
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
    
    // Aqui você pode implementar a lógica de processamento da Júl.IA
    // Por exemplo, detectar intenções de agendamento, responder automaticamente, etc.
    
    // Exemplo de resposta automática simples
    if (messageText.toLowerCase().includes('agendar') || 
        messageText.toLowerCase().includes('consulta')) {
      
      const responseMessage = `Olá ${senderName}! 👋\n\nVi que você quer agendar uma consulta. Vou te ajudar com isso!\n\nPor favor, me informe:\n1️⃣ Que tipo de procedimento você precisa?\n2️⃣ Qual data você prefere?\n3️⃣ Qual horário funciona melhor para você?\n\nEstou aqui para facilitar seu agendamento! 🦷✨`;
      
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
  patientName: string,
  appointmentDate: string,
  appointmentTime: string,
  procedure: string
): Promise<MegaApiResponse> => {
  const message = `🦷 *Redeorto Salvador* 🦷

Olá ${patientName}! ✅

Seu agendamento foi confirmado:

📅 *Data:* ${appointmentDate}
🕐 *Horário:* ${appointmentTime}
🔧 *Procedimento:* ${procedure}

📍 *Local:*
Av. Sete de Setembro, 906
1º andar – Dois de Julho
Salvador - BA

📞 *Contato:* (71) 3328-3229

⚠️ *Importante:*
• Chegue 15 minutos antes
• Traga documento com foto
• Em caso de cancelamento, avise com 24h de antecedência

Nos vemos em breve! 😊`;

  return await sendWhatsAppMessage(phoneNumber, message);
};

/**
 * Envia lembrete de consulta
 */
export const sendAppointmentReminder = async (
  phoneNumber: string,
  patientName: string,
  appointmentDate: string,
  appointmentTime: string
): Promise<MegaApiResponse> => {
  const message = `🔔 *Lembrete - Lia*

Olá ${patientName}!

Lembrando que você tem um compromisso agendado:

📅 *Amanhã - ${appointmentDate}*
🕐 *Horário:* ${appointmentTime}

📍 Av. Sete de Setembro, 906 - Dois de Julho

Confirme sua presença respondendo:
✅ *SIM* - para confirmar
❌ *NÃO* - para cancelar

Aguardamos você! 🦷`;

  return await sendWhatsAppMessage(phoneNumber, message);
};

export default {
  sendWhatsAppMessage,
  getInstanceStatus,
  processWebhook,
  sendAppointmentConfirmation,
  sendAppointmentReminder,
  config: MEGA_API_CONFIG,
};