import { execFileSync } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, isAbsolute, join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { PLACE_TYPE_IDS } from '../src/constants.ts';

export interface ManifestPlace {
  name: string;
  address: string;
  lat: number;
  lng: number;
  type: string;
  isOutdoor?: boolean;
  isFree?: boolean;
  price?: string;
  hours?: string;
  isDone?: boolean;
  photos?: string[];
}

export interface Manifest {
  places: ManifestPlace[];
}

interface SerializedPhoto {
  id: string;
  data: string;
}

interface SerializedPlace {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  hours?: string;
  isFree: boolean;
  price?: string;
  isDone: boolean;
  isOutdoor: boolean;
  type: string;
  photos: SerializedPhoto[];
  createdAt: number;
  updatedAt: number;
}

const MAX_PHOTO_EDGE = 1600;
const JPEG_QUALITY_PERCENT = 85;

export function buildImportFile(manifestPath: string): string {
  const manifestDir = dirname(resolve(manifestPath));
  let manifest: Manifest;
  try {
    manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
  } catch {
    throw new Error('unreadable manifest: invalid JSON.');
  }
  if (!Array.isArray(manifest?.places)) {
    throw new Error('invalid manifest: "places" must be a list.');
  }
  const now = Date.now();
  const places: SerializedPlace[] = manifest.places.map((place, index) => {
    const prefix = `place #${index + 1}${typeof place?.name === 'string' ? ` (${place.name})` : ''}`;
    if (typeof place?.name !== 'string' || !place.name.trim()) {
      throw new Error(`${prefix}: missing name.`);
    }
    if (typeof place.address !== 'string' || !place.address.trim()) {
      throw new Error(`${prefix}: missing address.`);
    }
    if (typeof place.lat !== 'number' || !Number.isFinite(place.lat)) {
      throw new Error(`${prefix}: invalid latitude.`);
    }
    if (typeof place.lng !== 'number' || !Number.isFinite(place.lng)) {
      throw new Error(`${prefix}: invalid longitude.`);
    }
    if (typeof place.type !== 'string' || !(PLACE_TYPE_IDS as string[]).includes(place.type)) {
      throw new Error(
        `${prefix}: unknown type (${String(place?.type)}). Valid types: ${PLACE_TYPE_IDS.join(', ')}.`,
      );
    }
    const photos = (place.photos ?? []).map((photo) =>
      photoToJpegBase64(isAbsolute(photo) ? photo : resolve(manifestDir, photo)),
    );
    const timestamp = now - index;
    return {
      id: randomUUID(),
      name: place.name.trim(),
      address: place.address.trim(),
      lat: place.lat,
      lng: place.lng,
      hours: place.hours?.trim() || undefined,
      isFree: place.isFree ?? false,
      price: place.price?.trim() || undefined,
      isDone: place.isDone ?? false,
      isOutdoor: place.isOutdoor ?? false,
      type: place.type,
      photos: photos.map((data) => ({ id: randomUUID(), data })),
      createdAt: timestamp,
      updatedAt: timestamp,
    };
  });
  return JSON.stringify({ version: 3, exportedAt: now, places }, null, 2);
}

function photoToJpegBase64(photoPath: string): string {
  if (!existsSync(photoPath)) {
    throw new Error(`photo not found: ${photoPath}`);
  }
  const tmpDir = mkdtempSync(join(tmpdir(), 'mymap-import-'));
  try {
    const dest = join(tmpDir, 'photo.jpg');
    const args = ['-s', 'format', 'jpeg', '-s', 'formatOptions', String(JPEG_QUALITY_PERCENT)];
    if (maxPhotoEdge(photoPath) > MAX_PHOTO_EDGE) {
      args.push('-Z', String(MAX_PHOTO_EDGE));
    }
    args.push(photoPath, '--out', dest);
    try {
      execFileSync('sips', args, { stdio: ['ignore', 'ignore', 'ignore'] });
    } catch {
      throw new Error(`conversion failed (sips): ${photoPath}`);
    }
    return readFileSync(dest).toString('base64');
  } finally {
    rmSync(tmpDir, { recursive: true, force: true });
  }
}

function maxPhotoEdge(photoPath: string): number {
  const out = execFileSync('sips', ['-g', 'pixelWidth', '-g', 'pixelHeight', photoPath], {
    encoding: 'utf8',
  });
  const widths = [...out.matchAll(/pixelWidth: (\d+)/g)].map((m) => Number(m[1]));
  const heights = [...out.matchAll(/pixelHeight: (\d+)/g)].map((m) => Number(m[1]));
  return Math.max(...widths, ...heights, 0);
}

function main() {
  const manifestPath = process.argv[2] ?? 'import-data/manifest.json';
  if (!existsSync(manifestPath)) {
    console.error(`Manifest not found: ${manifestPath}`);
    console.error('Usage: node scripts/build-import-from-folder.ts [path/to/manifest.json]');
    process.exit(1);
  }
  const json = buildImportFile(manifestPath);
  const outPath = join(dirname(resolve(manifestPath)), 'mymap-import.json');
  writeFileSync(outPath, json);
  const places = (JSON.parse(json) as { places: SerializedPlace[] }).places;
  const photoCount = places.reduce((sum, p) => sum + p.photos.length, 0);
  console.log(`✓ ${places.length} place(s), ${photoCount} photo(s) → ${outPath}`);
  console.log('Import it into MyMap via ⬆️ Import (warning: replaces all existing places).');
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main();
}
