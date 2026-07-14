# Registro de Alterações

## [2026-07-14] - Revisão Pré-Demo: Segurança de Cliente ✅

### Foco Operacional para Primeira Demonstração

**Status:** ✅ ALINHADO PARA DEMO

#### Alterações Aplicadas:
1. **Fluxo do modal de bloqueio simplificado**:
   - removido caminho de apagar permanentemente.
   - mantido apenas bloquear/desbloquear com senha do administrador.
2. **Exclusão permanente de cliente desativada na API operacional**:
   - endpoint de DELETE agora retorna orientação de bloqueio para inativação.
3. **Fluxo de senha no modal de cliente estabilizado**:
   - visualizar, copiar e compartilhar WhatsApp validados.
   - atualização de senha com compartilhamento imediato via WhatsApp.

#### Decisão de Escopo Técnico:
1. **Warning Vite 8 + React Babel (depreciação)** reconhecido, porém **adiado**.
2. Ajuste para `@vitejs/plugin-react-oxc` será tratado **antes do deploy online**, não antes da primeira entrega.

#### Resultado para Demonstração:
1. Processo administrativo mais curto e previsível.
2. Menor risco de remoção acidental de dados históricos.
3. Build de frontend segue verde para entrega inicial.

## [2026-07-13] - Sessão Cliente Mobile Refinada ✅

### FASE: Consolidação da Experiência do Cliente para Demonstração

**Status:** ✅ PRONTA PARA TESTES MANUAIS

#### Entregas Principais:
1. **Header mobile compacto do cliente** com apelido, status e botão Sair.
2. **SmartSection reutilizável** com hamburger, animação suave de 0.3s e comportamento sticky quando aberto.
3. **Regra de um bloco aberto por vez** no mobile para reduzir ruído visual.
4. **Dashboard do cliente reorganizada** em blocos colapsáveis:
   - Informações da Conta
   - Resumo Financeiro
   - Meus Pedidos
   - Histórico de Pagamentos
5. **Novo Pedido migrado para o mesmo padrão colapsável**.
6. **Resumo financeiro padronizado** com os rótulos:
   - Saldo Limite
   - Saldo Utilizado
   - Saldo Disponível
7. **Pedidos reorganizados no formato “caderno”**:
   ordem cronológica antiga → nova, com foco automático no pedido mais recente ao abrir.
8. **Card de pedido orientado a pagamento**:
   título por data/hora do pedido, remoção de entrega como eixo principal e badge textual de pagamento.
9. **Informações da Conta expandidas** para refletir melhor o modal admin:
   nome comercial, apelido, tipo, telefone, CPF/CNPJ condicional e endereço.
10. **Novo Pedido alinhado à regra operacional real**:
    cliente não escolhe método de pagamento; endereço de entrega fica pré-preenchido e editável.

#### Correções Relevantes:
1. **Hook order fix no OrdersList** - corrigido erro de runtime que gerava tela branca.
2. **Colapso real de altura nos blocos fechados** - removido espaço em branco indevido.
3. **Sincronização da sessão do cliente** com `/api/customers/me/` para evitar dados financeiros desatualizados.
4. **Guardas de sessão e redirecionamento** para evitar estados vazios no dashboard e em Novo Pedido.
5. **ProtectedRoute legado corrigido** para usar `bread_customer_token`.

#### Escopo Atual de Teste Manual:
1. Cadastrar um novo cliente.
2. Aprovar o cliente no admin.
3. Fazer login no mobile.
4. Validar os quatro blocos colapsáveis da dashboard.
5. Criar múltiplos pedidos e observar o comportamento de Meus Pedidos.
6. Validar o endereço padrão editável em Dados da Entrega.
7. Repetir o fluxo com outro cliente.

#### Pendência Planejada para a Próxima Fase:
- Sessão admin para registrar baixa real de pagamento do pedido, com método recebido e data/hora, refletindo depois no card do cliente.

---

## [2026-07-10] - Phase 5: Order Creation Interface ✅

### PHASE 5: Customer Order Creation - COMPLETED

**Status:** ✅ PRODUCTION READY

#### Features Implemented:
1. **useProducts Hook** - Fetches product catalog from GET /api/products/
2. **useCreateOrder Hook** - Handles POST requests to create orders with items
3. **OrderCreateSerializer** - Backend serializer for atomic order creation with items
4. **CreateOrderForm Component** - Full-featured order creation interface
5. **CustomerCreateOrderPage** - Dedicated page for order creation
6. **Order creation endpoint** - POST /api/customers/orders/create/
7. **Route integration** - Added /customer/orders/create route
8. **Dashboard button** - "Fazer Novo Pedido" button in customer dashboard

#### Key Features:
- ✅ Product catalog display with prices
- ✅ Add to cart functionality with quantity selection
- ✅ Dynamic cart with item modification (-, qty, +)
- ✅ Cart totals calculation
- ✅ Delivery date picker (datetime-local)
- ✅ Payment method selection (CREDIT, CASH, PIX, TRANSFER)
- ✅ Optional delivery notes
- ✅ Atomic order creation with OrderItems (transaction)
- ✅ Success message with order ID
- ✅ Automatic redirect to dashboard after creation
- ✅ Responsive mobile-friendly design
- ✅ Form validation (cart items required, delivery date required)

#### Testing Results:
- ✅ Product catalog loads correctly (9 active products)
- ✅ Add to cart works with quantity adjustment
- ✅ Order creation successful (ORD-002 created with R$ 150.00)
- ✅ New order displays in dashboard with correct status (PENDING)
- ✅ Order items show correctly with product names and quantities
- ✅ Delivery date displays correctly (11/07/2026)
- ✅ Redirect to dashboard works after creation
- ✅ Button "Fazer Novo Pedido" works and is accessible

#### Backend Changes:
- `customers/views.py` - Added customer_create_order function
- `orders/serializers.py` - Added OrderItemCreateSerializer and OrderCreateSerializer
- `core/urls.py` - Added route for /api/customers/orders/create/

#### Frontend Changes:
- `frontend/src/hooks/useProducts.ts` - New hook for product fetching
- `frontend/src/hooks/useCreateOrder.ts` - New hook for order creation
- `frontend/src/components/CreateOrderForm.tsx` - New order form component (120 lines)
- `frontend/src/components/CreateOrderForm.module.css` - Styling for form (310 lines)
- `frontend/src/pages/ClientPages/CustomerCreateOrderPage.tsx` - New page component
- `frontend/src/pages/ClientPages/CustomerCreateOrderPage.module.css` - Page styling
- `frontend/src/App.tsx` - Added route configuration for create-order page
- `frontend/src/pages/ClientPages/index.tsx` - Added "Novo Pedido" button
- `frontend/src/hooks/index.ts` - Exported new hooks

#### Files Modified:
- `frontend/src/hooks/useCustomerDashboard.ts` - Fixed TypeScript optional property access

#### Build Status:
- Backend: ✓ System check passed, no issues
- Frontend: ✓ 90 modules compiled, 0 TypeScript errors, built in 157ms
- Database: ✓ 9 test products created

#### Database:
- Created 5 new products: Pão Francês (pacote), Pão de Forma (pacote), Croissant (pacote), Biscoitos Sortidos, Bolo de Chocolate
- Total active products: 9
- Created test order: ORD-002 with 1 item (10x Pão Francês pacote = R$ 150.00)

#### Git Commits (to be made):
1. `Phase 5: Order Creation Interface - Complete and Tested`
   - Includes all backend serializers, views, and routes
   - Includes all frontend components, hooks, and pages
   - Includes CSS styling for responsive design

#### Next Phase:
- Phase 6: Admin Order Management (view, approve, update status)

---

## [2026-07-10] - Phase 4: Backend API Endpoints ✅

### PHASE 4: Backend API Endpoints for Orders and Transactions - COMPLETED

**Status:** ✅ PRODUCTION READY (frontend data fetching verified)

#### Features Implemented:
- GET /api/customers/orders/ endpoint for customer order listing
- GET /api/customers/transactions/ endpoint for customer transaction history
- Optional query filters for both endpoints (status, transaction_type)
- Paginated responses (PageNumberPagination)
- Bearer token authentication (SimpleJWT)

#### Key Fixes Applied:
1. **React Hook Timing Issue** - Fixed useEffect dependencies
   - Changed from [] to [token, isAuthenticated]
   - Ensures data fetching happens after token is loaded from localStorage
   - Resolves "cannot read property of undefined" errors

2. **Enum Value Alignment**
   - Backend orders: PENDING, CONFIRMED, DELIVERED, CANCELLED
   - Backend transactions: CREDIT (deposits), DEBIT (sales)
   - Frontend components updated to match

3. **CORS Configuration**
   - Added localhost:5174, 5175 to CORS_ALLOWED_ORIGINS
   - Supports Vite fallback ports

#### Testing Results:
- ✅ Both endpoints return data via curl with correct format
- ✅ Test data persists in database (1 Order, 1 Transaction)
- ✅ Orders and transactions now display in frontend dashboard
- ✅ Status badges render correctly
- ✅ Pagination works

#### Build Status:
- Backend: ✓ Django checks passed
- Frontend: ✓ 90 modules, 0 TypeScript errors

[2026-07-10] - Phase 3: Customer Dashboard Enhancements ✅

### PHASE 3: Frontend Dashboard Components - COMPLETED

**Status:** ✅ PRODUCTION READY (awaiting backend API endpoints)

#### Features Implemented:
1. **useCustomerDashboard Hook** - Manages dashboard financial data
2. **useCustomerOrders Hook** - Fetches customer orders list
3. **useCustomerTransactions Hook** - Fetches payment history
4. **BalanceCard Component** - Displays balance & credit info with visual indicators
5. **OrdersList Component** - Shows customer orders with status tracking
6. **TransactionHistory Component** - Transaction history table view

#### Key Features:
- ✅ Balance display with "A favor" / "Devendo" status
- ✅ Available credit progress bar with percentage
- ✅ Credit limit tracking
- ✅ Order list with status badges (PENDENTE, CONFIRMADO, ENTREGUE, CANCELADO)
- ✅ Item preview with expandable list  
- ✅ Transaction history table
- ✅ Empty states with helpful messaging
- ✅ Responsive mobile-friendly design
- ✅ Professional #D4825C theme

#### Build Status:
- Frontend: ✓ 90 modules compiled, 0 TypeScript errors
- CSS: ✓ All modules validated
- Build Time: 130ms

#### Git Commits:
1. `Phase 3: Customer Dashboard Enhancements`

---

## [2026-07-10] - Phase 2: Customer Login & Authentication ✅

### PHASE 2: Frontend Customer Authentication - COMPLETED

**Status:** ✅ PRODUCTION READY

#### Features Implemented:
- Customer login page with apelido/password form
- JWT token storage (access, refresh, user data)
- Customer dashboard with welcome section
- Customer information grid (nickname, type, phone)
- Logout functionality with localStorage cleanup
- Protected routes via CustomerRoute wrapper
- Responsive mobile-friendly design

#### Files Created:
- `frontend/src/hooks/useCustomerLogin.ts` - Login API calls + token storage
- `frontend/src/hooks/useCustomerAuth.ts` - Authentication state management
- `frontend/src/pages/ClientPages/CustomerLoginPage.tsx` - Login form component
- `notes/PHASE_2_COMPLETE.md` - Detailed implementation guide
- `notes/PHASE_2_TESTING_COMPLETE.md` - Full test results

#### Files Modified:
- `frontend/src/App.tsx` - Added customer routes
- `frontend/src/hooks/index.ts` - Exported new hooks
- `frontend/src/pages/ClientPages/index.tsx` - Enhanced dashboard
- `backend/customers/serializers.py` - Fixed serializer redundancy

#### Testing Results:
- ✅ Customer login flow: END-TO-END SUCCESS
- ✅ Token storage: Verified in localStorage
- ✅ Dashboard display: All sections rendering
- ✅ Logout functionality: Tokens cleared + redirects home
- ✅ Route protection: Unauthorized access redirected to login
- ✅ Responsive design: Desktop & mobile tested

#### Build Status:
- Frontend: ✓ 81 modules, 0 TypeScript errors
- Backend: ✓ Database migrations applied
- Compilation: ✓ 114ms build time

#### Git Commits:
1. `Phase 2: Customer Login & Authentication (Frontend)`
2. `Fix: Remove redundant source parameter in CustomerSerializer`

---

## [2026-07-10] - Phase 1: Backend Audit & Password Validation ✅

### PHASE 1: Backend Implementation - COMPLETED

**Status:** ✅ TESTED & VALIDATED

#### Features Implemented:
- Enhanced Customer model with blocking fields
- CustomerAuditLog model with comprehensive audit trail
- Pragmatic password validation rules
- API endpoints:
  - POST `/customers/{id}/approve` - Admin approval with password
  - POST `/customers/{id}/block` - Admin blocking with reason
  - POST `/customers/{id}/set-password` - Admin password reset
- Audit logging for all operations
- calculated fields: available_credit, current_balance

#### Files Created:
- `backend/customers/migrations/0002_*.py` - Schema migration
- `backend/utils/password_validator.py` - Validation logic
- `notes/PHASE_1_COMPLETE.md` - Detailed implementation

#### Files Modified:
- `backend/customers/models.py` - Added audit model & fields
- `backend/customers/views.py` - Enhanced endpoints
- `backend/customers/serializers.py` - Updated fields

#### Password Validation Rules:
- Minimum 6 characters
- Must contain letters AND numbers
- No obvious sequences (0123456789, 9876543210)
- No 3+ character repetition
- Accepts: "Pwd123", "Test123456", "MyPassword789"

#### Testing:
- ✅ Token generation working
- ✅ Password validation rules verified
- ✅ Audit logging functional
- ✅ Decimal type handling fixed
- ✅ Admin endpoints responding correctly

---

## Project Information

**Repository:** bread-sales-company
**Current Phase:** 5 (Customer Order Creation)
**Status:** ✅ Phase 5 COMPLETE

### Phases Overview:
1. ✅ **Phase 1:** Backend audit trail + password validation
2. ✅ **Phase 2:** Customer login & authentication
3. ✅ **Phase 3:** Dashboard balance + orders/transactions display
4. ✅ **Phase 4:** Backend API Endpoints (GET orders/transactions)
5. ✅ **Phase 5:** Customer Order Creation Interface (COMPLETE)
6. ⬜ **Phase 6:** Admin Order Management

### Technology Stack:
- Backend: Django 6.0.7 + Django REST Framework 3.17.1
- Frontend: React 19.2.7 + TypeScript 7.0.2 + Vite 8.1.3
- Database: SQLite with migrations
- Authentication: SimpleJWT
- Styling: CSS Modules

### Key Achievements:
- End-to-end customer authentication working
- Customer dashboard displaying financial data and orders
- Real-time order creation with cart interface
- Responsive design across all devices
- Zero TypeScript errors
- Atomic database transactions for order creation
- Professional UI with #D4825C theme

---

## [2026-07-10] - Phase 2: Customer Login & Authentication ✅

### PHASE 2: Frontend Customer Authentication - COMPLETED

**Status:** ✅ PRODUCTION READY

#### Features Implemented:
- Customer login page with apelido/password form
- JWT token storage (access, refresh, user data)
- Customer dashboard with welcome section
- Customer information grid (nickname, type, phone)
- Logout functionality with localStorage cleanup
- Protected routes via CustomerRoute wrapper
- Responsive mobile-friendly design

#### Files Created:
- `frontend/src/hooks/useCustomerLogin.ts` - Login API calls + token storage
- `frontend/src/hooks/useCustomerAuth.ts` - Authentication state management
- `frontend/src/pages/ClientPages/CustomerLoginPage.tsx` - Login form component
- `notes/PHASE_2_COMPLETE.md` - Detailed implementation guide
- `notes/PHASE_2_TESTING_COMPLETE.md` - Full test results

#### Files Modified:
- `frontend/src/App.tsx` - Added customer routes
- `frontend/src/hooks/index.ts` - Exported new hooks
- `frontend/src/pages/ClientPages/index.tsx` - Enhanced dashboard
- `backend/customers/serializers.py` - Fixed serializer redundancy

#### Testing Results:
- ✅ Customer login flow: END-TO-END SUCCESS
- ✅ Token storage: Verified in localStorage
- ✅ Dashboard display: All sections rendering
- ✅ Logout functionality: Tokens cleared + redirects home
- ✅ Route protection: Unauthorized access redirected to login
- ✅ Responsive design: Desktop & mobile tested

#### Build Status:
- Frontend: ✓ 81 modules, 0 TypeScript errors
- Backend: ✓ Database migrations applied
- Compilation: ✓ 114ms build time

#### Git Commits:
1. `Phase 2: Customer Login & Authentication (Frontend)`
2. `Fix: Remove redundant source parameter in CustomerSerializer`

---

## [2026-07-10] - Phase 1: Backend Audit & Password Validation ✅

### PHASE 1: Backend Implementation - COMPLETED

**Status:** ✅ TESTED & VALIDATED

#### Features Implemented:
- Enhanced Customer model with blocking fields
- CustomerAuditLog model with comprehensive audit trail
- Pragmatic password validation rules
- API endpoints:
  - POST `/customers/{id}/approve` - Admin approval with password
  - POST `/customers/{id}/block` - Admin blocking with reason
  - POST `/customers/{id}/set-password` - Admin password reset
- Audit logging for all operations
- calculated fields: available_credit, current_balance

#### Files Created:
- `backend/customers/migrations/0002_*.py` - Schema migration
- `backend/utils/password_validator.py` - Validation logic
- `notes/PHASE_1_COMPLETE.md` - Detailed implementation

#### Files Modified:
- `backend/customers/models.py` - Added audit model & fields
- `backend/customers/views.py` - Enhanced endpoints
- `backend/customers/serializers.py` - Updated fields

#### Password Validation Rules:
- Minimum 6 characters
- Must contain letters AND numbers
- No obvious sequences (0123456789, 9876543210)
- No 3+ character repetition
- Accepts: "Pwd123", "Test123456", "MyPassword789"

#### Testing:
- ✅ Token generation working
- ✅ Password validation rules verified
- ✅ Audit logging functional
- ✅ Decimal type handling fixed
- ✅ Admin endpoints responding correctly

---

## Project Information

**Repository:** bread-sales-company
**Current Phase:** 2 (Customer Frontend Authentication)
**Next Phase:** 3 (Customer Dashboard & Balance Display)

### Phases Overview:
1. ✅ **Phase 1:** Backend audit trail + password validation
2. ✅ **Phase 2:** Customer login & authentication (CURRENT)
3. 🟡 **Phase 3:** Dashboard balance + orders display
4. ⬜ **Phase 4:** Admin approval interface
5. ⬜ **Phase 5:** Customer order creation

### Technology Stack:
- Backend: Django 6.0.7 + Django REST Framework 3.17.1
- Frontend: React 19.2.7 + TypeScript 7.0.2 + Vite 8.1.3
- Database: SQLite with migrations
- Authentication: SimpleJWT
- Styling: CSS Modules

### Key Achievements:
- End-to-end customer authentication working
- Secure token management
- Protected routing
- Comprehensive audit trail
- Pragmatic password validation
- Responsive design
- Zero TypeScript errors