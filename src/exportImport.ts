import { isKnownTypeId, migrateTypeId } from './migrations';
import type { Place, PlacePhoto } from './types';

const EXPORT_VERSION = 3;

export class ImportError extends Error {}

interface SerializedPhoto {
  id: string;
  data: string;
}

interface SerializedPlace {
  id: string;
  name: string;
  address: string;
  description?: string;
  lat: number;
  lng: number;
  hours?: string;
  isFree: boolean;
  price?: string;
  isDone?: boolean;
  isOutdoor?: boolean;
  type: string;
  photos: SerializedPhoto[];
  createdAt: number;
  updatedAt: number;
}

interface ExportFile {
  version: number;
  exportedAt: number;
  places: SerializedPlace[];
}

async function blobToBase64(blob: Blob): Promise<string> {
  const bytes = new Uint8Array(await blob.arrayBuffer());
  let binary = '';
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  return btoa(binary);
}

function base64ToBlob(data: string): Blob {
  const binary = atob(data);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  if (bytes.length < 2 || bytes[0] !== 0xff || bytes[1] !== 0xd8) {
    throw new Error('invalid photo data');
  }
  return new Blob([bytes], { type: 'image/jpeg' });
}

export async function exportPlaces(places: Place[]): Promise<string> {
  const file: ExportFile = {
    version: EXPORT_VERSION,
    exportedAt: Date.now(),
    places: await Promise.all(
      places.map(async (place): Promise<SerializedPlace> => ({
        ...place,
        isDone: place.isDone ?? false,
        isOutdoor: place.isOutdoor ?? false,
        photos: await Promise.all(
          place.photos.map(async (photo): Promise<SerializedPhoto> => ({
            id: photo.id,
            data: await blobToBase64(photo.blob),
          })),
        ),
      })),
    ),
  };
  return JSON.stringify(file, null, 2);
}

export function parseImportFile(text: string): Place[] {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new ImportError('the file is not valid JSON.');
  }
  if (typeof parsed !== 'object' || parsed === null) {
    throw new ImportError('unexpected file structure.');
  }
  const file = parsed as Partial<ExportFile>;
  if (file.version !== 1 && file.version !== 2 && file.version !== EXPORT_VERSION) {
    throw new ImportError(`unsupported file version (${String(file.version)}).`);
  }
  if (!Array.isArray(file.places)) {
    throw new ImportError('missing places list.');
  }
  return file.places.map((place, index) => parsePlace(place, index));
}

function parsePlace(place: SerializedPlace, index: number): Place {
  const prefix = `place #${index + 1}`;
  if (typeof place !== 'object' || place === null) {
    throw new ImportError(`${prefix}: invalid data.`);
  }
  const rawType = place.type;
  if (typeof place.id !== 'string' || place.id.length === 0) {
    throw new ImportError(`${prefix}: missing id.`);
  }
  if (typeof place.name !== 'string' || place.name.trim().length === 0) {
    throw new ImportError(`${prefix}: missing name.`);
  }
  if (typeof place.address !== 'string' || place.address.trim().length === 0) {
    throw new ImportError(`${prefix}: missing address.`);
  }
  if (typeof place.lat !== 'number' || !Number.isFinite(place.lat)) {
    throw new ImportError(`${prefix}: invalid latitude.`);
  }
  if (typeof place.lng !== 'number' || !Number.isFinite(place.lng)) {
    throw new ImportError(`${prefix}: invalid longitude.`);
  }
  if (typeof place.isFree !== 'boolean') {
    throw new ImportError(`${prefix} : invalid “isFree” field.`);
  }
  if (typeof place.type !== 'string' || !isKnownTypeId(place.type)) {
    throw new ImportError(`${prefix}: unknown type (${String(place.type)}).`);
  }
  if (typeof place.createdAt !== 'number' || typeof place.updatedAt !== 'number') {
    throw new ImportError(`${prefix}: invalid dates.`);
  }
  if (place.hours !== undefined && typeof place.hours !== 'string') {
    throw new ImportError(`${prefix}: invalid hours.`);
  }
  if (place.price !== undefined && typeof place.price !== 'string') {
    throw new ImportError(`${prefix}: invalid price.`);
  }
  if (place.description !== undefined && typeof place.description !== 'string') {
    throw new ImportError(`${prefix}: invalid description.`);
  }
  if (place.isDone !== undefined && typeof place.isDone !== 'boolean') {
    throw new ImportError(`${prefix} : invalid “isDone” field.`);
  }
  if (place.isOutdoor !== undefined && typeof place.isOutdoor !== 'boolean') {
    throw new ImportError(`${prefix} : invalid “isOutdoor” field.`);
  }
  if (!Array.isArray(place.photos)) {
    throw new ImportError(`${prefix}: invalid photos.`);
  }
  const photos: PlacePhoto[] = place.photos.map((photo, photoIndex) => {
    if (
      typeof photo !== 'object' ||
      photo === null ||
      typeof photo.id !== 'string' ||
      typeof photo.data !== 'string'
    ) {
      throw new ImportError(`${prefix}: photo #${photoIndex + 1} invalid.`);
    }
    try {
      return { id: photo.id, blob: base64ToBlob(photo.data) };
    } catch {
      throw new ImportError(`${prefix}: photo #${photoIndex + 1} unreadable.`);
    }
  });
  return {
    id: place.id,
    name: place.name,
    address: place.address,
    description: place.description,
    lat: place.lat,
    lng: place.lng,
    hours: place.hours,
    isFree: place.isFree,
    price: place.price,
    isDone: place.isDone ?? false,
    isOutdoor: place.isOutdoor ?? rawType === 'outdoor',
    type: migrateTypeId(rawType),
    photos,
    createdAt: place.createdAt,
    updatedAt: place.updatedAt,
  };
}

export function buildExportFileName(date: Date = new Date()): string {
  return `mymap-export-${date.toISOString().slice(0, 10)}.json`;
}
