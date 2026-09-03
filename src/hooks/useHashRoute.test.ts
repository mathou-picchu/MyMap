import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { useHashRoute } from './useHashRoute';

describe('useHashRoute', () => {
  afterEach(() => {
    window.location.hash = '';
  });

  it('retourne le hash courant', () => {
    window.location.hash = '#styleguide';
    const { result } = renderHook(() => useHashRoute());
    expect(result.current).toBe('#styleguide');
  });

  it('suit les changements de hash', () => {
    const { result } = renderHook(() => useHashRoute());
    act(() => {
      window.location.hash = '#styleguide';
      window.dispatchEvent(new HashChangeEvent('hashchange'));
    });
    expect(result.current).toBe('#styleguide');
  });

  it('revient au hash vide', () => {
    window.location.hash = '#styleguide';
    const { result } = renderHook(() => useHashRoute());
    act(() => {
      window.location.hash = '';
      window.dispatchEvent(new HashChangeEvent('hashchange'));
    });
    expect(result.current).toBe('');
  });
});
