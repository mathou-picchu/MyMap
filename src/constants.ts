import type { MilieuId, PlaceTypeId } from './types';

export interface PlaceTypeDef {
  id: PlaceTypeId;
  label: string;
  emoji: string;
  color: string;
}

export const PLACE_TYPES: PlaceTypeDef[] = [
  { id: 'visit', label: 'Visit', emoji: '🏛️', color: '#3b82f6' },
  { id: 'balade', label: 'Walk', emoji: '🌳', color: '#22c55e' },
  { id: 'restaurant', label: 'Restaurant', emoji: '🍽️', color: '#f97316' },
  { id: 'gourmandise', label: 'Dessert', emoji: '🍰', color: '#a855f7' },
  { id: 'lodging', label: 'Lodging', emoji: '🛏️', color: '#14b8a6' },
  { id: 'shopping', label: 'Shopping', emoji: '🛍️', color: '#ec4899' },
  { id: 'other', label: 'Other', emoji: '📍', color: '#64748b' },
];

export const PLACE_TYPE_IDS: PlaceTypeId[] = PLACE_TYPES.map((t) => t.id);

export function getPlaceTypeDef(id: PlaceTypeId): PlaceTypeDef {
  return PLACE_TYPES.find((t) => t.id === id) ?? PLACE_TYPES[PLACE_TYPES.length - 1];
}

export interface MilieuDef {
  id: MilieuId;
  label: string;
  emoji: string;
  color: string;
}

export const MILIEUS: MilieuDef[] = [
  { id: 'outdoor', label: 'Outdoor', emoji: '🌳', color: '#22c55e' },
  { id: 'indoor', label: 'Indoor', emoji: '🏠', color: '#f59e0b' },
];

export function getMilieuDef(isOutdoor: boolean): MilieuDef {
  return MILIEUS[isOutdoor ? 0 : 1];
}
