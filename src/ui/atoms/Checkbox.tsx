import type { InputHTMLAttributes } from 'react';
import './Checkbox.css';

export default function Checkbox({ className = '', ...rest }: InputHTMLAttributes<HTMLInputElement>) {
  return <input type="checkbox" className={`ha-checkbox${className ? ` ${className}` : ''}`} {...rest} />;
}
