import { useNavigate } from 'react-router-dom';
import { useCustomerAuth } from '../../hooks';
import styles from './ClientPages.module.css';

export function ClientPages() {
  const navigate = useNavigate();
  const { customer, logout } = useCustomerAuth();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!customer) {
    return <div className={styles.container}>Carregando...</div>;
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1>🥖 Minha Conta</h1>
          <button onClick={handleLogout} className={styles.logoutButton}>
            Sair
          </button>
        </div>
      </header>

      <main className={styles.main}>
        <section className={styles.welcomeSection}>
          <h2>Bem-vindo, {customer.nickname}!</h2>
          <p className={styles.subtitle}>
            Status: <strong>{customer.status}</strong>
          </p>
        </section>

        <section className={styles.section}>
          <h3>📋 Informações da Conta</h3>
          <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
              <label>Apelido</label>
              <p>{customer.nickname}</p>
            </div>
            <div className={styles.infoItem}>
              <label>Tipo</label>
              <p>{customer.customer_type === 'PF' ? 'Pessoa Física' : 'Pessoa Jurídica'}</p>
            </div>
            {customer.phone && (
              <div className={styles.infoItem}>
                <label>Telefone</label>
                <p>{customer.phone}</p>
              </div>
            )}
          </div>
        </section>

        <section className={styles.section}>
          <h3>🛠️ Próximas Funcionalidades</h3>
          <ul className={styles.featureList}>
            <li>📊 Saldo e Crédito Disponível</li>
            <li>📦 Meus Pedidos</li>
            <li>💳 Histórico de Pagamentos</li>
            <li>🛒 Fazer Novo Pedido</li>
          </ul>
        </section>
      </main>
    </div>
  );
}
