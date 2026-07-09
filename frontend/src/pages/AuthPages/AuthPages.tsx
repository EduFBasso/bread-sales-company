import styles from './AuthPages.module.css';

export function RegisterPage() {
  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1>🥖 Registrar</h1>
        <p>Preencha os dados para se cadastrar</p>
        {/* Será preenchido durante implementação */}
      </div>
    </div>
  );
}

export function LoginPage() {
  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1>🥖 Login</h1>
        <p>Acesse sua conta</p>
        {/* Será preenchido durante implementação */}
      </div>
    </div>
  );
}

export function PendingPage() {
  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1>⏳ Cadastro Pendente</h1>
        <p>Seu cadastro foi recebido e está sendo analisado</p>
        {/* Será preenchido durante implementação */}
      </div>
    </div>
  );
}
