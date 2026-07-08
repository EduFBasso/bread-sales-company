import React from 'react';
import styles from './styles.module.css';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  mask?: (value: string) => string;
  helperText?: string;
}

export function Input({
  label,
  error,
  mask,
  value,
  onChange,
  helperText,
  className = '',
  ...props
}: InputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newValue = e.target.value;

    if (mask) {
      newValue = mask(newValue);
    }

    if (onChange) {
      const newEvent = {
        ...e,
        target: { ...e.target, value: newValue },
      };
      onChange(newEvent as React.ChangeEvent<HTMLInputElement>);
    }
  };

  return (
    <div className={`${styles.wrapper} ${className}`}>
      {label && <label className={styles.label}>{label}</label>}

      <input
        className={`${styles.input} ${error ? styles.error : ''}`}
        value={value}
        onChange={handleChange}
        {...props}
      />

      {error && <span className={styles.errorText}>{error}</span>}
      {helperText && !error && <span className={styles.helperText}>{helperText}</span>}
    </div>
  );
}
