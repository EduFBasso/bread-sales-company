# 🥖 bread-sales-company

Um sistema de gerenciamento de pedidos, saldos e aprovações projetado especificamente para pequenas padarias, padeiros autônomos e distribuidores de pães.

O principal objetivo deste projeto é **eliminar a necessidade de anotações**, substituindo-o por uma solução digital extremamente simples, intuitiva e acessível.

## 🎯 O Problema
Muitos donos de padarias e padeiros autônomos gerenciam suas vendas, fiados e pedidos diários usando papel e caneta. Isso gera problemas como:
* Perda de prazos de entrega.
* Erros na contagem do saldo devedor/pago dos clientes.
* Tempo gasto calculando tudo manualmente no fim do mês.
* Falta de histórico e rastreabilidade de transações.

## 🚀 A Solução
O **bread-sales-company** oferece uma interface ultra-simplificada, pensada para usuários que não têm intimidade com sistemas complexos. O foco está na agilidade tanto para o comerciante quanto para o cliente final.

### ✨ Funcionalidades Principais
* **Pedidos Mobile:** O cliente final acessa pelo celular e faz o pedido em poucos cliques.
* **Controle de Saldo (Livro Caixa):** Gerenciamento dinâmico de pagamentos antecipados, fiado e saldos devedores.
* **Painel do Administrador:** Aprovação de novos clientes com segurança (3 estágios: PENDENTE → APROVADO → BLOQUEADO).
* **Histórico de Transações:** Registro imutável de todos os pagamentos e débitos.
* **Integração ViaCEP:** Auto-preenchimento de endereços pelo CEP.

## 🛠️ Stack Tecnológico

### Backend
* **Framework:** Django 6.0.7
* **API:** Django REST Framework 3.17.1
* **Autenticação:** JWT (djangorestframework_simplejwt)
* **Banco de Dados:** SQLite3 (desenvolvimento) / PostgreSQL (produção)
* **Integração Externa:** ViaCEP para validação de endereços
* **Python:** 3.12.12

### Frontend
* **Framework:** React 19.2.7
* **Linguagem:** TypeScript 7.0.2 (strict mode)
* **Roteamento:** React Router 7.18.1
* **Build Tool:** Vite 8.1.3
* **Estilos:** CSS Modules
* **Cliente HTTP:** Fetch API nativa

## 📋 Arquitetura

### Fluxo de Autenticação (3 Estágios)
```
1. PENDENTE  → Cliente se registra
2. APROVADO  → Admin aprova no painel
3. BLOQUEADO → Opcional, para suspender cliente
```

### Endpoints Principais
* `POST /api/customers/register/` - Registrar novo cliente
* `POST /api/customers/login/` - Login com autenticação JWT
* `GET /api/customers/me/` - Dados do cliente autenticado
* `GET /api/customers/pending/` - Lista de clientes pendentes (admin)
* `PATCH /api/customers/{id}/approve/` - Aprovar cliente (admin)
* `POST /api/customers/lookup-cep/` - ViaCEP lookup

## 🚀 Quick Start

### Backend
```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # macOS/Linux
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```
Servidor em: http://127.0.0.1:8000

### Frontend
```bash
cd frontend
npm install
npm run dev
```
Servidor em: http://localhost:5173

## 📚 Documentação
* **[Notes](./notes/)** - Documentação interna (arquitetura, regras de negócio, decisões técnicas)
* **[Backend Docs](./backend/notes/)** - Guia de API, setup dev, testes
* **[Frontend Docs](./frontend/notes/)** - Guia de setup frontend

## 🧪 Testing

### Backend
```bash
cd backend
python manage.py test
```

### Frontend
```bash
cd frontend
npm run lint  # TypeScript + ESLint
npm run build  # Validar build
```

## 📝 E2E Workflow Validado
- ✅ Registro com auto-fill ViaCEP
- ✅ Aprovação via admin
- ✅ Login com JWT
- ✅ Dashboard com saldo e limite de crédito
- ✅ Transações imutáveis (livro caixa)

## 📄 Licença
MIT

## 👥 Contribuidores
Desenvolvido para micro-empreendedores na área de panificação.