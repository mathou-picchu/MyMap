import { X } from 'lucide-react';
import ImgThumb from './ImgThumb';
import './PhotoThumb.css';

interface PhotoThumbProps {
  blob: Blob;
  onRemove?: () => void;
}

export default function PhotoThumb({ blob, onRemove }: PhotoThumbProps) {
  return (
    <div className="ha-photo-thumb">
      <ImgThumb blob={blob} />
      {onRemove && (
        <button
          type="button"
          className="ha-photo-thumb__remove"
          aria-label="Retirer la photo"
          onClick={onRemove}
        >
          <X size={12} aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
