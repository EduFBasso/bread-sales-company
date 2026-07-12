import { useState, useEffect, useRef } from 'react';
import { useCustomerAuth } from './useCustomerAuth';

export interface CustomerDashboardData {
  balance: number;
  availableCredit: number;
  creditLimit: number;
  totalOrders: number;
  pendingOrders: number;
  totalSpent: number;
}

export function useCustomerDashboard() {
  const { customer, token, isAuthenticated } = useCustomerAuth();
  const [data, setData] = useState<CustomerDashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const hasInitialized = useRef(false);

  useEffect(() => {
    if (!isAuthenticated || !token || !customer || hasInitialized.current) {
      return;
    }

    hasInitialized.current = true;

    try {
      // Parse customer data for balance info
      const balance = parseFloat(String(customer.current_balance ?? '0')) || 0;
      const availableCredit = parseFloat(String(customer.available_credit ?? '0')) || 0;
      const creditLimit = parseFloat(String(customer.credit_limit ?? '0')) || 0;

      // Prepare dashboard data
      const dashboardData: CustomerDashboardData = {
        balance,
        availableCredit,
        creditLimit,
        totalOrders: 0,
        pendingOrders: 0,
        totalSpent: 0,
      };

      setData(dashboardData);
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao carregar dados';
      setError(message);
      console.error('Dashboard data fetch error:', err);
    }
  }, [isAuthenticated, token, customer]);

  return {
    data,
    error,
  };
}
