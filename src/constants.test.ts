import { describe, expect, it } from 'vitest';
import { getPlaceTypeDef, PLACE_TYPES } from './constants';

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
    expect(getPlaceTypeDef('food').label).toBe('Nourriture');
  });

  it('retombe sur « Autre » pour un type inconnu', () => {
    expect(getPlaceTypeDef('unknown' as never).id).toBe('other');
  });
});
