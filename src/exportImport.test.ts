import { describe, expect, it } from 'vitest';
import { buildExportFileName, exportPlaces, ImportError, parseImportFile } from './exportImport';
import type { Place } from './types';

function makePlace(overrides: Partial<Place> = {}): Place {
  return {
    id: 'p1',
    name: 'Tour Eiffel',
    address: 'Paris',
    lat: 48.85,
    lng: 2.29,
    hours: 'Lun-Ven 9h-18h',
    isFree: false,
    price: '12 €',
    type: 'visit',
    photos: [{ id: 'ph1', blob: new Blob([new Uint8Array([0xff, 0xd8, 0x01, 0x02, 0x03])], { type: 'image/jpeg' }) }],
    createdAt: 1000,
    updatedAt: 2000,
    ...overrides,
  };
}

async function project(places: Place[]) {
  return Promise.all(
    places.map(async (p) => ({
      id: p.id,
      name: p.name,
      address: p.address,
      lat: p.lat,
      lng: p.lng,
      hours: p.hours,
      isFree: p.isFree,
      isDone: p.isDone ?? false,
      isOutdoor: p.isOutdoor ?? false,
      price: p.price,
      type: p.type,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
      photos: await Promise.all(
        p.photos.map(async (ph) => ({
          id: ph.id,
          bytes: Array.from(new Uint8Array(await ph.blob.arrayBuffer())),
        })),
      ),
    })),
  );
}

describe('exportImport', () => {
  it('round-trips export → import without loss', async () => {
    const original = [makePlace(), makePlace({ id: 'p2', photos: [] })];
    const json = await exportPlaces(original);
    const restored = parseImportFile(json);
    expect(await project(restored)).toEqual(await project(original));
  });

  it('round-trips the done status', async () => {
    const original = [makePlace(), makePlace({ id: 'p2', photos: [], isDone: true })];
    const json = await exportPlaces(original);
    const restored = parseImportFile(json);
    expect(restored[0].isDone).toBe(false);
    expect(restored[1].isDone).toBe(true);
  });

  it('accepts a v1 file without isDone', () => {
    const file = JSON.stringify({
      version: 1,
      exportedAt: 0,
      places: [makePlace({ photos: [] })],
    });
    const restored = parseImportFile(file);
    expect(restored[0].isDone).toBe(false);
  });

  it('rejects an invalid isDone', () => {
    const file = JSON.stringify({
      version: 2,
      exportedAt: 0,
      places: [{ ...makePlace(), isDone: 'oui' }],
    });
    expect(() => parseImportFile(file)).toThrow(/isDone/);
  });

  it('writes versioned JSON with base64 photos', async () => {
    const json = await exportPlaces([makePlace()]);
    const parsed = JSON.parse(json);
    expect(parsed.version).toBe(3);
    expect(parsed.places[0].isDone).toBe(false);
    expect(parsed.places[0].isOutdoor).toBe(false);
    expect(typeof parsed.exportedAt).toBe('number');
    const data = parsed.places[0].photos[0].data as string;
    const bytes = Array.from(atob(data), (c) => c.charCodeAt(0));
    expect(bytes).toEqual([0xff, 0xd8, 0x01, 0x02, 0x03]);
  });

  it('accepts a v2 file with legacy types and converts them', () => {
    const file = JSON.stringify({
      version: 2,
      exportedAt: 0,
      places: [
        { ...makePlace(), type: 'outdoor', photos: [] },
        { ...makePlace({ id: 'p2' }), type: 'drink', photos: [] },
        { ...makePlace({ id: 'p3' }), type: 'food', photos: [] },
      ],
    });
    const restored = parseImportFile(file);
    expect(restored[0]).toMatchObject({ type: 'balade', isOutdoor: true });
    expect(restored[1]).toMatchObject({ type: 'gourmandise', isOutdoor: false });
    expect(restored[2]).toMatchObject({ type: 'restaurant', isOutdoor: false });
  });

  it('rejects an invalid isOutdoor', () => {
    const file = JSON.stringify({
      version: 3,
      exportedAt: 0,
      places: [{ ...makePlace(), isOutdoor: 'oui' }],
    });
    expect(() => parseImportFile(file)).toThrow(/isOutdoor/);
  });

  it('round-trips the setting', async () => {
    const original = [
      makePlace({ type: 'balade', isOutdoor: true }),
      makePlace({ id: 'p2', photos: [], isOutdoor: false }),
    ];
    const json = await exportPlaces(original);
    const restored = parseImportFile(json);
    expect(restored[0].isOutdoor).toBe(true);
    expect(restored[1].isOutdoor).toBe(false);
  });

  it('rejects a file that is not valid JSON', () => {
    expect(() => parseImportFile('not json')).toThrow(ImportError);
  });

  it('rejects an unsupported version', () => {
    const file = JSON.stringify({ version: 99, exportedAt: 0, places: [] });
    expect(() => parseImportFile(file)).toThrow(/version/);
  });

  it('rejects a place without a name', () => {
    const file = JSON.stringify({ version: 1, exportedAt: 0, places: [makePlace({ name: '' })] });
    expect(() => parseImportFile(file)).toThrow(/missing name/);
  });

  it('rejects an unknown type', () => {
    const file = JSON.stringify({
      version: 1,
      exportedAt: 0,
      places: [{ ...makePlace(), type: 'museum', photos: [] }],
    });
    expect(() => parseImportFile(file)).toThrow(/unknown type/);
  });

  it('rejects an unreadable photo', () => {
    const file = JSON.stringify({
      version: 1,
      exportedAt: 0,
      places: [{ ...makePlace(), photos: [{ id: 'ph1', data: '!!!pas-base64!!!' }] }],
    });
    expect(() => parseImportFile(file)).toThrow(/photo/);
  });

  it('rejects a photo whose data is not a JPEG image', () => {
    const file = JSON.stringify({
      version: 1,
      exportedAt: 0,
      places: [{ ...makePlace(), photos: [{ id: 'ph1', data: btoa('not-a-jpeg') }] }],
    });
    expect(() => parseImportFile(file)).toThrow(/photo/);
  });

  it('rejects a photo with empty data', () => {
    const file = JSON.stringify({
      version: 1,
      exportedAt: 0,
      places: [{ ...makePlace(), photos: [{ id: 'ph1', data: '' }] }],
    });
    expect(() => parseImportFile(file)).toThrow(/photo/);
  });

  it('rejects structurally invalid data', () => {
    const cases: unknown[][] = [
      [null],
      [{ ...makePlace(), id: '' }],
      [{ ...makePlace(), address: '' }],
      [{ ...makePlace(), photos: 'nope' }],
      [{ ...makePlace(), photos: [{ id: 'ph1' }] }],
    ];
    for (const places of cases) {
      const file = JSON.stringify({ version: 1, exportedAt: 0, places });
      expect(() => parseImportFile(file)).toThrow(ImportError);
    }
  });

  it('generates a dated file name', () => {
    expect(buildExportFileName(new Date('2026-09-02T12:00:00Z'))).toBe('mymap-export-2026-09-02.json');
  });
});
