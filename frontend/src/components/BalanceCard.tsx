import { useCustomerDashboard } from '../hooks/useCustomerDashboard';
import styles from './BalanceCard.module.css';

export function BalanceCard() {
  const { data } = useCustomerDashboard();

  if (!data) {
    return null;
  }

  // Calcular crédito disponível: Limite - Saldo (em valor absoluto)
  const absoluteBalance = Math.abs(data.balance);
  const availableForPurchase = Math.max(0, data.creditLimit - absoluteBalance);
  const usedPercentage =
    data.creditLimit > 0 ? Math.round((absoluteBalance / data.creditLimit) * 100) : 0;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3>💰 Saldo & Crédito</h3>
      </div>

      <div className={styles.content}>
        {/* Current Balance */}
        <div className={styles.item}>
          <div className={styles.label}>Saldo Atual</div>
          <div className={styles.value}>R$ {absoluteBalance.toFixed(2)}</div>
          {data.balance < 0 && (
            <div className={styles.subtext}>Dívida: R$ {absoluteBalance.toFixed(2)}</div>
          )}
          {data.balance >= 0 && <div className={styles.subtext}>A favor</div>}
        </div>

        {/* Available Credit */}
        <div className={styles.item}>
          <div className={styles.label}>Disponível para Compra</div>
          <div className={styles.value}>R$ {availableForPurchase.toFixed(2)}</div>
          <div className={styles.progressBar}>
            <div className={styles.progressFill} style={{ width: `${usedPercentage}%` }} />
          </div>
          <div className={styles.subtext}>de R$ {data.creditLimit.toFixed(2)}</div>
        </div>

        {/* Credit Limit */}
        <div className={styles.item}>
          <div className={styles.label}>Limite de Crédito</div>
          <div className={styles.value}>R$ {data.creditLimit.toFixed(2)}</div>
          <div className={styles.subtext}>{usedPercentage}% utilizado</div>
        </div>
      </div>

      {availableForPurchase <= data.creditLimit * 0.2 && (
        <div className={styles.warning}>⚠️ Limite próximo!</div>
      )}
    </div>
  );
}
