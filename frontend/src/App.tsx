import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { HomePage, RegisterPage, LoginPage, PendingPage, AdminPages, ClientPages } from './pages';
import { AdminLoginPage } from './pages/AdminPages/AdminLoginPage';
import { CustomerLoginPage } from './pages/ClientPages/CustomerLoginPage';
import './App.css';

function AdminRoute() {
  const hasToken = !!localStorage.getItem('bread_admin_token');

  if (!hasToken) {
    return <AdminLoginPage />;
  }

  return <AdminPages />;
}

function CustomerRoute() {
  const hasToken = !!localStorage.getItem('bread_customer_token');

  if (!hasToken) {
    return <CustomerLoginPage />;
  }

  return <ClientPages />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Home */}
        <Route path="/" element={<HomePage />} />

        {/* Registro e Login */}
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/customer/login" element={<CustomerLoginPage />} />

        {/* Pendente (aguardando aprovação) */}
        <Route path="/pending" element={<PendingPage />} />

        {/* Admin */}
        <Route path="/admin" element={<AdminRoute />} />

        {/* Cliente */}
        <Route path="/dashboard" element={<ClientPages />} />
        <Route path="/customer/dashboard" element={<CustomerRoute />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
