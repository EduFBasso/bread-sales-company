import { CreateOrderForm } from '../../components/CreateOrderForm';
import styles from './CustomerCreateOrderPage.module.css';

export function CustomerCreateOrderPage() {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>🥖 Minha Conta - Novo Pedido</h1>
      </div>

      <main className={styles.main}>
        <CreateOrderForm />
      </main>
    </div>
  );
}
