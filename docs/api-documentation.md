# Documentação da API - Júl.IA Agenda

## Visão Geral

Esta documentação descreve os endpoints da API do sistema Júl.IA Agenda para integração com webhooks do n8n e outras aplicações externas.

**Base URL:** `https://euqknbfgxvntqyrtcozg.supabase.co/functions/v1`

## Autenticação

Todos os endpoints requerem autenticação via Bearer Token usando a Service Role Key do Supabase.

```
Authorization: Bearer [SUPABASE_SERVICE_ROLE_KEY]
Content-Type: application/json
```

---

## Endpoints da Júl.IA

### 1. Criar Agendamento

Cria um novo agendamento solicitado pela Júl.IA via WhatsApp/Telegram.

**Endpoint:** `POST /julia-agenda`

**Headers:**
```
Authorization: Bearer [SERVICE_ROLE_KEY]
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "clinica_id": "550e8400-e29b-41d4-a716-446655440000",
  "nome_paciente": "Maria Silva",
  "telefone_paciente": "(11) 99999-1234",
  "email_paciente": "maria@exemplo.com",
  "data_solicitada": "2025-01-25",
  "horario_solicitado": "14:00",
  "procedimento": "Limpeza",
  "origem": "whatsapp",
  "conversa_id": "wa_123456",
  "observacoes": "Primeira consulta do paciente"
}
```

**Campos Obrigatórios:**
- `clinica_id` (string): UUID da clínica
- `nome_paciente` (string): Nome completo do paciente
- `telefone_paciente` (string): Telefone no formato (XX) XXXXX-XXXX
- `data_solicitada` (string): Data no formato YYYY-MM-DD
- `horario_solicitado` (string): Horário no formato HH:mm
- `procedimento` (string): Tipo de procedimento solicitado
- `origem` (string): Origem da solicitação (`whatsapp`, `telegram`, `web`)

**Campos Opcionais:**
- `email_paciente` (string): Email do paciente
- `conversa_id` (string): ID da conversa no WhatsApp/Telegram
- `observacoes` (string): Observações adicionais

**Validações:**
- **Horário:** Deve estar entre 8:00 e 17:30, em intervalos de 30 minutos (8:00, 8:30, 9:00, etc.)
- **Data:** Não pode ser no passado
- **Conflito:** Não pode haver dois agendamentos ativos (agendado/confirmado) no mesmo horário da mesma clínica
- **Origem:** Deve ser `whatsapp`, `telegram` ou `web`

**Resposta de Sucesso (201):**
```json
{
  "success": true,
  "agendamento": {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "clinica_id": "550e8400-e29b-41d4-a716-446655440000",
    "nome_paciente": "Maria Silva",
    "telefone_paciente": "(11) 99999-1234",
    "email_paciente": "maria@exemplo.com",
    "data_solicitada": "2025-01-25",
    "horario_solicitado": "14:00",
    "procedimento": "Limpeza",
    "status": "agendado",
    "origem": "whatsapp",
    "conversa_id": "wa_123456",
    "observacoes": "Primeira consulta do paciente",
    "criado_em": "2025-01-24T10:30:00.000Z",
    "atualizado_em": "2025-01-24T10:30:00.000Z"
  },
  "message": "Agendamento criado com sucesso"
}
```

**Resposta de Erro (400):**
```json
{
  "error": "Horário indisponível para esta clínica"
}
```

---

### 2. Listar Agendamentos

Busca agendamentos da Júl.IA com filtros opcionais.

**Endpoint:** `GET /julia-agenda`

**Headers:**
```
Authorization: Bearer [SERVICE_ROLE_KEY]
```

**Query Parameters (Opcionais):**
- `status` (string): Filtrar por status (`agendado`, `confirmado`, `cancelado`, `realizado`, `ausente`, `all`)
- `origem` (string): Filtrar por origem (`whatsapp`, `telegram`, `web`)
- `limit` (number): Limite de resultados (padrão: 50)

**Exemplos de URLs:**
```
GET /julia-agenda
GET /julia-agenda?status=agendado
GET /julia-agenda?origem=whatsapp
GET /julia-agenda?status=confirmado&limit=10
```

**Resposta de Sucesso (200):**
```json
{
  "success": true,
  "agendamentos": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "nome_paciente": "Maria Silva",
      "telefone_paciente": "(11) 99999-1234",
      "email_paciente": "maria@exemplo.com",
      "data_solicitada": "2025-01-25",
      "horario_solicitado": "14:00",
      "procedimento": "Limpeza",
      "status": "agendado",
      "origem": "whatsapp",
      "conversa_id": "wa_123456",
      "observacoes": "Primeira consulta do paciente",
      "criado_em": "2025-01-24T10:30:00.000Z",
      "atualizado_em": "2025-01-24T10:30:00.000Z"
    }
  ],
  "total": 1
}
```

---

### 3. Atualizar Status do Agendamento

Atualiza o status de um agendamento específico da Júl.IA.

**Endpoint:** `PUT /julia-agenda/{id}`

**Headers:**
```
Authorization: Bearer [SERVICE_ROLE_KEY]
Content-Type: application/json
```

**URL Parameters:**
- `id` (uuid): ID do agendamento

**Body (JSON):**
```json
{
  "status": "confirmado"
}
```

**Status Válidos (em português brasileiro):**
- `agendado`: Agendamento criado pelo fluxo do n8n
- `confirmado`: Paciente confirmou presença (via followup do n8n)
- `cancelado`: Agendamento cancelado pelo paciente
- `realizado`: Consulta foi realizada (manual ou via IA)
- `ausente`: Paciente faltou à consulta (manual ou via IA)

**Campos Atualizáveis (todos opcionais):**
- `status` (string): Novo status (`agendado`, `confirmado`, `cancelado`, `realizado`, `ausente`)
- `clinica_id` (string): UUID da clínica
- `nome_paciente` (string): Nome do paciente
- `telefone_paciente` (string): Telefone do paciente
- `email_paciente` (string): Email do paciente
- `data_solicitada` (string): Nova data (YYYY-MM-DD)
- `horario_solicitado` (string): Novo horário (HH:mm)
- `procedimento` (string): Tipo de procedimento
- `observacoes` (string): Observações adicionais

**Validações:**
- **Horário:** Deve estar entre 8:00 e 17:30, em intervalos de 30 minutos
- **Data:** Não pode ser no passado
- **Conflito:** Não pode haver dois agendamentos ativos no mesmo horário da mesma clínica
- **Status:** Deve ser `agendado`, `confirmado`, `cancelado`, `realizado` ou `ausente`

**Exemplo de URL:**
```
PUT /julia-agenda/550e8400-e29b-41d4-a716-446655440001
```

**Exemplos de Body:**

**Alterar apenas status:**
```json
{
  "status": "confirmado"
}
```

**Reagendar consulta:**
```json
{
  "data_solicitada": "2025-01-26",
  "horario_solicitado": "15:30",
  "observacoes": "Reagendado a pedido do paciente"
}
```

**Atualização completa:**
```json
{
  "clinica_id": "550e8400-e29b-41d4-a716-446655440000",
  "nome_paciente": "João Silva Santos",
  "telefone_paciente": "(11) 99999-5678",
  "email_paciente": "joao@email.com",
  "data_solicitada": "2025-01-27",
  "horario_solicitado": "16:00",
  "procedimento": "Limpeza",
  "observacoes": "Dados atualizados pelo paciente",
  "status": "confirmado"
}
```

**Resposta de Sucesso (200):**
```json
{
  "success": true,
  "agendamento": {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "nome_paciente": "Maria Silva",
    "telefone_paciente": "(11) 99999-1234",
    "email_paciente": "maria@exemplo.com",
    "data_solicitada": "2025-01-25",
    "horario_solicitado": "14:00",
    "procedimento": "Limpeza",
    "status": "confirmado",
    "origem": "whatsapp",
    "conversa_id": "wa_123456",
    "observacoes": "Primeira consulta do paciente",
    "criado_em": "2025-01-24T10:30:00.000Z",
    "atualizado_em": "2025-01-24T12:15:00.000Z"
  },
  "message": "Agendamento atualizado com sucesso"
}
```

**Resposta de Erro (400):**
```json
{
  "error": "Horário indisponível para esta clínica"
}
```

---

## Códigos de Status HTTP

| Código | Descrição |
|--------|-----------|
| 200 | Sucesso |
| 201 | Criado com sucesso |
| 400 | Erro de validação |
| 401 | Não autorizado |
| 404 | Não encontrado |
| 405 | Método não permitido |
| 500 | Erro interno do servidor |

---

## Exemplos de Uso com cURL

### Criar Agendamento
```bash
curl -X POST https://euqknbfgxvntqyrtcozg.supabase.co/functions/v1/julia-agenda \
  -H "Authorization: Bearer [SERVICE_ROLE_KEY]" \
  -H "Content-Type: application/json" \
  -d '{
    "clinica_id": "550e8400-e29b-41d4-a716-446655440000",
    "nome_paciente": "João Silva",
    "telefone_paciente": "(11) 99999-5678",
    "email_paciente": "joao@exemplo.com",
    "data_solicitada": "2025-01-25",
    "horario_solicitado": "10:30",
    "procedimento": "Consulta",
    "origem": "whatsapp",
    "conversa_id": "wa_789012"
  }'
```

### Listar Agendamentos Pendentes
```bash
curl -X GET "https://euqknbfgxvntqyrtcozg.supabase.co/functions/v1/julia-agenda?status=agendado" \
  -H "Authorization: Bearer [SERVICE_ROLE_KEY]"
```

### Confirmar Agendamento
```bash
curl -X PUT https://euqknbfgxvntqyrtcozg.supabase.co/functions/v1/julia-agenda/550e8400-e29b-41d4-a716-446655440001 \
  -H "Authorization: Bearer [SERVICE_ROLE_KEY]" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "confirmado"
  }'
```

### Reagendar Consulta
```bash
curl -X PUT https://euqknbfgxvntqyrtcozg.supabase.co/functions/v1/julia-agenda/550e8400-e29b-41d4-a716-446655440001 \
  -H "Authorization: Bearer [SERVICE_ROLE_KEY]" \
  -H "Content-Type: application/json" \
  -d '{
    "data_solicitada": "2025-01-26",
    "horario_solicitado": "15:30",
    "observacoes": "Reagendado a pedido do paciente"
  }'
```

### Marcar como Realizado
```bash
curl -X PUT https://euqknbfgxvntqyrtcozg.supabase.co/functions/v1/julia-agenda/550e8400-e29b-41d4-a716-446655440001 \
  -H "Authorization: Bearer [SERVICE_ROLE_KEY]" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "realizado",
    "observacoes": "Consulta realizada com sucesso"
  }'
```

### Marcar como Ausente
```bash
curl -X PUT https://euqknbfgxvntqyrtcozg.supabase.co/functions/v1/julia-agenda/550e8400-e29b-41d4-a716-446655440001 \
  -H "Authorization: Bearer [SERVICE_ROLE_KEY]" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "ausente",
    "observacoes": "Paciente não compareceu"
  }'
```
---

## Integração com n8n

### Webhook para Receber Agendamentos
Configure seu webhook no n8n para fazer POST para:
```
https://euqknbfgxvntqyrtcozg.supabase.co/functions/v1/julia-agenda
```

### Fluxo Recomendado no n8n
1. **WhatsApp Trigger** → Recebe mensagem
2. **Júl.IA Processing** → Processa intenção
3. **HTTP Request** → POST para criar agendamento
4. **Conditional** → Verifica se foi criado com sucesso
5. **WhatsApp Response** → Responde ao paciente

### Exemplo de Payload do n8n
```json
{
  "nome_paciente": "{{ $json.patient_name }}",
  "telefone_paciente": "{{ $json.phone }}",
  "email_paciente": "{{ $json.email }}",
  "data_solicitada": "{{ $json.requested_date }}",
  "horario_solicitado": "{{ $json.requested_time }}",
  "procedimento": "{{ $json.procedure }}",
  "origem": "whatsapp",
  "conversa_id": "{{ $json.conversation_id }}",
  "observacoes": "{{ $json.notes }}"
}
```

---

## Estrutura do Banco de Dados

### Tabela: `julia_agendamentos`

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | uuid | ID único do agendamento |
| `nome_paciente` | text | Nome do paciente |
| `telefone_paciente` | text | Telefone do paciente |
| `email_paciente` | text | Email do paciente (opcional) |
| `data_solicitada` | date | Data solicitada (YYYY-MM-DD) |
| `horario_solicitado` | time | Horário solicitado (HH:mm) |
| `procedimento` | text | Tipo de procedimento |
| `status` | text | Status do agendamento |
| `origem` | text | Origem da solicitação |
| `conversa_id` | text | ID da conversa (opcional) |
| `observacoes` | text | Observações (opcional) |
| `criado_em` | timestamptz | Data de criação |
| `atualizado_em` | timestamptz | Data da última atualização |

### Status Possíveis
- `agendado`: Agendamento criado pelo fluxo do n8n
- `confirmado`: Paciente confirmou presença (via followup do n8n)
- `cancelado`: Agendamento cancelado pelo paciente
- `realizado`: Consulta foi realizada (manual ou via IA)
- `ausente`: Paciente faltou à consulta (manual ou via IA)

### Origens Possíveis
- `whatsapp`: Solicitação via WhatsApp
- `telegram`: Solicitação via Telegram
- `web`: Solicitação via site/formulário

---

## Notas Importantes

1. **Fuso Horário:** Todos os horários são tratados em horário de São Paulo (America/Sao_Paulo)
2. **Validação de Horários:** Sistema só aceita agendamentos de 30 em 30 minutos
3. **Sem Dentista:** Agendamentos da Júl.IA não têm dentista pré-definido
4. **Rate Limiting:** Não implementado (considere adicionar se necessário)
5. **Logs:** Todos os erros são logados no console do Supabase

---

## Troubleshooting

### Erro 401 - Não Autorizado
- Verifique se o token está correto
- Confirme que está usando a Service Role Key

### Erro 400 - Horário Inválido
- Horários devem ser entre 08:00 e 17:30
- Apenas intervalos de 30 minutos são aceitos
- Formato: HH:MM (ex: 08:00, 08:30, 09:00)

### Erro 400 - Conflito de Horário
- Não pode haver dois agendamentos ativos no mesmo horário da mesma clínica
- Status ativos: `agendado` e `confirmado`
- Status inativos (`cancelado`, `realizado`, `ausente`) não geram conflito

### Erro 400 - Data Inválida
- Data não pode ser no passado
- Formato: YYYY-MM-DD

### Erro 500 - Erro Interno
- Verifique os logs no Supabase Dashboard
- Confirme se a tabela `julia_agendamentos` existe

---

## Contato e Suporte

Para dúvidas sobre a integração ou problemas técnicos, consulte:
- Logs do Supabase Dashboard
- Documentação do n8n
- Console do navegador para erros frontend