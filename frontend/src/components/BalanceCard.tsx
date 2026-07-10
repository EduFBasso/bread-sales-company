import { useCustomerDashboard } from '../hooks/useCustomerDashboard';
import styles from './BalanceCard.module.css';

export function BalanceCard() {
  const { data } = useCustomerDashboard();

  if (!data) {
    return null;
  }

  const balancePercentage = data.creditLimit > 0 
    ? Math.round((data.availableCredit / data.creditLimit) * 100) 
    : 0;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3>💰 Saldo & Crédito</h3>
      </div>

      <div className={styles.content}>
        {/* Current Balance */}
        <div className={styles.item}>
          <div className={styles.label}>Saldo Atual</div>
          <div className={styles.value}>
            R$ {Math.abs(data.balance).toFixed(2)}
          </div>
          {data.balance < 0 && (
            <div className={styles.subtext}>
              Devendo: R$ {Math.abs(data.balance).toFixed(2)}
            </div>
          )}
          {data.balance >= 0 && (
            <div className={styles.subtext}>
              A favor
            </div>
          )}
        </div>

        {/* Available Credit */}
        <div className={styles.item}>
          <div className={styles.label}>Crédito Disponível</div>
          <div className={styles.value}>
            R$ {data.availableCredit.toFixed(2)}
          </div>
          <div className={styles.progressBar}>
            <div 
              className={styles.progressFill}
              style={{ width: `${balancePercentage}%` }}
            />
          </div>
          <div className={styles.subtext}>
            de R$ {data.creditLimit.toFixed(2)}
          </div>
        </div>

        {/* Credit Limit */}
        <div className={styles.item}>
          <div className={styles.label}>Limite de Crédito</div>
          <div className={styles.value}>
            R$ {data.creditLimit.toFixed(2)}
          </div>
          <div className={styles.subtext}>
            {balancePercentage}% utilizado
          </div>
        </div>
      </div>

      {data.availableCredit <= (data.creditLimit * 0.2) && (
        <div className={styles.warning}>
          ⚠️ Crédito disponível baixo
        </div>
      )}
    </div>
  );
}
