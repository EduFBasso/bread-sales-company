import { useState, useEffect } from 'react';

export interface AdminOrder {
  id: number;
  order_number: string;
  customer_id: number;
  customer_nickname: string;
  status: string;
  status_display: string;
  order_date: string;
  delivery_date: string;
  total_value: string;
  payment_method: string;
  items: any[];
}

export interface AdminOrdersResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: AdminOrder[];
}

export function useAdminOrders(filters?: {
  status?: string;
  customer_nickname?: string;
  page?: number;
  page_size?: number;
}) {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    count: 0,
    next: null as string | null,
    previous: null as string | null,
  });

  useEffect(() => {
    const adminToken = localStorage.getItem('bread_admin_token');

    if (!adminToken) {
      setError('Token de admin não disponível');
      return;
    }

    const fetchOrders = async () => {
      setLoading(true);
      setError(null);

      try {
        // Build query string
        const params = new URLSearchParams();
        if (filters?.status) params.append('status', filters.status);
        if (filters?.customer_nickname)
          params.append('customer_nickname', filters.customer_nickname);
        if (filters?.page) params.append('page', filters.page.toString());
        if (filters?.page_size) params.append('page_size', filters.page_size.toString());

        const queryString = params.toString();
        const url = `http://localhost:8000/api/admin/orders/${queryString ? '?' + queryString : ''}`;

        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${adminToken}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data: AdminOrdersResponse = await response.json();
        setOrders(data.results);
        setPagination({
          count: data.count,
          next: data.next,
          previous: data.previous,
        });
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Erro ao carregar pedidos';
        setError(message);
        console.error('Admin orders fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [filters]);

  return {
    orders,
    loading,
    error,
    pagination,
  };
}
