import { afterEach, describe, expect, it, vi } from 'vitest';
import { loadJSON, saveJSON } from './storage';

describe('storage', () => {
  afterEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('returns the fallback when nothing is stored', () => {
    expect(loadJSON('missing', ['food'])).toEqual(['food']);
  });

  it('saves then reloads a value', () => {
    saveJSON('key', { a: 1 });
    expect(loadJSON('key', null)).toEqual({ a: 1 });
  });

  it('returns the fallback when the stored JSON is corrupted', () => {
    localStorage.setItem('corrupt', '{not json');
    expect(loadJSON('corrupt', 'default')).toBe('default');
  });

  it('ignores write errors (quota, private browsing)', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('quota exceeded');
    });
    expect(() => saveJSON('key', { a: 1 })).not.toThrow();
  });
});
