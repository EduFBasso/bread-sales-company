# 🚀 Roadmap - bread-sales-company

**Data:** 08 de julho de 2026  
**Status:** ✅ v1.0 - Authentication & Approval Workflow Complete

---

## 📊 Fase 1: ✅ COMPLETA - Autenticação (v1.0)

### Escopo Realizado
- ✅ Backend: 8 endpoints de autenticação com JWT
- ✅ 3-stage approval workflow (PENDENTE → APROVADO → BLOQUEADO)
- ✅ ViaCEP integration para auto-preenchimento
- ✅ Frontend: 6 páginas (Home, Register, Login, Pending, Admin, Dashboard)
- ✅ React Router com 6 rotas
- ✅ localStorage persistence
- ✅ E2E workflow validado

### Validações
- ✅ TypeScript strict: 0 erros
- ✅ Backend: 0 erros
- ✅ E2E: Register → Approve → Login → Dashboard
- ✅ ViaCEP: Teste com CEP 01310100 ✅ Funcionando

---

## 📦 Fase 2: 🔜 PRÓXIMA - Catálogo de Produtos

### Escopo Planejado
- [ ] **Backend:**
  - [ ] Endpoint: `GET /api/products/` - Listar produtos públicos
  - [ ] Endpoint: `POST /api/products/` - Admin criar produto (autenticação is_staff)
  - [ ] Endpoint: `PATCH /api/products/{id}/` - Admin editar
  - [ ] Modelo Product com: name, description, price, quantity_available, image_url
  - [ ] Testes unitários para CRUD

- [ ] **Frontend:**
  - [ ] ProdutosCatalogo.tsx - Grid de produtos com imagens
  - [ ] Carrinhos básicos (não persistente)
  - [ ] Filtros por categoria
  - [ ] Busca por nome
  - [ ] CSS responsivo mobile-first

### Critério de Aceitação
- [ ] Listagem de ≥ 10 produtos hardcoded
- [ ] Carrinho mostra subtotal
- [ ] Mobile em tela 360px funciona 100%
- [ ] E2E: Login → Ver Catálogo → Selecionar itens

---

## 📋 Fase 3: 🔜 PRÓXIMA - Criar Pedidos

### Escopo Planejado
- [ ] **Backend:**
  - [ ] Endpoint: `POST /api/orders/` - Criar pedido
  - [ ] Validação de crédito disponível
  - [ ] Cálculo automático de subtotal + total
  - [ ] Transação criada no ledger (débito)
  - [ ] Endpoint: `GET /api/orders/` - Listar pedidos do cliente
  - [ ] Endpoint: `GET /api/orders/{id}/` - Detalhe do pedido

- [ ] **Frontend:**
  - [ ] CheckoutPage.tsx - Revisão de carrinho
  - [ ] Endereço de entrega (clonar do perfil ou editar)
  - [ ] Confirmação com modal
  - [ ] Redirecionamento a OrderConfirmation page

### Critério de Aceitação
- [ ] Pedido criado com status PENDENTE
- [ ] Saldo atualizado dinamicamente (via ledger)
- [ ] Limite de crédito respeitado
- [ ] E2E: Login → Catálogo → Carrinho → Checkout → Confirmação

---

## 👨‍💼 Fase 4: 🔜 PRÓXIMA - Admin Panel para Pedidos

### Escopo Planejado
- [ ] **Backend:**
  - [ ] Endpoint: `GET /api/orders/?status=PENDENTE` - Filtrar pedidos
  - [ ] Endpoint: `PATCH /api/orders/{id}/approve/` - Aprovar pedido
  - [ ] Endpoint: `PATCH /api/orders/{id}/reject/` - Rejeitar
  - [ ] Notificações em tempo real (WebSocket opcional)

- [ ] **Frontend:**
  - [ ] AdminOrdersPage.tsx - Tabela de pedidos pendentes
  - [ ] Action buttons: Aprovar, Rejeitar, Visualizar
  - [ ] Status badge visual (PENDENTE/APROVADO/REJEITADO)
  - [ ] Data/hora de criação

### Critério de Aceitação
- [ ] Admin vê todos os pedidos PENDENTE
- [ ] Ao aprovar, status muda para APROVADO
- [ ] Cliente vê pedido aprovado no dashboard
- [ ] E2E: Admin aprova pedido → Cliente vê status

---

## 💳 Fase 5: 🔜 PRÓXIMA - Pagamentos & Transações

### Escopo Planejado
- [ ] **Backend:**
  - [ ] Endpoint: `POST /api/transactions/payment/` - Registrar pagamento
  - [ ] Validação de valor pago
  - [ ] Atualização automática de saldo devedor
  - [ ] Endpoint: `GET /api/customers/{id}/balance/` - Saldo total

- [ ] **Frontend:**
  - [ ] PaymentPage.tsx - Formulário de pagamento
  - [ ] Saldo devedor atualizado em tempo real
  - [ ] Histórico de transações (tabela)
  - [ ] Recibo PDF download (opcional)

### Critério de Aceitação
- [ ] Cliente vê saldo devedor correto
- [ ] Pode registrar pagamento
- [ ] Transação aparece no histórico
- [ ] E2E: Login → Ver Saldo → Pagar → Confirmação

---

## 📱 Fase 6: 🔜 PRÓXIMA - Otimizações & Polish

### Escopo Planejado
- [ ] **Performance:**
  - [ ] Lazy loading de imagens
  - [ ] Paginação de listas
  - [ ] Cache de produtos

- [ ] **UX/UI:**
  - [ ] Loading skeletons
  - [ ] Toast notifications para ações
  - [ ] Animações de transição
  - [ ] Dark mode (opcional)

- [ ] **Segurança:**
  - [ ] Rate limiting nos endpoints
  - [ ] HTTPS enforced
  - [ ] CSRF tokens

- [ ] **Testing:**
  - [ ] Frontend: Testes com Vitest
  - [ ] Backend: Coverage ≥ 80%
  - [ ] E2E: Cypress tests

### Critério de Aceitação
- [ ] Lighthouse score ≥ 85 (mobile)
- [ ] Todas as rotas testadas
- [ ] Zero console errors

---

## 🌍 Fase 7: 🔜 FUTURA - Produção & Deployment

### Escopo Planejado
- [ ] **Backend:**
  - [ ] PostgreSQL em produção
  - [ ] Migrate do SQLite
  - [ ] Environment variables (.env)
  - [ ] Gunicorn + Nginx
  - [ ] Docker setup

- [ ] **Frontend:**
  - [ ] Build otimizado (npm run build)
  - [ ] Vercel ou Netlify deployment
  - [ ] CDN para assets
  - [ ] Monitoramento de erros (Sentry)

- [ ] **DevOps:**
  - [ ] CI/CD pipeline (GitHub Actions)
  - [ ] Backup automático
  - [ ] Monitoramento de uptime

### Critério de Aceitação
- [ ] Sistema rodando em domínio público
- [ ] HTTPS com certificado válido
- [ ] 99.9% uptime target

---

## 📚 Documentação de Referência

Consulte os documentos em `notes/`:

| Documento | Propósito |
|-----------|-----------|
| [ÍNDICE_DOCUMENTAÇÃO.md](./ÍNDICE_DOCUMENTAÇÃO.md) | Mapa completo de docs |
| [business_rules.md](./business_rules.md) | Regras de negócio |
| [architecture.md](./architecture.md) | Arquitetura técnica |
| [CHECKLIST_FINAL.md](./CHECKLIST_FINAL.md) | Validações v1.0 |

---

## 🎯 Prioridades Imediatas (Próximos PRs)

### Priority 1 (Esta semana)
- Implementar Fase 2: Catálogo de produtos
- Testes unitários para Product model
- Integração com frontend

### Priority 2 (Próxima semana)
- Implementar Fase 3: Criar pedidos
- Validação de crédito
- E2E tests

### Priority 3 (Duas semanas)
- Implementar Fase 4: Admin de pedidos
- Dashboard de vendas

---

## 📞 Contato & Suporte

Para dúvidas sobre o roadmap:
1. Consulte a seção relevante em `notes/`
2. Verifique o ÍNDICE_DOCUMENTAÇÃO.md
3. Revise os testes para exemplos de uso

---

**Atualizado:** 08 de julho de 2026  
**Próxima revisão:** 15 de julho de 2026