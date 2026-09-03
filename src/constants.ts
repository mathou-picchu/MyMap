import type { MilieuId, PlaceTypeId } from './types';

export interface PlaceTypeDef {
  id: PlaceTypeId;
  label: string;
  color: string;
}

export const PLACE_TYPES: PlaceTypeDef[] = [
  { id: 'visit', label: 'Visite', color: '#4c40cf' },
  { id: 'balade', label: 'Balade', color: '#21824e' },
  { id: 'restaurant', label: 'Restaurant', color: '#b55805' },
  { id: 'gourmandise', label: 'Gourmandise', color: '#c2449c' },
  { id: 'lodging', label: 'Hébergement', color: '#11788c' },
  { id: 'shopping', label: 'Shopping', color: '#d62e4a' },
  { id: 'other', label: 'Autre', color: '#6e7691' },
];

export const PLACE_TYPE_IDS: PlaceTypeId[] = PLACE_TYPES.map((t) => t.id);

export function getPlaceTypeDef(id: PlaceTypeId): PlaceTypeDef {
  return PLACE_TYPES.find((t) => t.id === id) ?? PLACE_TYPES[PLACE_TYPES.length - 1];
}

export interface MilieuDef {
  id: MilieuId;
  label: string;
  color: string;
}

export const MILIEUS: MilieuDef[] = [
  { id: 'outdoor', label: 'Extérieur', color: '#131445' },
  { id: 'indoor', label: 'Intérieur', color: '#131445' },
];

export function getMilieuDef(isOutdoor: boolean): MilieuDef {
  return MILIEUS[isOutdoor ? 0 : 1];
}
