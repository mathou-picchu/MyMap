import { afterEach, describe, expect, it, vi } from 'vitest';
import { searchAddress } from './geocoding';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('searchAddress', () => {
  it('maps Nominatim results', async () => {
    const controller = new AbortController();
    const fetchMock = vi.fn(
      async (_input: RequestInfo | URL, _init?: RequestInit) =>
        ({
          ok: true,
          json: async () => [
            {
              name: 'Tour Eiffel',
              display_name: 'Tour Eiffel, 5 Avenue Anatole France, 75007 Paris',
              lat: '48.8584',
              lon: '2.2945',
            },
          ],
        }) as Response,
    );
    vi.stubGlobal('fetch', fetchMock);
    const results = await searchAddress('tour eiffel', controller.signal);
    expect(results).toEqual([
      {
        name: 'Tour Eiffel',
        address: 'Tour Eiffel, 5 Avenue Anatole France, 75007 Paris',
        lat: 48.8584,
        lng: 2.2945,
      },
    ]);
    const url = new URL(fetchMock.mock.calls[0][0] as string);
    expect(url.searchParams.get('q')).toBe('tour eiffel');
    expect(url.searchParams.get('format')).toBe('jsonv2');
    expect(url.searchParams.get('accept-language')).toBe('en');
    expect(fetchMock.mock.calls[0][1]?.signal).toBe(controller.signal);
  });

  it('falls back to the first display_name segment when name is missing', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(
        async () =>
          ({
            ok: true,
            json: async () => [{ display_name: 'Parc Montsouris, Paris', lat: '48.82', lon: '2.34' }],
          }) as Response,
      ),
    );
    const results = await searchAddress('parc');
    expect(results[0].name).toBe('Parc Montsouris');
  });

  it('throws when the response is not ok', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => ({ ok: false } as Response)));
    await expect(searchAddress('x')).rejects.toThrow('Search unavailable');
  });
});
