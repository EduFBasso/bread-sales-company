import styles from './ClientPages.module.css';

export function ClientPages() {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>🥖 Minha Conta</h1>
        <button>Sair</button>
      </header>

      <main className={styles.main}>{/* Será preenchido durante implementação */}</main>
    </div>
  );
}
