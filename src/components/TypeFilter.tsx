import type { CSSProperties } from 'react';
import { PLACE_TYPES } from '../constants';
import type { PlaceTypeId } from '../types';

interface TypeFilterProps {
  active: Set<PlaceTypeId>;
  onToggle: (type: PlaceTypeId) => void;
}

export default function TypeFilter({ active, onToggle }: TypeFilterProps) {
  return (
    <div className="type-filter" role="group" aria-label="Filtrer par type">
      {PLACE_TYPES.map((t) => (
        <button
          key={t.id}
          type="button"
          className={`filter-pill${active.has(t.id) ? ' active' : ''}`}
          style={{ '--pill-color': t.color } as CSSProperties}
          onClick={() => onToggle(t.id)}
          aria-pressed={active.has(t.id)}
        >
          <span aria-hidden="true">{t.emoji}</span> {t.label}
        </button>
      ))}
    </div>
  );
}
