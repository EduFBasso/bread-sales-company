# Registro de Alterações

Todas as mudanças significativas neste projeto serão documentadas neste arquivo.

## [Unreleased]

## [1.0.0] - 2026-07-08

### ✅ Adicionado
- **Backend completo:**
  - Django 6.0.7 + Django REST Framework 3.17.1
  - Autenticação JWT com tokens de 24h (access) e 7d (refresh)
  - 3-stage approval workflow: PENDENTE → APROVADO → BLOQUEADO
  - 8 endpoints de autenticação (register, login, me, pending, approve, block, lookup-cep, balance)
  - Integração ViaCEP para auto-preenchimento de endereços
  - Modelo de clientes com suporte PF/PJ
  - Livro caixa com transações imutáveis
  - CORS habilitado para localhost
  - requirements.txt com 25 pacotes pinned

- **Frontend completo:**
  - React 19.2.7 + TypeScript 7.0.2 (strict mode)
  - React Router 7.18.1 com 6 rotas principais
  - Vite 8.1.3 como bundler
  - CSS Modules com tema panificadora (#D4825C)
  - 6 páginas: HomePage, RegisterPage, LoginPage, PendingPage, AdminPage, ClientDashboard
  - Hook useCustomer para gerenciamento de autenticação
  - Service API com 9 métodos
  - localStorage persistence para tokens e dados
  - Validação de formulários
  - Loading states e error handling

- **Documentação:**
  - README.md com stack tech completo e quick start
  - changelog.md estruturado
  - Backend API Guide
  - Backend Testing Guide
  - Frontend Setup Plan
  - Business Rules Documentation
  - Architecture Documentation

### 🧪 Validado
- E2E workflow: Registro → Aprovação → Login → Dashboard (✅ SUCESSO)
- ViaCEP integration: CEP 01310100 → Avenida Paulista (✅ FUNCIONANDO)
- JWT token generation e refresh (✅ FUNCIONANDO)
- TypeScript strict mode compilation (✅ 0 ERROS)
- Backend syntax validation (✅ 0 ERROS)
- Django test suite (✅ TODOS PASSING)

### 🔧 Modificado
- README.md: Atualizado com informações reais do projeto
- .gitignore: Expandido para excluir gerados (*.js, node_modules, etc)
- Pylance configuration: Apontado para backend/.venv/bin/python

### 📋 Notas de Desenvolvimento
- Ambiente Python isolado em backend/.venv/
- Frontend roda em Vite dev server (localhost:5173)
- Backend em Django dev server (localhost:8000)
- SQLite para desenvolvimento
- Pronto para transição para PostgreSQL em produção

## [0.1.0] - Planejamento Inicial
- Definição de escopo
- Design de arquitetura
- Planejamento de endpoints
- Setup inicial de estrutura