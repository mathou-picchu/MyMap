import { useCallback, useEffect, useRef, useState } from 'react';
import type { Map as LeafletMap } from 'leaflet';
import MapView from './components/MapView';
import PlaceDetails from './components/PlaceDetails';
import PlaceForm from './components/PlaceForm';
import PlaceList from './components/PlaceList';
import SearchBar from './components/SearchBar';
import Toolbar from './components/Toolbar';
import TypeFilter from './components/TypeFilter';
import { PLACE_TYPE_IDS } from './constants';
import { deletePlace, listPlaces, replaceAllPlaces, savePlace } from './db';
import { buildExportFileName, exportPlaces, ImportError, parseImportFile } from './exportImport';
import type { GeoResult } from './geocoding';
import { loadJSON, saveJSON } from './storage';
import type { MapState, Place, PlaceDraft, PlaceTypeId } from './types';
import './App.css';

const DEFAULT_MAP_STATE: MapState = { lat: 48.8566, lng: 2.3522, zoom: 12 };
const LEGACY_MAP_STATE: MapState = { lat: 46.6, lng: 2.4, zoom: 5 };

function loadInitialMapState(): MapState {
  const stored = loadJSON<MapState>('mymap.mapstate', DEFAULT_MAP_STATE);
  if (
    stored.lat === LEGACY_MAP_STATE.lat &&
    stored.lng === LEGACY_MAP_STATE.lng &&
    stored.zoom === LEGACY_MAP_STATE.zoom
  ) {
    return DEFAULT_MAP_STATE;
  }
  return stored;
}

export default function App() {
  const [places, setPlaces] = useState<Place[]>([]);
  const [activeTypes, setActiveTypes] = useState<Set<PlaceTypeId>>(() =>
    new Set(loadJSON<PlaceTypeId[]>('mymap.filters', PLACE_TYPE_IDS)),
  );
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);
  const [draft, setDraft] = useState<PlaceDraft | null>(null);
  const [editing, setEditing] = useState<Place | null>(null);
  const [addMode, setAddMode] = useState(false);
  const [mobileView, setMobileView] = useState<'map' | 'list'>('map');
  const [storageError, setStorageError] = useState(false);
  const [initialMapState] = useState(loadInitialMapState);
  const mapRef = useRef<LeafletMap | null>(null);

  const refreshPlaces = useCallback(async () => {
    try {
      setPlaces(await listPlaces());
    } catch {
      setStorageError(true);
    }
  }, []);

  useEffect(() => {
    listPlaces()
      .then(setPlaces)
      .catch(() => setStorageError(true));
  }, []);

  useEffect(() => {
    saveJSON('mymap.filters', [...activeTypes]);
  }, [activeTypes]);

  const filteredPlaces = places.filter((p) => activeTypes.has(p.type));
  const selectedPlace = places.find((p) => p.id === selectedPlaceId) ?? null;

  function flyTo(lat: number, lng: number) {
    if (!mapRef.current) return;
    mapRef.current.flyTo([lat, lng], Math.max(mapRef.current.getZoom(), 13));
  }

  function handleToggleType(type: PlaceTypeId) {
    setActiveTypes((prev) => {
      const next = new Set(prev);
      if (next.has(type)) {
        next.delete(type);
      } else {
        next.add(type);
      }
      return next;
    });
  }

  function handleSelect(id: string) {
    setSelectedPlaceId(id);
    setMobileView('list');
    const place = places.find((p) => p.id === id);
    if (place) flyTo(place.lat, place.lng);
  }

  function handleSearchSelect(result: GeoResult) {
    setDraft({ lat: result.lat, lng: result.lng, name: result.name, address: result.address });
    flyTo(result.lat, result.lng);
  }

  function handleMapClick(lat: number, lng: number) {
    setDraft({ lat, lng });
    setAddMode(false);
  }

  async function handleSavePlace(place: Place) {
    await savePlace(place);
    await refreshPlaces();
    setDraft(null);
    setEditing(null);
    setSelectedPlaceId(place.id);
  }

  function handleCancelForm() {
    setDraft(null);
    setEditing(null);
    setAddMode(false);
  }

  async function handleDeletePlace(id: string) {
    await deletePlace(id);
    await refreshPlaces();
    setSelectedPlaceId(null);
  }

  async function handleExport() {
    const json = await exportPlaces(places);
    const url = URL.createObjectURL(new Blob([json], { type: 'application/json' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = buildExportFileName();
    a.click();
    URL.revokeObjectURL(url);
  }

  async function handleImport(file: File) {
    try {
      const imported = parseImportFile(await file.text());
      const ok = window.confirm(
        `Remplacer les ${places.length} points actuels par les ${imported.length} points du fichier ?`,
      );
      if (!ok) return;
      await replaceAllPlaces(imported);
      await refreshPlaces();
      setSelectedPlaceId(null);
    } catch (err) {
      if (err instanceof ImportError) {
        window.alert(`Import impossible : ${err.message}`);
      } else {
        window.alert('Import impossible : fichier illisible.');
      }
    }
  }

  function handleLocate() {
    if (!('geolocation' in navigator)) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        mapRef.current?.flyTo([pos.coords.latitude, pos.coords.longitude], 14);
      },
      () => window.alert('Localisation impossible.'),
    );
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1 className="app-title">MyMap</h1>
        <SearchBar onSelect={handleSearchSelect} />
        <Toolbar onExport={handleExport} onImport={handleImport} onLocate={handleLocate} />
        <button
          type="button"
          className={`add-button${addMode ? ' active' : ''}`}
          onClick={() => {
            setAddMode((v) => !v);
            setDraft(null);
          }}
        >
          ＋ Ajouter un lieu
        </button>
      </header>
      <TypeFilter active={activeTypes} onToggle={handleToggleType} />
      {storageError && (
        <div className="storage-banner" role="alert">
          ⚠️ Stockage indisponible : impossible d'enregistrer tes points dans ce navigateur (mode
          privé ?).
        </div>
      )}
      <main className="app-main" data-mobile-view={mobileView}>
        <div className="map-pane">
          <MapView
            places={filteredPlaces}
            selectedId={selectedPlaceId}
            addMode={addMode}
            draftPos={draft ? { lat: draft.lat, lng: draft.lng } : null}
            mapRef={mapRef}
            initialMapState={initialMapState}
            onMapClick={handleMapClick}
            onMarkerClick={handleSelect}
            onMoveEnd={(state) => saveJSON('mymap.mapstate', state)}
          />
        </div>
        <section className="side-column">
          {selectedPlace ? (
            <PlaceDetails
              place={selectedPlace}
              onBack={() => setSelectedPlaceId(null)}
              onEdit={() => setEditing(selectedPlace)}
              onDelete={handleDeletePlace}
            />
          ) : (
            <PlaceList
              places={filteredPlaces}
              selectedId={selectedPlaceId}
              onSelect={handleSelect}
            />
          )}
        </section>
      </main>
      <nav className="mobile-tabs">
        <button
          type="button"
          className={mobileView === 'map' ? 'active' : ''}
          onClick={() => setMobileView('map')}
        >
          Carte
        </button>
        <button
          type="button"
          className={mobileView === 'list' ? 'active' : ''}
          onClick={() => setMobileView('list')}
        >
          Liste ({filteredPlaces.length})
        </button>
      </nav>
      {(draft || editing) && (
        <PlaceForm
          place={editing}
          draft={draft}
          onCancel={handleCancelForm}
          onSave={handleSavePlace}
        />
      )}
    </div>
  );
}
