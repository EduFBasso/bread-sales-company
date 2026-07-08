const API_BASE_URL = 'http://localhost:8000/api';

interface AuthResponse {
  access: string;
  refresh: string;
}

export class ApiService {
  static async registerCustomer(data: {
    nickname: string;
    customer_type: 'PJ' | 'PF';
    phone: string;
    zip_code: string;
    street: string;
    number: string;
    neighborhood: string;
    city: string;
    state: string;
  }): Promise<{ id: number; token: string }> {
    const response = await fetch(`${API_BASE_URL}/customers/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Erro ao registrar cliente');
    }

    const result = await response.json();
    return {
      id: result.id,
      token: result.token || '',
    };
  }

  static async getCustomer(customerId: number, token: string) {
    const response = await fetch(`${API_BASE_URL}/customers/${customerId}/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Erro ao buscar dados do cliente');
    }

    return response.json();
  }

  static async getPublicProducts() {
    const response = await fetch(`${API_BASE_URL}/products-public/`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      throw new Error('Erro ao buscar produtos');
    }

    return response.json();
  }

  static async createOrder(
    customerId: number,
    token: string,
    data: {
      delivery_date: string;
      payment_method: string;
      items: Array<{ product: number; quantity: number; unit_price: number }>;
    }
  ) {
    const response = await fetch(`${API_BASE_URL}/orders/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        customer: customerId,
        ...data,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Erro ao criar pedido');
    }

    return response.json();
  }

  static async getCustomerBalance(customerId: number, token: string) {
    const response = await fetch(`${API_BASE_URL}/customers/${customerId}/balance/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Erro ao buscar saldo');
    }

    return response.json();
  }

  static async getCustomerTransactions(customerId: number, token: string) {
    const response = await fetch(`${API_BASE_URL}/customers/${customerId}/transactions/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Erro ao buscar transações');
    }

    return response.json();
  }
}
