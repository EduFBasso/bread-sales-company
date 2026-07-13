import React, { useState } from 'react';
import { AdminPasswordDialog } from './AdminPasswordDialog';
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
  const [confirmModalLoading, setConfirmModalLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [pendingSecureAction, setPendingSecureAction] = useState<'primary' | 'delete' | null>(null);

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

  // 🚫 Bloquear / 🔓 Desbloquear cliente
  const handleBlockActionConfirm = async (adminPassword: string) => {
    setConfirmModalLoading(true);
    setActionError(null);

    try {
      const token = localStorage.getItem('bread_admin_token');
      if (!token) {
        throw new Error('Token não encontrado');
      }

      const endpoint = action === 'block' ? '/block' : '/unblock';
      const actionName = action === 'block' ? 'bloquear' : 'desbloquear';

      const response = await fetch(`/api/customers/${customerId}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          password: adminPassword,
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
  const handleDeleteConfirm = async (adminPassword: string) => {
    setConfirmModalLoading(true);
    setActionError(null);

    try {
      const token = localStorage.getItem('bread_admin_token');
      if (!token) {
        throw new Error('Token não encontrado');
      }

      const response = await fetch(`/api/customers/${customerId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          admin_password: adminPassword,
        }),
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
    setActionError(null);
    setPasswordDialogOpen(false);
    setPendingSecureAction(null);
  };

  const openPasswordDialog = (secureAction: 'primary' | 'delete') => {
    setActionError(null);
    setPendingSecureAction(secureAction);
    setPasswordDialogOpen(true);
  };

  const handlePasswordConfirm = async (adminPassword: string) => {
    if (!adminPassword) {
      setActionError('Digite a senha do dono para continuar');
      return;
    }

    if (pendingSecureAction === 'delete') {
      await handleDeleteConfirm(adminPassword);
      return;
    }

    await handleBlockActionConfirm(adminPassword);
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
          <div style={{ padding: '20px' }}>
            <p style={{ marginBottom: '20px', fontSize: '14px', color: '#666' }}>
              Escolha a ação para {customerNickname}. A confirmação da senha do dono será pedida no
              próximo passo.
            </p>

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
                    O cliente será bloqueado, mas todos os seus dados serão preservados. Você poderá
                    reativá-lo depois se necessário.
                  </p>
                </>
              ) : (
                <>
                  <h4 style={{ margin: '0 0 10px 0', color: '#616161' }}>🔓 Desbloquear Cliente</h4>
                  <p style={{ margin: '0 0 10px 0', fontSize: '13px', color: '#666' }}>
                    O cliente será desbloqueado e poderá fazer pedidos novamente.
                  </p>
                </>
              )}
              <button
                onClick={() => openPasswordDialog('primary')}
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
                  onClick={() => openPasswordDialog('delete')}
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
        </div>

        <AdminPasswordDialog
          isOpen={passwordDialogOpen}
          title="Confirmar com Senha do Dono"
          description={`Digite a senha do dono para continuar com ${customerNickname}.`}
          confirmLabel={pendingSecureAction === 'delete' ? 'Apagar Cliente' : 'Confirmar Ação'}
          isLoading={confirmModalLoading}
          error={actionError}
          onClose={() => setPasswordDialogOpen(false)}
          onConfirm={handlePasswordConfirm}
        />
      </div>
    </div>
  );
};
