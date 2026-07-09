import styles from './AdminPages.module.css';

export function AdminPages() {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>🛠️ Painel Admin</h1>
        <button>Sair</button>
      </header>

      <main className={styles.main}>{/* Será preenchido durante implementação */}</main>
    </div>
  );
}
