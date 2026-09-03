import type { ReactNode } from 'react';
import './EmptyState.css';

interface EmptyStateProps {
  icon: ReactNode;
  children: ReactNode;
  action?: ReactNode;
}

export default function EmptyState({ icon, children, action }: EmptyStateProps) {
  return (
    <div className="ha-empty-state">
      <span className="ha-empty-state__icon" aria-hidden="true">
        {icon}
      </span>
      <p className="ha-empty-state__text">{children}</p>
      {action}
    </div>
  );
}
