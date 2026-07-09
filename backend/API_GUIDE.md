# 🥖 API REST - bread-sales-company

**Versão**: 1.0  
**Status**: ✅ Implementado e Testável

---

## 🚀 Quick Start

### 1. Ativar Virtual Environment
```bash
cd backend/
source .venv/bin/activate
```

### 2. Executar Migrações (primeira vez)
```bash
python manage.py migrate
```

### 3. Criar Superuser (para admin)
```bash
python manage.py createsuperuser
```

### 4. Rodar Servidor
```bash
python manage.py runserver
```

✅ API disponível em: `http://localhost:8000/api/`

---

## 📚 Documentação Interativa

| Recurso | URL |
|---------|-----|
| **Swagger UI** | http://localhost:8000/api/docs/ |
| **ReDoc** | http://localhost:8000/api/redoc/ |
| **OpenAPI Schema** | http://localhost:8000/api/schema/ |
| **Django Admin** | http://localhost:8000/admin/ |

---

## 🛣️ Rotas Implementadas

### Customers (Clientes)

```
GET    /api/customers/                    → Lista clientes
POST   /api/customers/                    → Cria novo cliente
GET    /api/customers/{id}/               → Detalha cliente
PUT    /api/customers/{id}/               → Atualiza cliente
DELETE /api/customers/{id}/               → Deleta cliente
GET    /api/customers/{id}/orders/        → Pedidos do cliente
GET    /api/customers/{id}/transactions/  → Transações do cliente
GET    /api/customers/{id}/balance/       → Saldo atual + limite
```

**Exemplo de Response - GET /api/customers/1/balance/**
```json
{
  "customer_id": 1,
  "nickname": "Supermercado Central",
  "balance": "1234.56",
  "credit_limit": "5000.00",
  "available_credit": "3765.44",
  "currency": "BRL"
}
```

### Orders (Pedidos)

```
GET    /api/orders/                       → Lista pedidos
POST   /api/orders/                       → Cria novo pedido
GET    /api/orders/{id}/                  → Detalha pedido
PUT    /api/orders/{id}/                  → Atualiza pedido
DELETE /api/orders/{id}/                  → Deleta pedido (soft)
GET    /api/orders/{id}/items/            → Items do pedido (aninhado)
POST   /api/orders/{id}/items/            → Cria item
POST   /api/orders/{id}/confirm/          → Confirma pedido
POST   /api/orders/{id}/cancel/           → Cancela pedido
GET    /api/orders/{id}/transactions/     → Transações relacionadas
```

**Filtros Disponíveis:**
```
?status=PENDING
?payment_method=CREDIT
?customer=1
?page=1&page_size=20
```

### Products (Catálogo)

```
GET    /api/products/                     → Lista produtos ativos
GET    /api/products/{id}/                → Detalha produto
```

**Filtros:**
```
?search=hamburguer
?ordering=-price
```

### Transactions (Livro Caixa)

```
GET    /api/transactions/                 → Lista transações
GET    /api/transactions/{id}/            → Detalha transação
```

**Filtros:**
```
?customer=1
?transaction_type=CREDIT
?search=descricao
?ordering=-created_at
```

---

## 🔐 Autenticação

### Obter Token JWT
```bash
POST /api/token/
{
  "username": "seu_usuario",
  "password": "sua_senha"
}
```

**Response:**
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

### Usar Token em Requests
```bash
Authorization: Bearer {access_token}
```

### Refresh Token
```bash
POST /api/token/refresh/
{
  "refresh": "{refresh_token}"
}
```

---

## 📋 Exemplos de Requests (cURL)

### 1. Criar Cliente
```bash
curl -X POST http://localhost:8000/api/customers/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {token}" \
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

### 2. Criar Pedido
```bash
curl -X POST http://localhost:8000/api/orders/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {token}" \
  -d '{
    "delivery_date": "2025-07-10T08:00:00Z",
    "payment_method": "CREDIT",
    "notes": "Entregar de manhã"
  }'
```

### 3. Adicionar Item ao Pedido
```bash
curl -X POST http://localhost:8000/api/orders/1/items/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {token}" \
  -d '{
    "product": 1,
    "quantity": 50
  }'
```

### 4. Confirmar Pedido
```bash
curl -X POST http://localhost:8000/api/orders/1/confirm/ \
  -H "Authorization: Bearer {token}"
```

### 5. Listar Transações do Cliente
```bash
curl -X GET http://localhost:8000/api/customers/1/transactions/ \
  -H "Authorization: Bearer {token}"
```

---

## 🔍 Filtros, Buscas e Ordenação

### Paginação
```
?page=1&page_size=50
```

### Busca (Search)
```
?search=supermercado
```

### Filtros
```
?status=PENDING&payment_method=CREDIT
```

### Ordenação
```
?ordering=-created_at
?ordering=total_value
```

**Combinação:**
```
/api/orders/?status=PENDING&search=central&ordering=-delivery_date&page=1&page_size=20
```

---

## 🛡️ Permissões

### Clientes
- ✅ Veem apenas **seus próprios dados**
- ✅ Podem criar/editar **seus próprios pedidos**
- ❌ Não podem ver dados de outros clientes

### Admins
- ✅ Veem **todos os dados**
- ✅ Podem editar **qualquer coisa**
- ✅ Acesso total a `/admin/`

---

## 🧪 Testar com Postman/Insomnia

### 1. Importar Collection
```
File → Import → Cole a URL do schema
http://localhost:8000/api/schema/
```

### 2. Configurar Autenticação
```
Authorization → Bearer Token
Token: {seu_access_token}
```

### 3. Testar Endpoints
- Selecione um endpoint
- Clique em "Send"
- Veja a resposta

---

## 📊 Estrutura de Dados

### Customer
```json
{
  "id": 1,
  "user": {
    "id": 1,
    "username": "usuario",
    "first_name": "João",
    "last_name": "Silva"
  },
  "customer_type": "PJ",
  "nickname": "Supermercado Central",
  "company_name": "Central Com. LTDA",
  "cnpj_cpf": "12345678000190",
  "phone": "11987654321",
  "credit_limit": "5000.00",
  "current_balance": "1234.56"
}
```

### Order
```json
{
  "id": 1,
  "customer": 1,
  "customer_nickname": "Supermercado Central",
  "status": "PENDING",
  "delivery_date": "2025-07-10T08:00:00Z",
  "payment_method": "CREDIT",
  "total_value": "2850.00",
  "items": [
    {
      "id": 1,
      "product": 1,
      "product_details": {
        "name": "Pão de Hamburguer",
        "price": "15.50"
      },
      "quantity": 184,
      "unit_price": "15.50",
      "subtotal": "2852.00"
    }
  ]
}
```

### Transaction
```json
{
  "id": 1,
  "customer": 1,
  "transaction_type": "DEBIT",
  "transaction_type_display": "Débito/Venda",
  "amount": "2850.00",
  "description": "Venda - Pedido #1",
  "order": 1,
  "created_at": "2025-07-08T14:30:00Z"
}
```

---

## 🐛 Troubleshooting

### Erro: "No such table"
```bash
python manage.py migrate
```

### Erro: "Authentication credentials not provided"
```
Adicione header: Authorization: Bearer {token}
```

### Erro: "You do not have permission"
```
Clientes só podem ver seus próprios dados
Use token do admin para ver tudo
```

### CORS Error no Frontend
```
Certificar que frontend URL está em CORS_ALLOWED_ORIGINS
Ver settings.py
```

---

## 📝 Próximos Passos

1. ✅ Implementar autenticação completa com JWT
2. ⏳ Criar testes automatizados (pytest)
3. ⏳ Documentar com Swagger
4. ⏳ Implementar frontend React
5. ⏳ Deploy em Render/Vercel

---

**Status**: 🟢 Pronto para testes  
**Última atualização**: 08 de julho de 2025

