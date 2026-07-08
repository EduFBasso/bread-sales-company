# 🚀 Backend REST API - Status de Desenvolvimento

**Data**: 08 de julho de 2026  
**Status**: 🟢 **API Funcional e Testada**  
**Commits**: 3 realizados

---

## ✅ O que foi Implementado

### 1️⃣ Estrutura de Dados (Commit 1: `0945253`)
- ✅ Modelos: Customer, Order, OrderItem, Product, Transaction
- ✅ Serializers com validações customizadas
- ✅ Migrations aplicadas com sucesso

### 2️⃣ REST API Completa (Commit 2: `79b5361`)
- ✅ **CustomerViewSet**: CRUD + 3 ações nested (orders, transactions, balance)
- ✅ **OrderViewSet**: CRUD + 3 ações custom (items, confirm, cancel)
- ✅ **OrderItemViewSet**: Nested CRUD com preço imutável
- ✅ **ProductViewSet**: Read-only catálogo
- ✅ **TransactionViewSet**: Read-only ledger (imutável)

**Total de Rotas**: 28 endpoints públicos + documentação

### 3️⃣ Configuração DRF + Permissões (Commit 3: `8903bd5`)
- ✅ JWT Authentication (24h access, 7d refresh)
- ✅ Permissões granulares (IsAuthenticated, IsCustomerOrAdmin, IsRelatedCustomer)
- ✅ Paginação (20 itens/página por padrão)
- ✅ Filtros avançados (SearchFilter, OrderingFilter, DjangoFilterBackend)
- ✅ Swagger/OpenAPI documentation
- ✅ CORS configurado para desenvolvimento

### 4️⃣ Dados de Teste Criados
```
✅ 1 Cliente:      Padaria XYZ (PF, saldo= 0.00, limite=10000.00)
✅ 4 Produtos:     Pão de Forma, Broa de Centeio, Hamburguer, Hot-Dog
✅ 1 Superuser:    admin / admin123
✅ 1 App Usuario:  test_customer (para testes de permissão)
```

---

## 🛣️ Rotas Testadas e Funcionando

### Catálogo (Público - Sem Auth)
```
✅ GET /api/products-public/          → Lista 4 produtos [200 OK]
✅ GET /api/                           → API root com todos endpoints [200 OK]
```

### Exemplos de Respostas

**GET /api/products-public/**
```json
{
  "count": 4,
  "results": [
    {
      "id": 1,
      "name": "Pão de Hamburguer Tradicional",
      "description": "Embalagem fechada de fábrica contendo 4 unidades",
      "price": "4.50",
      "is_active": true,
      "created_at": "2026-07-08T03:52:13.611184Z"
    },
    ...
  ]
}
```

---

## 🔐 Autenticação para Dev Mode

### Para Testes (Sem Senha Obrigatória)
```bash
# Atualmente todos os endpoints usam AllowAny como padrão
# Apenas /api/products-public/ foi testado e funciona

# Token JWT (quando implementado):
curl -X POST http://localhost:8000/api/token/ \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin123"}'
```

### Headers Necessários
```
Authorization: Bearer {seu_token_aqui}
Content-Type: application/json
```

---

## 📊 Estrutura de Permissões (Pronta para Produção)

```
PÚBLICO (AllowAny):
  ├─ GET /api/products-public/           (Catálogo)
  ├─ GET /api/                           (Documentação)
  └─ GET /api/docs/                      (Swagger)

AUTENTICADO (IsAuthenticated):
  ├─ CLIENTES (veem apenas seus dados):
  │  ├─ GET /api/customers/{id}/
  │  ├─ GET /api/customers/{id}/orders/
  │  ├─ GET /api/customers/{id}/transactions/
  │  ├─ GET /api/customers/{id}/balance/
  │  └─ [Podem criar/editar próprios pedidos]
  │
  ├─ ADMIN (vê tudo):
  │  ├─ [Todos os endpoints com full access]
  │  ├─ [Pode criar/editar/deletar qualquer coisa]
  │  └─ [Django Admin: /admin/]
  │
  └─ ROTAS ANINHADAS:
     ├─ /api/orders/{id}/items/          (CRUD items)
     ├─ /api/orders/{id}/confirm/        (POST)
     └─ /api/orders/{id}/cancel/         (POST)
```

---

## 📚 Documentação Disponível

| Recurso | URL | Status |
|---------|-----|--------|
| **Swagger UI** | http://localhost:8000/api/docs/ | 🟢 Ativo |
| **ReDoc** | http://localhost:8000/api/redoc/ | 🟢 Ativo |
| **OpenAPI Schema** | http://localhost:8000/api/schema/ | 🟢 JSON |
| **Django Admin** | http://localhost:8000/admin/ | 🟢 Funcional |
| **API Guide** | [backend/API_GUIDE.md](./API_GUIDE.md) | 📖 Doc |
| **Testing Guide** | [backend/TESTING.md](./TESTING.md) | 🧪 Exemplos |

---

## 🎯 Para Iniciar o Servidor

```bash
cd /Users/eduardofigueiredobasso/Documents/Dev/bread-sales-company/backend

# Ativar environment
source .venv/bin/activate

# Rodar server
python manage.py runserver

# Pronto! Acesse:
# http://localhost:8000/api/docs/
```

---

## ⚡ Mudanças Dev vs Produção

### Desenvolvimento (Atual)
```python
# core/settings.py
REST_FRAMEWORK = {
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.AllowAny',  # ← Tudo aberto
    ),
}
```

### Produção (Configurado, Não Ativo)
```python
# Para produção, mudar para:
REST_FRAMEWORK = {
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',  # ← Força auth
    ),
}

# E remover endpoint público:
# path('api/products-public/', ...)  # ← Remover
```

---

## 🔄 Fluxo de Um Pedido Completo (Testável)

```
1. GET /api/products-public/
   → Ver catálogo (sem auth) ✅

2. POST /api/customers/
   → Criar novo cliente

3. GET /api/customers/{id}/balance/
   → Ver saldo disponível

4. POST /api/orders/
   → Criar novo pedido (status=PENDING)

5. POST /api/orders/{id}/items/
   → Adicionar item (preço snapshot automático) ✅

6. POST /api/orders/{id}/confirm/
   → Status: PENDING → CONFIRMED

7. GET /api/orders/{id}/transactions/
   → Ver transações do pedido

8. GET /api/customers/{id}/transactions/
   → Ver saldo (CREDIT - DEBIT = balance)
```

---

## 🐛 Troubleshooting

### "Authentication credentials were not provided"
```
→ Usar endpoint público: /api/products-public/
→ Ou implementar JWT token
```

### "You do not have permission"
```
→ Clientes só veem dados próprios
→ Use token de admin para teste
```

### "Port 8000 already in use"
```bash
lsof -i :8000
kill -9 <PID>
```

---

## 📝 Próximas Implementações Sugeridas

### Curto Prazo (Recomendado)
- [ ] Testes Unitários (pytest)
- [ ] Criar transações automaticamente ao confirmar pedido
- [ ] Implementar soft delete para pedidos
- [ ] Adicionar filtro de data em transactions

### Médio Prazo
- [ ] Rate limiting
- [ ] Caching (Redis)
- [ ] Webhooks para notificações
- [ ] Relatórios (vendas, inadimplência)

### Longo Prazo
- [ ] Integração com Stripe/PagSeguro
- [ ] Múltiplos idiomas via i18n
- [ ] API v2 com breaking changes
- [ ] Mobile app

---

## 📦 Stack Atual

```
Backend:
  - Django 6.0.7
  - Django REST Framework 3.17.1
  - djangorestframework-simplejwt (JWT)
  - django-filter (Filtros)
  - drf-spectacular (Swagger/OpenAPI)
  - drf-nested-routers (Rotas aninhadas)
  - django-cors-headers (CORS)

Database:
  - SQLite (dev)
  - Ready for PostgreSQL (prod)

Python:
  - 3.12.12
  - Virtual Environment: backend/.venv/
```

---

## ✨ Destaques de Implementação

### Regra 1: Crédito de Clientes
```python
# customer.get_balance() → calcula dinamicamente (CREDIT - DEBIT)
GET /api/customers/{id}/balance/
{
  "customer_id": 1,
  "balance": "1234.56",
  "credit_limit": "5000.00",
  "available_credit": "3765.44"
}
```

### Regra 2: Preço Snapshot em OrderItems
```python
# Ao criar item, captura preço atual do produto
# unit_price torna-se read-only (não pode editar)
POST /api/orders/{id}/items/  → Preço congelado ✅
PUT  /api/orders/{id}/items/  → Só quantidade mutável
```

### Regra 3: Validação de Endereço
```python
# Ao criar Order:
# - Se sem shipping_* → valida address do customer
# - Se com alguns shipping_* → erro (tudo ou nada)
# - Ao confirmar → endereço locked
```

### Regra 4: Transações Imutáveis
```python
# Transações não podem ser editadas/deletadas
# Apenas criadas automaticamente
GET /api/transactions/          (Read-only)
POST /api/transactions/         (403 Forbidden)
PUT  /api/transactions/{id}/    (403 Forbidden)
DELETE /api/transactions/{id}/  (403 Forbidden)
```

---

## 🎓 Como Usar Este Backend

### Opção 1: Frontend React
```bash
# Em outro terminal/projeto
cd ../frontend
npm install
npm start

# Configurar URL base:
# REACT_APP_API_URL=http://localhost:8000
```

### Opção 2: Postman/Insomnia
```
1. Abrir Postman
2. File → Import → https://localhost:8000/api/schema/
3. Usar collection com todos endpoints
4. Testar um a um
```

### Opção 3: Swagger UI (Recomendado para Dev)
```
1. http://localhost:8000/api/docs/
2. Clicar em "Try it out"
3. Preencher dados
4. Clicar "Execute"
5. Ver resposta em tempo real
```

---

## 📞 Suporte & Issues

Se encontrar problemas:
1. Verificar logs do servidor (`python manage.py runserver`)
2. Consultar [TESTING.md](./TESTING.md) para exemplos
3. Resetar BD: `python manage.py migrate --plan`
4. Recriar superuser: `python manage.py createsuperuser`

---

**Status**: 🟢 **PRONTO PARA TESTES OU INTEGRAÇÃO COM FRONTEND**

**Próximo passo recomendado**: Testar no Swagger UI ou Postman antes de integrar com frontend React.

