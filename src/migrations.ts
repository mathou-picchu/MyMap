import { PLACE_TYPE_IDS } from './constants';
import type { Place, PlaceTypeId } from './types';

const LEGACY_TYPE_MAP = new Map<string, PlaceTypeId>([
  ['outdoor', 'balade'],
  ['food', 'restaurant'],
  ['drink', 'gourmandise'],
]);

export function isKnownTypeId(type: string): type is PlaceTypeId {
  return PLACE_TYPE_IDS.includes(type as PlaceTypeId) || LEGACY_TYPE_MAP.has(type);
}

export function migrateTypeId(type: string): PlaceTypeId {
  return LEGACY_TYPE_MAP.get(type) ?? (isKnownTypeId(type) ? type : 'other');
}

export function migratePlace(place: Place): Place {
  const originalType: string = place.type;
  const type = migrateTypeId(originalType);
  const isOutdoor = place.isOutdoor ?? originalType === 'outdoor';
  if (type === place.type && isOutdoor === place.isOutdoor) {
    return place;
  }
  return { ...place, type, isOutdoor };
}
