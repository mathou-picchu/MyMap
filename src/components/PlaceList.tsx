import { MapPinned } from 'lucide-react';
import type { Place } from '../types';
import EmptyState from '../ui/molecules/EmptyState';
import PlaceCard from '../ui/molecules/PlaceCard';
import './PlaceList.css';

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
        <EmptyState icon={<MapPinned size={28} />}>
          {emptyHint ?? (
            <>
              <span className="ha-accent">No places yet.</span>
              <br />
              Use the search or the “Add a place” button.
            </>
          )}
        </EmptyState>
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
