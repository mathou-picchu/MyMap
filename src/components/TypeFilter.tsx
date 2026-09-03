import type { CSSProperties } from 'react';
import { EyeOff } from 'lucide-react';
import { MILIEUS, PLACE_TYPES } from '../constants';
import type { MilieuId, PlaceTypeId } from '../types';
import { MILIEU_ICONS, TYPE_ICONS } from '../ui/icons';

function TypePillIcon({ type }: { type: PlaceTypeId }) {
  const Icon = TYPE_ICONS[type];
  return <Icon size={14} aria-hidden="true" />;
}

function MilieuPillIcon({ milieu }: { milieu: MilieuId }) {
  const Icon = MILIEU_ICONS[milieu];
  return <Icon size={14} aria-hidden="true" />;
}

interface TypeFilterProps {
  active: Set<PlaceTypeId>;
  onToggle: (type: PlaceTypeId) => void;
  activeMilieu: Set<MilieuId>;
  onToggleMilieu: (milieu: MilieuId) => void;
  hideDone: boolean;
  onToggleHideDone: () => void;
}

export default function TypeFilter({
  active,
  onToggle,
  activeMilieu,
  onToggleMilieu,
  hideDone,
  onToggleHideDone,
}: TypeFilterProps) {
  return (
    <div className="type-filter" role="group" aria-label="Filtrer par type et milieu">
      {PLACE_TYPES.map((t) => (
        <button
          key={t.id}
          type="button"
          className={`filter-pill${active.has(t.id) ? ' active' : ''}`}
          style={{ '--pill-color': t.color } as CSSProperties}
          onClick={() => onToggle(t.id)}
          aria-pressed={active.has(t.id)}
        >
          <TypePillIcon type={t.id} /> {t.label}
        </button>
      ))}
      {MILIEUS.map((m) => (
        <button
          key={m.id}
          type="button"
          className={`filter-pill milieu${activeMilieu.has(m.id) ? ' active' : ''}`}
          style={{ '--pill-color': m.color } as CSSProperties}
          onClick={() => onToggleMilieu(m.id)}
          aria-pressed={activeMilieu.has(m.id)}
        >
          <MilieuPillIcon milieu={m.id} /> {m.label}
        </button>
      ))}
      <button
        type="button"
        className={`filter-pill hide-done${hideDone ? ' active' : ''}`}
        style={{ '--pill-color': '#16a34a' } as CSSProperties}
        onClick={onToggleHideDone}
        aria-pressed={hideDone}
      >
        <EyeOff size={14} aria-hidden="true" /> Masquer les faits
      </button>
    </div>
  );
}
