import { describe, expect, it } from 'vitest';
import { checkSvg, markerSvg, MILIEU_ICONS, TYPE_ICONS } from './icons';
import { PLACE_TYPE_IDS } from '../constants';

describe('icons', () => {
  it('mappe les 7 types vers un composant lucide', () => {
    expect(Object.keys(TYPE_ICONS).sort()).toEqual([...PLACE_TYPE_IDS].sort());
  });

  it('mappe les 2 milieux vers un composant lucide', () => {
    expect(Object.keys(MILIEU_ICONS).sort()).toEqual(['indoor', 'outdoor']);
  });

  it('génère un SVG pour chaque type de marqueur', () => {
    for (const id of PLACE_TYPE_IDS) {
      const svg = markerSvg(id, 15);
      expect(svg).toContain('<svg');
      expect(svg).toContain('stroke="currentColor"');
      expect(svg).toContain('width="15"');
    }
  });

  it('génère un SVG de coche', () => {
    expect(checkSvg(10)).toContain('<svg');
    expect(checkSvg(10)).toContain('width="10"');
  });
});
