import type { ButtonHTMLAttributes, ReactNode } from 'react';
import './IconButton.css';

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  children: ReactNode;
}

export default function IconButton({ label, children, className = '', ...rest }: IconButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={`ha-icon-button${className ? ` ${className}` : ''}`}
      {...rest}
    >
      {children}
    </button>
  );
}
