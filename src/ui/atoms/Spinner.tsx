import './Spinner.css';

interface SpinnerProps {
  size?: number;
  label?: string;
}

export default function Spinner({ size = 24, label = 'Chargement…' }: SpinnerProps) {
  return (
    <span
      className="ha-spinner"
      role="status"
      aria-label={label}
      style={{ width: size, height: size }}
    />
  );
}
