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
  it('fait un aller-retour export → import sans perte', async () => {
    const original = [makePlace(), makePlace({ id: 'p2', photos: [] })];
    const json = await exportPlaces(original);
    const restored = parseImportFile(json);
    expect(await project(restored)).toEqual(await project(original));
  });

  it('écrit un JSON versionné avec les photos en base64', async () => {
    const json = await exportPlaces([makePlace()]);
    const parsed = JSON.parse(json);
    expect(parsed.version).toBe(1);
    expect(typeof parsed.exportedAt).toBe('number');
    const data = parsed.places[0].photos[0].data as string;
    const bytes = Array.from(atob(data), (c) => c.charCodeAt(0));
    expect(bytes).toEqual([0xff, 0xd8, 0x01, 0x02, 0x03]);
  });

  it('rejette un fichier qui n\'est pas du JSON valide', () => {
    expect(() => parseImportFile('pas du json')).toThrow(ImportError);
  });

  it('rejette une version non supportée', () => {
    const file = JSON.stringify({ version: 99, exportedAt: 0, places: [] });
    expect(() => parseImportFile(file)).toThrow(/version/);
  });

  it('rejette un point sans nom', () => {
    const file = JSON.stringify({ version: 1, exportedAt: 0, places: [makePlace({ name: '' })] });
    expect(() => parseImportFile(file)).toThrow(/nom manquant/);
  });

  it('rejette un type inconnu', () => {
    const file = JSON.stringify({
      version: 1,
      exportedAt: 0,
      places: [{ ...makePlace(), type: 'museum', photos: [] }],
    });
    expect(() => parseImportFile(file)).toThrow(/type inconnu/);
  });

  it('rejette une photo illisible', () => {
    const file = JSON.stringify({
      version: 1,
      exportedAt: 0,
      places: [{ ...makePlace(), photos: [{ id: 'ph1', data: '!!!pas-base64!!!' }] }],
    });
    expect(() => parseImportFile(file)).toThrow(/photo/);
  });

  it('rejette une photo dont les données ne sont pas une image JPEG', () => {
    const file = JSON.stringify({
      version: 1,
      exportedAt: 0,
      places: [{ ...makePlace(), photos: [{ id: 'ph1', data: btoa('pas-un-jpeg') }] }],
    });
    expect(() => parseImportFile(file)).toThrow(/photo/);
  });

  it('rejette une photo avec des données vides', () => {
    const file = JSON.stringify({
      version: 1,
      exportedAt: 0,
      places: [{ ...makePlace(), photos: [{ id: 'ph1', data: '' }] }],
    });
    expect(() => parseImportFile(file)).toThrow(/photo/);
  });

  it('rejette les données structurellement invalides', () => {
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

  it('génère un nom de fichier daté', () => {
    expect(buildExportFileName(new Date('2026-09-02T12:00:00Z'))).toBe('mymap-export-2026-09-02.json');
  });
});
