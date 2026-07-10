import { useCustomerTransactions } from '../hooks/useCustomerTransactions';
import styles from './TransactionHistory.module.css';

export function TransactionHistory() {
  const { transactions, loading, error } = useCustomerTransactions();

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <h3>💳 Histórico de Pagamentos</h3>
        </div>
        <div className={styles.skeleton} />
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <h3>💳 Histórico de Pagamentos</h3>
        </div>
        <div className={styles.errorMessage}>{error}</div>
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <h3>💳 Histórico de Pagamentos</h3>
        </div>
        <div className={styles.emptyState}>
          <p>Nenhuma transação registrada</p>
          <small>Suas transações aparecerão aqui</small>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTransactionIcon = (type: string) => {
    return type === 'CREDITO' ? '➕' : '➖';
  };

  const getTransactionColor = (type: string) => {
    return type === 'CREDITO' ? styles.credit : styles.debit;
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3>💳 Histórico de Pagamentos</h3>
        <span className={styles.count}>{transactions.length}</span>
      </div>

      <div className={styles.table}>
        <div className={styles.tableHeader}>
          <div className={styles.colDate}>Data</div>
          <div className={styles.colDescription}>Descrição</div>
          <div className={styles.colType}>Tipo</div>
          <div className={styles.colAmount}>Valor</div>
        </div>

        <div className={styles.tableBody}>
          {transactions.map((transaction) => (
            <div 
              key={transaction.id} 
              className={`${styles.row} ${getTransactionColor(transaction.transaction_type)}`}
            >
              <div className={styles.colDate}>
                {formatDate(transaction.transaction_date || transaction.created_at)}
              </div>
              <div className={styles.colDescription}>
                {transaction.description}
                {transaction.reference_order_id && (
                  <span className={styles.reference}>
                    (Pedido #{transaction.reference_order_id})
                  </span>
                )}
              </div>
              <div className={styles.colType}>
                <span className={styles.typeBadge}>
                  {getTransactionIcon(transaction.transaction_type)}
                  {transaction.transaction_type === 'CREDITO' ? 'Crédito' : 'Débito'}
                </span>
              </div>
              <div className={`${styles.colAmount} ${styles[transaction.transaction_type.toLowerCase()]}`}>
                {transaction.transaction_type === 'CREDITO' ? '+' : '-'}R$ {parseFloat(transaction.amount).toFixed(2)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
