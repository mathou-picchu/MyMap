import { getPlaceTypeDef } from '../constants';
import type { Place } from '../types';
import ImgThumb from './ImgThumb';

interface PlaceListProps {
  places: Place[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export default function PlaceList({ places, selectedId, onSelect }: PlaceListProps) {
  if (places.length === 0) {
    return (
      <div className="place-list empty">
        <p>
          Aucun point pour l'instant.
          <br />
          Utilise la recherche ou le bouton « ＋ Ajouter un lieu ».
        </p>
      </div>
    );
  }
  return (
    <ul className="place-list">
      {places.map((place) => (
        <PlaceCard key={place.id} place={place} selected={place.id === selectedId} onSelect={onSelect} />
      ))}
    </ul>
  );
}

function PlaceCard({
  place,
  selected,
  onSelect,
}: {
  place: Place;
  selected: boolean;
  onSelect: (id: string) => void;
}) {
  const def = getPlaceTypeDef(place.type);
  return (
    <li className={`place-card${selected ? ' selected' : ''}`}>
      <button type="button" onClick={() => onSelect(place.id)}>
        <span className="card-thumb">
          <ImgThumb
            blob={place.photos[0]?.blob ?? null}
            fallback={
              <span className="card-fallback" style={{ background: def.color }}>
                {def.emoji}
              </span>
            }
          />
        </span>
        <span className="card-body">
          <span className="type-badge" style={{ background: def.color }}>
            {def.emoji} {def.label}
          </span>
          <span className="card-title">{place.name}</span>
          <span className="card-address">{place.address}</span>
          <span className="card-meta">
            {place.isFree ? 'Gratuit' : place.price || 'Payant'}
            {place.hours ? ` · ${place.hours}` : ''}
          </span>
        </span>
      </button>
    </li>
  );
}
