import 'fake-indexeddb/auto';
import { beforeEach, describe, expect, it } from 'vitest';
import { deletePlace, listPlaces, replaceAllPlaces, savePlace } from './db';
import type { Place } from './types';

function makePlace(overrides: Partial<Place> = {}): Place {
  return {
    id: 'p1',
    name: 'Tour Eiffel',
    address: 'Paris',
    lat: 48.85,
    lng: 2.29,
    isFree: false,
    price: '12 €',
    type: 'visit',
    hours: '9h-23h',
    photos: [],
    createdAt: 1000,
    updatedAt: 1000,
    ...overrides,
  };
}

beforeEach(async () => {
  await replaceAllPlaces([]);
});

describe('db', () => {
  it('enregistre puis liste les points', async () => {
    await savePlace(makePlace());
    const places = await listPlaces();
    expect(places).toHaveLength(1);
    expect(places[0].name).toBe('Tour Eiffel');
  });

  it('liste les points les plus récents en premier', async () => {
    await savePlace(makePlace({ id: 'old', createdAt: 1000 }));
    await savePlace(makePlace({ id: 'new', createdAt: 2000 }));
    expect((await listPlaces()).map((p) => p.id)).toEqual(['new', 'old']);
  });

  it('met à jour un point existant', async () => {
    await savePlace(makePlace());
    await savePlace(makePlace({ name: 'La Tour Eiffel', updatedAt: 1500 }));
    const places = await listPlaces();
    expect(places).toHaveLength(1);
    expect(places[0].name).toBe('La Tour Eiffel');
  });

  it('supprime un point', async () => {
    await savePlace(makePlace());
    await deletePlace('p1');
    expect(await listPlaces()).toHaveLength(0);
  });

  it('remplace tous les points', async () => {
    await savePlace(makePlace());
    await replaceAllPlaces([makePlace({ id: 'x' }), makePlace({ id: 'y' })]);
    expect((await listPlaces()).map((p) => p.id).sort()).toEqual(['x', 'y']);
  });
});
