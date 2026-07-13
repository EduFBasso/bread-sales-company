import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProducts, Product } from '../hooks/useProducts';
import { useCreateOrder, CreateOrderPayload } from '../hooks/useCreateOrder';
import { useCustomerAuth } from '../hooks/useCustomerAuth';
import styles from './CreateOrderForm.module.css';

interface CartItem {
  product: Product;
  quantity: number;
}

export function CreateOrderForm() {
  const navigate = useNavigate();
  const { customer, token } = useCustomerAuth();
  const { products, loading: productsLoading, error: productsError } = useProducts();
  const { createOrder, loading: orderLoading, error: orderError } = useCreateOrder();

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [selectedQuantityInput, setSelectedQuantityInput] = useState<string>('');

  const [deliveryDate, setDeliveryDate] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<string>('CREDIT');
  const [notes, setNotes] = useState<string>('');
  const [financial, setFinancial] = useState<{
    limit: number;
    used: number;
    available: number;
  } | null>(null);

  useEffect(() => {
    // Regra operacional: pedido feito hoje entrega no dia seguinte (D+1).
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const yyyy = tomorrow.getFullYear();
    const mm = String(tomorrow.getMonth() + 1).padStart(2, '0');
    const dd = String(tomorrow.getDate()).padStart(2, '0');
    setDeliveryDate(`${yyyy}-${mm}-${dd}`);
  }, []);

  const parsePositiveInteger = (value: string): number | null => {
    const trimmed = value.trim();
    if (!trimmed) {
      return null;
    }
    const parsed = Number.parseInt(trimmed, 10);
    if (!Number.isFinite(parsed) || parsed <= 0) {
      return null;
    }
    return parsed;
  };

  const handleAddToCart = () => {
    if (!selectedProductId) {
      alert('Selecione um produto');
      return;
    }

    const selectedQuantity = parsePositiveInteger(selectedQuantityInput);
    if (!selectedQuantity) {
      alert('Informe uma quantidade válida (ex: 10)');
      return;
    }

    const product = products.find((p) => p.id === parseInt(selectedProductId));
    if (!product) return;

    // Verificar se já está no carrinho
    const existingItem = cartItems.find((item) => item.product.id === product.id);
    if (existingItem) {
      // Incrementar quantidade
      setCartItems(
        cartItems.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + selectedQuantity }
            : item
        )
      );
    } else {
      // Adicionar novo item
      setCartItems([...cartItems, { product, quantity: selectedQuantity }]);
    }

    // Resetar seleção
    setSelectedProductId('');
    setSelectedQuantityInput('');
  };

  const handleRemoveFromCart = (productId: number) => {
    setCartItems(cartItems.filter((item) => item.product.id !== productId));
  };

  const handleUpdateQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveFromCart(productId);
      return;
    }
    setCartItems(
      cartItems.map((item) => (item.product.id === productId ? { ...item, quantity } : item))
    );
  };

  const calculateTotal = (): number => {
    return cartItems.reduce((total, item) => {
      const price = parseFloat(item.product.price);
      return total + price * item.quantity;
    }, 0);
  };

  const parseMoney = (value?: string) => {
    const parsed = Number.parseFloat(String(value ?? '0'));
    return Number.isFinite(parsed) ? parsed : 0;
  };

  useEffect(() => {
    const bootstrapFinancial = async () => {
      if (!token) {
        return;
      }

      try {
        const response = await fetch('/api/customers/me/', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          return;
        }

        const data = await response.json();
        setFinancial({
          limit: parseMoney(data.financial_limit ?? data.credit_limit),
          used: parseMoney(data.financial_used ?? data.current_balance),
          available: parseMoney(data.financial_available ?? data.available_credit),
        });
      } catch (err) {
        console.error('Erro ao carregar resumo financeiro do cliente:', err);
      }
    };

    void bootstrapFinancial();
  }, [token]);

  const financialLimit =
    financial?.limit ?? parseMoney(customer?.financial_limit ?? customer?.credit_limit);
  const financialUsed =
    financial?.used ?? parseMoney(customer?.financial_used ?? customer?.current_balance);
  const availableCredit =
    financial?.available ?? parseMoney(customer?.financial_available ?? customer?.available_credit);

  const orderTotal = calculateTotal();
  const exceedsAvailableCredit = paymentMethod === 'CREDIT' && orderTotal > availableCredit;
  const projectedAvailable = Math.max(
    0,
    availableCredit - (paymentMethod === 'CREDIT' ? orderTotal : 0)
  );
  const isSubmitDisabled = orderLoading || cartItems.length === 0 || exceedsAvailableCredit;

  const formatCurrency = (value: number) => {
    return `R$ ${value.toFixed(2).replace('.', ',')}`;
  };

  const formatDeliveryDateLabel = (value: string) => {
    if (!value) {
      return '';
    }
    const [year, month, day] = value.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    const weekday = new Intl.DateTimeFormat('pt-BR', { weekday: 'short' })
      .format(date)
      .replace('.', '');
    const dd = String(day).padStart(2, '0');
    const mm = String(month).padStart(2, '0');
    const yy = String(year).slice(-2);
    return `${weekday}, ${dd}/${mm}/${yy}`;
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validações
    if (cartItems.length === 0) {
      alert('Adicione pelo menos um item ao carrinho');
      return;
    }

    if (!deliveryDate) {
      alert('Defina a data de entrega');
      return;
    }

    if (exceedsAvailableCredit) {
      alert(
        `Pedido excede o limite disponível. Total: R$ ${orderTotal.toFixed(2)} | Disponível: R$ ${availableCredit.toFixed(2)}`
      );
      return;
    }

    // Preparar payload
    const [year, month, day] = deliveryDate.split('-').map(Number);
    const scheduledDelivery = new Date(year, month - 1, day, 8, 0, 0);

    const payload: CreateOrderPayload = {
      delivery_date: scheduledDelivery.toISOString(),
      payment_method: paymentMethod,
      notes,
      items: cartItems.map((item) => ({
        product_id: item.product.id,
        quantity: item.quantity,
      })),
    };

    // Criar pedido
    const result = await createOrder(payload);
    if (result) {
      alert(`Pedido criado com sucesso! ID: ${result.order_number}`);
      navigate('/customer/dashboard');
    }
  };

  if (productsLoading) {
    return <div className={styles.container}>Carregando produtos...</div>;
  }

  if (productsError) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>Erro: {productsError}</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h2>Criar Novo Pedido</h2>

      <div className={styles.content}>
        <div className={styles.financialSection}>
          <h3>Resumo Financeiro</h3>
          <div className={styles.financialGrid}>
            <div className={styles.financialCard}>
              <label>Saldo Limite</label>
              <p>{formatCurrency(financialLimit)}</p>
            </div>
            <div className={styles.financialCard}>
              <label>Saldo Utilizado</label>
              <p>{formatCurrency(financialUsed)}</p>
            </div>
            <div className={styles.financialCard}>
              <label>Saldo Disponível</label>
              <p>{formatCurrency(availableCredit)}</p>
            </div>
          </div>
          {paymentMethod === 'CREDIT' && cartItems.length > 0 && (
            <p className={styles.financialProjection}>
              Após este pedido: <strong>{formatCurrency(projectedAvailable)}</strong>
            </p>
          )}
        </div>

        {/* Seção de seleção de produtos */}
        <div className={styles.section}>
          <h3>📦 Selecionar Produtos</h3>
          <div className={styles.productSelector}>
            <select
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              className={styles.select}
            >
              <option value="">Escolha um produto...</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name} - R$ {parseFloat(product.price).toFixed(2)}
                </option>
              ))}
            </select>

            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={selectedQuantityInput}
              onChange={(e) => {
                const next = e.target.value.replace(/\D/g, '');
                setSelectedQuantityInput(next);
              }}
              onFocus={(e) => e.currentTarget.select()}
              className={styles.quantitySelectorInput}
              placeholder="Ex: 10"
              aria-label="Quantidade"
            />

            <button onClick={handleAddToCart} className={styles.buttonAdd} type="button">
              Adicionar ao Carrinho
            </button>
          </div>
        </div>

        {/* Carrinho */}
        <div className={styles.section}>
          <h3>🛒 Carrinho ({cartItems.length} itens)</h3>
          {cartItems.length === 0 ? (
            <p className={styles.emptyMessage}>Carrinho vazio. Adicione produtos acima.</p>
          ) : (
            <div className={styles.cartItems}>
              {cartItems.map((item) => (
                <div key={item.product.id} className={styles.cartItem}>
                  <div className={styles.itemInfo}>
                    <span className={styles.itemName}>{item.product.name}</span>
                    <span className={styles.itemPrice}>
                      R$ {parseFloat(item.product.price).toFixed(2)} cada
                    </span>
                  </div>

                  <div className={styles.itemQuantity}>
                    <button
                      onClick={() => handleUpdateQuantity(item.product.id, item.quantity - 1)}
                      className={styles.buttonSmall}
                      type="button"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) =>
                        handleUpdateQuantity(item.product.id, parseInt(e.target.value) || 1)
                      }
                      className={styles.quantityInput}
                    />
                    <button
                      onClick={() => handleUpdateQuantity(item.product.id, item.quantity + 1)}
                      className={styles.buttonSmall}
                      type="button"
                    >
                      +
                    </button>
                  </div>

                  <div className={styles.itemSubtotal}>
                    R$ {(parseFloat(item.product.price) * item.quantity).toFixed(2)}
                  </div>

                  <button
                    onClick={() => handleRemoveFromCart(item.product.id)}
                    className={styles.buttonRemove}
                    type="button"
                  >
                    ✕
                  </button>
                </div>
              ))}

              <div className={styles.cartTotal}>
                <strong>Total:</strong>
                <strong className={styles.totalAmount}>R$ {calculateTotal().toFixed(2)}</strong>
              </div>
            </div>
          )}
        </div>

        {/* Dados de entrega e pagamento */}
        <form onSubmit={handleSubmitOrder} className={styles.formSection}>
          <div className={styles.section}>
            <h3>📅 Dados de Entrega</h3>

            <div className={styles.formGroup}>
              <label>Data de Entrega *</label>
              <input
                type="text"
                value={formatDeliveryDateLabel(deliveryDate)}
                className={styles.dateAutoInput}
                readOnly
                aria-label="Data de entrega automática"
              />
            </div>

            <div className={styles.formGroup}>
              <label>Notas (opcional)</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className={styles.textarea}
                placeholder="Ex: Entregar na portaria"
                rows={3}
              />
            </div>
          </div>

          {/* Método de pagamento */}
          <div className={styles.section}>
            <h3>💳 Método de Pagamento</h3>

            <div className={styles.formGroup}>
              <label>Escolha o método *</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className={styles.select}
                required
              >
                <option value="CREDIT">Fiado (Crédito)</option>
                <option value="CASH">Dinheiro</option>
                <option value="PIX">PIX</option>
                <option value="TRANSFER">Transferência</option>
              </select>
            </div>
          </div>

          {/* Erro de criação */}
          {orderError && <div className={styles.error}>Erro: {orderError}</div>}

          {exceedsAvailableCredit && (
            <div className={styles.error}>
              Limite insuficiente para este pedido. Disponível: R$ {availableCredit.toFixed(2)} |
              Total: R$ {orderTotal.toFixed(2)}
            </div>
          )}

          {/* Botões de ação */}
          <div className={styles.actions}>
            <button
              type="button"
              onClick={() => navigate('/customer/dashboard')}
              className={styles.buttonCancel}
            >
              Cancelar
            </button>

            <button type="submit" className={styles.buttonSubmit} disabled={isSubmitDisabled}>
              {orderLoading ? 'Criando pedido...' : 'Criar Pedido'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
