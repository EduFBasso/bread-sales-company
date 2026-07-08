import { useState, useCallback, useEffect } from 'react';
import { Customer } from '../types';
import { ApiService } from '../services/api';

interface UseCustomerReturn {
  customer: Customer | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  register: (data: Omit<Customer, 'id'>) => Promise<void>;
  logout: () => void;
  setCustomer: (customer: Customer, token: string) => void;
}

const STORAGE_KEYS = {
  CUSTOMER: 'bread_customer',
  TOKEN: 'bread_token',
};

export function useCustomer(): UseCustomerReturn {
  const [customer, setCustomerState] = useState<Customer | null>(() => {
    const stored = localStorage.getItem(STORAGE_KEYS.CUSTOMER);
    return stored ? JSON.parse(stored) : null;
  });

  const [token, setTokenState] = useState<string | null>(() => {
    return localStorage.getItem(STORAGE_KEYS.TOKEN);
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isAuthenticated = !!token && !!customer;

  const register = useCallback(async (data: Omit<Customer, 'id'>) => {
    setLoading(true);
    setError(null);

    try {
      const result = await ApiService.registerCustomer(data);

      // Buscar dados do cliente registrado
      const customerData = await ApiService.getCustomer(result.id, result.token);

      const newCustomer: Customer = {
        ...customerData,
        token: result.token,
      };

      // Salvar no localStorage
      localStorage.setItem(STORAGE_KEYS.CUSTOMER, JSON.stringify(newCustomer));
      localStorage.setItem(STORAGE_KEYS.TOKEN, result.token);

      // Atualizar estado
      setCustomerState(newCustomer);
      setTokenState(result.token);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao registrar';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEYS.CUSTOMER);
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    setCustomerState(null);
    setTokenState(null);
    setError(null);
  }, []);

  const setCustomer = useCallback((newCustomer: Customer, newToken: string) => {
    localStorage.setItem(STORAGE_KEYS.CUSTOMER, JSON.stringify(newCustomer));
    localStorage.setItem(STORAGE_KEYS.TOKEN, newToken);
    setCustomerState(newCustomer);
    setTokenState(newToken);
  }, []);

  return {
    customer,
    token,
    loading,
    error,
    isAuthenticated,
    register,
    logout,
    setCustomer,
  };
}
