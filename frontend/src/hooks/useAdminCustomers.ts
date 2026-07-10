import { useState, useCallback, useRef, useEffect } from 'react';

interface Customer {
  id: number;
  nickname: string;
  customer_type: string;
  phone: string;
  status: string;
  created_at: string;
}

interface UseAdminCustomersOptions {
  onSuccess?: (message: string) => void;
  onError?: (error: string) => void;
}

export function useAdminCustomers(options?: UseAdminCustomersOptions) {
  const [pendingCustomers, setPendingCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Ref para sempre ter o options atualizado sem recriar os callbacks
  const optionsRef = useRef(options);
  useEffect(() => {
    optionsRef.current = options;
  });

  const fetchPendingCustomers = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('bread_admin_token');
      if (!token) throw new Error('Token de admin não encontrado');

      // Sem barra final — router Django configurado com trailing_slash=False
      const response = await fetch('http://localhost:8000/api/customers', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      });

      if (!response.ok) {
        const text = await response.text();
        console.error('fetchPendingCustomers error:', text);
        throw new Error(`Erro ao carregar clientes: ${response.status}`);
      }

      const data = await response.json();
      const all: Customer[] = Array.isArray(data) ? data : data.results || [];
      const pending = all.filter((c) => c.status === 'PENDENTE');
      setPendingCustomers(pending);
      return pending;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro ao carregar clientes';
      setError(msg);
      optionsRef.current?.onError?.(msg);
      return [];
    } finally {
      setLoading(false);
    }
  }, []); // [] estável — sem loop no useEffect

  const approveCustomer = useCallback(async (customerId: number, nickname: string) => {
    setError(null);
    try {
      const token = localStorage.getItem('bread_admin_token');
      if (!token) throw new Error('Token de admin não encontrado');

      // Sem barra final — trailing_slash=False
      const response = await fetch(`http://localhost:8000/api/customers/${customerId}/approve`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || `Erro ao aprovar cliente: ${response.status}`);
      }

      const result = await response.json();
      setPendingCustomers((prev) => prev.filter((c) => c.id !== customerId));
      optionsRef.current?.onSuccess?.(`✅ Cliente "${nickname}" aprovado com sucesso!`);
      return result;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro ao aprovar cliente';
      setError(msg);
      optionsRef.current?.onError?.(msg);
      return null;
    }
  }, []); // [] estável

  const clearError = useCallback(() => setError(null), []);

  return { pendingCustomers, loading, error, fetchPendingCustomers, approveCustomer, clearError };
}
