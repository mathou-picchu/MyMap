import type { SelectHTMLAttributes } from 'react';
import './Input.css';

export default function Select({ className = '', ...rest }: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={`ha-select${className ? ` ${className}` : ''}`} {...rest} />;
}
