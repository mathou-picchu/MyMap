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
    photos: [{ id: 'ph1', blob: new Blob([new Uint8Array([1, 2, 3])], { type: 'image/jpeg' }) }],
    createdAt: 1000,
    updatedAt: 2000,
    ...overrides,
  };
}

function project(places: Place[]) {
  return places.map((p) => ({
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
    photos: p.photos.map((ph) => ({ id: ph.id, size: ph.blob.size, type: ph.blob.type })),
  }));
}

describe('exportImport', () => {
  it('fait un aller-retour export → import sans perte', async () => {
    const original = [makePlace(), makePlace({ id: 'p2', photos: [] })];
    const json = await exportPlaces(original);
    const restored = parseImportFile(json);
    expect(project(restored)).toEqual(project(original));
  });

  it('écrit un JSON versionné avec les photos en base64', async () => {
    const json = await exportPlaces([makePlace()]);
    const parsed = JSON.parse(json);
    expect(parsed.version).toBe(1);
    expect(typeof parsed.exportedAt).toBe('number');
    expect(parsed.places[0].photos[0].data).toBe('AQID');
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

  it('génère un nom de fichier daté', () => {
    expect(buildExportFileName(new Date('2026-09-02T12:00:00Z'))).toBe('mymap-export-2026-09-02.json');
  });
});
