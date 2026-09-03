import { describe, expect, it } from 'vitest';
import { draftPinIcon, placePinIcon } from './MarkerPin';

describe('MarkerPin', () => {
  it('generates a pin per type with the SVG icon', () => {
    const html = String(placePinIcon('visit', false, false).options.html);
    expect(html).toContain('marker-pin');
    expect(html).toContain('<svg');
    expect(html).toContain('var(--type-visit)');
  });

  it('marks the done and selected state', () => {
    const html = String(placePinIcon('balade', true, true).options.html);
    expect(html).toContain('selected');
    expect(html).toContain('done');
    expect(html).toContain('marker-check');
  });

  it('generates a draft pin', () => {
    const html = String(draftPinIcon().options.html);
    expect(html).toContain('draft');
    expect(html).toContain('var(--ha-navy)');
  });
});
