import { useNavigate } from 'react-router-dom';
import { useCustomer } from '../hooks/useCustomer';
import styles from './PendingPage.module.css';

export function PendingPage() {
  const navigate = useNavigate();
  const { customer, logout } = useCustomer();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!customer) {
    navigate('/');
    return null;
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1>⏳ Cadastro Pendente</h1>
          <p>Aguardando aprovação do dono da panificadora</p>
        </div>

        <div className={styles.content}>
          <div className={styles.statusBox}>
            <div className={styles.icon}>⏳</div>

            <h2>Seu cadastro foi recebido!</h2>

            <p className={styles.message}>
              Olá <strong>{customer.nickname}</strong>, seu cadastro foi recebido com sucesso!
            </p>

            <div className={styles.infoBox}>
              <h3>Próximas Etapas:</h3>
              <ol>
                <li>
                  <strong>Análise:</strong> O dono da panificadora analisará seu cadastro
                </li>
                <li>
                  <strong>Aprovação:</strong> Você será aprovado (ou solicitado a corrigir dados)
                </li>
                <li>
                  <strong>Senha:</strong> Você receberá uma senha provisória por mensagem/email
                </li>
                <li>
                  <strong>Login:</strong> Faça login com seu apelido e a senha enviada
                </li>
              </ol>
            </div>

            <div className={styles.customerData}>
              <h3>Seus Dados Cadastrados:</h3>
              <div className={styles.dataGrid}>
                <div className={styles.dataItem}>
                  <span className={styles.label}>Apelido</span>
                  <p>{customer.nickname}</p>
                </div>

                <div className={styles.dataItem}>
                  <span className={styles.label}>Tipo</span>
                  <p>{customer.customer_type === 'PF' ? 'Pessoa Física' : 'Pessoa Jurídica'}</p>
                </div>

                <div className={styles.dataItem}>
                  <span className={styles.label}>Telefone</span>
                  <p>{customer.phone}</p>
                </div>

                <div className={styles.dataItem}>
                  <span className={styles.label}>Cidade</span>
                  <p>
                    {customer.city}, {customer.state}
                  </p>
                </div>

                <div className={styles.dataItem}>
                  <span className={styles.label}>Status</span>
                  <p className={styles.statusPending}>🕐 {customer.status || 'PENDENTE'}</p>
                </div>

                <div className={styles.dataItem}>
                  <span className={styles.label}>Data de Cadastro</span>
                  <p>{new Date(customer.created_at || Date.now()).toLocaleDateString('pt-BR')}</p>
                </div>
              </div>
            </div>

            <div className={styles.contactBox}>
              <p>
                <strong>❓ Alguma dúvida?</strong>
              </p>
              <p>Entre em contato com o dono da panificadora para saber o status do seu cadastro</p>
            </div>
          </div>

          <div className={styles.actions}>
            <button className={styles.logoutButton} onClick={handleLogout}>
              ← Voltar para Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
