import { useEffect, useState } from 'react';
import { getMilieuDef, getPlaceTypeDef } from '../constants';
import { useObjectUrl } from '../hooks/useObjectUrl';
import type { Place, PlacePhoto } from '../types';
import ImgThumb from './ImgThumb';

interface PlaceDetailsProps {
  place: Place;
  onBack: () => void;
  onEdit: () => void;
  onDelete: (id: string) => void;
  onToggleDone: (id: string) => void;
}

export default function PlaceDetails({ place, onBack, onEdit, onDelete, onToggleDone }: PlaceDetailsProps) {
  const def = getPlaceTypeDef(place.type);
  const milieu = getMilieuDef(place.isOutdoor ?? false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);

  return (
    <article className="place-details">
      <button type="button" className="details-back" onClick={onBack}>
        ← Back to list
      </button>
      <header className="details-header">
        <div className="details-badges">
          <span className="type-badge" style={{ background: def.color }}>
            {def.emoji} {def.label}
          </span>
          <span className="type-badge" style={{ background: milieu.color }}>
            {milieu.emoji} {milieu.label}
          </span>
        </div>
        <h2>{place.name}</h2>
        <p className="details-address">{place.address}</p>
      </header>
      {place.description && <p className="details-description">{place.description}</p>}
      {place.photos.length > 0 && (
        <div className="details-gallery">
          {place.photos.map((photo, index) => (
            <button
              key={photo.id}
              type="button"
              className="gallery-thumb"
              aria-label={`View photo ${index + 1}`}
              onClick={() => setViewerIndex(index)}
            >
              <ImgThumb blob={photo.blob} />
            </button>
          ))}
        </div>
      )}
      <dl className="details-info">
        {place.hours && (
          <div>
            <dt>Hours</dt>
            <dd>{place.hours}</dd>
          </div>
        )}
        <div>
          <dt>Price</dt>
          <dd>{place.isFree ? 'Free' : place.price || 'Paid'}</dd>
        </div>
      </dl>
      <div className="details-actions">
        <button
          type="button"
          className={`done-toggle${place.isDone ? ' done' : ''}`}
          onClick={() => onToggleDone(place.id)}
        >
          {place.isDone ? '✓ Done' : '✓ Mark as done'}
        </button>
        <button type="button" onClick={onEdit}>
          Edit
        </button>
        {confirmDelete ? (
          <>
            <span className="confirm-label">Delete this place?</span>
            <button type="button" className="danger" onClick={() => onDelete(place.id)}>
              Yes, delete
            </button>
            <button type="button" onClick={() => setConfirmDelete(false)}>
              Cancel
            </button>
          </>
        ) : (
          <button type="button" className="danger" onClick={() => setConfirmDelete(true)}>
            Delete
          </button>
        )}
      </div>
      {viewerIndex !== null && (
        <PhotoViewer
          photos={place.photos}
          startIndex={viewerIndex}
          onClose={() => setViewerIndex(null)}
        />
      )}
    </article>
  );
}

function PhotoViewer({
  photos,
  startIndex,
  onClose,
}: {
  photos: PlacePhoto[];
  startIndex: number;
  onClose: () => void;
}) {
  const [index, setIndex] = useState(startIndex);
  const url = useObjectUrl(photos[index].blob);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') setIndex((i) => (i + 1) % photos.length);
      if (e.key === 'ArrowLeft') setIndex((i) => (i - 1 + photos.length) % photos.length);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, photos.length]);

  return (
    <div className="photo-viewer" role="dialog" aria-modal="true" onClick={onClose}>
      {url && <img src={url} alt="" onClick={(e) => e.stopPropagation()} />}
      {photos.length > 1 && (
        <>
          <button
            type="button"
            className="viewer-nav prev"
            aria-label="Previous photo"
            onClick={(e) => {
              e.stopPropagation();
              setIndex((i) => (i - 1 + photos.length) % photos.length);
            }}
          >
            ‹
          </button>
          <button
            type="button"
            className="viewer-nav next"
            aria-label="Next photo"
            onClick={(e) => {
              e.stopPropagation();
              setIndex((i) => (i + 1) % photos.length);
            }}
          >
            ›
          </button>
        </>
      )}
      <button type="button" className="viewer-close" aria-label="Close" onClick={onClose}>
        ×
      </button>
    </div>
  );
}
