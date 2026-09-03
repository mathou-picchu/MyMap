import type { ButtonHTMLAttributes, ReactNode } from 'react';
import Spinner from './Spinner';
import './Button.css';

type ButtonVariant = 'primary' | 'accent' | 'outline' | 'ghost' | 'danger' | 'dark';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  iconLeft?: ReactNode;
  iconRight?: ReactNode;
  loading?: boolean;
}

export default function Button({
  variant = 'primary',
  size = 'md',
  iconLeft,
  iconRight,
  loading = false,
  className = '',
  disabled,
  type = 'button',
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading}
      className={`ha-button ha-button--${variant} ha-button--${size}${className ? ` ${className}` : ''}`}
      {...rest}
    >
      {loading ? (
        <span aria-hidden="true">
          <Spinner size={16} />
        </span>
      ) : (
        iconLeft
      )}
      {children}
      {loading ? null : iconRight}
    </button>
  );
}
