# 📁 Estrutura de Documentação - bread-sales-company

**Última atualização:** 08 de julho de 2026

---

## 🎯 Princípio Organizacional

A documentação do projeto está dividida em **3 níveis**:

```
📦 bread-sales-company/
├── 📄 README.md              ← DOCUMENTAÇÃO PÚBLICA (repositório)
├── 📄 changelog.md           ← HISTÓRICO DE VERSÕES (repositório)
├── 📁 notes/                 ← DOCUMENTAÇÃO INTERNA (controle interno)
│   ├── ROADMAP.md            ← Este documento (próximas fases)
│   ├── ÍNDICE_DOCUMENTAÇÃO.md ← Índice completo
│   ├── architecture.md       ← Arquitetura técnica
│   ├── business_rules.md     ← Regras de negócio
│   ├── SUMÁRIO_EXECUTIVO.md  ← Resumo para stakeholders
│   ├── CHECKLIST_FINAL.md    ← Validações e status
│   ├── CORREÇÕES_IMPLEMENTADAS.md ← Histórico de mudanças
│   ├── BEFORE_AFTER_COMPARACAO.md ← Comparação visual
│   ├── ALINHAMENTO_FASE5.md  ← Alinhamento sprint
│   └── i18n_strategy.md      ← Estratégia de internacionalização
├── 📁 backend/
│   └── 📁 notes/             ← DOCUMENTAÇÃO BACKEND (dev)
│       ├── API_GUIDE.md      ← Guia de endpoints
│       ├── README_DEV.md     ← Setup desenvolvimento
│       └── TESTING.md        ← Testes unitários
└── 📁 frontend/
    └── 📁 notes/             ← DOCUMENTAÇÃO FRONTEND (dev)
        └── FRONTEND_SETUP_PLAN.md ← Setup frontend
```

---

## 📊 Quem Lê Cada Documento?

### 🤵 Stakeholder / Gerente
**Objetivo:** Entender escopo, status, próximos passos

**Comece com:**
1. [README.md](../README.md) - Visão geral do projeto (2 min)
2. [changelog.md](../changelog.md) - O que foi feito (2 min)
3. [notes/SUMÁRIO_EXECUTIVO.md](./SUMÁRIO_EXECUTIVO.md) - Status atual (3 min)

**Total: ~7 minutos**

---

### 👨‍💻 Developer (Backend)
**Objetivo:** Implementar novos endpoints, entender arquitetura

**Comece com:**
1. [notes/ÍNDICE_DOCUMENTAÇÃO.md](./ÍNDICE_DOCUMENTAÇÃO.md) - Índice geral (3 min)
2. [notes/business_rules.md](./business_rules.md) - Regras de negócio (5 min)
3. [backend/notes/API_GUIDE.md](../backend/notes/API_GUIDE.md) - Endpoints (10 min)
4. [backend/notes/README_DEV.md](../backend/notes/README_DEV.md) - Setup (5 min)

**Para mudanças específicas:**
- [notes/CORREÇÕES_IMPLEMENTADAS.md](./CORREÇÕES_IMPLEMENTADAS.md) - Histórico de mudanças

**Total: ~25 minutos**

---

### 🎨 Developer (Frontend)
**Objetivo:** Implementar componentes, entender fluxo

**Comece com:**
1. [README.md](../README.md) - Stack frontend (2 min)
2. [notes/SUMÁRIO_EXECUTIVO.md](./SUMÁRIO_EXECUTIVO.md) - Status (3 min)
3. [frontend/notes/FRONTEND_SETUP_PLAN.md](../frontend/notes/FRONTEND_SETUP_PLAN.md) - Setup (10 min)
4. [notes/i18n_strategy.md](./i18n_strategy.md) - Estratégia de linguagem (5 min)

**Para integração com backend:**
- [backend/notes/API_GUIDE.md](../backend/notes/API_GUIDE.md) - Endpoints que irá consumir

**Total: ~20 minutos**

---

### 🧪 QA / Tester
**Objetivo:** Entender escopo de testes, validações

**Comece com:**
1. [notes/CHECKLIST_FINAL.md](./CHECKLIST_FINAL.md) - Validações (5 min)
2. [notes/business_rules.md](./business_rules.md) - Casos de teste (5 min)
3. [backend/notes/TESTING.md](../backend/notes/TESTING.md) - Testes backend (10 min)

**Desenvolvimento futuro:**
- [notes/ROADMAP.md](./ROADMAP.md) - Próximas fases

**Total: ~20 minutos**

---

## 🗂️ Conteúdo de Cada Arquivo

### 📄 Nível Público (Raiz)

#### `README.md`
- **O quê:** Visão geral do projeto
- **Para quem:** Qualquer pessoa descobrindo o projeto
- **Tamanho:** 150 linhas
- **Tempo de leitura:** 2-3 min
- **Contém:**
  - Descrição do problema/solução
  - Stack tecnológico completo
  - Quick start (comandos)
  - Links para docs internas

#### `changelog.md`
- **O quê:** Histórico de versões
- **Para quem:** Developers, stakeholders
- **Tamanho:** 100 linhas
- **Tempo de leitura:** 2-3 min
- **Contém:**
  - [1.0.0] - Versão atual com detalhes
  - ✅ Adicionado
  - 🧪 Validado
  - 📋 Notas de desenvolvimento

---

### 📚 Nível Interno - Negócio (notes/)

#### `SUMÁRIO_EXECUTIVO.md`
- **O quê:** Resumo visual 1-page
- **Para quem:** Stakeholders, tomadores de decisão
- **Tamanho:** 320 linhas
- **Contém:** Status, próximas fases, riscos

#### `business_rules.md`
- **O quê:** Regras de negócio implementadas
- **Para quem:** Todos (developers, QA, PO)
- **Tamanho:** 100+ linhas
- **Contém:**
  - 1. Entidade Cliente (PF/PJ)
  - 2. Catálogo de Produtos
  - 3. Logística de Endereços
  - 4. Fluxo de Saldo (Livro Caixa)

#### `CHECKLIST_FINAL.md`
- **O quê:** Validações de v1.0
- **Para quem:** QA, Lead Dev, PM
- **Tamanho:** 340 linhas
- **Contém:** ✅/❌ checklist de cada feature

---

### 🔧 Nível Interno - Técnico (notes/)

#### `architecture.md`
- **O quê:** Arquitetura técnica
- **Para quem:** Developers
- **Tamanho:** Em construção
- **Próxima:** Será expandido com diagrama de modelos

#### `i18n_strategy.md`
- **O quê:** Internacionalização
- **Para quem:** Frontend/Backend devs
- **Tamanho:** 255 linhas
- **Contém:** Backend (en), Frontend (pt-BR)

#### `CORREÇÕES_IMPLEMENTADAS.md`
- **O quê:** Histórico de mudanças/bugfixes
- **Para quem:** Code review, histórico
- **Tamanho:** 225 linhas
- **Contém:** Lista de correções com detalhes

#### `BEFORE_AFTER_COMPARACAO.md`
- **O quê:** Comparação visual antes/depois
- **Para quem:** Code review
- **Tamanho:** 300+ linhas
- **Contém:** Diffs e comparações

---

### 🚀 Estratégia (notes/)

#### `ROADMAP.md`
- **O quê:** Visão de futuro (Fase 2-7)
- **Para quem:** PO, Developers, Stakeholders
- **Tamanho:** 400+ linhas
- **Contém:**
  - ✅ Fase 1: Autenticação (COMPLETA)
  - 🔜 Fase 2: Catálogo (PRÓXIMA)
  - 🔜 Fase 3: Pedidos
  - 🔜 Fase 4: Admin
  - 🔜 Fase 5: Pagamentos
  - 🔜 Fase 6: Polish
  - 🔜 Fase 7: Produção

#### `ÍNDICE_DOCUMENTAÇÃO.md`
- **O quê:** Mapa completo de docs
- **Para quem:** Qualquer um procurando algo específico
- **Tamanho:** 245 linhas
- **Contém:**
  - Índice por documento
  - Índice por perfil (PO, Dev, QA)
  - Localização de arquivos

---

### 🔍 Backend Específico (backend/notes/)

#### `API_GUIDE.md`
- **O quê:** Documentação de endpoints
- **Para quem:** Frontend devs, QA
- **Tamanho:** 250+ linhas
- **Contém:**
  - POST /api/customers/register/
  - POST /api/customers/login/
  - GET /api/customers/me/
  - etc...

#### `README_DEV.md`
- **O quê:** Setup e desenvolvimento backend
- **Para quem:** Backend devs
- **Tamanho:** 350+ linhas
- **Contém:**
  - Instalação de dependências
  - Estrutura de apps (customers, orders, ledger)
  - Configuração do banco

#### `TESTING.md`
- **O quê:** Guia de testes
- **Para quem:** Backend devs, QA
- **Tamanho:** 300+ linhas
- **Contém:**
  - Testes unitários
  - Fixtures e factories
  - Coverage mínimo

---

### 🎨 Frontend Específico (frontend/notes/)

#### `FRONTEND_SETUP_PLAN.md`
- **O quê:** Setup e planejamento frontend
- **Para quem:** Frontend devs
- **Tamanho:** 500+ linhas
- **Contém:**
  - React 19 + TypeScript setup
  - Estrutura de componentes
  - CSS Modules strategy

---

## 🔄 Fluxo de Atualização da Documentação

### Quando um novo commit é feito:
1. ✏️ Atualizar `changelog.md` com a mudança
2. 📋 Atualizar `notes/CORREÇÕES_IMPLEMENTADAS.md` se for bugfix
3. 🗂️ Atualizar docs específicas (API_GUIDE, architecture, etc)
4. 📚 Revisar ÍNDICE_DOCUMENTAÇÃO.md se houver novos docs

### Quando uma nova fase é iniciada:
1. 📍 Criar seção em `notes/ROADMAP.md`
2. 📋 Definir escopo e critérios de aceitação
3. 🧪 Criar CHECKLIST para validação
4. 📊 Atualizar SUMÁRIO_EXECUTIVO.md

---

## 🎯 Convenções de Nomenclatura

### Em `notes/`:
- **Documentos de Status:** `SUMÁRIO_*.md`, `CHECKLIST_*.md`, `ALINHAMENTO_*.md`
- **Documentos Técnicos:** `architecture.md`, `business_rules.md`
- **Documentos de Estratégia:** `ROADMAP.md`, `i18n_strategy.md`
- **Documentos de Histórico:** `CORREÇÕES_*.md`, `BEFORE_AFTER_*.md`

### Em `backend/notes/` e `frontend/notes/`:
- **Guides:** `*_GUIDE.md`, `*_PLAN.md`
- **Referência:** `README_*.md`
- **Testes:** `TESTING.md`

---

## 📱 Como Usar Esta Documentação

### Primeiro acesso ao projeto?
```
Leia → README.md → notes/SUMÁRIO_EXECUTIVO.md → notes/ROADMAP.md
```

### Precisa implementar um endpoint?
```
Leia → backend/notes/README_DEV.md → backend/notes/API_GUIDE.md → notes/business_rules.md
```

### Precisa corrigir um bug?
```
Leia → notes/CORREÇÕES_IMPLEMENTADAS.md → backend/notes/TESTING.md
```

### Precisa validar tudo?
```
Leia → notes/CHECKLIST_FINAL.md → notes/BEFORE_AFTER_COMPARACAO.md
```

---

## ✨ Dicas para Manutenção

1. **Mantenha docs sincronizadas com código**
   - Ao mudar uma rota, atualize API_GUIDE.md
   - Ao adicionar feature, atualize ROADMAP.md

2. **Use links internos (markdown)**
   ```markdown
   Ver [business_rules.md](./business_rules.md) para detalhes
   ```

3. **Revise regularmente**
   - Spike: Segunda-feira
   - Review: Quinta-feira
   - Cleanup: Friday afternoon

4. **Documente decisões**
   - Adicione em `notes/CORREÇÕES_IMPLEMENTADAS.md`
   - Justifique o "por quê"

---

**Versão:** 1.0  
**Última revisão:** 08 de julho de 2026  
**Próxima revisão:** 15 de julho de 2026