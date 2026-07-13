import React, { useEffect, useState } from 'react';
import styles from './AdminPages.module.css';

interface AdminPasswordDialogProps {
  isOpen: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  isLoading?: boolean;
  error?: string | null;
  onClose: () => void;
  onConfirm: (password: string) => void;
}

export const AdminPasswordDialog: React.FC<AdminPasswordDialogProps> = ({
  isOpen,
  title,
  description,
  confirmLabel,
  isLoading = false,
  error,
  onClose,
  onConfirm,
}) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setPassword('');
      setShowPassword(false);
    }
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.passwordDialogContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>{title}</h2>
          <button className={styles.closeButton} onClick={onClose}>
            ✕
          </button>
        </div>

        <div className={styles.modalBody}>
          <p className={styles.passwordDialogDescription}>{description}</p>

          <div className={styles.passwordDialogField}>
            <label>Sua Senha</label>
            <div className={styles.passwordInlineRow}>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Digite sua senha"
                disabled={isLoading}
                className={styles.adminPasswordInput}
              />
              <button
                type="button"
                className={styles.inlinePasswordAction}
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          {error && <div className={styles.errorMessage}>{error}</div>}
        </div>

        <div className={styles.passwordDialogActions}>
          <button className={styles.closeButtonModal} onClick={onClose} disabled={isLoading}>
            Cancelar
          </button>
          <button
            className={styles.approveButton}
            onClick={() => onConfirm(password)}
            disabled={!password || isLoading}
          >
            {isLoading ? '⏳ Confirmando...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
