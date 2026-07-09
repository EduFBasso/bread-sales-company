import { useState, useRef } from 'react';
import { FormGroup } from '../FormGroup';
import { Input } from '../../ui/Input';
import { Button } from '../../ui/Button';
import { useMaskInput, useViaCEPLookup } from '../../../hooks';
import { RegistrationFormData, FormErrors, CustomerType } from '../../../types/forms';
import { maskPatterns } from '../../../utils/maskPatterns';
import styles from './CustomerForm.module.css';

interface CustomerFormProps {
  onSubmit: (data: RegistrationFormData) => void;
  isLoading?: boolean;
  errors?: FormErrors;
}

export function CustomerForm({ onSubmit, isLoading = false, errors = {} }: CustomerFormProps) {
  // Refs para auto-focus após ViaCEP
  const numberInputRef = useRef<HTMLInputElement>(null);

  // Estado dos campos básicos
  const [formData, setFormData] = useState({
    name: '',
    nickname: '',
    complement: '',
    companyName: '',
  });

  const [customerType, setCustomerType] = useState<CustomerType>('PF');

  // Estado dos campos de endereço que vêm do ViaCEP
  const [address, setAddress] = useState({
    street: '',
    neighborhood: '',
    city: '',
    state: '',
  });

  // Máscaras dos campos numéricos
  const cpfMask = useMaskInput('cpf');
  const cnpjMask = useMaskInput('cnpj');
  const phoneMask = useMaskInput('phone');
  const zipCodeMask = useMaskInput('zipCode');
  const numberMask = useMaskInput('streetNumber');

  // Hook para ViaCEP lookup com auto-focus
  const { lookup: lookupCEP } = useViaCEPLookup({
    onSuccess: (newAddress) => {
      setAddress(newAddress);
    },
    onAutoFocusField: () => {
      numberInputRef.current?.focus();
    },
  });

  // Monitorar mudanças no CEP e chamar lookup ao completar
  const handleZipCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    zipCodeMask.onChangeHandler(e);
    if (zipCodeMask.value.length === 8) {
      lookupCEP(zipCodeMask.value);
    }
  };

  // Enviar formulário
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const submitData: RegistrationFormData = {
      name: formData.name,
      nickname: formData.nickname,
      customer_type: customerType,
      phone: phoneMask.value,
      zip_code: zipCodeMask.value,
      street: address.street,
      number: numberMask.value,
      neighborhood: address.neighborhood,
      city: address.city,
      state: address.state,
      ...(formData.complement && { complement: formData.complement }),
      ...(customerType === 'PF'
        ? { cpf: cpfMask.value }
        : { cnpj: cnpjMask.value, company_name: formData.companyName }),
    };

    onSubmit(submitData);
  };

  const handleFormChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      {/* ===== SEÇÃO: IDENTIFICAÇÃO ===== */}
      <h3 className={styles.sectionTitle}>Informações Pessoais</h3>

      <FormGroup label="Nome Completo" required error={errors.name}>
        <Input
          name="name"
          placeholder="João da Silva Santos"
          value={formData.name}
          onChange={(e) => handleFormChange('name', e.target.value)}
          required
        />
      </FormGroup>

      <FormGroup label="Apelido (Como será chamado)" required error={errors.nickname}>
        <Input
          name="nickname"
          placeholder="João"
          value={formData.nickname}
          onChange={(e) => handleFormChange('nickname', e.target.value)}
          required
        />
      </FormGroup>

      {/* Tipo de Cliente */}
      <FormGroup label="Tipo de Cliente" required error={errors.customer_type}>
        <div className={styles.customerTypeButtons}>
          <button
            type="button"
            className={`${styles.typeButton} ${customerType === 'PF' ? styles.active : ''}`}
            onClick={() => setCustomerType('PF')}
          >
            Pessoa Física (PF)
          </button>
          <button
            type="button"
            className={`${styles.typeButton} ${customerType === 'PJ' ? styles.active : ''}`}
            onClick={() => setCustomerType('PJ')}
          >
            Pessoa Jurídica (PJ)
          </button>
        </div>
      </FormGroup>

      {/* CPF ou CNPJ - renderizar baseado no tipo */}
      {customerType === 'PF' ? (
        <FormGroup label="CPF" required error={errors.cpf}>
          <Input
            name="cpf"
            placeholder={maskPatterns.cpf.placeholder}
            value={cpfMask.formattedValue}
            onChange={cpfMask.onChangeHandler}
            inputMode={cpfMask.inputMode}
            pattern="[0-9]*"
            required
          />
        </FormGroup>
      ) : (
        <>
          <FormGroup label="CNPJ" required error={errors.cnpj}>
            <Input
              name="cnpj"
              placeholder={maskPatterns.cnpj.placeholder}
              value={cnpjMask.formattedValue}
              onChange={cnpjMask.onChangeHandler}
              inputMode={cnpjMask.inputMode}
              pattern="[0-9]*"
              required
            />
          </FormGroup>

          <FormGroup label="Razão Social" required error={errors.company_name}>
            <Input
              name="company_name"
              placeholder="Panificadora XYZ Ltda"
              value={formData.companyName}
              onChange={(e) => handleFormChange('companyName', e.target.value)}
              required
            />
          </FormGroup>
        </>
      )}

      <FormGroup label="Telefone (Celular)" required error={errors.phone}>
        <Input
          name="phone"
          placeholder={maskPatterns.phone.placeholder}
          value={phoneMask.formattedValue}
          onChange={phoneMask.onChangeHandler}
          inputMode={phoneMask.inputMode}
          pattern="[0-9]*"
          required
        />
      </FormGroup>

      {/* ===== SEÇÃO: ENDEREÇO ===== */}
      <h3 className={styles.sectionTitle}>Endereço de Entrega</h3>

      <FormGroup label="CEP" required error={errors.zip_code}>
        <Input
          name="zip_code"
          placeholder={maskPatterns.zipCode.placeholder}
          value={zipCodeMask.formattedValue}
          onChange={handleZipCodeChange}
          inputMode={zipCodeMask.inputMode}
          pattern="[0-9]*"
          required
        />
      </FormGroup>

      <FormGroup label="Rua/Avenida" required error={errors.street}>
        <Input
          name="street"
          placeholder="Avenida Paulista"
          defaultValue={address.street}
          disabled={Boolean(address.street)}
          required
        />
      </FormGroup>

      <FormGroup label="Número" required error={errors.number}>
        <Input
          ref={numberInputRef}
          name="number"
          placeholder="123"
          value={numberMask.formattedValue}
          onChange={(e) => numberMask.onChangeHandler(e)}
          inputMode={numberMask.inputMode}
          pattern="[0-9]*"
          required
        />
      </FormGroup>

      <FormGroup label="Complemento" error={errors.complement}>
        <Input
          name="complement"
          placeholder="Apto 456, Sala B"
          value={formData.complement}
          onChange={(e) => handleFormChange('complement', e.target.value)}
        />
      </FormGroup>

      <FormGroup label="Bairro" required error={errors.neighborhood}>
        <Input
          name="neighborhood"
          placeholder="Centro"
          defaultValue={address.neighborhood}
          disabled={Boolean(address.neighborhood)}
          required
        />
      </FormGroup>

      <FormGroup label="Cidade" required error={errors.city}>
        <Input
          name="city"
          placeholder="São Paulo"
          defaultValue={address.city}
          disabled={Boolean(address.city)}
          required
        />
      </FormGroup>

      <FormGroup label="Estado (UF)" required error={errors.state}>
        <Input
          name="state"
          placeholder="SP"
          defaultValue={address.state}
          disabled={Boolean(address.state)}
          maxLength={2}
          required
        />
      </FormGroup>

      {/* Botão de Envio */}
      <Button variant="primary" type="submit" disabled={isLoading}>
        {isLoading ? '⏳ Enviando...' : '✅ Enviar Cadastro'}
      </Button>
    </form>
  );
}
