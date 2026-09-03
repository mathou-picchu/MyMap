import { describe, expect, it } from 'vitest';
import { draftPinIcon, placePinIcon } from './MarkerPin';

describe('MarkerPin', () => {
  it("génère une épingle par type avec l'icône SVG", () => {
    const html = String(placePinIcon('visit', false, false).options.html);
    expect(html).toContain('marker-pin');
    expect(html).toContain('<svg');
    expect(html).toContain('var(--type-visit)');
  });

  it("marque l'état fait et sélectionné", () => {
    const html = String(placePinIcon('balade', true, true).options.html);
    expect(html).toContain('selected');
    expect(html).toContain('done');
    expect(html).toContain('marker-check');
  });

  it('génère une épingle de brouillon', () => {
    const html = String(draftPinIcon().options.html);
    expect(html).toContain('draft');
    expect(html).toContain('var(--ha-navy)');
  });
});
