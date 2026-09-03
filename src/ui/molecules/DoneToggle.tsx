import { Check } from 'lucide-react';
import './DoneToggle.css';

interface DoneToggleProps {
  done: boolean;
  onToggle: () => void;
  variant?: 'round' | 'line';
}

export default function DoneToggle({ done, onToggle, variant = 'round' }: DoneToggleProps) {
  if (variant === 'line') {
    return (
      <button
        type="button"
        className={`ha-done-toggle ha-done-toggle--line${done ? ' done' : ''}`}
        aria-pressed={done}
        onClick={onToggle}
      >
        <Check size={16} aria-hidden="true" />
        {done ? 'Fait' : 'Marquer comme fait'}
      </button>
    );
  }
  return (
    <button
      type="button"
      className={`ha-done-toggle ha-done-toggle--round${done ? ' done' : ''}`}
      aria-pressed={done}
      aria-label={done ? 'Marquer comme à faire' : 'Marquer comme fait'}
      onClick={onToggle}
    >
      <Check size={14} aria-hidden="true" />
    </button>
  );
}
