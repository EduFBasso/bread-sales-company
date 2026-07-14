import { useState, useCallback, useRef, useEffect } from 'react';

interface Customer {
  id: number;
  nickname: string;
  customer_type: string;
  phone: string;
  status: string;
  company_name?: string;
  zip_code?: string;
  street?: string;
  number?: string;
  complement?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  credit_limit?: string;
  created_at?: string;
  user?: {
    id: number;
    username: string;
    email: string;
  };
  cpf?: string;
  cnpj?: string;
  cnpj_cpf?: string;
  current_balance?: string;
  available_credit?: string;
  financial_limit?: string;
  financial_used?: string;
  financial_available?: string;
}

interface AdminStats {
  total_customers: number;
  pending_customers: number;
  approved_customers: number;
  used_balance?: string;
  balance_receivable: string;
  currency: string;
}

interface UseAdminCustomersOptions {
  onSuccess?: (message: string) => void;
  onError?: (error: string) => void;
}

export function useAdminCustomers(options?: UseAdminCustomersOptions) {
  const [pendingCustomers, setPendingCustomers] = useState<Customer[]>([]);
  const [allCustomers, setAllCustomers] = useState<Customer[]>([]);
  const [customerDetail, setCustomerDetail] = useState<Customer | null>(null);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Ref para sempre ter o options atualizado sem recriar os callbacks
  const optionsRef = useRef(options);
  useEffect(() => {
    optionsRef.current = options;
  });

  const getAuthHeaders = () => {
    const token = localStorage.getItem('bread_admin_token');
    if (!token) throw new Error('Token de admin não encontrado');
    return {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };
  };

  // Fetch admin stats (KPIs reais)
  const fetchAdminStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/admin/stats/', {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Erro ao carregar estatísticas: ${response.status}`);
      }

      const data: AdminStats = await response.json();
      setStats(data);
      return data;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro ao carregar estatísticas';
      setError(msg);
      optionsRef.current?.onError?.(msg);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch clientes pendentes (legacy, mantido para compatibilidade)
  const fetchPendingCustomers = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/customers?status=PENDENTE', {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        const text = await response.text();
        console.error('fetchPendingCustomers error:', text);
        throw new Error(`Erro ao carregar clientes: ${response.status}`);
      }

      const data = await response.json();
      const pending: Customer[] = Array.isArray(data) ? data : data.results || [];
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
  }, []);

  // Fetch todos os clientes com filtro opcional (novo)
  const fetchAllCustomers = useCallback(async (filters?: { status?: string; search?: string }) => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (filters?.status) params.append('status', filters.status);
      if (filters?.search) params.append('nickname', filters.search);

      const url = `/api/customers${params.toString() ? '?' + params.toString() : ''}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Erro ao carregar clientes: ${response.status}`);
      }

      const data = await response.json();
      const customers: Customer[] = Array.isArray(data) ? data : data.results || [];
      setAllCustomers(customers);
      return customers;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro ao carregar clientes';
      setError(msg);
      optionsRef.current?.onError?.(msg);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch detalhe de um cliente (novo)
  const fetchCustomerDetail = useCallback(async (customerId: number) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/customers/${customerId}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Erro ao carregar detalhe do cliente: ${response.status}`);
      }

      const customer: Customer = await response.json();
      setCustomerDetail(customer);
      return customer;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro ao carregar detalhe';
      setError(msg);
      optionsRef.current?.onError?.(msg);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const approveCustomer = useCallback(async (customerId: number, nickname: string) => {
    setError(null);
    try {
      const response = await fetch(`/api/customers/${customerId}/approve`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || `Erro ao aprovar cliente: ${response.status}`);
      }

      const result = await response.json();
      setPendingCustomers((prev) => prev.filter((c) => c.id !== customerId));
      setAllCustomers((prev) =>
        prev.map((c) => (c.id === customerId ? { ...c, status: 'APROVADO' } : c))
      );
      optionsRef.current?.onSuccess?.(`✅ Cliente "${nickname}" aprovado com sucesso!`);
      return result;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro ao aprovar cliente';
      setError(msg);
      optionsRef.current?.onError?.(msg);
      return null;
    }
  }, []);

  // Bloquear cliente (novo)
  const blockCustomer = useCallback(async (customerId: number, nickname: string) => {
    setError(null);
    try {
      const response = await fetch(`/api/customers/${customerId}/block`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || `Erro ao bloquear cliente: ${response.status}`);
      }

      const result = await response.json();
      setAllCustomers((prev) =>
        prev.map((c) => (c.id === customerId ? { ...c, status: 'BLOQUEADO' } : c))
      );
      optionsRef.current?.onSuccess?.(`🚫 Cliente "${nickname}" bloqueado com sucesso!`);
      return result;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro ao bloquear cliente';
      setError(msg);
      optionsRef.current?.onError?.(msg);
      return null;
    }
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return {
    // Estados
    pendingCustomers,
    allCustomers,
    customerDetail,
    stats,
    loading,
    error,
    // Métodos
    fetchAdminStats,
    fetchPendingCustomers,
    fetchAllCustomers,
    fetchCustomerDetail,
    approveCustomer,
    blockCustomer,
    clearError,
  };
}
