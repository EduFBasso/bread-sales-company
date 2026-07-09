import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CustomerForm } from '../../components/forms/CustomerForm';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Spinner } from '../../components/ui/Spinner';
import { useRegister } from '../../hooks';
import { RegistrationFormData } from '../../types/forms';
import styles from './AuthPages.module.css';

export function RegisterPage() {
  const navigate = useNavigate();
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [registeredNickname, setRegisteredNickname] = useState('');
  const [formErrors, setFormErrors] = useState({});

  const { loading, error, register } = useRegister({
    onSuccess: (response) => {
      setRegisteredNickname(response.nickname);
      setShowSuccessModal(true);
    },
    onError: (err) => {
      console.error('Erro ao registrar:', err);
      // Mostrar erro no formulário
    },
  });

  const handleRegisterSubmit = async (formData: RegistrationFormData) => {
    setFormErrors({});
    try {
      await register(formData);
    } catch (err) {
      // Erro já foi capturado no hook
    }
  };

  const handleCloseModal = () => {
    setShowSuccessModal(false);
    navigate('/');
  };

  const handleGoHome = () => {
    navigate('/');
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>🥖 Registrar Novo Cliente</h1>
        <p className={styles.subtitle}>Preencha os dados para se cadastrar no sistema</p>

        {error && (
          <div className={styles.errorAlert}>
            ❌ {error}
          </div>
        )}

        <CustomerForm
          onSubmit={handleRegisterSubmit}
          isLoading={loading}
          errors={formErrors}
        />

        <button className={styles.backLink} onClick={handleGoHome}>
          ← Voltar para Home
        </button>
      </div>

      {/* Modal de Sucesso */}
      <Modal isOpen={showSuccessModal} onClose={handleCloseModal}>
        <div className={styles.successContent}>
          <div className={styles.successIcon}>✅</div>
          <h2 className={styles.successTitle}>Cadastro Recebido!</h2>
          <p className={styles.successMessage}>
            Seu acesso está em análise pelo administrador.
          </p>
          <p className={styles.successDetail}>
            Apelido cadastrado: <strong>{registeredNickname}</strong>
          </p>
          <p className={styles.successSubtext}>
            Você será contatado em breve com sua senha de acesso.
          </p>
          <div className={styles.successActions}>
            <Button
              variant="primary"
              onClick={handleCloseModal}
            >
              ✅ Ir para Home
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export function LoginPage() {
  const navigate = useNavigate();
  const [nickname, setNickname] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:8000/api/customers/login/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nickname, password }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || 'Erro ao fazer login');
      }

      const data = await response.json();
      localStorage.setItem('bread_token', data.access_token);
      localStorage.setItem('bread_customer', JSON.stringify(data.customer));
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>🥖 Login</h1>
        <p className={styles.subtitle}>Acesse sua conta para fazer pedidos</p>

        {error && (
          <div className={styles.errorAlert}>
            ❌ {error}
          </div>
        )}

        <form onSubmit={handleLogin} className={styles.form}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Apelido</label>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="Seu apelido"
              required
              className={styles.input}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Senha</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Sua senha"
              required
              className={styles.input}
            />
          </div>

          <Button
            variant="primary"
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? '⏳ Entrando...' : '🔓 Entrar'}
          </Button>
        </form>

        <button className={styles.backLink} onClick={() => navigate('/')}>
          ← Voltar para Home
        </button>
      </div>
    </div>
  );
}

export function PendingPage() {
  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.pendingContent}>
          <div className={styles.spinnerWrapper}>
            <Spinner />
          </div>
          <h1 className={styles.pendingTitle}>⏳ Aguardando Aprovação</h1>
          <p className={styles.pendingMessage}>
            Seu cadastro está em análise pelo administrador.
          </p>
          <p className={styles.pendingSubtext}>
            Você será notificado em breve quando sua conta for aprovada.
          </p>
        </div>
      </div>
    </div>
  );
}
