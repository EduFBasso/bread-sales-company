import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './AdminPages.module.css';

export function AdminPages() {
  const navigate = useNavigate();
  const [successMessage, setSuccessMessage] = useState('');

  // Mock data - sem chamadas à API por enquanto
  const mockKPIs = {
    totalCustomers: 42,
    pendingCustomers: 3,
    approvedCustomers: 39,
  };

  const mockPendingCustomers = [
    {
      id: 1,
      nickname: 'Padaria Central',
      customer_type: 'PF',
      phone: '(11) 98765-4321',
      status: 'PENDENTE',
    },
    {
      id: 2,
      nickname: 'Supermercado 24h',
      customer_type: 'PJ',
      phone: '(11) 98888-8888',
      status: 'PENDENTE',
    },
    {
      id: 3,
      nickname: 'Padaria do João',
      customer_type: 'PF',
      phone: '(11) 97777-7777',
      status: 'PENDENTE',
    },
  ];

  const handleLogout = () => {
    localStorage.removeItem('bread_admin_token');
    localStorage.removeItem('bread_admin_refresh');
    localStorage.removeItem('bread_admin_role');
    localStorage.removeItem('bread_admin_user');
    navigate('/admin');
  };

  const handleApprove = (nickname: string) => {
    // Mock - sem chamada à API por enquanto
    setSuccessMessage(`✅ Cliente "${nickname}" aprovado com sucesso!`);
    setTimeout(() => {
      setSuccessMessage('');
    }, 3000);
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

          {mockPendingCustomers.length === 0 ? (
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
                  {mockPendingCustomers.map((customer) => (
                    <tr key={customer.id}>
                      <td>{customer.nickname}</td>
                      <td>
                        {customer.customer_type === 'PF' ? 'Pessoa Física' : 'Pessoa Jurídica'}
                      </td>
                      <td>{customer.phone}</td>
                      <td>
                        <button
                          className={styles.approveButton}
                          onClick={() => handleApprove(customer.nickname)}
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
