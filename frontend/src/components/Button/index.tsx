import React from 'react';
import styles from './styles.module.css';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'link';
type ButtonSize = 'sm' | 'base' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  children: React.ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'base',
  loading = false,
  disabled = false,
  className = '',
  children,
  ...props
}: ButtonProps) {
  const buttonClass = `${styles.button} ${styles[variant]} ${styles[size]} ${
    loading ? styles.loading : ''
  } ${className}`;

  return (
    <button className={buttonClass} disabled={disabled || loading} {...props}>
      {loading ? (
        <>
          <span className={styles.spinner}></span>
          {children}
        </>
      ) : (
        children
      )}
    </button>
  );
}
