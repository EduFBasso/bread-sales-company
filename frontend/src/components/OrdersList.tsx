import { useCustomerOrders } from '../hooks/useCustomerOrders';
import styles from './OrdersList.module.css';

export function OrdersList() {
  const { orders, loading, error } = useCustomerOrders();

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <h3>📦 Meus Pedidos</h3>
        </div>
        <div className={styles.skeleton} />
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <h3>📦 Meus Pedidos</h3>
        </div>
        <div className={styles.errorMessage}>{error}</div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <h3>📦 Meus Pedidos</h3>
        </div>
        <div className={styles.emptyState}>
          <p>Nenhum pedido realizado ainda</p>
          <small>Comece a fazer seus pedidos agora!</small>
        </div>
      </div>
    );
  }

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'ENTREGUE':
        return styles.statusDelivered;
      case 'CONFIRMADO':
        return styles.statusConfirmed;
      case 'CANCELADO':
        return styles.statusCancelled;
      default:
        return styles.statusPending;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'ENTREGUE':
        return '✓ Entregue';
      case 'CONFIRMADO':
        return '→ Confirmado';
      case 'CANCELADO':
        return '✕ Cancelado';
      default:
        return '⏳ Pendente';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3>📦 Meus Pedidos</h3>
        <span className={styles.count}>{orders.length}</span>
      </div>

      <div className={styles.list}>
        {orders.map((order) => (
          <div key={order.id} className={styles.orderCard}>
            <div className={styles.cardHeader}>
              <div>
                <div className={styles.orderNumber}>Pedido #{order.order_number}</div>
                <div className={styles.orderDate}>{formatDate(order.order_date)}</div>
              </div>
              <div className={`${styles.status} ${getStatusClass(order.status)}`}>
                {getStatusLabel(order.status)}
              </div>
            </div>

            <div className={styles.cardContent}>
              <div className={styles.items}>
                <div className={styles.itemCount}>
                  {order.items.length} {order.items.length === 1 ? 'item' : 'itens'}
                </div>
                <div className={styles.itemsList}>
                  {order.items.slice(0, 2).map((item) => (
                    <div key={item.id} className={styles.itemPreview}>
                      • {item.product_name} (qty: {item.quantity})
                    </div>
                  ))}
                  {order.items.length > 2 && (
                    <div className={styles.itemPreview}>
                      • +{order.items.length - 2} mais
                    </div>
                  )}
                </div>
              </div>

              <div className={styles.amount}>
                R$ {parseFloat(order.total_value).toFixed(2)}
              </div>
            </div>

            {order.delivery_date && (
              <div className={styles.cardFooter}>
                📅 Entrega: {formatDate(order.delivery_date)}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
