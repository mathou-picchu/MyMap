import type { CSSProperties } from 'react';
import { PLACE_TYPES } from '../constants';
import type { PlaceTypeId } from '../types';

interface TypeFilterProps {
  active: Set<PlaceTypeId>;
  onToggle: (type: PlaceTypeId) => void;
  hideDone: boolean;
  onToggleHideDone: () => void;
}

export default function TypeFilter({ active, onToggle, hideDone, onToggleHideDone }: TypeFilterProps) {
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
      <button
        type="button"
        className={`filter-pill hide-done${hideDone ? ' active' : ''}`}
        style={{ '--pill-color': '#16a34a' } as CSSProperties}
        onClick={onToggleHideDone}
        aria-pressed={hideDone}
      >
        <span aria-hidden="true">✓</span> Masquer les faits
      </button>
    </div>
  );
}
