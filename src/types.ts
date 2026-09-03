export type PlaceTypeId = 'visit' | 'balade' | 'restaurant' | 'gourmandise' | 'lodging' | 'shopping' | 'other';

export type MilieuId = 'outdoor' | 'indoor';

export interface PlacePhoto {
  id: string;
  blob: Blob;
}

export interface Place {
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
  type: PlaceTypeId;
  photos: PlacePhoto[];
  createdAt: number;
  updatedAt: number;
}

export interface PlaceDraft {
  lat: number;
  lng: number;
  name?: string;
  address?: string;
}

export interface MapState {
  lat: number;
  lng: number;
  zoom: number;
}
