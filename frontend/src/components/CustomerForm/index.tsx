import React, { useState } from 'react';
import { Button } from '../Button';
import { Input } from '../Input';
import { Card } from '../Card';
import styles from './styles.module.css';

interface CustomerFormProps {
  onSubmit: (data: FormData) => Promise<void>;
  loading?: boolean;
  error?: string | null;
}

export interface FormData {
  nickname: string;
  customer_type: 'PJ' | 'PF';
  phone: string;
  zip_code: string;
  street: string;
  number: string;
  neighborhood: string;
  city: string;
  state: string;
}

const INITIAL_STATE: FormData = {
  nickname: '',
  customer_type: 'PF',
  phone: '',
  zip_code: '',
  street: '',
  number: '',
  neighborhood: '',
  city: '',
  state: 'SP',
};

export function CustomerForm({ onSubmit, loading = false, error = null }: CustomerFormProps) {
  const [formData, setFormData] = useState<FormData>(INITIAL_STATE);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const maskPhone = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d)/, '$1-$2')
      .slice(0, 14);
  };

  const maskZip = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{5})(\d)/, '$1-$2')
      .slice(0, 9);
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.nickname.trim()) {
      errors.nickname = 'Nome é obrigatório';
    }
    if (!formData.phone.replace(/\D/g, '') || formData.phone.replace(/\D/g, '').length < 10) {
      errors.phone = 'Telefone inválido';
    }
    if (!formData.zip_code.replace(/\D/g, '') || formData.zip_code.replace(/\D/g, '').length < 8) {
      errors.zip_code = 'CEP inválido';
    }
    if (!formData.street.trim()) {
      errors.street = 'Rua é obrigatória';
    }
    if (!formData.number.trim()) {
      errors.number = 'Número é obrigatório';
    }
    if (!formData.neighborhood.trim()) {
      errors.neighborhood = 'Bairro é obrigatório';
    }
    if (!formData.city.trim()) {
      errors.city = 'Cidade é obrigatória';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Limpar erro ao digitar
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await onSubmit(formData);
      setFormData(INITIAL_STATE);
    } catch (err) {
      // Erro já é exibido via prop 'error'
    }
  };

  return (
    <Card title="📝 Registre-se" subtitle="Seja um cliente e comece a fazer pedidos">
      <form className={styles.form} onSubmit={handleSubmit}>
        {error && <div className={styles.alert}>{error}</div>}

        <Input
          label="Nome do Cliente"
          name="nickname"
          value={formData.nickname}
          onChange={handleChange}
          placeholder="Seu nome ou razão social"
          error={validationErrors.nickname}
          disabled={loading}
        />

        <div className={styles.row}>
          <div className={styles.col}>
            <label className={styles.label}>Tipo de Cliente</label>
            <select
              name="customer_type"
              value={formData.customer_type}
              onChange={handleChange}
              className={styles.select}
              disabled={loading}
            >
              <option value="PF">Pessoa Física</option>
              <option value="PJ">Pessoa Jurídica</option>
            </select>
          </div>

          <div className={styles.col}>
            <Input
              label="Telefone"
              name="phone"
              value={formData.phone}
              onChange={(e) => {
                const masked = maskPhone(e.target.value);
                handleChange({ ...e, target: { ...e.target, value: masked } });
              }}
              placeholder="(11) 98765-4321"
              error={validationErrors.phone}
              disabled={loading}
            />
          </div>
        </div>

        <Input
          label="CEP"
          name="zip_code"
          value={formData.zip_code}
          onChange={(e) => {
            const masked = maskZip(e.target.value);
            handleChange({ ...e, target: { ...e.target, value: masked } });
          }}
          placeholder="01310-100"
          error={validationErrors.zip_code}
          disabled={loading}
        />

        <div className={styles.row}>
          <div className={styles.col2}>
            <Input
              label="Rua"
              name="street"
              value={formData.street}
              onChange={handleChange}
              placeholder="Av. Paulista"
              error={validationErrors.street}
              disabled={loading}
            />
          </div>
          <div className={styles.col}>
            <Input
              label="Número"
              name="number"
              value={formData.number}
              onChange={handleChange}
              placeholder="1000"
              error={validationErrors.number}
              disabled={loading}
            />
          </div>
        </div>

        <Input
          label="Bairro"
          name="neighborhood"
          value={formData.neighborhood}
          onChange={handleChange}
          placeholder="Bela Vista"
          error={validationErrors.neighborhood}
          disabled={loading}
        />

        <div className={styles.row}>
          <div className={styles.col}>
            <Input
              label="Cidade"
              name="city"
              value={formData.city}
              onChange={handleChange}
              placeholder="São Paulo"
              error={validationErrors.city}
              disabled={loading}
            />
          </div>

          <div className={styles.col}>
            <label className={styles.label}>Estado</label>
            <select
              name="state"
              value={formData.state}
              onChange={handleChange}
              className={styles.select}
              disabled={loading}
            >
              <option value="SP">SP</option>
              <option value="RJ">RJ</option>
              <option value="MG">MG</option>
              <option value="BA">BA</option>
              <option value="SC">SC</option>
              <option value="RS">RS</option>
              <option value="PR">PR</option>
              <option value="PE">PE</option>
              <option value="CE">CE</option>
              <option value="GO">GO</option>
            </select>
          </div>
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          loading={loading}
          disabled={loading}
          style={{ width: '100%' }}
        >
          Registrar
        </Button>
      </form>
    </Card>
  );
}
