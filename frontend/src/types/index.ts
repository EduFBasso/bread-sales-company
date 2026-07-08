export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  is_active: boolean;
  created_at: string;
}

export interface Customer {
  id: number;
  nickname: string;
  customer_type: string;
  phone: string;
  zip_code: string;
  street: string;
  number: string;
  neighborhood: string;
  city: string;
  state: string;
  credit_limit: number;
  token?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Order {
  id: number;
  customer: number;
  status: 'PENDING' | 'CONFIRMED' | 'DELIVERED' | 'CANCELLED';
  delivery_date: string;
  payment_method: string;
  total_value: number;
  items: OrderItem[];
  created_at: string;
}

export interface OrderItem {
  id: number;
  product: number;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

export interface Transaction {
  id: number;
  customer: number;
  transaction_type: 'CREDIT' | 'DEBIT';
  amount: number;
  description: string;
  created_at: string;
}
