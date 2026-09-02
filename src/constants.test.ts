import { describe, expect, it } from 'vitest';
import { getMilieuDef, getPlaceTypeDef, MILIEUS, PLACE_TYPES } from './constants';

describe('constants', () => {
  it('définit exactement 7 types', () => {
    expect(PLACE_TYPES).toHaveLength(7);
  });

  it('a des identifiants uniques', () => {
    expect(new Set(PLACE_TYPES.map((t) => t.id)).size).toBe(PLACE_TYPES.length);
  });

  it('a des labels, couleurs et emojis valides', () => {
    for (const t of PLACE_TYPES) {
      expect(t.label.length).toBeGreaterThan(0);
      expect(t.color).toMatch(/^#[0-9a-f]{6}$/i);
      expect(t.emoji.length).toBeGreaterThan(0);
    }
  });

  it('retourne la définition d\'un type', () => {
    expect(getPlaceTypeDef('restaurant').label).toBe('Restaurant');
  });

  it('retombe sur « Autre » pour un type inconnu', () => {
    expect(getPlaceTypeDef('unknown' as never).id).toBe('other');
  });

  it('définit exactement 2 milieux', () => {
    expect(MILIEUS).toHaveLength(2);
  });

  it('retourne la définition d\'un milieu', () => {
    expect(getMilieuDef(true).id).toBe('outdoor');
    expect(getMilieuDef(false).id).toBe('indoor');
  });
});
