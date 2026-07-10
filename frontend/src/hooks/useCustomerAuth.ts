import { useState, useEffect, useCallback } from 'react';

interface CustomerData {
  id: number;
  customer_id: number;
  nickname: string;
  customer_type: string;
  phone?: string;
  status: string;
  current_balance?: string;
  available_credit?: string;
  credit_limit?: string;
}

export function useCustomerAuth() {
  const [customer, setCustomer] = useState<CustomerData | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Carregar dados do localStorage
    const storedToken = localStorage.getItem('bread_customer_token');
    const storedCustomer = localStorage.getItem('bread_customer_user');

    if (storedToken && storedCustomer) {
      try {
        setToken(storedToken);
        setCustomer(JSON.parse(storedCustomer));
      } catch (err) {
        console.error('Erro ao carregar dados do cliente:', err);
        logout();
      }
    }

    setIsLoading(false);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('bread_customer_token');
    localStorage.removeItem('bread_customer_refresh');
    localStorage.removeItem('bread_customer_user');
    setCustomer(null);
    setToken(null);
  }, []);

  const isAuthenticated = !!token && !!customer;

  return {
    customer,
    token,
    isAuthenticated,
    isLoading,
    logout,
  };
}
