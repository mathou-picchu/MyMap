import type { ButtonHTMLAttributes, ReactNode } from 'react';
import type { PlaceTypeId } from '../../types';
import './Pill.css';

type PillColor = PlaceTypeId | 'navy' | 'success';

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
      className={`ha-pill ha-pill--${color}${active ? ' active' : ''}${className ? ` ${className}` : ''}`}
      {...rest}
      aria-pressed={active}
    >
      {children}
    </button>
  );
}
