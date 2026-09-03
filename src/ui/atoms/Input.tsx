import type { InputHTMLAttributes } from 'react';
import './Input.css';

export default function Input({ className = '', ...rest }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={`ha-input${className ? ` ${className}` : ''}`} {...rest} />;
}
