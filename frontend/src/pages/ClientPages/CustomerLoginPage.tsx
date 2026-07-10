import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCustomerLogin } from '../../hooks';
import { Button } from '../../components/ui/Button';
import styles from '../LoginPage.module.css';

export function CustomerLoginPage() {
  const navigate = useNavigate();
  const [nickname, setNickname] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const { login, loading, error, clearError } = useCustomerLogin({
    onSuccess: () => {
      navigate('/customer/dashboard');
    },
    onError: (err) => {
      console.error('Erro ao fazer login:', err);
    },
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    clearError();

    if (!nickname.trim()) {
      return;
    }
    if (!password.trim()) {
      return;
    }

    await login(nickname, password);
  };

  const handleGoHome = () => {
    navigate('/');
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>🥖 Login Cliente</h1>
        <p className={styles.subtitle}>Acesse sua conta para fazer pedidos</p>

        {error && (
          <div className={styles.errorAlert}>
            <span onClick={clearError} style={{ cursor: 'pointer', float: 'right' }}>
              ✕
            </span>
            ❌ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Apelido da Empresa</label>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="Ex: Padaria Central"
              disabled={loading}
              className={styles.input}
              autoFocus
            />
            <small className={styles.hint}>
              Digite o apelido da sua empresa cadastrado no sistema
            </small>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Senha</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Sua senha"
                disabled={loading}
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
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
          </div>

          <Button
            variant="primary"
            type="submit"
            disabled={loading || !nickname.trim() || !password.trim()}
          >
            {loading ? '⏳ Entrando...' : '🔓 Entrar'}
          </Button>
        </form>

        <div className={styles.footer}>
          <button className={styles.backLink} onClick={handleGoHome}>
            ← Voltar para Home
          </button>
          <button
            className={styles.registerLink}
            onClick={() => navigate('/register')}
            style={{ float: 'right' }}
          >
            Cadastrar-se →
          </button>
        </div>
      </div>
    </div>
  );
}
