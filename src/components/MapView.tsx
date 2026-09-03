import type { Map as LeafletMap } from 'leaflet';
import { divIcon } from 'leaflet';
import { MapContainer, Marker, TileLayer, useMapEvents } from 'react-leaflet';
import { getPlaceTypeDef } from '../constants';
import type { MapState, Place, PlaceTypeId } from '../types';
import { checkSvg, markerSvg } from '../ui/icons';
import 'leaflet/dist/leaflet.css';

interface MapViewProps {
  places: Place[];
  selectedId: string | null;
  addMode: boolean;
  draftPos: { lat: number; lng: number } | null;
  mapRef: { current: LeafletMap | null };
  onMapClick: (lat: number, lng: number) => void;
  onMarkerClick: (id: string) => void;
  initialMapState?: MapState;
}

function placeIcon(type: PlaceTypeId, selected: boolean, done: boolean) {
  return divIcon({
    className: 'marker-wrapper',
    html: `<div class="marker-pin${selected ? ' selected' : ''}${done ? ' done' : ''}" style="background:${getPlaceTypeDef(type).color}">${markerSvg(type, 15)}${done ? `<span class="marker-check">${checkSvg(10)}</span>` : ''}</div>`,
    iconSize: [36, 44],
    iconAnchor: [18, 42],
  });
}

const draftIcon = divIcon({
  className: 'marker-wrapper',
  html: `<div class="marker-pin draft" style="background:#131445">${markerSvg('other', 15)}</div>`,
  iconSize: [36, 44],
  iconAnchor: [18, 42],
});

function MapEvents({ addMode, onMapClick }: Pick<MapViewProps, 'addMode' | 'onMapClick'>) {
  useMapEvents({
    click(e) {
      if (addMode) onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export default function MapView({
  places,
  selectedId,
  addMode,
  draftPos,
  mapRef,
  onMapClick,
  onMarkerClick,
  initialMapState,
}: MapViewProps) {
  const initial = initialMapState ?? { lat: 48.8566, lng: 2.3522, zoom: 12 };
  return (
    <MapContainer
      center={[initial.lat, initial.lng]}
      zoom={initial.zoom}
      className={`map-container${addMode ? ' add-mode' : ''}`}
      ref={mapRef}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapEvents addMode={addMode} onMapClick={onMapClick} />
      {places.map((place) => (
        <Marker
          key={place.id}
          position={[place.lat, place.lng]}
          icon={placeIcon(place.type, place.id === selectedId, place.isDone === true)}
          zIndexOffset={place.id === selectedId ? 1000 : 0}
          eventHandlers={{ click: () => onMarkerClick(place.id) }}
        />
      ))}
      {draftPos && (
        <Marker position={[draftPos.lat, draftPos.lng]} icon={draftIcon} interactive={false} />
      )}
    </MapContainer>
  );
}
