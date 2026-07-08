import { useNavigate } from 'react-router-dom';
import styles from './HomePage.module.css';

export function HomePage() {
  const navigate = useNavigate();

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.hero}>
          <h1>🥖 Panificadora Sistema de Pedidos</h1>
          <p>Gerencie seus pedidos e pagamentos de forma segura e prática</p>
        </div>

        <div className={styles.cards}>
          {/* Card: Novo Cliente */}
          <div className={styles.card}>
            <h2>👤 Novo Cliente?</h2>
            <p>
              Se você é um novo cliente, faça o seu cadastro agora. Após aprovação do dono da
              panificadora, você poderá fazer login e começar a fazer pedidos.
            </p>
            <button className={styles.primaryButton} onClick={() => navigate('/register')}>
              📝 Cadastre-se Aqui
            </button>
          </div>

          {/* Card: Cliente Existente */}
          <div className={styles.card}>
            <h2>🔓 Já é Cliente?</h2>
            <p>
              Se você já tem uma conta aprovada, faça login com seu apelido e senha para acessar sua
              conta e fazer pedidos.
            </p>
            <button className={styles.secondaryButton} onClick={() => navigate('/login')}>
              🔑 Fazer Login
            </button>
          </div>

          {/* Card: Admin */}
          <div className={styles.card}>
            <h2>👨‍💼 Sou o Dono</h2>
            <p>
              Se você é o dono da panificadora, faça login para acessar o painel de admin e
              gerenciar novos clientes e pedidos.
            </p>
            <button className={styles.adminButton} onClick={() => navigate('/admin')}>
              ⚙️ Painel Admin
            </button>
          </div>
        </div>

        {/* Infos */}
        <div className={styles.infos}>
          <h3>Como Funciona?</h3>
          <div className={styles.steps}>
            <div className={styles.step}>
              <div className={styles.stepNumber}>1️⃣</div>
              <h4>Cadastro Aberto</h4>
              <p>Novo cliente faz cadastro preenchendo CPF/CNPJ, endereço e telefone</p>
            </div>

            <div className={styles.step}>
              <div className={styles.stepNumber}>2️⃣</div>
              <h4>Aprovação</h4>
              <p>Dono da panificadora aprova o cadastro no painel admin</p>
            </div>

            <div className={styles.step}>
              <div className={styles.stepNumber}>3️⃣</div>
              <h4>Login & Pedidos</h4>
              <p>Cliente faz login e começa a fazer pedidos</p>
            </div>

            <div className={styles.step}>
              <div className={styles.stepNumber}>4️⃣</div>
              <h4>Pagamento</h4>
              <p>Dono marca como pago quando recebe o valor</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
