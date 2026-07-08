import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCustomer } from '../hooks/useCustomer';
import styles from './LoginPage.module.css';

export function LoginPage() {
  const navigate = useNavigate();
  const { login, loading, error } = useCustomer();

  const [formData, setFormData] = useState({
    nickname: '',
    password: '',
  });

  const [localError, setLocalError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setLocalError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    try {
      if (!formData.nickname.trim()) {
        throw new Error('Apelido é obrigatório');
      }

      if (!formData.password.trim()) {
        throw new Error('Senha é obrigatória');
      }

      await login(formData.nickname, formData.password);

      // Redirecionar para dashboard após login bem-sucedido
      navigate('/dashboard');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao fazer login';
      setLocalError(errorMessage);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1>🥖 Login de Cliente</h1>
          <p>Acesse sua conta para fazer pedidos</p>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          {/* Nickname */}
          <div className={styles.formGroup}>
            <label htmlFor="nickname">Apelido *</label>
            <input
              id="nickname"
              name="nickname"
              type="text"
              value={formData.nickname}
              onChange={handleInputChange}
              placeholder="Digite seu apelido"
              disabled={loading}
              autoFocus
              required
            />
          </div>

          {/* Senha */}
          <div className={styles.formGroup}>
            <label htmlFor="password">Senha *</label>
            <input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Digite sua senha"
              disabled={loading}
              required
            />
          </div>

          {/* Mensagens de erro */}
          {(localError || error) && (
            <div className={styles.errorMessage}>❌ {localError || error}</div>
          )}

          {/* Botões */}
          <div className={styles.actions}>
            <button type="submit" className={styles.submitButton} disabled={loading}>
              {loading ? '⏳ Entrando...' : '✅ Entrar'}
            </button>
          </div>

          {/* Links */}
          <div className={styles.links}>
            <button type="button" className={styles.linkButton} onClick={() => navigate('/')}>
              ← Voltar
            </button>

            <button
              type="button"
              className={styles.linkButton}
              onClick={() => navigate('/register')}
            >
              Não tenho cadastro
            </button>
          </div>
        </form>

        <div className={styles.info}>
          <p>
            <strong>Informações:</strong>
          </p>
          <ul>
            <li>Use o apelido definido no seu cadastro</li>
            <li>Sua senha foi enviada pelo dono da panificadora após aprovação</li>
            <li>Se não recebeu a senha, entre em contato com o dono</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
