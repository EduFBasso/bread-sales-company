import React, { useEffect, useState } from 'react';
import { useAdminCustomers } from '../../hooks/useAdminCustomers';
import styles from './AdminPages.module.css';

interface CustomerDetailModalProps {
  customerId: number | null;
  isOpen: boolean;
  onClose: () => void;
  onCustomerUpdated: () => void;
}

export const CustomerDetailModal: React.FC<CustomerDetailModalProps> = ({
  customerId,
  isOpen,
  onClose,
  onCustomerUpdated,
}) => {
  const { customerDetail, fetchCustomerDetail, approveCustomer, blockCustomer, loading, error } =
    useAdminCustomers();
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && customerId) {
      fetchCustomerDetail(customerId);
      setActionError(null);
      setActionSuccess(null);
    }
  }, [isOpen, customerId, fetchCustomerDetail]);

  if (!isOpen || !customerId) {
    return null;
  }

  const handleApprove = async () => {
    setIsActionLoading(true);
    setActionError(null);
    setActionSuccess(null);
    try {
      await approveCustomer(customerId, customer?.nickname || 'Cliente');
      setActionSuccess('Cliente aprovado com sucesso!');
      setTimeout(() => {
        onCustomerUpdated();
        onClose();
      }, 1500);
    } catch (err) {
      setActionError('Erro ao aprovar cliente.');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleBlock = async () => {
    setIsActionLoading(true);
    setActionError(null);
    setActionSuccess(null);
    try {
      await blockCustomer(customerId, customer?.nickname || 'Cliente');
      setActionSuccess('Cliente bloqueado com sucesso!');
      setTimeout(() => {
        onCustomerUpdated();
        onClose();
      }, 1500);
    } catch (err) {
      setActionError('Erro ao bloquear cliente.');
    } finally {
      setIsActionLoading(false);
    }
  };

  const customer = customerDetail;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>Detalhes do Cliente</h2>
          <button className={styles.closeButton} onClick={onClose}>
            ✕
          </button>
        </div>

        {loading ? (
          <div className={styles.modalBody}>
            <p>Carregando...</p>
          </div>
        ) : error ? (
          <div className={styles.modalBody}>
            <p className={styles.errorText}>Erro ao carregar detalhes: {error}</p>
          </div>
        ) : customer ? (
          <div className={styles.modalBody}>
            {/* Customer Info Section */}
            <div className={styles.detailSection}>
              <h3>Informações do Cliente</h3>
              <div className={styles.detailGrid}>
                <div className={styles.detailItem}>
                  <label>Apelido</label>
                  <p>{customer.nickname || '-'}</p>
                </div>
                <div className={styles.detailItem}>
                  <label>Tipo</label>
                  <p>{customer.customer_type === 'FISICA' ? 'Pessoa Física' : 'Pessoa Jurídica'}</p>
                </div>
                <div className={styles.detailItem}>
                  <label>CPF/CNPJ</label>
                  <p>{customer.cnpj_cpf || '-'}</p>
                </div>
                <div className={styles.detailItem}>
                  <label>Telefone</label>
                  <p>{customer.phone || '-'}</p>
                </div>
                <div className={styles.detailItem}>
                  <label>Status</label>
                  <p>
                    <span
                      className={`${styles.statusBadge} ${styles[`status-${(customer.status || 'pendente').toLowerCase()}`]}`}
                    >
                      {customer.status || 'PENDENTE'}
                    </span>
                  </p>
                </div>
                {customer.created_at && (
                  <div className={styles.detailItem}>
                    <label>Cadastro em</label>
                    <p>{new Date(customer.created_at).toLocaleDateString('pt-BR')}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Balance Section */}
            <div className={styles.detailSection}>
              <h3>Saldo</h3>
              <div className={styles.balanceDetail}>
                <div className={styles.balanceItem}>
                  <label>Saldo Atual</label>
                  <p className={styles.balanceValue}>
                    R${' '}
                    {(typeof customer.current_balance === 'string'
                      ? parseFloat(customer.current_balance)
                      : customer.current_balance || 0
                    )
                      .toFixed(2)
                      .replace('.', ',')}
                  </p>
                </div>
              </div>
            </div>

            {/* Action Messages */}
            {actionError && <div className={styles.errorMessage}>{actionError}</div>}
            {actionSuccess && <div className={styles.successMessage}>{actionSuccess}</div>}

            {/* Action Buttons */}
            <div className={styles.modalActions}>
              {customer.status === 'PENDENTE' && (
                <button
                  className={styles.approveButton}
                  onClick={handleApprove}
                  disabled={isActionLoading}
                >
                  {isActionLoading ? '⏳ Aprovando...' : '✅ Aprovar'}
                </button>
              )}
              {customer.status === 'APROVADO' && (
                <button
                  className={styles.blockButton}
                  onClick={handleBlock}
                  disabled={isActionLoading}
                >
                  {isActionLoading ? '⏳ Bloqueando...' : '🚫 Bloquear'}
                </button>
              )}
              {customer.status === 'BLOQUEADO' && (
                <p className={styles.blockedNote}>Cliente bloqueado - sem ações disponíveis</p>
              )}
              <button
                className={styles.closeButtonModal}
                onClick={onClose}
                disabled={isActionLoading}
              >
                Fechar
              </button>
            </div>
          </div>
        ) : (
          <div className={styles.modalBody}>
            <p>Cliente não encontrado.</p>
          </div>
        )}
      </div>
    </div>
  );
};
