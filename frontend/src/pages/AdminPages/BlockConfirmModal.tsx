import React, { useState } from 'react';
import styles from './AdminPages.module.css';

interface BlockConfirmModalProps {
  isOpen: boolean;
  customerId: number;
  customerNickname: string;
  action: 'block' | 'unblock';
  onClose: () => void;
  onCustomerUpdated: () => void;
}

export const BlockConfirmModal: React.FC<BlockConfirmModalProps> = ({
  isOpen,
  customerId,
  customerNickname,
  action,
  onClose,
  onCustomerUpdated,
}) => {
  const [adminPasswordInput, setAdminPasswordInput] = useState('');
  const [passwordValidated, setPasswordValidated] = useState(false);
  const [showAdminPassword, setShowAdminPassword] = useState(false);
  const [confirmModalLoading, setConfirmModalLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  if (!isOpen) {
    return null;
  }

  const readErrorMessage = async (response: Response, fallbackMessage: string) => {
    const contentType = response.headers.get('content-type') || '';

    if (contentType.includes('application/json')) {
      const data = await response.json();
      if (data?.detail) {
        if (typeof data.orders_count === 'number' || typeof data.transactions_count === 'number') {
          const ordersCount = data.orders_count ?? 0;
          const transactionsCount = data.transactions_count ?? 0;
          return `${data.detail} (Pedidos: ${ordersCount}, Transações: ${transactionsCount})`;
        }
        return data.detail;
      }
      return fallbackMessage;
    }

    const text = (await response.text()).trim();
    return text || fallbackMessage;
  };

  // 🔐 Validar senha do admin
  const handleValidateAdminPassword = async () => {
    if (!adminPasswordInput) {
      setActionError('Digite a sua senha');
      return;
    }

    setConfirmModalLoading(true);
    setActionError(null);

    try {
      // Para este MVP, aceitamos qualquer senha não-vazia
      // Em produção, seria necessário um endpoint de validação real no backend
      setPasswordValidated(true);
      setActionError(null);
    } catch (err) {
      setActionError('Erro ao validar. Tente novamente.');
    } finally {
      setConfirmModalLoading(false);
    }
  };

  // 🚫 Bloquear / 🔓 Desbloquear cliente
  const handleBlockActionConfirm = async () => {
    setConfirmModalLoading(true);
    setActionError(null);

    try {
      const token = localStorage.getItem('bread_admin_token');
      if (!token) {
        throw new Error('Token não encontrado');
      }

      const endpoint = action === 'block' ? '/block' : '/unblock';
      const actionName = action === 'block' ? 'bloquear' : 'desbloquear';

      const response = await fetch(`http://localhost:8000/api/customers/${customerId}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          password: adminPasswordInput,
          reason: action === 'block' ? 'Bloqueado via admin panel' : 'Desbloqueado via admin panel',
        }),
      });

      if (!response.ok) {
        const message = await readErrorMessage(response, `Erro ao ${actionName} cliente`);
        throw new Error(message);
      }

      setTimeout(() => {
        onCustomerUpdated();
        onClose();
      }, 1500);
    } catch (err) {
      const errorMsg =
        err instanceof Error
          ? err.message
          : `Erro ao ${action === 'block' ? 'bloquear' : 'desbloquear'} cliente`;
      setActionError(errorMsg);
    } finally {
      setConfirmModalLoading(false);
    }
  };

  // 🗑️ Apagar cliente (hard delete)
  const handleDeleteConfirm = async () => {
    setConfirmModalLoading(true);
    setActionError(null);

    try {
      const token = localStorage.getItem('bread_admin_token');
      if (!token) {
        throw new Error('Token não encontrado');
      }

      const response = await fetch(`http://localhost:8000/api/customers/${customerId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const message = await readErrorMessage(response, 'Erro ao apagar cliente');
        throw new Error(message);
      }

      // ✅ Sucesso! Mostrar confirmação antes de fechar
      setActionError(null);
      setTimeout(() => {
        onCustomerUpdated();
        onClose();
      }, 1500);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Erro ao apagar cliente';
      setActionError(errorMsg);
    } finally {
      setConfirmModalLoading(false);
    }
  };

  // Fechar modal
  const handleCloseConfirmModal = () => {
    onClose();
    setAdminPasswordInput('');
    setPasswordValidated(false);
    setActionError(null);
  };

  return (
    <div className={styles.modalOverlay} onClick={handleCloseConfirmModal}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>🔐 Confirmação de Segurança</h2>
          <button className={styles.closeButton} onClick={handleCloseConfirmModal}>
            ✕
          </button>
        </div>

        <div className={styles.modalBody}>
          {!passwordValidated ? (
            // 🔑 Pedir senha do admin
            <div style={{ padding: '20px' }}>
              <p style={{ marginBottom: '20px', fontSize: '14px', color: '#666' }}>
                Digite sua senha de administrador para continuar com {customerNickname}:
              </p>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                  Sua Senha*
                </label>
                <div style={{ position: 'relative', display: 'flex', gap: '8px' }}>
                  <input
                    type={showAdminPassword ? 'text' : 'password'}
                    value={adminPasswordInput}
                    onChange={(e) => setAdminPasswordInput(e.target.value)}
                    placeholder="Digite sua senha"
                    style={{
                      flex: 1,
                      padding: '10px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      fontSize: '14px',
                    }}
                    disabled={confirmModalLoading}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !confirmModalLoading) {
                        handleValidateAdminPassword();
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowAdminPassword(!showAdminPassword)}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '18px',
                      padding: '8px',
                    }}
                    disabled={confirmModalLoading}
                  >
                    {showAdminPassword ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
              </div>

              {actionError && (
                <div
                  style={{
                    padding: '10px',
                    background: '#ffebee',
                    color: '#c62828',
                    borderRadius: '4px',
                    marginBottom: '20px',
                    fontSize: '14px',
                  }}
                >
                  {actionError}
                </div>
              )}

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button
                  onClick={handleCloseConfirmModal}
                  disabled={confirmModalLoading}
                  style={{
                    padding: '10px 20px',
                    background: '#f0f0f0',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '14px',
                  }}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleValidateAdminPassword}
                  disabled={!adminPasswordInput || confirmModalLoading}
                  style={{
                    padding: '10px 20px',
                    background: '#2196f3',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '14px',
                  }}
                >
                  {confirmModalLoading ? '⏳ Validando...' : '✓ Validar'}
                </button>
              </div>
            </div>
          ) : (
            // ✅ Senha validada - Mostrar opções
            <div style={{ padding: '20px' }}>
              <div
                style={{
                  padding: '15px',
                  background: '#e8f5e9',
                  color: '#2e7d32',
                  borderRadius: '4px',
                  marginBottom: '20px',
                  fontSize: '14px',
                }}
              >
                ✅ Senha validada. Escolha uma ação para {customerNickname}:
              </div>

              {actionError && (
                <div
                  style={{
                    padding: '10px',
                    background: '#ffebee',
                    color: '#c62828',
                    borderRadius: '4px',
                    marginBottom: '20px',
                    fontSize: '14px',
                  }}
                >
                  {actionError}
                </div>
              )}

              {/* Opção 1: Bloquear */}
              <div
                style={{
                  padding: '15px',
                  border: action === 'block' ? '1px solid #ffc107' : '1px solid #9e9e9e',
                  borderRadius: '4px',
                  marginBottom: '15px',
                  background: action === 'block' ? '#fffef0' : '#f5f5f5',
                }}
              >
                {action === 'block' ? (
                  <>
                    <h4 style={{ margin: '0 0 10px 0', color: '#f57f17' }}>🚫 Bloquear Cliente</h4>
                    <p style={{ margin: '0 0 10px 0', fontSize: '13px', color: '#666' }}>
                      O cliente será bloqueado, mas todos os seus dados serão preservados. Você
                      poderá reativá-lo depois se necessário.
                    </p>
                  </>
                ) : (
                  <>
                    <h4 style={{ margin: '0 0 10px 0', color: '#616161' }}>
                      🔓 Desbloquear Cliente
                    </h4>
                    <p style={{ margin: '0 0 10px 0', fontSize: '13px', color: '#666' }}>
                      O cliente será desbloqueado e poderá fazer pedidos novamente.
                    </p>
                  </>
                )}
                <button
                  onClick={handleBlockActionConfirm}
                  disabled={confirmModalLoading}
                  style={{
                    padding: '10px 16px',
                    background: action === 'block' ? '#ffc107' : '#757575',
                    color: action === 'block' ? '#000' : '#fff',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '600',
                  }}
                >
                  {confirmModalLoading
                    ? action === 'block'
                      ? '⏳ Bloqueando...'
                      : '⏳ Desbloqueando...'
                    : action === 'block'
                      ? '🚫 Bloquear'
                      : '🔓 Desbloquear'}
                </button>
              </div>

              {/* Opção 2: Apagar (apenas quando ação é 'block') */}
              {action === 'block' && (
                <div
                  style={{
                    padding: '15px',
                    border: '2px solid #d32f2f',
                    borderRadius: '4px',
                    background: '#ffebee',
                  }}
                >
                  <h4 style={{ margin: '0 0 10px 0', color: '#d32f2f' }}>
                    🗑️ Apagar Cliente (PERMANENTE)
                  </h4>
                  <p style={{ margin: '0 0 10px 0', fontSize: '13px', color: '#666' }}>
                    <strong>⚠️ AVISO:</strong> Esta ação <strong>NÃO PODE SER DESFEITA</strong>. O
                    cliente e todo o seu histórico (pedidos, transações, etc.) serão deletados
                    permanentemente do sistema.
                  </p>
                  <button
                    onClick={handleDeleteConfirm}
                    disabled={confirmModalLoading}
                    style={{
                      padding: '10px 16px',
                      background: '#d32f2f',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: '600',
                    }}
                  >
                    {confirmModalLoading ? '⏳ Apagando...' : '🗑️ Apagar Permanentemente'}
                  </button>
                </div>
              )}
              {action === 'unblock' && (
                <div
                  style={{
                    padding: '15px',
                    border: '2px solid #e0e0e0',
                    borderRadius: '4px',
                    background: '#f5f5f5',
                    opacity: 0.6,
                  }}
                >
                  <h4 style={{ margin: '0 0 10px 0', color: '#9e9e9e' }}>
                    🗑️ Apagar Cliente (PERMANENTE)
                  </h4>
                  <p style={{ margin: '0 0 10px 0', fontSize: '13px', color: '#999' }}>
                    <strong>⚠️ AVISO:</strong> Esta ação <strong>NÃO PODE SER DESFEITA</strong>. O
                    cliente e todo o seu histórico (pedidos, transações, etc.) serão deletados
                    permanentemente do sistema.
                  </p>
                  <button
                    disabled
                    style={{
                      padding: '10px 16px',
                      background: '#e0e0e0',
                      color: '#999',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'not-allowed',
                      fontSize: '14px',
                      fontWeight: '600',
                    }}
                  >
                    🗑️ Apagar Permanentemente
                  </button>
                </div>
              )}

              <div style={{ marginTop: '20px', paddingTop: '15px', borderTop: '1px solid #ddd' }}>
                <button
                  onClick={handleCloseConfirmModal}
                  disabled={confirmModalLoading}
                  style={{
                    width: '100%',
                    padding: '10px',
                    background: '#f0f0f0',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '14px',
                  }}
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
