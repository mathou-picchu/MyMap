import { PLACE_TYPE_IDS } from './constants';
import type { Place, PlacePhoto, PlaceTypeId } from './types';

const EXPORT_VERSION = 1;

export class ImportError extends Error {}

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
  type: PlaceTypeId;
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
  return new Blob([bytes], { type: 'image/jpeg' });
}

export async function exportPlaces(places: Place[]): Promise<string> {
  const file: ExportFile = {
    version: EXPORT_VERSION,
    exportedAt: Date.now(),
    places: await Promise.all(
      places.map(async (place): Promise<SerializedPlace> => ({
        ...place,
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
    throw new ImportError('le fichier n\'est pas un JSON valide.');
  }
  if (typeof parsed !== 'object' || parsed === null) {
    throw new ImportError('structure de fichier inattendue.');
  }
  const file = parsed as Partial<ExportFile>;
  if (file.version !== EXPORT_VERSION) {
    throw new ImportError(`version du fichier non supportée (${String(file.version)}).`);
  }
  if (!Array.isArray(file.places)) {
    throw new ImportError('liste des points manquante.');
  }
  return file.places.map((place, index) => parsePlace(place, index));
}

function parsePlace(place: SerializedPlace, index: number): Place {
  const prefix = `point n°${index + 1}`;
  if (typeof place !== 'object' || place === null) {
    throw new ImportError(`${prefix} : données invalides.`);
  }
  if (typeof place.id !== 'string' || place.id.length === 0) {
    throw new ImportError(`${prefix} : identifiant manquant.`);
  }
  if (typeof place.name !== 'string' || place.name.trim().length === 0) {
    throw new ImportError(`${prefix} : nom manquant.`);
  }
  if (typeof place.address !== 'string' || place.address.trim().length === 0) {
    throw new ImportError(`${prefix} : adresse manquante.`);
  }
  if (typeof place.lat !== 'number' || !Number.isFinite(place.lat)) {
    throw new ImportError(`${prefix} : latitude invalide.`);
  }
  if (typeof place.lng !== 'number' || !Number.isFinite(place.lng)) {
    throw new ImportError(`${prefix} : longitude invalide.`);
  }
  if (typeof place.isFree !== 'boolean') {
    throw new ImportError(`${prefix} : champ « gratuit » invalide.`);
  }
  if (typeof place.type !== 'string' || !PLACE_TYPE_IDS.includes(place.type)) {
    throw new ImportError(`${prefix} : type inconnu (${String(place.type)}).`);
  }
  if (typeof place.createdAt !== 'number' || typeof place.updatedAt !== 'number') {
    throw new ImportError(`${prefix} : dates invalides.`);
  }
  if (place.hours !== undefined && typeof place.hours !== 'string') {
    throw new ImportError(`${prefix} : horaires invalides.`);
  }
  if (place.price !== undefined && typeof place.price !== 'string') {
    throw new ImportError(`${prefix} : prix invalide.`);
  }
  if (!Array.isArray(place.photos)) {
    throw new ImportError(`${prefix} : photos invalides.`);
  }
  const photos: PlacePhoto[] = place.photos.map((photo, photoIndex) => {
    if (
      typeof photo !== 'object' ||
      photo === null ||
      typeof photo.id !== 'string' ||
      typeof photo.data !== 'string'
    ) {
      throw new ImportError(`${prefix} : photo n°${photoIndex + 1} invalide.`);
    }
    try {
      return { id: photo.id, blob: base64ToBlob(photo.data) };
    } catch {
      throw new ImportError(`${prefix} : photo n°${photoIndex + 1} illisible.`);
    }
  });
  return {
    id: place.id,
    name: place.name,
    address: place.address,
    lat: place.lat,
    lng: place.lng,
    hours: place.hours,
    isFree: place.isFree,
    price: place.price,
    type: place.type,
    photos,
    createdAt: place.createdAt,
    updatedAt: place.updatedAt,
  };
}

export function buildExportFileName(date: Date = new Date()): string {
  return `mymap-export-${date.toISOString().slice(0, 10)}.json`;
}
