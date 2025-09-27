import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
}

interface JuliaAgendamentoRequest {
  clinica_id: string;
  nome_paciente: string;
  telefone_paciente: string;
  email_paciente?: string;
  data_solicitada: string; // YYYY-MM-DD
  horario_solicitado: string; // HH:mm
  procedimento: string;
  origem: 'whatsapp' | 'telegram' | 'web';
  conversa_id?: string;
  observacoes?: string;
}

interface UpdateStatusRequest {
  status?: 'agendado' | 'confirmado' | 'cancelado' | 'realizado' | 'ausente';
  clinica_id?: string;
  nome_paciente?: string;
  telefone_paciente?: string;
  email_paciente?: string;
  data_solicitada?: string; // YYYY-MM-DD
  horario_solicitado?: string; // HH:mm
  procedimento?: string;
  observacoes?: string;
}

// Verificar se horário está entre 8:00 e 17:30
function isBetween(time: string, start: string, end: string): boolean {
  return time >= start && time <= end;
}

// Verificar se horário é múltiplo de 30 minutos
function isStep30(time: string): boolean {
  const [hh, mm] = time.split(':').map(Number);
  return (mm === 0 || mm === 30);
}

// Verificar se é erro de violação de constraint única
function isUniqueViolation(err: any): boolean {
  return err?.code === '23505';
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
    // Verificar autenticação
    const authHeader = req.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Token de autorização necessário' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Inicializar cliente Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = authHeader.replace('Bearer ', '')
    
    const supabase = createClient(supabaseUrl, supabaseKey)

    const url = new URL(req.url)
    const pathSegments = url.pathname.split('/').filter(Boolean)
    const lastSegment = pathSegments[pathSegments.length - 1]

    switch (req.method) {
      case 'POST':
        // Criar novo agendamento
        const body: JuliaAgendamentoRequest = await req.json()
        
        // Validações básicas
        if (!body.clinica_id || !body.nome_paciente || !body.telefone_paciente || 
            !body.data_solicitada || !body.horario_solicitado || !body.procedimento || !body.origem) {
          return new Response(
            JSON.stringify({ 
              error: 'Campos obrigatórios: clinica_id, nome_paciente, telefone_paciente, data_solicitada, horario_solicitado, procedimento, origem' 
            }),
            {
              status: 400,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            }
          )
        }

        // Validar janela de horário (8:00 - 17:30)
        if (!isBetween(body.horario_solicitado, '08:00', '17:30')) {
          return new Response(
            JSON.stringify({ 
              error: 'Horário fora da janela permitida (08:00–17:30)' 
            }),
            {
              status: 400,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            }
          )
        }

        // Validar intervalos de 30 minutos
        if (!isStep30(body.horario_solicitado)) {
          return new Response(
            JSON.stringify({ 
              error: 'Horário deve estar nos intervalos de 30 minutos (ex: 08:00, 08:30, 09:00...)' 
            }),
            {
              status: 400,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            }
          )
        }

        const status = 'agendado';

        // Verificar conflito de horário para status ativos
        const { data: conflitos, error: conflitoError } = await supabase
          .from('julia_agendamentos')
          .select('id')
          .eq('clinica_id', body.clinica_id)
          .eq('data_solicitada', body.data_solicitada)
          .eq('horario_solicitado', body.horario_solicitado)
          .in('status', ['agendado', 'confirmado'])

        if (!conflitoError && conflitos && conflitos.length > 0) {
          return new Response(
            JSON.stringify({ error: 'Horário indisponível para esta clínica' }),
            {
              status: 400,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            }
          )
        }

        // Inserir no Supabase
        const { data: insertData, error: insertError } = await supabase
          .from('julia_agendamentos')
          .insert({
            ...body,
            status,
          })
          .select()
          .single()

        if (insertError) {
          // Tratar violação de constraint única
          if (isUniqueViolation(insertError)) {
            return new Response(
              JSON.stringify({ error: 'Horário indisponível para esta clínica' }),
              {
                status: 400,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              }
            )
          }

          return new Response(
            JSON.stringify({ error: 'Erro interno ao criar agendamento', details: insertError.message }),
            {
              status: 500,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            }
          )
        }

        return new Response(
          JSON.stringify({ 
            success: true, 
            agendamento: insertData,
            message: 'Agendamento criado com sucesso' 
          }),
          {
            status: 201,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        )

      case 'GET':
        // Listar agendamentos
        const statusParam = url.searchParams.get('status')
        const origem = url.searchParams.get('origem')
        const limit = parseInt(url.searchParams.get('limit') || '50')
        
        let query = supabase
          .from('julia_agendamentos')
          .select('*')
          .order('criado_em', { ascending: false })
          .limit(limit)
        
        if (statusParam && statusParam !== 'all') {
          query = query.eq('status', statusParam)
        }
        
        if (origem) {
          query = query.eq('origem', origem)
        }

        const { data: agendamentos, error: selectError } = await query

        if (selectError) {
          return new Response(
            JSON.stringify({ error: 'Erro ao buscar agendamentos', details: selectError.message }),
            {
              status: 400,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            }
          )
        }

        return new Response(
          JSON.stringify({ 
            success: true, 
            agendamentos,
            total: agendamentos?.length || 0 
          }),
          {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        )

      case 'PUT':
        // Atualizar status do agendamento
        if (lastSegment && lastSegment !== 'julia-agenda') {
          const agendamentoId = lastSegment
          const updateBody: UpdateStatusRequest = await req.json()
          
          // Validar status se fornecido
          if (updateBody.status && !['agendado', 'confirmado', 'cancelado', 'realizado', 'ausente'].includes(updateBody.status)) {
            return new Response(
              JSON.stringify({ error: 'Status inválido. Use: agendado, confirmado, cancelado, realizado, ausente' }),
              {
                status: 400,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              }
            )
          }

          // Validar horário se fornecido
          if (updateBody.horario_solicitado && !isBetween(updateBody.horario_solicitado, '08:00', '17:30')) {
            return new Response(
              JSON.stringify({ 
                error: 'Horário fora da janela permitida (08:00–17:30)' 
              }),
              {
                status: 400,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              }
            )
          }

          // Validar intervalos de 30 minutos se fornecido
          if (updateBody.horario_solicitado && !isStep30(updateBody.horario_solicitado)) {
            return new Response(
              JSON.stringify({ 
                error: 'Horário deve estar nos intervalos de 30 minutos (ex: 08:00, 08:30, 09:00...)' 
              }),
              {
                status: 400,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              }
            )
          }

          // Buscar dados atuais do agendamento
          const { data: currentData, error: currentError } = await supabase
            .from('julia_agendamentos')
            .select('*')
            .eq('id', agendamentoId)
            .single()

          if (currentError || !currentData) {
            return new Response(
              JSON.stringify({ error: 'Agendamento não encontrado' }),
              {
                status: 404,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              }
            )
          }

          const newStatus = updateBody.status || currentData.status;

          // Verificar conflito se está alterando dados críticos para status ativo
          const precisaChecar = 
            ['clinica_id', 'data_solicitada', 'horario_solicitado', 'status'].some(k => k in updateBody) &&
            ['agendado', 'confirmado'].includes(newStatus);

          if (precisaChecar) {
            const clinicaId = updateBody.clinica_id || currentData.clinica_id;
            const dataSolic = updateBody.data_solicitada || currentData.data_solicitada;
            const horaSolic = updateBody.horario_solicitado || currentData.horario_solicitado;

            const { data: conflitos, error: conflitoError } = await supabase
              .from('julia_agendamentos')
              .select('id')
              .eq('clinica_id', clinicaId)
              .eq('data_solicitada', dataSolic)
              .eq('horario_solicitado', horaSolic)
              .in('status', ['agendado', 'confirmado'])
              .neq('id', agendamentoId) // ignora o próprio

            if (!conflitoError && conflitos && conflitos.length > 0) {
              return new Response(
                JSON.stringify({ error: 'Horário indisponível para esta clínica' }),
                {
                  status: 400,
                  headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                }
              )
            }
          }

          const { data: updateData, error: updateError } = await supabase
            .from('julia_agendamentos')
            .update({
              ...updateBody,
              atualizado_em: new Date().toISOString(),
            })
            .eq('id', agendamentoId)
            .select()
            .single()

          if (updateError) {
            // Tratar violação de constraint única
            if (isUniqueViolation(updateError)) {
              return new Response(
                JSON.stringify({ error: 'Horário indisponível para esta clínica' }),
                {
                  status: 400,
                  headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                }
              )
            }

            return new Response(
              JSON.stringify({ error: 'Erro ao atualizar agendamento', details: updateError.message }),
              {
                status: 500,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              }
            )
          }

          return new Response(
            JSON.stringify({ 
              success: true, 
              agendamento: updateData,
              message: 'Agendamento atualizado com sucesso' 
            }),
            {
              status: 200,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            }
          )
        }
        break

      default:
        return new Response(
          JSON.stringify({ error: 'Método não permitido' }),
          {
            status: 405,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        )
    }

    return new Response(
      JSON.stringify({ error: 'Endpoint não encontrado' }),
      {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )

  } catch (error) {
    console.error('Erro na API:', error)
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