import React, { useState } from 'react';
import { CustomerForm, CustomerSelector } from '../components';
import { useCustomer } from '../hooks/useCustomer';
import styles from './AuthPage.module.css';

export function AuthPage() {
  const { customer, isAuthenticated, register, logout, error: authError } = useCustomer();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRegister = async (data: any) => {
    setLoading(true);
    setError(null);

    try {
      await register(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao registrar';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    setError(null);
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1>🥖 Panificadora - Sistema de Pedidos</h1>
        <p>Acesso para Clientes</p>
      </div>

      <div className={styles.container}>
        {isAuthenticated && customer ? (
          <>
            <CustomerSelector
              customer={customer}
              onLogout={handleLogout}
              onSelectOther={() => logout()}
            />

            <div className={styles.message}>
              <p>✅ Bem-vindo! Você está autenticado e pronto para fazer pedidos.</p>
            </div>
          </>
        ) : (
          <CustomerForm onSubmit={handleRegister} loading={loading} error={error || authError} />
        )}
      </div>
    </div>
  );
}
