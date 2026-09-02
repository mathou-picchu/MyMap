import type { PlaceTypeId } from './types';

export interface PlaceTypeDef {
  id: PlaceTypeId;
  label: string;
  emoji: string;
  color: string;
}

export const PLACE_TYPES: PlaceTypeDef[] = [
  { id: 'outdoor', label: 'Extérieur', emoji: '🌳', color: '#22c55e' },
  { id: 'visit', label: 'Visite', emoji: '🏛️', color: '#3b82f6' },
  { id: 'food', label: 'Nourriture', emoji: '🍽️', color: '#f97316' },
  { id: 'drink', label: 'Boisson', emoji: '🍷', color: '#a855f7' },
  { id: 'shopping', label: 'Shopping', emoji: '🛍️', color: '#ec4899' },
  { id: 'lodging', label: 'Hébergement', emoji: '🛏️', color: '#14b8a6' },
  { id: 'other', label: 'Autre', emoji: '📍', color: '#64748b' },
];

export const PLACE_TYPE_IDS: PlaceTypeId[] = PLACE_TYPES.map((t) => t.id);

export function getPlaceTypeDef(id: PlaceTypeId): PlaceTypeDef {
  return PLACE_TYPES.find((t) => t.id === id) ?? PLACE_TYPES[PLACE_TYPES.length - 1];
}
