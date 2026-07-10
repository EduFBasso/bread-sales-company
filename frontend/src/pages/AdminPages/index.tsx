import { useState, useMemo } from 'react';
import { AdminLayout } from './AdminLayout';
import { DashboardPage } from './DashboardPage';
import { CustomersPage } from './CustomersPage';
import { ProductsPage } from './ProductsPage';
import styles from './AdminPages.module.css';

export function AdminPages() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'customers' | 'products'>('dashboard');
  const [customerFilter, setCustomerFilter] = useState<string | undefined>();
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const adminUser = localStorage.getItem('bread_admin_user');
  const userName = useMemo(() => (adminUser ? JSON.parse(adminUser).username : 'Admin'), []);

  const handleNavigateToCustomers = (filter?: string) => {
    setCustomerFilter(filter);
    setActiveTab('customers');
  };

  const handleTabChange = (tab: 'dashboard' | 'customers' | 'products') => {
    setActiveTab(tab);
  };

  const handleError = (error: string) => {
    setErrorMessage(error);
    setTimeout(() => setErrorMessage(''), 3000);
  };

  const handleSuccess = (message: string) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  return (
    <AdminLayout activeTab={activeTab} onTabChange={handleTabChange} userName={userName}>
      {errorMessage && <div className={styles.errorAlert}>{errorMessage}</div>}
      {successMessage && <div className={styles.successAlert}>{successMessage}</div>}

      {activeTab === 'dashboard' && (
        <DashboardPage
          onNavigateToCustomers={handleNavigateToCustomers}
          onError={handleError}
          onSuccess={handleSuccess}
        />
      )}

      {activeTab === 'customers' && (
        <CustomersPage
          initialFilter={customerFilter}
          onError={handleError}
          onSuccess={handleSuccess}
        />
      )}

      {activeTab === 'products' && <ProductsPage />}
    </AdminLayout>
  );
}
