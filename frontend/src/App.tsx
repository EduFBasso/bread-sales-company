import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { HomePage, RegisterPage, LoginPage, PendingPage, AdminPages, ClientPages } from './pages';
import { AdminLoginPage } from './pages/AdminPages/AdminLoginPage';
import './App.css';

function AdminRoute() {
  const hasAdminToken = !!localStorage.getItem('bread_admin_token');

  if (!hasAdminToken) {
    return <AdminLoginPage />;
  }

  return <AdminPages />;
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

        {/* Pendente (aguardando aprovação) */}
        <Route path="/pending" element={<PendingPage />} />

        {/* Admin */}
        <Route path="/admin" element={<AdminRoute />} />

        {/* Cliente */}
        <Route path="/dashboard" element={<ClientPages />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
