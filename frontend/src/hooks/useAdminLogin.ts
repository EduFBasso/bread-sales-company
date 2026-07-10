import { useState, useCallback } from 'react';

interface AdminUser {
  id: number;
  username: string;
  email: string;
  is_superuser: boolean;
}

interface AdminLoginResponse {
  access_token: string;
  refresh_token: string;
  role: string;
  user: AdminUser;
}

interface UseAdminLoginOptions {
  onSuccess?: (response: AdminLoginResponse) => void;
  onError?: (error: string) => void;
}

export function useAdminLogin(options?: UseAdminLoginOptions) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = useCallback(
    async (username: string, password: string) => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch('http://localhost:8000/api/admin/login/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ username, password }),
        });

        const data = await response.json();

        if (!response.ok) {
          const errorMessage =
            data.detail || data.password?.[0] || data.username?.[0] || 'Erro ao fazer login';
          setError(errorMessage);
          options?.onError?.(errorMessage);
          return false;
        }

        // Salvar tokens e info do admin
        localStorage.setItem('bread_admin_token', data.access_token);
        localStorage.setItem('bread_admin_refresh', data.refresh_token);
        localStorage.setItem('bread_admin_role', data.role);
        localStorage.setItem('bread_admin_user', JSON.stringify(data.user));

        options?.onSuccess?.(data);
        return true;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Erro de conexão';
        setError(errorMessage);
        options?.onError?.(errorMessage);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [options]
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('bread_admin_token');
    localStorage.removeItem('bread_admin_refresh');
    localStorage.removeItem('bread_admin_role');
    localStorage.removeItem('bread_admin_user');
  }, []);

  return {
    login,
    loading,
    error,
    clearError,
    logout,
  };
}
