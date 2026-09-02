import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import App from './App';
import { listPlaces } from './db';
import type { MapState } from './types';

vi.mock('./db', () => ({
  listPlaces: vi.fn(async () => []),
  savePlace: vi.fn(),
  deletePlace: vi.fn(),
  replaceAllPlaces: vi.fn(),
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

afterEach(() => {
  localStorage.clear();
});

describe('App', () => {
  it('affiche l\'en-tête, la recherche et la liste vide', () => {
    render(<App />);
    expect(screen.getByRole('heading', { name: 'MyMap' })).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/rechercher/i)).toBeInTheDocument();
    expect(screen.getByText(/aucun point/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /ajouter un lieu/i })).toBeInTheDocument();
  });

  it('affiche un bandeau si le stockage est indisponible', async () => {
    vi.mocked(listPlaces).mockRejectedValueOnce(new Error('IndexedDB indisponible'));
    render(<App />);
    expect(await screen.findByText(/stockage indisponible/i)).toBeInTheDocument();
  });

  it('centre sur Paris par défaut si aucune position n\'est mémorisée', () => {
    render(<App />);
    const map = screen.getByTestId('map-view-mock');
    expect(map).toHaveAttribute('data-lat', '48.8566');
    expect(map).toHaveAttribute('data-lng', '2.3522');
    expect(map).toHaveAttribute('data-zoom', '12');
  });

  it('centre sur Paris si l\'ancienne vue France par défaut est mémorisée', () => {
    localStorage.setItem('mymap.mapstate', JSON.stringify({ lat: 46.6, lng: 2.4, zoom: 5 }));
    render(<App />);
    const map = screen.getByTestId('map-view-mock');
    expect(map).toHaveAttribute('data-lat', '48.8566');
    expect(map).toHaveAttribute('data-zoom', '12');
  });

  it('respecte la position de carte mémorisée', () => {
    localStorage.setItem('mymap.mapstate', JSON.stringify({ lat: 48.85, lng: 2.35, zoom: 15 }));
    render(<App />);
    expect(screen.getByTestId('map-view-mock')).toHaveAttribute('data-zoom', '15');
  });
});
