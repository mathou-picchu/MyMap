import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { buildImportFile } from '../scripts/build-import-from-folder.ts';
import { parseImportFile } from './exportImport';

const TINY_PNG_BASE64 =
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';

function writeManifest(manifest: unknown, files: Record<string, Buffer | string> = {}): string {
  const dir = mkdtempSync(join(tmpdir(), 'mymap-build-import-'));
  for (const [name, content] of Object.entries(files)) {
    writeFileSync(join(dir, name), content);
  }
  writeFileSync(join(dir, 'manifest.json'), JSON.stringify(manifest));
  return join(dir, 'manifest.json');
}

function cleanup(manifestPath: string) {
  rmSync(dirname(manifestPath), { recursive: true, force: true });
}

describe('build-import-from-folder', () => {
  it('génère un import valide avec la photo convertie en JPEG', () => {
    const manifestPath = writeManifest(
      {
        places: [
          {
            name: 'Test Café',
            address: '1 rue du Test, Paris',
            lat: 48.85,
            lng: 2.35,
            type: 'restaurant',
            isOutdoor: false,
            isFree: false,
            price: '10 €',
            hours: 'Lun-Ven 8h-19h',
            photos: ['photo.png'],
          },
        ],
      },
      { 'photo.png': Buffer.from(TINY_PNG_BASE64, 'base64') },
    );
    try {
      const places = parseImportFile(buildImportFile(manifestPath));
      expect(places).toHaveLength(1);
      expect(places[0]).toMatchObject({
        name: 'Test Café',
        address: '1 rue du Test, Paris',
        type: 'restaurant',
        isOutdoor: false,
        isDone: false,
        isFree: false,
        price: '10 €',
        hours: 'Lun-Ven 8h-19h',
      });
      expect(places[0].photos).toHaveLength(1);
    } finally {
      cleanup(manifestPath);
    }
  });

  it('applique les valeurs par défaut sans photos', () => {
    const manifestPath = writeManifest({
      places: [{ name: 'Balade', address: 'Paris', lat: 48.85, lng: 2.35, type: 'balade' }],
    });
    try {
      const places = parseImportFile(buildImportFile(manifestPath));
      expect(places[0]).toMatchObject({
        isFree: false,
        isDone: false,
        isOutdoor: false,
      });
      expect(places[0].photos).toEqual([]);
    } finally {
      cleanup(manifestPath);
    }
  });

  it('préserve l\'ordre du manifeste (points les plus récents d\'abord)', () => {
    const manifestPath = writeManifest({
      places: [
        { name: 'Premier', address: 'Paris', lat: 1, lng: 2, type: 'visit' },
        { name: 'Deuxième', address: 'Paris', lat: 1, lng: 2, type: 'visit' },
      ],
    });
    try {
      const places = parseImportFile(buildImportFile(manifestPath));
      expect(places.map((p) => p.name)).toEqual(['Premier', 'Deuxième']);
      expect(places[0].createdAt).toBeGreaterThan(places[1].createdAt);
    } finally {
      cleanup(manifestPath);
    }
  });

  it('rejette un type inconnu', () => {
    const manifestPath = writeManifest({
      places: [{ name: 'X', address: 'Paris', lat: 1, lng: 2, type: 'museum' }],
    });
    try {
      expect(() => buildImportFile(manifestPath)).toThrow(/type inconnu/);
    } finally {
      cleanup(manifestPath);
    }
  });

  it('rejette un nom manquant', () => {
    const manifestPath = writeManifest({
      places: [{ address: 'Paris', lat: 1, lng: 2, type: 'visit' }],
    });
    try {
      expect(() => buildImportFile(manifestPath)).toThrow(/nom manquant/);
    } finally {
      cleanup(manifestPath);
    }
  });

  it('rejette une photo introuvable', () => {
    const manifestPath = writeManifest({
      places: [
        { name: 'X', address: 'Paris', lat: 1, lng: 2, type: 'visit', photos: ['absente.png'] },
      ],
    });
    try {
      expect(() => buildImportFile(manifestPath)).toThrow(/photo introuvable/);
    } finally {
      cleanup(manifestPath);
    }
  });
});
