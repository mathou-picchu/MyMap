import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import type { Place } from './types';

interface MyMapDB extends DBSchema {
  places: { key: string; value: Place };
}

let dbPromise: Promise<IDBPDatabase<MyMapDB>> | null = null;

function getDB(): Promise<IDBPDatabase<MyMapDB>> {
  if (!dbPromise) {
    dbPromise = openDB<MyMapDB>('mymap', 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('places')) {
          db.createObjectStore('places', { keyPath: 'id' });
        }
      },
    });
  }
  return dbPromise;
}

export async function listPlaces(): Promise<Place[]> {
  const db = await getDB();
  const places = await db.getAll('places');
  return places.sort((a, b) => b.createdAt - a.createdAt);
}

export async function savePlace(place: Place): Promise<void> {
  const db = await getDB();
  await db.put('places', place);
}

export async function deletePlace(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('places', id);
}

export async function replaceAllPlaces(places: Place[]): Promise<void> {
  const db = await getDB();
  const tx = db.transaction('places', 'readwrite');
  await tx.store.clear();
  for (const place of places) {
    await tx.store.put(place);
  }
  await tx.done;
}
