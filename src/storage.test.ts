import { afterEach, describe, expect, it, vi } from 'vitest';
import { loadJSON, saveJSON } from './storage';

describe('storage', () => {
  afterEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('retourne le fallback si rien n\'est stocké', () => {
    expect(loadJSON('absent', ['food'])).toEqual(['food']);
  });

  it('sauvegarde puis recharge une valeur', () => {
    saveJSON('cle', { a: 1 });
    expect(loadJSON('cle', null)).toEqual({ a: 1 });
  });

  it('retourne le fallback si le JSON stocké est corrompu', () => {
    localStorage.setItem('corrompu', '{pas json');
    expect(loadJSON('corrompu', 'defaut')).toBe('defaut');
  });

  it('ignore les erreurs d\'écriture (quota, navigation privée)', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('quota dépassé');
    });
    expect(() => saveJSON('cle', { a: 1 })).not.toThrow();
  });
});
