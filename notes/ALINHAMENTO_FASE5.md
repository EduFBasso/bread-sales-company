# 📋 Alinhamento Fase 5 - Autenticação + Gerenciar Cliente

## 🎯 Fluxo Real de Cadastro (conforme info.txt)

### Etapa 1: Cadastro Inicial (Sem Login)
```
1. Dono envia link: http://localhost:5173/register
2. Cliente preenche formulário básico:
   - Apelido (nickname)
   - Tipo: PJ (CNPJ) ou PF (CPF)
   - Telefone
   - CEP (com auto-preenchimento de endereço)
   - Endereço (rua, número, bairro, cidade, estado)
3. Sistema cria perfil pendente no backend
4. Status: PENDENTE_APROVACAO (só dono vê)
```

### Etapa 2: Aprovação pelo Dono
```
5. Dono acessa painel administrativo
6. Aprova cadastro do cliente
7. Sistema gera senha temporária
8. Dono envia senha para cliente
```

### Etapa 3: Login + Cadastro Definitivo
```
9. Cliente acessa: http://localhost:5173/login
10. Login: Apelido + Senha
11. Na primeira entrada, vê dashboard com:
    - Seus dados (apelido, tipo, endereço)
    - Limite de crédito
    - Dívida atual
    - Data de pagamento de cada pedido
```

---

## 🗄️ Estratégia de Armazenamento (Refatoração)

### ❌ NÃO usar localStorage para dados persistentes
- localStorage é **inseguro** para dados sensíveis
- Dados do cliente devem estar **SEMPRE** no backend

### ✅ USE localStorage APENAS para JWT Token
```javascript
// localStorage é adequado APENAS para:
localStorage.setItem('access_token', 'eyJ0eXA...');
localStorage.setItem('refresh_token', 'eyJ0eXA...');
localStorage.removeItem('access_token');
```

### ✅ USE backend SQLite para dados do cliente
```
Frontend request → Backend → SQLite Database
                     ↓
          Sempre atualizado
```

### Fluxo Correto de Autenticação:
```
1. [Login] POST /api/customers/login/
   └─ Retorna: { access_token, refresh_token }
   
2. [Salvar tokens] localStorage.setItem('access_token', token)

3. [Carregar dados] GET /api/customers/me/
   Headers: { Authorization: Bearer {token} }
   └─ Retorna: { id, nickname, type, phone, limit, balance, ... }
   
4. [Usar dados] Exibir na UI
   └─ Dados ficam em React state, não localStorage
   
5. [Logout] localStorage.removeItem('access_token')
```

---

## 🔄 Implementação Necessária

### Backend Django
- [ ] Endpoint `POST /api/customers/login/` (username: apelido, password: senha)
- [ ] Endpoint `GET /api/customers/me/` (retorna cliente autenticado)
- [ ] Modelo Customer: adicionar campos `cpf/cnpj`, `status` (PENDENTE/APROVADO)
- [ ] Endpoint `POST /api/admin/customers/{id}/approve/` (só admin)
- [ ] Integração com API CEP (ViaCEP ou similar)

### Frontend React
- **pages/RegisterPage.tsx**
  - Formulário inicial (sem autenticação)
  - Campo CPF/CNPJ com validação
  - Auto-preenchimento CEP
  - POST `/api/customers/register/`

- **pages/LoginPage.tsx**
  - Form: apelido + senha
  - POST `/api/customers/login/`
  - Salvar tokens em localStorage

- **pages/DashboardPage.tsx**
  - GET `/api/customers/me/` (carregar dados)
  - Exibir: dados, limite, dívida, pagamentos

- **hooks/useAuth.ts** (refatorado)
  - ✅ Gerenciar tokens em localStorage
  - ✅ Requisições com Authorization header
  - ✅ Auto-refresh de token
  - ✅ Logout limpa localStorage

---

## 📊 Estrutura de Dados (Backend)

### Customer Model
```python
class Customer(models.Model):
    STATUS_CHOICES = [
        ('PENDENTE', 'Pendente de Aprovação'),
        ('APROVADO', 'Aprovado'),
        ('BLOQUEADO', 'Bloqueado'),
    ]
    
    user = OneToOneField(User)
    status = CharField(choices=STATUS_CHOICES, default='PENDENTE')
    nickname = CharField()
    customer_type = CharField(choices=[('PF', 'Física'), ('PJ', 'Jurídica')])
    cpf = CharField(unique=True, null=True, blank=True)  # PF
    cnpj = CharField(unique=True, null=True, blank=True)  # PJ
    phone = CharField()
    zip_code = CharField()
    street = CharField()
    number = CharField()
    neighborhood = CharField()
    city = CharField()
    state = CharField()
    credit_limit = DecimalField(default=0)
    approved_at = DateTimeField(null=True, blank=True)  # Quando foi aprovado
    approved_by = ForeignKey(User, null=True, blank=True)  # Admin que aprovou
```

---

## ⚙️ Prioridade de Implementação

### Fase 5.1: Autenticação com Login (Mínimo Viável)
1. Backend: Endpoint `POST /api/customers/login/`
2. Backend: Endpoint `GET /api/customers/me/`
3. Frontend: LoginPage + useAuth refatorado
4. Frontend: localStorage apenas para tokens JWT

### Fase 5.2: Registro + Aprovação (Completo)
1. Backend: Validadores CPF/CNPJ
2. Backend: Auto-fill CEP (ViaCEP)
3. Backend: Endpoint aprovação admin
4. Frontend: RegisterPage com auto-fill
5. Frontend: Admin panel aprovação clientes

### Fase 5.3: Dashboard (Integração)
1. DashboardPage mostrando dados do backend
2. Saldo + limite + dívidas
3. Histórico de pedidos/pagamentos

---

## 🔐 Segurança

✅ **Tokens JWT em localStorage:** OK (com expiração curta)
❌ **Dados sensíveis em localStorage:** NÃO (sempre buscar do backend)
✅ **Headers Authorization:** Implementar em todas requisições
✅ **Refresh token:** Auto-renovação quando expirar
✅ **Logout:** Limpar localStorage completamente

---

## 📌 Resumo da Mudança

| Antes | Depois |
|-------|--------|
| Dados persistem em localStorage | Dados buscados do backend a cada vez |
| Estado único no hook `useCustomer` | Estado em React state + backend como source of truth |
| Sem endpoint de login | `POST /api/customers/login/` + `GET /api/customers/me/` |
| Sem fluxo de aprovação | Admin aprova e gera senha |

---

**Status:** ⏸️ Aguardando aprovação de arquitetura para prosseguir com implementação
