import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminCustomers } from '../../hooks/useAdminCustomers';
import styles from './AdminPages.module.css';

export function AdminPages() {
  const navigate = useNavigate();
  const [successMessage, setSuccessMessage] = useState('');

  const { pendingCustomers, loading, error, fetchPendingCustomers, approveCustomer } =
    useAdminCustomers({
      onSuccess: (message) => {
        setSuccessMessage(message);
        setTimeout(() => {
          setSuccessMessage('');
        }, 3000);
      },
      onError: (err) => {
        console.error('Admin action error:', err);
      },
    });

  // Carregar clientes pendentes ao montar
  useEffect(() => {
    fetchPendingCustomers();
  }, [fetchPendingCustomers]);

  // KPIs com fallback para mock (enquanto não temos endpoints de stats)
  const mockKPIs = {
    totalCustomers: 42,
    pendingCustomers: pendingCustomers.length,
    approvedCustomers: 39,
  };

  const handleLogout = () => {
    localStorage.removeItem('bread_admin_token');
    localStorage.removeItem('bread_admin_refresh');
    localStorage.removeItem('bread_admin_role');
    localStorage.removeItem('bread_admin_user');
    navigate('/admin');
  };

  const handleApprove = async (id: number, nickname: string) => {
    await approveCustomer(id, nickname);
  };

  const adminUser = localStorage.getItem('bread_admin_user');
  const userName = adminUser ? JSON.parse(adminUser).username : 'Admin';

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <h1>🛠️ Painel Admin</h1>
          <p className={styles.userName}>
            Olá, <strong>{userName}</strong>
          </p>
        </div>
        <button className={styles.logoutButton} onClick={handleLogout}>
          🚪 Sair
        </button>
      </header>

      <main className={styles.main}>
        {successMessage && <div className={styles.successAlert}>{successMessage}</div>}
        {error && <div className={styles.errorAlert}>{error}</div>}

        {/* KPIs Section */}
        <section className={styles.kpisSection}>
          <div className={styles.kpiCard}>
            <h3>👥 Total de Clientes</h3>
            <p className={styles.kpiValue}>{mockKPIs.totalCustomers}</p>
          </div>
          <div className={styles.kpiCard}>
            <h3>⏳ Pendentes</h3>
            <p className={styles.kpiValue}>{mockKPIs.pendingCustomers}</p>
          </div>
          <div className={styles.kpiCard}>
            <h3>✅ Aprovados</h3>
            <p className={styles.kpiValue}>{mockKPIs.approvedCustomers}</p>
          </div>
        </section>

        {/* Pending Customers Section */}
        <section className={styles.tableSection}>
          <h2>Clientes Pendentes de Aprovação</h2>

          {loading && <p className={styles.emptyState}>Carregando clientes...</p>}

          {!loading && pendingCustomers.length === 0 ? (
            <p className={styles.emptyState}>Nenhum cliente pendente!</p>
          ) : (
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Apelido</th>
                    <th>Tipo</th>
                    <th>Telefone</th>
                    <th>Ação</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingCustomers.map((customer) => (
                    <tr key={customer.id}>
                      <td>{customer.nickname}</td>
                      <td>
                        {customer.customer_type === 'PF' ? 'Pessoa Física' : 'Pessoa Jurídica'}
                      </td>
                      <td>{customer.phone}</td>
                      <td>
                        <button
                          className={styles.approveButton}
                          onClick={() => handleApprove(customer.id, customer.nickname)}
                        >
                          ✅ Aprovar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
