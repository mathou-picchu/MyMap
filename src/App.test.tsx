import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import App from './App';
import { listPlaces, replaceAllPlaces } from './db';
import type { MapState, Place, PlaceTypeId } from './types';

vi.mock('./db', () => ({
  listPlaces: vi.fn(async () => []),
  savePlace: vi.fn(),
  deletePlace: vi.fn(),
  replaceAllPlaces: vi.fn(async () => {}),
}));

vi.mock('./components/MapView', () => ({
  default: ({ initialMapState }: { initialMapState?: MapState }) => (
    <div
      data-testid="map-view-mock"
      data-lat={initialMapState?.lat}
      data-lng={initialMapState?.lng}
      data-zoom={initialMapState?.zoom}
    />
  ),
}));

function makeAppPlace(
  id: string,
  name: string,
  isDone: boolean,
  type: PlaceTypeId = 'restaurant',
  isOutdoor?: boolean,
): Place {
  return {
    id,
    name,
    address: 'Paris',
    lat: 48.85,
    lng: 2.35,
    isFree: true,
    type,
    photos: [],
    isDone,
    isOutdoor,
    createdAt: 1,
    updatedAt: 1,
  };
}

afterEach(() => {
  localStorage.clear();
});

describe('App', () => {
  it('renders the header, search and empty list', () => {
    render(<App />);
    expect(screen.getByRole('heading', { name: 'MyMap' })).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/search an address/i)).toBeInTheDocument();
    expect(screen.getByText(/no places yet/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add a place/i })).toBeInTheDocument();
  });

  it('renders a banner when storage is unavailable', async () => {
    vi.mocked(listPlaces).mockRejectedValueOnce(new Error('IndexedDB unavailable'));
    render(<App />);
    expect(await screen.findByText(/storage unavailable/i)).toBeInTheDocument();
  });

  it('centers on Paris by default when no position is stored', () => {
    render(<App />);
    const map = screen.getByTestId('map-view-mock');
    expect(map).toHaveAttribute('data-lat', '48.8566');
    expect(map).toHaveAttribute('data-lng', '2.3522');
    expect(map).toHaveAttribute('data-zoom', '12');
  });

  it('ignores any stored position and opens on Paris', () => {
    localStorage.setItem('mymap.mapstate', JSON.stringify({ lat: 48.85, lng: 2.35, zoom: 15 }));
    render(<App />);
    const map = screen.getByTestId('map-view-mock');
    expect(map).toHaveAttribute('data-lat', '48.8566');
    expect(map).toHaveAttribute('data-lng', '2.3522');
    expect(map).toHaveAttribute('data-zoom', '12');
  });

  it('hides done places when the filter is active', async () => {
    vi.mocked(listPlaces).mockResolvedValueOnce([
      makeAppPlace('p1', 'Museum done', true),
      makeAppPlace('p2', 'Café to do', false),
    ]);
    render(<App />);
    expect(await screen.findByText('Café to do')).toBeInTheDocument();
    expect(screen.getByText('Museum done')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /hide done/i }));
    expect(screen.queryByText('Museum done')).not.toBeInTheDocument();
    expect(screen.getByText('Café to do')).toBeInTheDocument();
  });

  it('filters by outdoor / indoor setting', async () => {
    vi.mocked(listPlaces).mockResolvedValueOnce([
      makeAppPlace('p1', 'Community garden', false, 'balade', true),
      makeAppPlace('p2', 'Library', false, 'visit', false),
    ]);
    render(<App />);
    expect(await screen.findByText('Community garden')).toBeInTheDocument();
    expect(screen.getByText('Library')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /outdoor/i }));
    expect(screen.queryByText('Community garden')).not.toBeInTheDocument();
    expect(screen.getByText('Library')).toBeInTheDocument();
  });

  it('migrates legacy types on startup and saves them', async () => {
    vi.mocked(replaceAllPlaces).mockClear();
    vi.mocked(listPlaces).mockResolvedValueOnce([
      makeAppPlace('p1', 'Parc Monceau', false, 'outdoor' as PlaceTypeId),
      makeAppPlace('p2', 'Vieux café', false, 'food' as PlaceTypeId),
    ]);
    render(<App />);
    await screen.findByText('Parc Monceau');
    expect(replaceAllPlaces).toHaveBeenCalledTimes(1);
    expect(replaceAllPlaces).toHaveBeenCalledWith([
      expect.objectContaining({ id: 'p1', type: 'balade', isOutdoor: true }),
      expect.objectContaining({ id: 'p2', type: 'restaurant', isOutdoor: false }),
    ]);
  });

  it('saves nothing when places are already up to date', async () => {
    vi.mocked(replaceAllPlaces).mockClear();
    vi.mocked(listPlaces).mockResolvedValueOnce([
      makeAppPlace('p1', 'Café moderne', false, 'restaurant', false),
    ]);
    render(<App />);
    await screen.findByText('Café moderne');
    expect(replaceAllPlaces).not.toHaveBeenCalled();
  });

  it('converts stored legacy filters', () => {
    localStorage.setItem('mymap.filters', JSON.stringify(['outdoor', 'food', 'museum']));
    render(<App />);
    expect(screen.getByRole('button', { name: /walk/i })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: /restaurant/i })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: /visit/i })).toHaveAttribute('aria-pressed', 'false');
  });

  it('discards invalid setting values', () => {
    localStorage.setItem('mymap.milieu', JSON.stringify(['outdoor', 'nimporte']));
    render(<App />);
    expect(screen.getByRole('button', { name: /outdoor/i })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: /indoor/i })).toHaveAttribute('aria-pressed', 'false');
  });
});
