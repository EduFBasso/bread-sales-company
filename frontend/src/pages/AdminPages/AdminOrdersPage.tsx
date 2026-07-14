import { useState } from 'react';
import { AdminOrdersPanel } from '../../components/AdminOrdersPanel';
import styles from './AdminOrdersPage.module.css';

export function AdminOrdersPage() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleRefresh = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>Gerenciamento de Pedidos</h1>
      </header>

      <AdminOrdersPanel key={refreshTrigger} onRefresh={handleRefresh} />
    </div>
  );
}
