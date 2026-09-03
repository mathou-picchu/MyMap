import { describe, expect, it } from 'vitest';
import { computeTargetDimensions } from './photoUtils';

describe('computeTargetDimensions', () => {
  it('keeps a photo smaller than the limit unchanged', () => {
    expect(computeTargetDimensions(800, 600)).toEqual({ width: 800, height: 600 });
  });

  it('shrinks an oversized landscape photo', () => {
    expect(computeTargetDimensions(3200, 2400)).toEqual({ width: 1600, height: 1200 });
  });

  it('shrinks an oversized portrait photo', () => {
    expect(computeTargetDimensions(2400, 3200)).toEqual({ width: 1200, height: 1600 });
  });

  it('honors a custom limit', () => {
    expect(computeTargetDimensions(2000, 1000, 1000)).toEqual({ width: 1000, height: 500 });
  });
});
