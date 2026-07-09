# 🧪 Guia de Testes - REST API

**Objetivo**: Validar que todas as rotas e permissões funcionam corretamente

---

## 📋 Setup Inicial

### ✅ Pré-requisitos Já Executados
- ✅ Virtual environment criado em `backend/.venv/`
- ✅ Dependências instaladas (django-filter, drf-spectacular, etc.)
- ✅ Migrations aplicadas (`python manage.py migrate`)
- ✅ Superuser criado (`admin` / `admin123`)

### 🚀 Iniciar Servidor

```bash
cd /Users/eduardofigueiredobasso/Documents/Dev/bread-sales-company/backend
source .venv/bin/activate
python manage.py runserver
```

**Output esperado:**
```
Starting development server at http://127.0.0.1:8000/
Quit the server with CONTROL-C.
```

---

## 🔐 Passo 1: Obter Token JWT

### Opção A: Via Swagger UI (Recomendado)
1. Abra: http://localhost:8000/api/docs/
2. Procure por `/api/token/` (POST)
3. Clique em "Try it out"
4. Preencha:
   ```json
   {
     "username": "admin",
     "password": "admin123"
   }
   ```
5. Clique em "Execute"
6. **Copie o `access` token** da resposta

### Opção B: Via cURL
```bash
curl -X POST http://localhost:8000/api/token/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin123"
  }'
```

**Response esperada:**
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

---

## 📋 Passo 2: Testar Documentação

### ✅ API Root (Sem autenticação)
```bash
curl http://localhost:8000/api/
```

**Esperado:** JSON com lista de todas as rotas

### ✅ Swagger UI
Acesse: **http://localhost:8000/api/docs/**

Você deve ver:
- 🔒 Lock icons em endpoints protegidos
- 📘 Documentação de cada rota
- ▶️ Botão "Try it out"

### ✅ ReDoc
Acesse: **http://localhost:8000/api/redoc/**

Você deve ver: Layout alternativo da documentação

---

## 👥 Passo 3: Testar Customers

### A. Listar Clientes (com token admin)
```bash
TOKEN="seu_access_token"

curl -X GET http://localhost:8000/api/customers/ \
  -H "Authorization: Bearer $TOKEN"
```

**Esperado:** `[]` (lista vazia, pois não há clientes)

### B. Criar Cliente
```bash
curl -X POST http://localhost:8000/api/customers/ \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "nickname": "Supermercado ABC",
    "customer_type": "PJ",
    "company_name": "ABC Comércio LTDA",
    "cnpj_cpf": "12345678000190",
    "phone": "11987654321",
    "zip_code": "01234567",
    "street": "Rua Principal",
    "number": "100",
    "neighborhood": "Centro",
    "city": "São Paulo",
    "state": "SP",
    "credit_limit": "5000.00"
  }'
```

**Esperado:**
```json
{
  "id": 1,
  "nickname": "Supermercado ABC",
  "current_balance": "0.00",
  ...
}
```

### C. Detalhar Cliente
```bash
curl -X GET http://localhost:8000/api/customers/1/ \
  -H "Authorization: Bearer $TOKEN"
```

---

## 📦 Passo 4: Testar Products (Catálogo)

### A. Listar Produtos (Sem autenticação! ✅)
```bash
curl http://localhost:8000/api/products/
```

**Esperado:** `[]` (lista vazia)

### B. Criar Produto (Admin apenas)
```bash
curl -X POST http://localhost:8000/api/products/ \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Pão de Hamburguer",
    "description": "Pão branco para hambúrguer",
    "price": "15.50",
    "is_active": true
  }'
```

**Esperado:**
```json
{
  "id": 1,
  "name": "Pão de Hamburguer",
  "price": "15.50",
  "is_active": true
}
```

---

## 🛒 Passo 5: Testar Orders (Pedidos)

### A. Criar Pedido
```bash
curl -X POST http://localhost:8000/api/orders/ \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "delivery_date": "2025-07-15T08:00:00Z",
    "payment_method": "CREDIT",
    "notes": "Entregar de manhã"
  }'
```

**Esperado:**
```json
{
  "id": 1,
  "customer": 1,
  "status": "PENDING",
  "total_value": "0.00",
  "items": []
}
```

### B. Listar Pedidos
```bash
curl http://localhost:8000/api/orders/ \
  -H "Authorization: Bearer $TOKEN"
```

### C. Listar Pedidos com Filtros
```bash
# Apenas pedidos pendentes
curl "http://localhost:8000/api/orders/?status=PENDING" \
  -H "Authorization: Bearer $TOKEN"

# Pedidos do cliente 1
curl "http://localhost:8000/api/orders/?customer=1" \
  -H "Authorization: Bearer $TOKEN"

# Paginar
curl "http://localhost:8000/api/orders/?page=1&page_size=10" \
  -H "Authorization: Bearer $TOKEN"
```

---

## 📦 Passo 6: Testar Nested Routes (OrderItems)

### A. Adicionar Item ao Pedido
```bash
curl -X POST http://localhost:8000/api/orders/1/items/ \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "product": 1,
    "quantity": 100
  }'
```

**Esperado:**
```json
{
  "id": 1,
  "product": 1,
  "quantity": 100,
  "unit_price": "15.50",
  "subtotal": "1550.00"
}
```

### B. Listar Items do Pedido
```bash
curl http://localhost:8000/api/orders/1/items/ \
  -H "Authorization: Bearer $TOKEN"
```

**Esperado:** JSON com item criado acima

### C. Detalhar Item
```bash
curl http://localhost:8000/api/orders/1/items/1/ \
  -H "Authorization: Bearer $TOKEN"
```

### D. Atualizar Item (Quantidade apenas)
```bash
curl -X PUT http://localhost:8000/api/orders/1/items/1/ \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "quantity": 150
  }'
```

**Verificar:** unit_price NÃO mudou (é read-only ✅)

---

## ⚡ Passo 7: Testar Ações Customizadas

### A. Confirmar Pedido
```bash
curl -X POST http://localhost:8000/api/orders/1/confirm/ \
  -H "Authorization: Bearer $TOKEN"
```

**Esperado:**
```json
{
  "message": "Pedido confirmado com sucesso",
  "status": "CONFIRMED"
}
```

### B. Cancelar Pedido
```bash
# Criar novo pedido primeiro
curl -X POST http://localhost:8000/api/orders/ \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"delivery_date": "2025-07-16T08:00:00Z", "payment_method": "CREDIT"}'

# Depois cancelar (ID será 2)
curl -X POST http://localhost:8000/api/orders/2/cancel/ \
  -H "Authorization: Bearer $TOKEN"
```

### C. Ver Saldo do Cliente
```bash
curl http://localhost:8000/api/customers/1/balance/ \
  -H "Authorization: Bearer $TOKEN"
```

**Esperado:**
```json
{
  "customer_id": 1,
  "nickname": "Supermercado ABC",
  "balance": "1550.00",
  "credit_limit": "5000.00",
  "available_credit": "3450.00"
}
```

---

## 💰 Passo 8: Testar Transactions

### A. Listar Transações
```bash
curl http://localhost:8000/api/transactions/ \
  -H "Authorization: Bearer $TOKEN"
```

**Esperado:** Transações dos pedidos criados

### B. Ver Transações do Cliente
```bash
curl http://localhost:8000/api/customers/1/transactions/ \
  -H "Authorization: Bearer $TOKEN"
```

### C. Ver Transações do Pedido
```bash
curl http://localhost:8000/api/orders/1/transactions/ \
  -H "Authorization: Bearer $TOKEN"
```

---

## 🔒 Passo 9: Testar Permissões

### A. Sem Token (Deve falhar)
```bash
curl http://localhost:8000/api/customers/
```

**Esperado:**
```json
{
  "detail": "Authentication credentials were not provided."
}
```

### B. Token Inválido (Deve falhar)
```bash
curl http://localhost:8000/api/customers/ \
  -H "Authorization: Bearer INVALID_TOKEN"
```

### C. Produto Sem Autenticação (Deve funcionar! ✅)
```bash
curl http://localhost:8000/api/products/
```

**Esperado:** Lista de produtos (sem auth)

---

## 🐛 Troubleshooting

### Erro: "Token is invalid or expired"
- Gere um novo token (Passo 1)
- Copie corretamente o `access` (não `refresh`)

### Erro: "You do not have permission to perform this action"
- Use token de admin (não de cliente)
- Clientes só podem modificar seus próprios dados

### Erro: "Method not allowed"
- Confirme o método HTTP (GET, POST, PUT, DELETE)
- Swagger mostra qual método cada rota suporta

### Erro: "No such table"
- Execute `python manage.py migrate`

### CORS Errors
- Confirmar que frontend URL está em `settings.py` → `CORS_ALLOWED_ORIGINS`

---

## ✅ Checklist Final

- [ ] Token JWT obtido com sucesso
- [ ] Swagger UI carrega em `/api/docs/`
- [ ] Clientes criados e listados
- [ ] Produtos criados
- [ ] Pedidos criados com items
- [ ] Items quantity atualizado (price imutável)
- [ ] Pedido confirmado
- [ ] Saldo calculado corretamente
- [ ] Transações registradas
- [ ] Permissões funcionam (admin vê tudo, cliente vê só seu)
- [ ] Produtos sem auth funcionam
- [ ] Transações read-only (sem POST/PUT/DELETE)

---

## 🎬 Demo Script Completo

```bash
# Ativar ambiente
cd backend && source .venv/bin/activate

# Rodar servidor
python manage.py runserver &

# Aguardar inicialização
sleep 2

# 1. Obter token
TOKEN=$(curl -s -X POST http://localhost:8000/api/token/ \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin123"}' | grep -o '"access":"[^"]*' | cut -d'"' -f4)

echo "✅ Token: $TOKEN"

# 2. Criar cliente
curl -X POST http://localhost:8000/api/customers/ \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"nickname": "Test ABC", "customer_type": "PJ", "cnpj_cpf": "12345678000190", "phone": "11999999999", "zip_code": "01234567", "street": "Rua A", "number": "100", "neighborhood": "Centro", "city": "São Paulo", "state": "SP", "credit_limit": "5000.00"}'

echo "\n✅ Cliente criado"

# 3. Listar clientes
curl http://localhost:8000/api/customers/ \
  -H "Authorization: Bearer $TOKEN" | python -m json.tool

echo "\n✅ Teste completo!"
```

---

**Status**: 🟢 Pronto para testes interativos  
**Próximo**: Testar via Postman/Insomnia ou cURL

