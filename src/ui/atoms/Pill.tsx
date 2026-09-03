import type { ButtonHTMLAttributes, ReactNode } from 'react';
import './Pill.css';

type PillColor =
  | 'visit'
  | 'balade'
  | 'restaurant'
  | 'gourmandise'
  | 'lodging'
  | 'shopping'
  | 'other'
  | 'navy'
  | 'success';

interface PillProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
  color?: PillColor;
  children: ReactNode;
}

export default function Pill({
  active = false,
  color = 'navy',
  className = '',
  children,
  ...rest
}: PillProps) {
  return (
    <button
      type="button"
      aria-pressed={active}
      className={`ha-pill ha-pill--${color}${active ? ' active' : ''}${className ? ` ${className}` : ''}`}
      {...rest}
    >
      {children}
    </button>
  );
}
