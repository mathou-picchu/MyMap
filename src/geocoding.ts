export interface GeoResult {
  name: string;
  address: string;
  lat: number;
  lng: number;
}

interface NominatimResult {
  name?: string;
  display_name: string;
  lat: string;
  lon: string;
}

export async function searchAddress(query: string, signal?: AbortSignal): Promise<GeoResult[]> {
  const url = new URL('https://nominatim.openstreetmap.org/search');
  url.searchParams.set('format', 'jsonv2');
  url.searchParams.set('q', query);
  url.searchParams.set('limit', '6');
  url.searchParams.set('accept-language', 'en');
  const res = await fetch(url, { signal });
  if (!res.ok) {
    throw new Error('Search unavailable');
  }
  const raw = (await res.json()) as NominatimResult[];
  return raw.map((r) => ({
    name: (r.name ?? '').trim() || r.display_name.split(',')[0].trim(),
    address: r.display_name,
    lat: Number(r.lat),
    lng: Number(r.lon),
  }));
}
