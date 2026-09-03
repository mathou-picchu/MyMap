import { TYPE_ICONS } from '../icons';
import type { PlaceTypeId } from '../../types';

interface TypeIconProps {
  type: PlaceTypeId;
  size?: number;
}

export default function TypeIcon({ type, size = 16 }: TypeIconProps) {
  const Icon = TYPE_ICONS[type];
  return <Icon size={size} aria-hidden="true" strokeWidth={2} />;
}
