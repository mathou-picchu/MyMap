import type { ReactNode } from 'react';
import { useObjectUrl } from '../hooks/useObjectUrl';

interface ImgThumbProps {
  blob: Blob | null;
  fallback?: ReactNode;
}

export default function ImgThumb({ blob, fallback }: ImgThumbProps) {
  const url = useObjectUrl(blob);
  if (!url) {
    return <>{fallback ?? null}</>;
  }
  return <img className="img-thumb" src={url} alt="" />;
}
