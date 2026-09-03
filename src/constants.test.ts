import { describe, expect, it } from 'vitest';
import { getMilieuDef, getPlaceTypeDef, MILIEUS, PLACE_TYPES } from './constants';

describe('constants', () => {
  it('defines exactly 7 types', () => {
    expect(PLACE_TYPES).toHaveLength(7);
  });

  it('has unique ids', () => {
    expect(new Set(PLACE_TYPES.map((t) => t.id)).size).toBe(PLACE_TYPES.length);
  });

  it('has valid labels and colors', () => {
    for (const t of PLACE_TYPES) {
      expect(t.label.length).toBeGreaterThan(0);
      expect(t.color).toMatch(/^#[0-9a-f]{6}$/i);
    }
  });

  it('returns a type definition', () => {
    expect(getPlaceTypeDef('restaurant').label).toBe('Restaurant');
  });

  it('falls back to Other for an unknown type', () => {
    expect(getPlaceTypeDef('unknown' as never).id).toBe('other');
  });

  it('defines exactly 2 settings', () => {
    expect(MILIEUS).toHaveLength(2);
  });

  it('returns a setting definition', () => {
    expect(getMilieuDef(true).id).toBe('outdoor');
    expect(getMilieuDef(false).id).toBe('indoor');
  });
});
