import React, { useState } from 'react';
import { useAdminOrders } from '../hooks/useAdminOrders';
import { useUpdateOrderStatus } from '../hooks/useUpdateOrderStatus';
import { useCancelOrder } from '../hooks/useCancelOrder';
import styles from './AdminOrdersPanel.module.css';

const ORDER_STATUSES = [
  { value: 'PENDING', label: 'Pendente', color: '#F4A460' },
  { value: 'CONFIRMED', label: 'Confirmado', color: '#32CD32' },
  { value: 'DELIVERED', label: 'Entregue', color: '#1E90FF' },
  { value: 'CANCELLED', label: 'Cancelado', color: '#DC143C' },
];

interface AdminOrdersPanelProps {
  onRefresh?: () => void;
}

export function AdminOrdersPanel({ onRefresh }: AdminOrdersPanelProps) {
  const [filters, setFilters] = useState({
    status: '',
    customer_nickname: '',
    page: 1,
    page_size: 20,
  });

  const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null);
  const [showCancelDialog, setShowCancelDialog] = useState<number | null>(null);
  const [cancelReason, setCancelReason] = useState('');

  const { orders, loading, error, pagination } = useAdminOrders(filters);
  const { updateStatus, loading: statusLoading } = useUpdateOrderStatus();
  const { cancelOrder, loading: cancelLoading } = useCancelOrder();

  const handleStatusChange = async (orderId: number, newStatus: string) => {
    const result = await updateStatus(orderId, newStatus);
    if (result) {
      onRefresh?.();
    }
  };

  const handleCancelOrder = async () => {
    if (!showCancelDialog || !cancelReason.trim()) return;

    const result = await cancelOrder(showCancelDialog, cancelReason);
    if (result) {
      setCancelReason('');
      setShowCancelDialog(null);
      onRefresh?.();
    }
  };

  const getStatusInfo = (status: string) => {
    return (
      ORDER_STATUSES.find((s) => s.value === status) || {
        value: status,
        label: status,
        color: '#999',
      }
    );
  };

  const toggleExpanded = (orderId: number) => {
    setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
  };

  if (loading && orders.length === 0) {
    return <div className={styles.loading}>Carregando pedidos...</div>;
  }

  return (
    <div className={styles.container}>
      {/* Filtros */}
      <div className={styles.filters}>
        <input
          type="text"
          placeholder="Pesquisar por apelido do cliente..."
          value={filters.customer_nickname}
          onChange={(e) => setFilters({ ...filters, customer_nickname: e.target.value, page: 1 })}
          className={styles.filterInput}
        />

        <select
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}
          className={styles.filterSelect}
        >
          <option value="">Todos os Status</option>
          {ORDER_STATUSES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      {error && <div className={styles.error}>Erro: {error}</div>}

      {/* Tabela de Pedidos */}
      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Pedido</th>
              <th>Cliente</th>
              <th>Status</th>
              <th>Data</th>
              <th>Total</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <React.Fragment key={order.id}>
                <tr className={styles.orderRow} onClick={() => toggleExpanded(order.id)}>
                  <td className={styles.orderNumber}>{order.order_number}</td>
                  <td>{order.customer_nickname}</td>
                  <td>
                    <span
                      className={styles.statusBadge}
                      style={{ backgroundColor: getStatusInfo(order.status).color }}
                    >
                      {getStatusInfo(order.status).label}
                    </span>
                  </td>
                  <td>{new Date(order.order_date).toLocaleDateString('pt-BR')}</td>
                  <td className={styles.value}>R$ {parseFloat(order.total_value).toFixed(2)}</td>
                  <td className={styles.actions}>
                    <button
                      className={styles.expandBtn}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleExpanded(order.id);
                      }}
                    >
                      {expandedOrderId === order.id ? '▼' : '▶'}
                    </button>
                  </td>
                </tr>

                {/* Detalhes expansíveis */}
                {expandedOrderId === order.id && (
                  <tr className={styles.expandedRow}>
                    <td colSpan={6}>
                      <div className={styles.details}>
                        <div className={styles.detailsGrid}>
                          <div>
                            <strong>Data de Entrega:</strong>
                            <p>{new Date(order.delivery_date).toLocaleDateString('pt-BR')}</p>
                          </div>
                          <div>
                            <strong>Método de Pagamento:</strong>
                            <p>{order.payment_method}</p>
                          </div>
                          <div>
                            <strong>Itens:</strong>
                            <ul className={styles.itemsList}>
                              {order.items.map((item, idx) => (
                                <li key={idx}>
                                  {item.product_name} × {item.quantity} = R${' '}
                                  {parseFloat(item.subtotal).toFixed(2)}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        {/* Botões de Ação */}
                        <div className={styles.actionButtons}>
                          {order.status !== 'CANCELLED' && order.status !== 'DELIVERED' && (
                            <div className={styles.statusUpdateContainer}>
                              <label>Atualizar Status:</label>
                              <select
                                value=""
                                onChange={(e) => {
                                  if (e.target.value) {
                                    handleStatusChange(order.id, e.target.value);
                                  }
                                }}
                                className={styles.statusSelect}
                                disabled={statusLoading}
                              >
                                <option value="">Selecionar novo status...</option>
                                {ORDER_STATUSES.filter((s) => s.value !== order.status).map((s) => (
                                  <option key={s.value} value={s.value}>
                                    → {s.label}
                                  </option>
                                ))}
                              </select>
                            </div>
                          )}

                          {order.status !== 'CANCELLED' && order.status !== 'DELIVERED' && (
                            <button
                              className={styles.cancelBtn}
                              onClick={() => setShowCancelDialog(order.id)}
                            >
                              Cancelar Pedido
                            </button>
                          )}
                        </div>

                        {/* Dialog de Cancelamento */}
                        {showCancelDialog === order.id && (
                          <div className={styles.cancelDialog}>
                            <label>Motivo do cancelamento:</label>
                            <textarea
                              value={cancelReason}
                              onChange={(e) => setCancelReason(e.target.value)}
                              placeholder="Ex: Cliente solicitou cancelamento"
                              className={styles.cancelReasonInput}
                            />
                            <div className={styles.cancelDialogButtons}>
                              <button
                                className={styles.confirmBtn}
                                onClick={handleCancelOrder}
                                disabled={!cancelReason.trim() || cancelLoading}
                              >
                                Confirmar Cancelamento
                              </button>
                              <button
                                className={styles.abortBtn}
                                onClick={() => {
                                  setShowCancelDialog(null);
                                  setCancelReason('');
                                }}
                              >
                                Voltar
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {/* Paginação */}
      <div className={styles.pagination}>
        <button
          disabled={!pagination.previous}
          onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
        >
          ← Anterior
        </button>
        <span>
          Página {filters.page} de {Math.ceil(pagination.count / filters.page_size)}
        </span>
        <button
          disabled={!pagination.next}
          onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
        >
          Próxima →
        </button>
      </div>
    </div>
  );
}
