import { Button } from '../Button';
import { Card } from '../Card';
import { Customer } from '../../types';
import styles from './styles.module.css';

interface CustomerSelectorProps {
  customer: Customer | null;
  onLogout: () => void;
  onSelectOther?: () => void;
}

export function CustomerSelector({ customer, onLogout, onSelectOther }: CustomerSelectorProps) {
  if (!customer) {
    return null;
  }

  return (
    <Card className={styles.selector}>
      <div className={styles.header}>
        <div className={styles.info}>
          <div className={styles.avatar}>👤</div>
          <div className={styles.details}>
            <h3 className={styles.name}>{customer.nickname}</h3>
            <p className={styles.type}>
              {customer.customer_type === 'PF' ? 'Pessoa Física' : 'Pessoa Jurídica'}
            </p>
            <p className={styles.contact}>{customer.phone}</p>
          </div>
        </div>
      </div>

      <div className={styles.address}>
        <p>
          <strong>Endereço:</strong> {customer.street}, {customer.number}
        </p>
        <p>
          {customer.neighborhood} - {customer.city}, {customer.state}
        </p>
        <p>CEP: {customer.zip_code}</p>
      </div>

      <div className={styles.actions}>
        {onSelectOther && (
          <Button variant="secondary" onClick={onSelectOther} size="sm">
            Trocar Cliente
          </Button>
        )}
        <Button variant="danger" onClick={onLogout} size="sm">
          Sair
        </Button>
      </div>
    </Card>
  );
}
