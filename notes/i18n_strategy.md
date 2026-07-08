# 🌍 Estratégia de Internacionalização (i18n)

## Princípio Fundamental

**Backend**: Configuração e armazenamento em **English (en)**
**Frontend**: Apresentação e formatação em **Português Brasileiro (pt-BR)**

---

## 📋 Backend: Padrão English (en-US)

### 1. Modelos & Banco de Dados
Todas as constantes (choices) são em English:

```python
# ✅ Correto
PAYMENT_CHOICES = [
    ('CREDIT', 'Credit'),       # Internamente: 'CREDIT'
    ('CASH', 'Cash'),           # Internamente: 'CASH'
    ('PIX', 'PIX'),
    ('TRANSFER', 'Transfer'),
]

STATUS_CHOICES = [
    ('PENDING', 'Pending'),
    ('CONFIRMED', 'Confirmed'),
    ('DELIVERED', 'Delivered'),
    ('CANCELLED', 'Cancelled'),
]

class TransactionType(TextChoices):
    CREDIT = 'CREDIT', 'Credit'
    DEBIT = 'DEBIT', 'Debit'
```

### 2. Serializers: Resposta JSON em en
Todos os endpoints retornam:
- **Chaves (keys)**: English (`payment_method`, `status`, `transaction_type`)
- **Valores de enum**: English (`CREDIT`, `PENDING`, etc.)
- **Displays legíveis**: English (`Payment Method`, `Order Status`)

```json
{
  "id": 123,
  "status": "PENDING",
  "status_display": "Pending",
  "payment_method": "CREDIT",
  "payment_method_display": "Credit",
  "created_at": "2025-07-08T14:30:00Z"
}
```

### 3. Datas & Timestamps
- **Formato no BD**: ISO 8601 com UTC (`2025-07-08T14:30:00Z`)
- **Timezone**: UTC no backend
- **Precisão**: Always use `DecimalField(max_digits=10, decimal_places=2)` para valores monetários

```python
created_at = models.DateTimeField(auto_now_add=True)  # UTC
total_value = models.DecimalField(max_digits=10, decimal_places=2)  # sem símbolos
```

---

## 🎨 Frontend: Padrão Português Brasileiro (pt-BR)

### 1. Mapeamento de Enums
Frontend recebe `CREDIT`, converte para `Fiado` (ou `Crédito`) para exibição:

```javascript
// Frontend: utils/translations.ts
export const PAYMENT_METHOD_MAP = {
  'CREDIT': 'Fiado',
  'CASH': 'Dinheiro',
  'PIX': 'PIX',
  'TRANSFER': 'Transferência'
};

export const STATUS_MAP = {
  'PENDING': 'Pendente',
  'CONFIRMED': 'Confirmado',
  'DELIVERED': 'Entregue',
  'CANCELLED': 'Cancelado'
};

export const TRANSACTION_TYPE_MAP = {
  'CREDIT': 'Crédito/Depósito',
  'DEBIT': 'Débito/Venda'
};

// Uso em componentes
const paymentLabel = PAYMENT_METHOD_MAP[order.payment_method];  // "Fiado"
```

### 2. Formatação de Datas em pt-BR
```javascript
// Convertendo timestamp ISO em formato legível em português

// ❌ Evitar
new Date('2025-07-08T14:30:00Z').toString()  // "Tue Jul 08 2025 11:30:00..."

// ✅ Correto - Intl API
const formatter = new Intl.DateTimeFormat('pt-BR', {
  dateStyle: 'short',    // "08/07/2025"
  timeStyle: 'short'     // "14:30"
});
formatter.format(new Date('2025-07-08T14:30:00Z'));  // "08/07/2025 14:30"

// OU com day.js (recomendado para React)
import dayjs from 'dayjs';
import 'dayjs/locale/pt-br';
dayjs.locale('pt-br');
dayjs('2025-07-08T14:30:00Z').format('DD/MM/YYYY HH:mm');  // "08/07/2025 14:30"
```

### 3. Formatação de Valores Monetários em pt-BR
```javascript
// ❌ Evitar
(10.50).toString()  // "10.5"

// ✅ Correto - Intl API
const formatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  minimumFractionDigits: 2
});
formatter.format(10.50);  // "R$ 10,50" (note: vírgula, não ponto)

// OU com uma função helper
export function formatCurrency(value) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
}

formatCurrency(1234.56);  // "R$ 1.234,56"
```

### 4. Exemplos de Dados Exibidos

| Campo | Backend | Frontend | Exemplo |
|-------|---------|----------|---------|
| `payment_method` | `"CREDIT"` | `"Fiado"` | `"Fiado"` |
| `status` | `"PENDING"` | `"Pendente"` | `"Pendente"` |
| `created_at` | `"2025-07-08T14:30:00Z"` | Formatado | `"08/07/2025 14:30"` |
| `total_value` | `"1234.56"` | Formatado | `"R$ 1.234,56"` |
| `credit_limit` | `"5000.00"` | Formatado | `"R$ 5.000,00"` |

---

## 🔄 Fluxo de Dados: API → Frontend

### Exemplo Completo

**Backend API Response (en):**
```json
{
  "id": 42,
  "customer": 5,
  "customer_nickname": "Supermercado Central",
  "status": "PENDING",
  "status_display": "Pending",
  "delivery_date": "2025-07-09T08:00:00Z",
  "payment_method": "CREDIT",
  "payment_method_display": "Credit",
  "total_value": "2840.50",
  "created_at": "2025-07-08T14:30:00Z",
  "items": [
    {
      "id": 1,
      "product_details": {
        "name": "Pao de Hamburguer (Pacote 4un)",
        "price": "15.50"
      },
      "quantity": 184,
      "unit_price": "15.50",
      "subtotal": "2852.00"
    }
  ]
}
```

**Frontend Apresentação (pt-BR):**
```
Pedido #42
Cliente: Supermercado Central

Status: Pendente ✓
Forma de Pagamento: Fiado ✓
Data de Entrega: 09/07/2025 às 08:00 ✓

Itens:
  - Pão de Hambúrguer (Pacote 4un) × 184
    R$ 15,50 × 184 = R$ 2.852,00

Valor Total: R$ 2.852,00
Criado em: 08/07/2025 às 14:30
```

---

## 📝 Regras de Implementação

### Backend (Django)
1. **Sempre** armazene constantes em English
2. **Sempre** retorne JSON com chaves em English
3. **Sempre** use ISO 8601 para datas (`auto_now_add=True` gera automaticamente)
4. **Sempre** use `DecimalField` para moeda, sem formatação (retornar string numérica)
5. **Nunca** aplique formatação de data/moeda no backend

### Frontend (React + Vite)
1. **Sempre** aplique i18n ao receber dados da API
2. **Sempre** formate datas com `dayjs` ou `Intl.DateTimeFormat`
3. **Sempre** formate moeda com `Intl.NumberFormat` ou biblioteca
4. **Sempre** mapeie enums usando dicionário (map/object)
5. **Nunca** armazene dados formatados em estado (sempre formatados ao renderizar)

---

## 🛠️ Dependências Recomendadas (Frontend)

### Data & Time
```bash
npm install dayjs
```

### Configuração (próximo commit)
```typescript
// src/i18n/locale.ts
import dayjs from 'dayjs';
import 'dayjs/locale/pt-br';

dayjs.locale('pt-br');

export const formatDate = (isoString: string) =>
  dayjs(isoString).format('DD/MM/YYYY HH:mm');

export const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
```

---

## 🚀 Status de Implementação

- ✅ Backend: Modelos com choices em English
- ✅ Backend: Serializers retornando en
- ✅ Frontend: Estrutura preparada (será implementada ao criar componentes React)
- ⏳ Frontend: Mapeamentos de enums
- ⏳ Frontend: Formatadores de data/moeda

