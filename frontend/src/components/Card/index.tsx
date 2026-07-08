import React from 'react';
import styles from './styles.module.css';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  padding?: 'sm' | 'base' | 'lg';
  hoverable?: boolean;
  onClick?: () => void;
}

export function Card({
  children,
  className = '',
  title,
  subtitle,
  padding = 'base',
  hoverable = false,
  onClick,
}: CardProps) {
  const cardClass = `${styles.card} ${styles[`padding${padding}`]} ${
    hoverable ? styles.hoverable : ''
  } ${className}`;

  return (
    <div className={cardClass} onClick={onClick} role={onClick ? 'button' : undefined}>
      {(title || subtitle) && (
        <div className={styles.header}>
          {title && <h2 className={styles.title}>{title}</h2>}
          {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
        </div>
      )}

      <div className={styles.content}>{children}</div>
    </div>
  );
}
