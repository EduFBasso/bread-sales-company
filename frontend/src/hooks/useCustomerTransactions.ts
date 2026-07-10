import { useState, useEffect, useRef } from 'react';
import { useCustomerAuth } from './useCustomerAuth';

export interface Transaction {
  id: number;
  customer_id: number;
  transaction_type: 'CREDITO' | 'DEBITO';
  amount: string;
  description: string;
  reference_order_id: number | null;
  transaction_date: string;
  created_at: string;
}

export function useCustomerTransactions() {
  const { token, isAuthenticated } = useCustomerAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const callbackRef = useRef(() => {
    const fetchTransactions = async () => {
      if (!isAuthenticated || !token) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const response = await fetch('http://localhost:8000/api/customers/transactions/', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          if (response.status === 401) {
            throw new Error('Sessão expirada. Por favor, faça login novamente.');
          }
          throw new Error(`Erro ao carregar transações: ${response.status}`);
        }

        const data = await response.json();
        setTransactions(Array.isArray(data) ? data : data.results || []);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Erro ao carregar transações';
        setError(message);
        console.error('Transactions fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  });

  useEffect(() => {
    callbackRef.current();
  }, [isAuthenticated, token]);

  const refreshTransactions = () => {
    callbackRef.current();
  };

  return {
    transactions,
    loading,
    error,
    refreshTransactions,
  };
}
