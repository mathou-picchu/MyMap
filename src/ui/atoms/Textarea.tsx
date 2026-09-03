import type { TextareaHTMLAttributes } from 'react';
import './Input.css';

export default function Textarea({ className = '', ...rest }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={`ha-textarea${className ? ` ${className}` : ''}`} {...rest} />;
}
