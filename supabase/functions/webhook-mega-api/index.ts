import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
}

interface MegaApiWebhook {
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

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    })
  }

  try {
    console.log('📱 Webhook Mega-API recebido:', req.method, req.url);

    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Método não permitido' }),
        {
          status: 405,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    const webhookData: MegaApiWebhook = await req.json();
    console.log('📱 Dados do webhook:', JSON.stringify(webhookData, null, 2));

    // Verificar se é da instância correta
    if (webhookData.instanceId !== 'julia-teste') {
      console.log('📱 Instância incorreta:', webhookData.instanceId);
      return new Response(
        JSON.stringify({ error: 'Instância não reconhecida' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Extrair informações da mensagem
    const { data } = webhookData;
    const phoneNumber = data.key.remoteJid.replace('@s.whatsapp.net', '');
    const isFromMe = data.key.fromMe;
    const senderName = data.pushName;
    const messageId = data.key.id;
    const timestamp = data.messageTimestamp;

    // Ignorar mensagens enviadas por nós
    if (isFromMe) {
      console.log('📱 Ignorando mensagem enviada por nós');
      return new Response(
        JSON.stringify({ success: true, message: 'Mensagem própria ignorada' }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
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
      return new Response(
        JSON.stringify({ success: true, message: 'Mensagem sem texto ignorada' }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    console.log('📱 Processando mensagem:', {
      from: phoneNumber,
      name: senderName,
      message: messageText,
      timestamp: new Date(timestamp * 1000).toISOString(),
    });

    // Inicializar cliente Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Salvar mensagem recebida no histórico (opcional)
    try {
      await supabase
        .from('n8n_chat_histories')
        .insert({
          session_id: phoneNumber,
          message: {
            type: 'received',
            text: messageText,
            from: phoneNumber,
            name: senderName,
            timestamp: new Date(timestamp * 1000).toISOString(),
            messageId: messageId,
          }
        });
    } catch (error) {
      console.error('Erro ao salvar histórico:', error);
    }

    // Processar intenções da mensagem
    const lowerMessage = messageText.toLowerCase();
    let responseMessage = '';

    if (lowerMessage.includes('agendar') || 
        lowerMessage.includes('consulta') || 
        lowerMessage.includes('marcar')) {
      
      responseMessage = `Olá ${senderName}! 👋

Vi que você quer agendar uma consulta na *Redeorto Salvador*. Vou te ajudar com isso!

Por favor, me informe:
1️⃣ Que tipo de procedimento você precisa?
2️⃣ Qual data você prefere?
3️⃣ Qual horário funciona melhor para você?

📍 *Nossa localização:*
Av. Sete de Setembro, 906
1º andar – Dois de Julho
Salvador - BA

📞 *Telefone:* (71) 3328-3229

Estou aqui para facilitar seu agendamento! 🦷✨`;

    } else if (lowerMessage.includes('cancelar')) {
      
      responseMessage = `Olá ${senderName}!

Para cancelar sua consulta, preciso de algumas informações:

📅 Qual a data da sua consulta?
🕐 Qual o horário?
👤 Confirme seu nome completo

⚠️ *Importante:* Cancelamentos devem ser feitos com pelo menos 24h de antecedência.

Como posso te ajudar? 🤝`;

    } else if (lowerMessage.includes('horário') || 
               lowerMessage.includes('funcionamento') ||
               lowerMessage.includes('aberto')) {
      
      responseMessage = `🕐 *Horários de Funcionamento - Redeorto Salvador*

📅 *Segunda a Sexta:* 8:00 às 17:30
📅 *Sábado:* 8:00 às 12:00
📅 *Domingo:* Fechado

📍 *Endereço:*
Av. Sete de Setembro, 906
1º andar – Dois de Julho
Salvador - BA

📞 *Telefone:* (71) 3328-3229

Como posso te ajudar hoje? 😊`;

    } else if (lowerMessage.includes('endereço') || 
               lowerMessage.includes('localização') ||
               lowerMessage.includes('onde')) {
      
      responseMessage = `📍 *Redeorto Salvador*

*Endereço:*
Av. Sete de Setembro, 906
1º andar – Dois de Julho
Salvador - BA
CEP: 40050-000

*Referências:*
• Próximo ao Shopping Dois de Julho
• Entre a Rua da Paciência e Rua Carlos Gomes

📞 *Telefone:* (71) 3328-3229

🚗 *Estacionamento disponível*

Precisa de mais alguma informação? 🤝`;

    } else {
      
      responseMessage = `Olá ${senderName}! 👋

Sou a *Júl.IA*, assistente virtual da *Redeorto Salvador*! 

Como posso te ajudar hoje?

🦷 *Agendar consulta*
📅 *Cancelar agendamento*
🕐 *Horários de funcionamento*
📍 *Localização da clínica*
📞 *Informações de contato*

Digite sua dúvida ou escolha uma das opções acima! 😊`;
    }

    // Aqui você enviaria a resposta via Mega-API
    // Por enquanto, apenas logamos a resposta que seria enviada
    console.log('📱 Resposta que seria enviada:', responseMessage);

    // Salvar resposta no histórico (opcional)
    try {
      await supabase
        .from('n8n_chat_histories')
        .insert({
          session_id: phoneNumber,
          message: {
            type: 'sent',
            text: responseMessage,
            to: phoneNumber,
            timestamp: new Date().toISOString(),
          }
        });
    } catch (error) {
      console.error('Erro ao salvar resposta no histórico:', error);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Webhook processado com sucesso',
        response: responseMessage 
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )

  } catch (error) {
    console.error('Erro no webhook Mega-API:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Erro interno do servidor',
        message: error instanceof Error ? error.message : 'Erro desconhecido'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})