import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCustomer } from '../hooks/useCustomer';
import { ApiService } from '../services/api';
import { PendingCustomer } from '../types';
import styles from './AdminPage.module.css';

export function AdminPage() {
  const navigate = useNavigate();
  const { customer, token, logout } = useCustomer();

  const [pending, setPending] = useState<PendingCustomer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [approvingId, setApprovingId] = useState<number | null>(null);
  const [approveError, setApproveError] = useState<string | null>(null);

  // Verificar se é admin (não está implementado no backend ainda, mas vamos usar como proteção básica)
  useEffect(() => {
    if (!token || customer?.customer_type === 'PF') {
      // Redirecionar se não for admin
      navigate('/');
    }
  }, [token, customer, navigate]);

  // Carregar clientes pendentes
  useEffect(() => {
    const loadPending = async () => {
      if (!token) return;

      setLoading(true);
      try {
        const data = await ApiService.getPendingCustomers(token);
        setPending(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar clientes pendentes');
      } finally {
        setLoading(false);
      }
    };

    loadPending();
  }, [token]);

  const handleApprove = async (customerId: number) => {
    if (!token) return;

    setApprovingId(customerId);
    setApproveError(null);

    try {
      await ApiService.approveCustomer(customerId, token);

      // Remover do array de pendentes
      setPending((prev) => prev.filter((p) => p.id !== customerId));
    } catch (err) {
      setApproveError(err instanceof Error ? err.message : 'Erro ao aprovar cliente');
    } finally {
      setApprovingId(null);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.titleSection}>
            <h1>👨‍💼 Painel Admin</h1>
            <p>Aprovar Clientes Pendentes</p>
          </div>

          <div className={styles.userSection}>
            <span className={styles.username}>{customer?.nickname}</span>
            <button className={styles.logoutButton} onClick={handleLogout}>
              Sair
            </button>
          </div>
        </div>

        {/* Conteúdo */}
        <div className={styles.content}>
          {loading ? (
            <div className={styles.loading}>⏳ Carregando clientes...</div>
          ) : error ? (
            <div className={styles.errorMessage}>❌ {error}</div>
          ) : pending.length === 0 ? (
            <div className={styles.emptyState}>
              <p>✅ Não há clientes pendentes!</p>
              <p>Todos os cadastros foram aprovados.</p>
            </div>
          ) : (
            <div className={styles.customersList}>
              <h2>Clientes Aguardando Aprovação ({pending.length})</h2>

              <div className={styles.table}>
                <div className={styles.tableHeader}>
                  <div className={styles.colNickname}>Apelido</div>
                  <div className={styles.colType}>Tipo</div>
                  <div className={styles.colPhone}>Telefone</div>
                  <div className={styles.colCreated}>Data Cadastro</div>
                  <div className={styles.colAction}>Ação</div>
                </div>

                <div className={styles.tableBody}>
                  {pending.map((customer) => (
                    <div key={customer.id} className={styles.tableRow}>
                      <div className={styles.colNickname}>
                        <strong>{customer.nickname}</strong>
                      </div>

                      <div className={styles.colType}>
                        <span className={styles.badge}>
                          {customer.customer_type === 'PF' ? '👤 PF' : '🏢 PJ'}
                        </span>
                      </div>

                      <div className={styles.colPhone}>{customer.phone}</div>

                      <div className={styles.colCreated}>
                        {new Date(customer.created_at).toLocaleDateString('pt-BR')}
                      </div>

                      <div className={styles.colAction}>
                        <button
                          className={styles.approveButton}
                          onClick={() => handleApprove(customer.id)}
                          disabled={approvingId === customer.id}
                        >
                          {approvingId === customer.id ? '⏳' : '✅ Aprovar'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {approveError && <div className={styles.errorMessage}>❌ {approveError}</div>}
            </div>
          )}
        </div>

        {/* Info */}
        <div className={styles.info}>
          <p>
            <strong>Instruções:</strong>
          </p>
          <ul>
            <li>Clique em "✅ Aprovar" para aprovar um cliente</li>
            <li>Após aprovação, envie a senha provisória ao cliente</li>
            <li>O cliente poderá fazer login com seu apelido e a senha</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
