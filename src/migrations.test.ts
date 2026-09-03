import { describe, expect, it } from 'vitest';
import { isKnownTypeId, migratePlace, migrateTypeId } from './migrations';
import type { Place, PlaceTypeId } from './types';

function makePlace(overrides: Partial<Place> = {}): Place {
  return {
    id: 'p1',
    name: 'Tour Eiffel',
    address: 'Paris',
    lat: 48.85,
    lng: 2.29,
    isFree: true,
    type: 'visit',
    photos: [],
    createdAt: 1000,
    updatedAt: 2000,
    ...overrides,
  };
}

describe('migrations', () => {
  it('converts legacy types', () => {
    expect(migrateTypeId('outdoor')).toBe('balade');
    expect(migrateTypeId('food')).toBe('restaurant');
    expect(migrateTypeId('drink')).toBe('gourmandise');
  });

  it('keeps current types', () => {
    expect(migrateTypeId('visit')).toBe('visit');
    expect(migrateTypeId('balade')).toBe('balade');
    expect(migrateTypeId('restaurant')).toBe('restaurant');
    expect(migrateTypeId('gourmandise')).toBe('gourmandise');
    expect(migrateTypeId('lodging')).toBe('lodging');
    expect(migrateTypeId('shopping')).toBe('shopping');
    expect(migrateTypeId('other')).toBe('other');
  });

  it('recognizes known types, current and legacy', () => {
    expect(isKnownTypeId('visit')).toBe(true);
    expect(isKnownTypeId('outdoor')).toBe(true);
    expect(isKnownTypeId('food')).toBe(true);
    expect(isKnownTypeId('drink')).toBe(true);
    expect(isKnownTypeId('museum')).toBe(false);
    expect(isKnownTypeId('')).toBe(false);
  });

  it('replaces an unknown type with “other”', () => {
    expect(migrateTypeId('museum')).toBe('other');
  });

  it('does not confuse “constructor” with a legacy type', () => {
    expect(isKnownTypeId('constructor')).toBe(false);
    expect(migrateTypeId('constructor')).toBe('other');
  });

  it('marks a legacy “outdoor” place as outdoor', () => {
    const migrated = migratePlace(makePlace({ type: 'outdoor' as PlaceTypeId }));
    expect(migrated).toMatchObject({ type: 'balade', isOutdoor: true });
  });

  it('converts a legacy type to indoor', () => {
    const migrated = migratePlace(makePlace({ type: 'food' as PlaceTypeId }));
    expect(migrated).toMatchObject({ type: 'restaurant', isOutdoor: false });
  });

  it('fills in a missing isOutdoor', () => {
    const migrated = migratePlace(makePlace());
    expect(migrated.isOutdoor).toBe(false);
  });

  it('returns the same reference when nothing changes', () => {
    const place = makePlace({ isOutdoor: false });
    expect(migratePlace(place)).toBe(place);
    const balade = makePlace({ type: 'balade', isOutdoor: true });
    expect(migratePlace(balade)).toBe(balade);
  });
});
