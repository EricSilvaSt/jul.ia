# Exemplos para Postman - API Júl.IA

## Configuração Base

**Base URL:** `https://euqknbfgxvntqyrtcozg.supabase.co/functions/v1`

**Headers obrigatórios:**
```
Authorization: Bearer [SUPABASE_SERVICE_ROLE_KEY]
Content-Type: application/json
```

---

## 1. Criar Agendamento

**Método:** `POST`  
**URL:** `{{baseUrl}}/julia-agenda`

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

**Resposta esperada (201):**
```json
{
  "success": true,
  "agendamento": {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "clinica_id": "550e8400-e29b-41d4-a716-446655440000",
    "nome_paciente": "Maria Silva",
    "status": "agendado",
    "criado_em": "2025-01-24T10:30:00.000Z"
  },
  "message": "Agendamento criado com sucesso"
}
```

---

## 2. Listar Agendamentos

**Método:** `GET`  
**URL:** `{{baseUrl}}/julia-agenda`

**Variações:**
- Todos: `{{baseUrl}}/julia-agenda`
- Por status: `{{baseUrl}}/julia-agenda?status=agendado`
- Por origem: `{{baseUrl}}/julia-agenda?origem=whatsapp`
- Limitado: `{{baseUrl}}/julia-agenda?limit=10`

---

## 3. Confirmar Agendamento (Followup n8n)

**Método:** `PUT`  
**URL:** `{{baseUrl}}/julia-agenda/550e8400-e29b-41d4-a716-446655440001`

**Body (JSON):**
```json
{
  "status": "confirmado",
  "observacoes": "Paciente confirmou presença via WhatsApp"
}
```

---

## 4. Cancelar Agendamento

**Método:** `PUT`  
**URL:** `{{baseUrl}}/julia-agenda/550e8400-e29b-41d4-a716-446655440001`

**Body (JSON):**
```json
{
  "status": "cancelado",
  "observacoes": "Paciente cancelou - conflito de horário"
}
```

---

## 5. Reagendar Consulta

**Método:** `PUT`  
**URL:** `{{baseUrl}}/julia-agenda/550e8400-e29b-41d4-a716-446655440001`

**Body (JSON):**
```json
{
  "data_solicitada": "2025-01-26",
  "horario_solicitado": "15:30",
  "observacoes": "Reagendado a pedido do paciente"
}
```

---

## 6. Marcar como Realizado (Manual/IA)

**Método:** `PUT`  
**URL:** `{{baseUrl}}/julia-agenda/550e8400-e29b-41d4-a716-446655440001`

**Body (JSON):**
```json
{
  "status": "realizado",
  "observacoes": "Consulta realizada com sucesso"
}
```

---

## 7. Marcar como Ausente (Manual/IA)

**Método:** `PUT`  
**URL:** `{{baseUrl}}/julia-agenda/550e8400-e29b-41d4-a716-446655440001`

**Body (JSON):**
```json
{
  "status": "ausente",
  "observacoes": "Paciente não compareceu"
}
```

---

## 8. Atualização Completa

**Método:** `PUT`  
**URL:** `{{baseUrl}}/julia-agenda/550e8400-e29b-41d4-a716-446655440001`

**Body (JSON):**
```json
{
  "clinica_id": "550e8400-e29b-41d4-a716-446655440000",
  "nome_paciente": "Maria Silva Santos",
  "telefone_paciente": "(11) 99999-5678",
  "email_paciente": "maria.santos@email.com",
  "data_solicitada": "2025-01-27",
  "horario_solicitado": "16:00",
  "procedimento": "Limpeza",
  "observacoes": "Dados atualizados pelo paciente",
  "status": "confirmado"
}
```

---

## Variáveis do Postman

Crie essas variáveis no Postman:

**Environment Variables:**
```
baseUrl = https://euqknbfgxvntqyrtcozg.supabase.co/functions/v1
serviceRoleKey = [SUA_SERVICE_ROLE_KEY]
clinicaId = 550e8400-e29b-41d4-a716-446655440000
agendamentoId = 550e8400-e29b-41d4-a716-446655440001
```

**Uso nas requisições:**
- URL: `{{baseUrl}}/julia-agenda/{{agendamentoId}}`
- Header: `Authorization: Bearer {{serviceRoleKey}}`

---

## Fluxo Completo de Teste

### 1. Criar agendamento
```bash
POST /julia-agenda
# Status inicial: "agendado"
```

### 2. Paciente confirma (n8n followup)
```bash
PUT /julia-agenda/{id}
{"status": "confirmado"}
```

### 3. Consulta acontece - marcar como realizada
```bash
PUT /julia-agenda/{id}
{"status": "realizado"}
```

### OU: Paciente não comparece
```bash
PUT /julia-agenda/{id}
{"status": "ausente"}
```

---

## Status Válidos

| Status | Quando usar | Quem define |
|--------|-------------|-------------|
| `agendado` | Criado pelo n8n | Automático |
| `confirmado` | Paciente confirmou | n8n followup |
| `cancelado` | Paciente cancelou | n8n/Manual |
| `realizado` | Consulta aconteceu | Manual/IA |
| `ausente` | Paciente faltou | Manual/IA |

---

## Horários Válidos

**Funcionamento:** 8:00 às 17:30  
**Intervalos:** 30 minutos

**Exemplos válidos:**
- `08:00`, `08:30`, `09:00`, `09:30`
- `17:00`, `17:30`

**Inválidos:**
- `07:30` (muito cedo)
- `18:00` (muito tarde)  
- `09:15` (não é múltiplo de 30min)

---

## Conflitos de Horário

**Status que bloqueiam:** `agendado`, `confirmado`  
**Status que não bloqueiam:** `cancelado`, `realizado`, `ausente`

**Exemplo de conflito:**
```json
{
  "error": "Horário indisponível para esta clínica"
}
```

---

## Códigos de Resposta

| Código | Significado |
|--------|-------------|
| 200 | Sucesso (GET/PUT) |
| 201 | Criado (POST) |
| 400 | Erro de validação |
| 401 | Não autorizado |
| 404 | Não encontrado |
| 500 | Erro interno |

---

## Exemplos de Erro

**Horário inválido (400):**
```json
{
  "error": "Horário fora da janela permitida (08:00–17:30)"
}
```

**Conflito de horário (400):**
```json
{
  "error": "Horário indisponível para esta clínica"
}
```

**Status inválido (400):**
```json
{
  "error": "Status inválido. Use: agendado, confirmado, cancelado, realizado, ausente"
}
```

**Não autorizado (401):**
```json
{
  "error": "Token de autorização necessário"
}
```