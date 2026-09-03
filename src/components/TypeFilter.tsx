import { EyeOff } from 'lucide-react';
import { MILIEUS, PLACE_TYPES } from '../constants';
import type { MilieuId, PlaceTypeId } from '../types';
import Pill from '../ui/atoms/Pill';
import TypeIcon from '../ui/atoms/TypeIcon';
import { MILIEU_ICONS } from '../ui/icons';
import './TypeFilter.css';

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
    <div className="type-filter" role="group" aria-label="Filter by type and setting">
      {PLACE_TYPES.map((t) => (
        <Pill key={t.id} color={t.id} active={active.has(t.id)} onClick={() => onToggle(t.id)}>
          <TypeIcon type={t.id} size={14} /> {t.label}
        </Pill>
      ))}
      <div className="type-filter__modifiers" role="group" aria-label="Filter modifiers">
        <div className="setting-toggle">
          {MILIEUS.map((m) => {
            const MilieuIcon = MILIEU_ICONS[m.id];
            return (
              <button
                key={m.id}
                type="button"
                className={`setting-toggle__seg${activeMilieu.has(m.id) ? ' active' : ''}`}
                aria-pressed={activeMilieu.has(m.id)}
                onClick={() => onToggleMilieu(m.id)}
              >
                <MilieuIcon size={14} aria-hidden="true" /> {m.label}
              </button>
            );
          })}
        </div>
        <Pill color="success" active={hideDone} onClick={onToggleHideDone}>
          <EyeOff size={14} aria-hidden="true" /> Hide done
        </Pill>
      </div>
    </div>
  );
}
