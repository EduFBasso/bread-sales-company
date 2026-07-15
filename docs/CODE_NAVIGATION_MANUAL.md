# Manual de Navegacao do Codigo

Este manual resume como navegar no projeto durante revisao, estabilizacao e refatoracao.

## Objetivo

- Facilitar leitura para pessoas e IA.
- Reduzir tempo de refatoracao em arquivos grandes.
- Padronizar estrutura por componente:
  - `components/NomeDoComponente/index.tsx`
  - `components/NomeDoComponente/styles.module.css`

## Mapa Rapido

### Frontend

- Painel admin: `frontend/src/pages/AdminPages`
- Area do cliente (mobile): `frontend/src/pages/ClientPages`
- Componentes compartilhados: `frontend/src/components`
- Hooks: `frontend/src/hooks`
- Servicos de API: `frontend/src/services`

### Backend

- Core/configuracao: `backend/core`
- Clientes: `backend/customers`
- Pedidos/produtos: `backend/orders`
- Livro caixa/transacoes: `backend/ledger`
- Contas e stats admin: `backend/accounts`

## Fluxos Principais

### 1) Cliente -> Pedido -> Pagamento

1. Cliente cria pedido em `frontend/src/components/CreateOrderForm.tsx`.
2. Pedido e itens passam por `backend/orders/serializers.py` e `backend/orders/views.py`.
3. Admin confirma pagamento em `frontend/src/components/AdminOrdersPanel.tsx`.
4. Backend marca pagamento em `backend/customers/admin_views.py` (`paid_at` + status).
5. Cliente ve pagamento em:
   - `frontend/src/components/OrdersList/index.tsx`
   - `frontend/src/components/TransactionHistory/index.tsx`

### 2) Cliente -> Situacao financeira

1. Snapshot financeiro por cliente em `backend/customers/serializers.py`.
2. Dashboard admin agrega em `backend/accounts/views.py`.
3. Frontend usa:
   - `frontend/src/hooks/useAdminCustomers.ts`
   - `frontend/src/hooks/useCustomerAuth.ts`

## Hotspots de Refatoracao (Prioridade)

1. `backend/customers/views.py` (muito grande)
2. `frontend/src/pages/AdminPages/AdminPages.module.css` (muito grande)
3. `frontend/src/pages/AdminPages/CustomerDetailModal.tsx` (alto acoplamento)
4. `frontend/src/components/CreateOrderForm.tsx` (logica extensa)

## Diretriz de Modularizacao

Quando um arquivo crescer muito:

1. Extrair funcoes utilitarias para `utils` ou `hooks` dedicados.
2. Quebrar UI em subcomponentes por responsabilidade.
3. Manter o arquivo principal como orquestrador de fluxo.
4. Preservar contratos publicos para evitar regressao.

## Convencoes de Estrutura

### Componentes

- Preferir sempre pasta por componente:
  - `index.tsx` (logica + markup)
  - `styles.module.css` (estilos locais)

### Nomeacao

- Componentes: PascalCase
- Hooks: `use*`
- CSS module: `styles.module.css`

## Checklist de Estabilizacao (cada lote)

1. Confirmar que nao ha arquivo legado sem uso.
2. Rodar `npm run build` no frontend.
3. Rodar `python manage.py check` no backend.
4. Revisar impacto em imports e paths.
5. Commits pequenos e reversiveis.

## Lotes sugeridos para a Fase 2

### Lote A (feito)

- Componentes cliente movidos para pasta:
  - `frontend/src/components/OrdersList/index.tsx`
  - `frontend/src/components/OrdersList/styles.module.css`
  - `frontend/src/components/TransactionHistory/index.tsx`
  - `frontend/src/components/TransactionHistory/styles.module.css`
- Remocao de placeholders sem uso em `pages/*/sections`.

### Lote B (proximo)

- Modularizar `frontend/src/pages/AdminPages/CustomerDetailModal.tsx`:
  - extrair utilitarios de moeda/data
  - extrair subblocos de seguranca/senha
  - reduzir tamanho e acoplamento

### Lote C

- Quebrar `frontend/src/pages/AdminPages/AdminPages.module.css` por tela/bloco.

### Lote D

- Revisao de duplicacoes entre hooks de cliente/admin para funcoes compartilhadas.
