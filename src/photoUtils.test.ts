import { describe, expect, it } from 'vitest';
import { computeTargetDimensions } from './photoUtils';

describe('computeTargetDimensions', () => {
  it('ne modifie pas une photo plus petite que la limite', () => {
    expect(computeTargetDimensions(800, 600)).toEqual({ width: 800, height: 600 });
  });

  it('réduit une photo paysage trop grande', () => {
    expect(computeTargetDimensions(3200, 2400)).toEqual({ width: 1600, height: 1200 });
  });

  it('réduit une photo portrait trop grande', () => {
    expect(computeTargetDimensions(2400, 3200)).toEqual({ width: 1200, height: 1600 });
  });

  it('respecte une limite personnalisée', () => {
    expect(computeTargetDimensions(2000, 1000, 1000)).toEqual({ width: 1000, height: 500 });
  });
});
