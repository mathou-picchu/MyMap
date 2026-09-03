import { getPlaceTypeDef } from '../../constants';
import type { Place } from '../../types';
import Badge from '../atoms/Badge';
import TypeIcon from '../atoms/TypeIcon';
import DoneToggle from './DoneToggle';
import ImgThumb from './ImgThumb';
import './PlaceCard.css';

interface PlaceCardProps {
  place: Place;
  selected: boolean;
  onSelect: (id: string) => void;
  onToggleDone: (id: string) => void;
}

export default function PlaceCard({ place, selected, onSelect, onToggleDone }: PlaceCardProps) {
  const def = getPlaceTypeDef(place.type);
  const done = place.isDone === true;
  return (
    <li className={`place-card${selected ? ' selected' : ''}${done ? ' done' : ''}`}>
      <button type="button" className="card-select" onClick={() => onSelect(place.id)}>
        <span className="card-thumb">
          <ImgThumb
            blob={place.photos[0]?.blob ?? null}
            fallback={
              <span className={`card-fallback type-surface--${place.type}`}>
                <TypeIcon type={place.type} size={24} />
              </span>
            }
          />
        </span>
        <span className="card-body">
          <Badge color={place.type} icon={<TypeIcon type={place.type} size={12} />}>
            {def.label}
          </Badge>
          <span className="card-title">{place.name}</span>
          <span className="card-address">{place.address}</span>
          <span className="card-meta">
            {place.isFree ? 'Gratuit' : place.price || 'Payant'}
            {place.hours ? ` · ${place.hours}` : ''}
          </span>
        </span>
      </button>
      <DoneToggle done={done} onToggle={() => onToggleDone(place.id)} variant="round" />
    </li>
  );
}
