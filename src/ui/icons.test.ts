import { describe, expect, it } from 'vitest';
import { checkSvg, markerSvg, MILIEU_ICONS, TYPE_ICONS } from './icons';
import { PLACE_TYPE_IDS } from '../constants';

describe('icons', () => {
  it('maps the 7 types to a lucide component', () => {
    expect(Object.keys(TYPE_ICONS).sort()).toEqual([...PLACE_TYPE_IDS].sort());
  });

  it('maps the 2 milieux to a lucide component', () => {
    expect(Object.keys(MILIEU_ICONS).sort()).toEqual(['indoor', 'outdoor']);
  });

  it('generates an SVG for each marker type', () => {
    for (const id of PLACE_TYPE_IDS) {
      const svg = markerSvg(id, 15);
      expect(svg).toContain('<svg');
      expect(svg).toContain('stroke="currentColor"');
      expect(svg).toContain('width="15"');
    }
  });

  it('generates a check SVG', () => {
    expect(checkSvg(10)).toContain('<svg');
    expect(checkSvg(10)).toContain('width="10"');
  });
});
