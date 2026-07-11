import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProducts, Product } from '../hooks/useProducts';
import { useCreateOrder, CreateOrderPayload } from '../hooks/useCreateOrder';
import styles from './CreateOrderForm.module.css';

interface CartItem {
  product: Product;
  quantity: number;
}

export function CreateOrderForm() {
  const navigate = useNavigate();
  const { products, loading: productsLoading, error: productsError } = useProducts();
  const { createOrder, loading: orderLoading, error: orderError } = useCreateOrder();

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [selectedQuantity, setSelectedQuantity] = useState<number>(1);

  const [deliveryDate, setDeliveryDate] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<string>('CREDIT');
  const [notes, setNotes] = useState<string>('');

  const handleAddToCart = () => {
    if (!selectedProductId) {
      alert('Selecione um produto');
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
    setSelectedQuantity(1);
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

    // Preparar payload
    const payload: CreateOrderPayload = {
      delivery_date: new Date(deliveryDate).toISOString(),
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
              type="number"
              min="1"
              value={selectedQuantity}
              onChange={(e) => setSelectedQuantity(parseInt(e.target.value) || 1)}
              className={styles.input}
              placeholder="Quantidade"
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
                type="datetime-local"
                value={deliveryDate}
                onChange={(e) => setDeliveryDate(e.target.value)}
                className={styles.input}
                required
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

          {/* Botões de ação */}
          <div className={styles.actions}>
            <button
              type="button"
              onClick={() => navigate('/customer/dashboard')}
              className={styles.buttonCancel}
            >
              Cancelar
            </button>

            <button
              type="submit"
              className={styles.buttonSubmit}
              disabled={orderLoading || cartItems.length === 0}
            >
              {orderLoading ? 'Criando pedido...' : 'Criar Pedido'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
