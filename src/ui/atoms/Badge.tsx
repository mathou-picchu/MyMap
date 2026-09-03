import type { HTMLAttributes, ReactNode } from 'react';
import './Badge.css';

type BadgeColor =
  | 'visit'
  | 'balade'
  | 'restaurant'
  | 'gourmandise'
  | 'lodging'
  | 'shopping'
  | 'other'
  | 'success'
  | 'milieu'
  | 'iris';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  color?: BadgeColor;
  icon?: ReactNode;
  children: ReactNode;
}

export default function Badge({ color = 'iris', icon, children, className = '', ...rest }: BadgeProps) {
  return (
    <span className={`ha-badge ha-badge--${color}${className ? ` ${className}` : ''}`} {...rest}>
      {icon}
      {children}
    </span>
  );
}
