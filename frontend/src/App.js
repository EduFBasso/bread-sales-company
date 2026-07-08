import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { HomePage, RegisterPage, LoginPage, AdminPage, ClientDashboard, PendingPage, } from './pages';
import './App.css';
export default function App() {
    return (_jsx(BrowserRouter, { children: _jsxs(Routes, { children: [_jsx(Route, { path: "/", element: _jsx(HomePage, {}) }), _jsx(Route, { path: "/register", element: _jsx(RegisterPage, {}) }), _jsx(Route, { path: "/login", element: _jsx(LoginPage, {}) }), _jsx(Route, { path: "/pending", element: _jsx(PendingPage, {}) }), _jsx(Route, { path: "/admin", element: _jsx(AdminPage, {}) }), _jsx(Route, { path: "/dashboard", element: _jsx(ClientDashboard, {}) }), _jsx(Route, { path: "*", element: _jsx(Navigate, { to: "/", replace: true }) })] }) }));
}
