import { getPlaceTypeDef } from '../constants';
import type { Place } from '../types';
import { TYPE_ICONS } from '../ui/icons';
import ImgThumb from './ImgThumb';

interface PlaceListProps {
  places: Place[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onToggleDone: (id: string) => void;
  emptyHint?: string;
}

export default function PlaceList({
  places,
  selectedId,
  onSelect,
  onToggleDone,
  emptyHint,
}: PlaceListProps) {
  if (places.length === 0) {
    return (
      <div className="place-list empty">
        <p>
          {emptyHint ?? (
            <>
              Aucun point pour l'instant.
              <br />
              Utilise la recherche ou le bouton « ＋ Ajouter un lieu ».
            </>
          )}
        </p>
      </div>
    );
  }
  return (
    <ul className="place-list">
      {places.map((place) => (
        <PlaceCard
          key={place.id}
          place={place}
          selected={place.id === selectedId}
          onSelect={onSelect}
          onToggleDone={onToggleDone}
        />
      ))}
    </ul>
  );
}

function CardFallbackIcon({ type }: { type: Place['type'] }) {
  const Icon = TYPE_ICONS[type];
  return <Icon size={24} aria-hidden="true" />;
}

function PlaceCard({
  place,
  selected,
  onSelect,
  onToggleDone,
}: {
  place: Place;
  selected: boolean;
  onSelect: (id: string) => void;
  onToggleDone: (id: string) => void;
}) {
  const def = getPlaceTypeDef(place.type);
  const done = place.isDone === true;
  return (
    <li className={`place-card${selected ? ' selected' : ''}${done ? ' done' : ''}`}>
      <button type="button" className="card-select" onClick={() => onSelect(place.id)}>
        <span className="card-thumb">
          <ImgThumb
            blob={place.photos[0]?.blob ?? null}
            fallback={
              <span className="card-fallback" style={{ background: def.color }}>
                <CardFallbackIcon type={place.type} />
              </span>
            }
          />
        </span>
        <span className="card-body">
          <span className="type-badge" style={{ background: def.color }}>
            {def.label}
          </span>
          <span className="card-title">{place.name}</span>
          <span className="card-address">{place.address}</span>
          <span className="card-meta">
            {place.isFree ? 'Gratuit' : place.price || 'Payant'}
            {place.hours ? ` · ${place.hours}` : ''}
          </span>
        </span>
      </button>
      <button
        type="button"
        className={`card-done${done ? ' done' : ''}`}
        aria-pressed={done}
        aria-label={done ? 'Marquer comme à faire' : 'Marquer comme fait'}
        onClick={() => onToggleDone(place.id)}
      >
        ✓
      </button>
    </li>
  );
}
