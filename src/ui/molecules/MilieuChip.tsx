import { MILIEU_ICONS } from '../icons';
import { getMilieuDef } from '../../constants';
import type { MilieuId } from '../../types';
import './MilieuChip.css';

interface MilieuChipProps {
  milieu: MilieuId;
}

export default function MilieuChip({ milieu }: MilieuChipProps) {
  const def = getMilieuDef(milieu === 'outdoor');
  const Icon = MILIEU_ICONS[milieu];
  return (
    <span className="ha-milieu-chip">
      <Icon size={12} aria-hidden="true" /> {def.label}
    </span>
  );
}
