import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCustomer } from '../hooks/useCustomer';
import { ApiService } from '../services/api';
import styles from './ClientDashboard.module.css';

interface Balance {
  customer_id: number;
  nickname: string;
  balance: string;
  credit_limit: string;
  available_credit: string;
  currency: string;
}

export function ClientDashboard() {
  const navigate = useNavigate();
  const { customer, token, logout } = useCustomer();

  const [balance, setBalance] = useState<Balance | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Redirecionar se não estiver autenticado ou aprovado
  useEffect(() => {
    if (!token || !customer || customer.status !== 'APROVADO') {
      navigate('/login');
    }
  }, [token, customer, navigate]);

  // Carregar saldo do cliente
  useEffect(() => {
    const loadBalance = async () => {
      if (!token || !customer?.id) return;

      setLoading(true);
      try {
        const data = await ApiService.getCustomerBalance(customer.id, token);
        setBalance(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar saldo');
      } finally {
        setLoading(false);
      }
    };

    loadBalance();
  }, [token, customer]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleRefresh = async () => {
    if (!token || !customer?.id) return;

    setLoading(true);
    try {
      const data = await ApiService.getCustomerBalance(customer.id, token);
      setBalance(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar dados');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.titleSection}>
            <h1>🥖 Minha Conta</h1>
            <p>Informações e Pedidos</p>
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
          {/* Cards de Informações */}
          <div className={styles.infoCards}>
            {/* Dados do Cliente */}
            <div className={styles.card}>
              <h3>📋 Seus Dados</h3>
              <div className={styles.dataGrid}>
                <div className={styles.dataItem}>
                  <label>Apelido</label>
                  <p>{customer?.nickname}</p>
                </div>

                <div className={styles.dataItem}>
                  <label>Tipo</label>
                  <p>{customer?.customer_type === 'PF' ? 'Pessoa Física' : 'Pessoa Jurídica'}</p>
                </div>

                <div className={styles.dataItem}>
                  <label>Telefone</label>
                  <p>{customer?.phone}</p>
                </div>

                <div className={styles.dataItem}>
                  <label>Cidade</label>
                  <p>
                    {customer?.city}, {customer?.state}
                  </p>
                </div>

                <div className={styles.dataItem}>
                  <label>Endereço</label>
                  <p>
                    {customer?.street}, {customer?.number}
                    {customer?.neighborhood && ` - ${customer.neighborhood}`}
                  </p>
                </div>

                <div className={styles.dataItem}>
                  <label>Status</label>
                  <p className={styles.statusApproved}>✅ {customer?.status}</p>
                </div>
              </div>
            </div>

            {/* Saldo e Crédito */}
            {loading ? (
              <div className={styles.card}>
                <p className={styles.loading}>⏳ Carregando saldo...</p>
              </div>
            ) : error ? (
              <div className={styles.card}>
                <p className={styles.error}>❌ {error}</p>
              </div>
            ) : balance ? (
              <>
                <div className={styles.card}>
                  <h3>💰 Saldo</h3>
                  <div className={styles.balanceDisplay}>
                    <div className={styles.balanceItem}>
                      <span className={styles.label}>Saldo Devedor</span>
                      <p className={styles.amount}>
                        {balance.currency} {balance.balance}
                      </p>
                    </div>
                  </div>
                </div>

                <div className={styles.card}>
                  <h3>💳 Limite de Crédito</h3>
                  <div className={styles.creditDisplay}>
                    <div className={styles.creditItem}>
                      <span className={styles.label}>Limite Total</span>
                      <p className={styles.amount}>
                        {balance.currency} {balance.credit_limit}
                      </p>
                    </div>

                    <div className={styles.creditItem}>
                      <span className={styles.label}>Disponível</span>
                      <p
                        className={
                          parseFloat(balance.available_credit) > 0
                            ? styles.amountPositive
                            : styles.amountNegative
                        }
                      >
                        {balance.currency} {balance.available_credit}
                      </p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className={styles.progressBar}>
                    <div
                      className={styles.progressFill}
                      style={{
                        width: `${
                          (parseFloat(balance.balance) / parseFloat(balance.credit_limit)) * 100
                        }%`,
                      }}
                    ></div>
                  </div>
                </div>
              </>
            ) : null}
          </div>

          {/* Botão de Atualizar */}
          <div className={styles.actions}>
            <button className={styles.refreshButton} onClick={handleRefresh} disabled={loading}>
              {loading ? '⏳' : '🔄'} Atualizar
            </button>

            <button className={styles.makeOrderButton} onClick={() => navigate('/orders')}>
              📝 Fazer Pedido
            </button>
          </div>

          {/* Info */}
          <div className={styles.info}>
            <p>
              <strong>Informações importantes:</strong>
            </p>
            <ul>
              <li>Seu saldo devedor é atualizado a cada pedido confirmado</li>
              <li>O limite de crédito disponível mostra quanto você pode gastar</li>
              <li>Pedidos só podem ser feitos se houver crédito disponível</li>
              <li>Verifique com o dono o status de pagamento dos seus pedidos</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
