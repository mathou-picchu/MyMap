import { AlertTriangle } from 'lucide-react';
import type { ReactNode } from 'react';
import './StorageBanner.css';

interface StorageBannerProps {
  children: ReactNode;
}

export default function StorageBanner({ children }: StorageBannerProps) {
  return (
    <div className="ha-storage-banner" role="alert">
      <AlertTriangle size={18} aria-hidden="true" />
      <span>{children}</span>
    </div>
  );
}
