import styles from './CustomerForm.module.css';

interface CustomerFormProps {
  onSubmit: (data: any) => void;
  isLoading?: boolean;
}

export function CustomerForm({ onSubmit }: CustomerFormProps) {
  return (
    <form
      className={styles.form}
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({});
      }}
    >
      {/* Será preenchido durante implementação */}
    </form>
  );
}
