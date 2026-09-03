import { useEffect, useState } from 'react';
import { ArrowLeft, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { getPlaceTypeDef } from '../constants';
import { useObjectUrl } from '../hooks/useObjectUrl';
import type { Place, PlacePhoto } from '../types';
import Badge from '../ui/atoms/Badge';
import Button from '../ui/atoms/Button';
import TypeIcon from '../ui/atoms/TypeIcon';
import DoneToggle from '../ui/molecules/DoneToggle';
import ImgThumb from '../ui/molecules/ImgThumb';
import MilieuChip from '../ui/molecules/MilieuChip';
import './PlaceDetails.css';

interface PlaceDetailsProps {
  place: Place;
  onBack: () => void;
  onEdit: () => void;
  onDelete: (id: string) => void;
  onToggleDone: (id: string) => void;
}

export default function PlaceDetails({ place, onBack, onEdit, onDelete, onToggleDone }: PlaceDetailsProps) {
  const def = getPlaceTypeDef(place.type);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);

  return (
    <article className="place-details">
      <button type="button" className="details-back" onClick={onBack}>
        <ArrowLeft size={16} aria-hidden="true" /> Retour à la liste
      </button>
      <header className="details-header">
        <div className="details-badges">
          <Badge color={place.type} icon={<TypeIcon type={place.type} size={12} />}>
            {def.label}
          </Badge>
          <MilieuChip milieu={place.isOutdoor ? 'outdoor' : 'indoor'} />
        </div>
        <h2 className="details-title">{place.name}</h2>
        <p className="details-address">{place.address}</p>
      </header>
      {place.photos.length > 0 && (
        <div className="details-gallery">
          {place.photos.map((photo, index) => (
            <button
              key={photo.id}
              type="button"
              className="gallery-thumb"
              aria-label={`Voir la photo ${index + 1}`}
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
            <dt>Horaires</dt>
            <dd>{place.hours}</dd>
          </div>
        )}
        <div>
          <dt>Prix</dt>
          <dd>{place.isFree ? 'Gratuit' : place.price || 'Payant'}</dd>
        </div>
      </dl>
      <div className="details-actions">
        <DoneToggle done={place.isDone === true} onToggle={() => onToggleDone(place.id)} variant="line" />
        <Button variant="outline" size="sm" onClick={onEdit}>
          Modifier
        </Button>
        {confirmDelete ? (
          <>
            <span className="confirm-label">Supprimer ce point ?</span>
            <Button variant="danger" size="sm" onClick={() => onDelete(place.id)}>
              Oui, supprimer
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setConfirmDelete(false)}>
              Annuler
            </Button>
          </>
        ) : (
          <Button variant="danger" size="sm" onClick={() => setConfirmDelete(true)}>
            Supprimer
          </Button>
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
            aria-label="Photo précédente"
            onClick={(e) => {
              e.stopPropagation();
              setIndex((i) => (i - 1 + photos.length) % photos.length);
            }}
          >
            <ChevronLeft size={44} aria-hidden="true" />
          </button>
          <button
            type="button"
            className="viewer-nav next"
            aria-label="Photo suivante"
            onClick={(e) => {
              e.stopPropagation();
              setIndex((i) => (i + 1) % photos.length);
            }}
          >
            <ChevronRight size={44} aria-hidden="true" />
          </button>
        </>
      )}
      <button type="button" className="viewer-close" aria-label="Fermer" onClick={onClose}>
        <X size={34} aria-hidden="true" />
      </button>
    </div>
  );
}
