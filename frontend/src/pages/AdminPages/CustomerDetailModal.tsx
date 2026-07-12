import React, { useEffect, useState } from 'react';
import { useAdminCustomers } from '../../hooks/useAdminCustomers';
import { generateRandomPassword, validatePassword } from '../../utils/passwordGenerator';
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
  const { customerDetail, fetchCustomerDetail, loading, error } = useAdminCustomers();
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Campos de aprovação
  const [creditLimit, setCreditLimit] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordGenerated, setPasswordGenerated] = useState('');
  const [copiedToClipboard, setCopiedToClipboard] = useState(false);

  useEffect(() => {
    if (isOpen && customerId) {
      fetchCustomerDetail(customerId);
      setActionError(null);
      setActionSuccess(null);
      setCreditLimit('');
      setShowPassword(false);
      setPasswordGenerated(generateRandomPassword());
      setCopiedToClipboard(false);
    }
  }, [isOpen, customerId, fetchCustomerDetail]);

  if (!isOpen || !customerId) {
    return null;
  }

  const handleApprove = async () => {
    // Validar campos
    if (!creditLimit || !passwordGenerated) {
      setActionError('Limite de crédito é obrigatório');
      return;
    }

    if (parseFloat(creditLimit) <= 0) {
      setActionError('Limite de crédito deve ser maior que 0');
      return;
    }

    // Validar senha gerada
    const validation = validatePassword(passwordGenerated);
    if (!validation.valid) {
      setActionError(`Senha inválida: ${validation.message}`);
      return;
    }

    setIsActionLoading(true);
    setActionError(null);
    setActionSuccess(null);
    try {
      const token = localStorage.getItem('bread_admin_token');
      if (!token) {
        throw new Error('Token não encontrado');
      }

      const response = await fetch(`http://localhost:8000/api/customers/${customerId}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          credit_limit: creditLimit,
          password: passwordGenerated,
          confirm_password: passwordGenerated,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || 'Erro ao aprovar cliente');
      }

      setActionSuccess(`✅ Cliente aprovado! Senha: ${passwordGenerated}`);
      setTimeout(() => {
        onCustomerUpdated();
        onClose();
      }, 2000);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Erro ao aprovar cliente';
      setActionError(errorMsg);
    } finally {
      setIsActionLoading(false);
    }
  };

  // ✨ Funções auxiliares para senha
  const handleGenerateNewPassword = () => {
    const newPassword = generateRandomPassword();
    setPasswordGenerated(newPassword);
    setCopiedToClipboard(false);
  };

  const handleCopyPassword = async () => {
    try {
      await navigator.clipboard.writeText(passwordGenerated);
      setCopiedToClipboard(true);
      setTimeout(() => setCopiedToClipboard(false), 2000);
    } catch (err) {
      setActionError('Erro ao copiar para clipboard');
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

            {/* Balance Section - Renamed to Debt */}
            <div className={styles.detailSection}>
              <h3>Dívida</h3>
              <div className={styles.balanceDetail}>
                <div className={styles.balanceItem}>
                  <label>Dívida Atual</label>
                  <p className={styles.balanceValue}>
                    R${' '}
                    {Math.abs(
                      typeof customer.current_balance === 'string'
                        ? parseFloat(customer.current_balance)
                        : customer.current_balance || 0
                    )
                      .toFixed(2)
                      .replace('.', ',')}
                  </p>
                </div>
              </div>
            </div>

            {/* Approval Form - Só mostra quando status é PENDENTE */}
            {customer.status === 'PENDENTE' && (
              <div className={styles.detailSection}>
                <h3>🔐 Dados para Aprovação</h3>
                <div className={styles.approvalForm}>
                  <div className={styles.formGroup}>
                    <label>Limite de Crédito (R$)*</label>
                    <input
                      type="number"
                      value={creditLimit}
                      onChange={(e) => setCreditLimit(e.target.value)}
                      placeholder="Ex: 5000.00"
                      step="0.01"
                      min="0"
                      disabled={isActionLoading}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>Senha de Acesso*</label>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <div style={{ flex: 1, position: 'relative' }}>
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={passwordGenerated}
                          readOnly
                          placeholder="Senha será gerada..."
                          style={{ width: '100%', paddingRight: '40px' }}
                          className={styles.input}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          style={{
                            position: 'absolute',
                            right: '10px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '18px',
                          }}
                          disabled={isActionLoading}
                        >
                          {showPassword ? '👁️' : '👁️‍🗨️'}
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={handleCopyPassword}
                        disabled={!passwordGenerated || isActionLoading}
                        style={{
                          padding: '8px 12px',
                          background: copiedToClipboard ? '#4caf50' : '#2196f3',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '14px',
                        }}
                      >
                        {copiedToClipboard ? '✓ Copiado' : '📋 Copiar'}
                      </button>
                      <button
                        type="button"
                        onClick={handleGenerateNewPassword}
                        disabled={isActionLoading}
                        style={{
                          padding: '8px 12px',
                          background: '#ff9800',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '14px',
                        }}
                      >
                        🔄 Gerar
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

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
                <p className={styles.blockedNote}>
                  Para bloquear ou apagar, use o botão "🚫 Bloquear" na tabela
                </p>
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
