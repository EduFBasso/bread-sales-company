import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCustomer } from '../hooks/useCustomer';
import { ApiService } from '../services/api';
import styles from './RegisterPage.module.css';

export function RegisterPage() {
  const navigate = useNavigate();
  const { register, loading: authLoading, error: authError } = useCustomer();

  const [formData, setFormData] = useState({
    nickname: '',
    customer_type: 'PF' as 'PF' | 'PJ',
    cpf: '',
    cnpj: '',
    company_name: '',
    phone: '',
    zip_code: '',
    street: '',
    number: '',
    neighborhood: '',
    city: '',
    state: 'SP',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cepLoading, setCepLoading] = useState(false);

  // Buscar endereço via ViaCEP quando CEP é alterado
  const handleCepChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const zipCode = e.target.value.replace(/\D/g, '');

    setFormData((prev) => ({
      ...prev,
      zip_code: zipCode,
    }));

    if (zipCode.length === 8) {
      setCepLoading(true);
      try {
        const address = await ApiService.lookupCEP(zipCode);
        setFormData((prev) => ({
          ...prev,
          street: address.street,
          neighborhood: address.neighborhood,
          city: address.city,
          state: address.state,
        }));
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao buscar CEP');
      } finally {
        setCepLoading(false);
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Validações básicas
      if (!formData.nickname.trim()) {
        throw new Error('Apelido é obrigatório');
      }

      if (formData.customer_type === 'PF' && !formData.cpf.trim()) {
        throw new Error('CPF é obrigatório para Pessoa Física');
      }

      if (formData.customer_type === 'PJ' && !formData.cnpj.trim()) {
        throw new Error('CNPJ é obrigatório para Pessoa Jurídica');
      }

      if (!formData.phone.trim()) {
        throw new Error('Telefone é obrigatório');
      }

      if (!formData.zip_code.trim()) {
        throw new Error('CEP é obrigatório');
      }

      // Chamar API de registro
      await register({
        id: 0, // Será gerado pelo backend
        nickname: formData.nickname,
        customer_type: formData.customer_type,
        cpf: formData.customer_type === 'PF' ? formData.cpf : undefined,
        cnpj: formData.customer_type === 'PJ' ? formData.cnpj : undefined,
        company_name: formData.customer_type === 'PJ' ? formData.company_name : undefined,
        phone: formData.phone,
        zip_code: formData.zip_code,
        street: formData.street,
        number: formData.number,
        neighborhood: formData.neighborhood,
        city: formData.city,
        state: formData.state,
        credit_limit: 0,
      } as any);

      // Redirecionar para tela de sucesso/aguardando aprovação
      navigate('/pending');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao registrar';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1>🥖 Cadastro de Cliente</h1>
          <p>Preencha os dados abaixo para se cadastrar</p>
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
              placeholder="Ex: Padaria Central"
              required
            />
          </div>

          {/* Tipo de Cliente */}
          <div className={styles.formGroup}>
            <label htmlFor="customer_type">Tipo de Cliente *</label>
            <select
              id="customer_type"
              name="customer_type"
              value={formData.customer_type}
              onChange={handleInputChange}
            >
              <option value="PF">Pessoa Física</option>
              <option value="PJ">Pessoa Jurídica</option>
            </select>
          </div>

          {/* CPF ou CNPJ */}
          {formData.customer_type === 'PF' ? (
            <div className={styles.formGroup}>
              <label htmlFor="cpf">CPF (sem pontos/traços) *</label>
              <input
                id="cpf"
                name="cpf"
                type="text"
                value={formData.cpf}
                onChange={handleInputChange}
                placeholder="11144477735"
                maxLength={11}
                required
              />
              <small>11 dígitos (Ex: 11144477735)</small>
            </div>
          ) : (
            <>
              <div className={styles.formGroup}>
                <label htmlFor="cnpj">CNPJ (sem pontos/traços) *</label>
                <input
                  id="cnpj"
                  name="cnpj"
                  type="text"
                  value={formData.cnpj}
                  onChange={handleInputChange}
                  placeholder="34028316000152"
                  maxLength={14}
                  required
                />
                <small>14 dígitos (Ex: 34028316000152)</small>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="company_name">Nome da Empresa *</label>
                <input
                  id="company_name"
                  name="company_name"
                  type="text"
                  value={formData.company_name}
                  onChange={handleInputChange}
                  placeholder="Minha Empresa LTDA"
                  required
                />
              </div>
            </>
          )}

          {/* Telefone */}
          <div className={styles.formGroup}>
            <label htmlFor="phone">Telefone *</label>
            <input
              id="phone"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleInputChange}
              placeholder="11 98765-4321"
              required
            />
          </div>

          {/* CEP - Auto-preenchimento */}
          <div className={styles.formGroup}>
            <label htmlFor="zip_code">CEP (sem hífen) *</label>
            <div className={styles.cepInput}>
              <input
                id="zip_code"
                name="zip_code"
                type="text"
                value={formData.zip_code}
                onChange={handleCepChange}
                placeholder="01310100"
                maxLength={8}
                required
              />
              {cepLoading && <span className={styles.loading}>⏳</span>}
            </div>
            <small>8 dígitos - Endereço será auto-preenchido via ViaCEP</small>
          </div>

          {/* Endereço (Auto-preenchido) */}
          <div className={styles.formGroup}>
            <label htmlFor="street">Rua *</label>
            <input
              id="street"
              name="street"
              type="text"
              value={formData.street}
              onChange={handleInputChange}
              placeholder="Auto-preenchido"
              required
            />
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="number">Número *</label>
              <input
                id="number"
                name="number"
                type="text"
                value={formData.number}
                onChange={handleInputChange}
                placeholder="1000"
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="neighborhood">Bairro *</label>
              <input
                id="neighborhood"
                name="neighborhood"
                type="text"
                value={formData.neighborhood}
                onChange={handleInputChange}
                placeholder="Auto-preenchido"
                required
              />
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="city">Cidade *</label>
              <input
                id="city"
                name="city"
                type="text"
                value={formData.city}
                onChange={handleInputChange}
                placeholder="Auto-preenchido"
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="state">Estado *</label>
              <input
                id="state"
                name="state"
                type="text"
                value={formData.state}
                onChange={handleInputChange}
                placeholder="SP"
                maxLength={2}
                required
              />
            </div>
          </div>

          {/* Mensagens */}
          {(error || authError) && (
            <div className={styles.errorMessage}>❌ {error || authError}</div>
          )}

          {/* Botões */}
          <div className={styles.actions}>
            <button type="submit" className={styles.submitButton} disabled={loading || authLoading}>
              {loading || authLoading ? '⏳ Cadastrando...' : '✅ Cadastrar'}
            </button>

            <button type="button" className={styles.backButton} onClick={() => navigate('/')}>
              ← Voltar
            </button>
          </div>

          <p className={styles.info}>
            Após cadastrar, o dono da panificadora precisará aprovar seu cadastro. Você receberá uma
            senha para fazer login.
          </p>
        </form>
      </div>
    </div>
  );
}
