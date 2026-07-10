import { useState, useCallback, useRef, useEffect } from 'react';

interface CustomerUser {
  id: number;
  customer_id: number;
  nickname: string;
  customer_type: string;
  phone?: string;
  status: string;
}

interface CustomerLoginResponse {
  access_token: string;
  refresh_token: string;
  customer: CustomerUser;
}

interface UseCustomerLoginOptions {
  onSuccess?: (response: CustomerLoginResponse) => void;
  onError?: (error: string) => void;
}

export function useCustomerLogin(options?: UseCustomerLoginOptions) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Ref para sempre ter acesso ao options mais recente sem recriar o login callback
  const optionsRef = useRef(options);
  useEffect(() => {
    optionsRef.current = options;
  });

  const login = useCallback(
    async (nickname: string, password: string) => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch('http://localhost:8000/api/customers/login/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ nickname, password }),
        });

        const data = await response.json();

        if (!response.ok) {
          const errorMessage =
            data.detail || data.nickname?.[0] || data.password?.[0] || 'Erro ao fazer login';
          setError(errorMessage);
          optionsRef.current?.onError?.(errorMessage);
          return false;
        }

        // Salvar tokens e info do cliente
        localStorage.setItem('bread_customer_token', data.access_token);
        localStorage.setItem('bread_customer_refresh', data.refresh_token);
        localStorage.setItem('bread_customer_user', JSON.stringify(data.customer));

        optionsRef.current?.onSuccess?.(data);
        return true;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Erro de conexão';
        setError(errorMessage);
        optionsRef.current?.onError?.(errorMessage);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [] // login nunca muda — usa optionsRef para sempre ter callbacks atualizados
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('bread_customer_token');
    localStorage.removeItem('bread_customer_refresh');
    localStorage.removeItem('bread_customer_user');
  }, []);

  return {
    login,
    loading,
    error,
    clearError,
    logout,
  };
}
