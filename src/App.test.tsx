import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import App from './App';
import { listPlaces } from './db';
import type { MapState, Place } from './types';

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

function makeAppPlace(id: string, name: string, isDone: boolean): Place {
  return {
    id,
    name,
    address: 'Paris',
    lat: 48.85,
    lng: 2.35,
    isFree: true,
    type: 'restaurant',
    photos: [],
    isDone,
    createdAt: 1,
    updatedAt: 1,
  };
}

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

  it('ignore toute position mémorisée et ouvre sur Paris', () => {
    localStorage.setItem('mymap.mapstate', JSON.stringify({ lat: 48.85, lng: 2.35, zoom: 15 }));
    render(<App />);
    const map = screen.getByTestId('map-view-mock');
    expect(map).toHaveAttribute('data-lat', '48.8566');
    expect(map).toHaveAttribute('data-lng', '2.3522');
    expect(map).toHaveAttribute('data-zoom', '12');
  });

  it('masque les points faits quand le filtre est actif', async () => {
    vi.mocked(listPlaces).mockResolvedValueOnce([
      makeAppPlace('p1', 'Musée fait', true),
      makeAppPlace('p2', 'Café à faire', false),
    ]);
    render(<App />);
    expect(await screen.findByText('Café à faire')).toBeInTheDocument();
    expect(screen.getByText('Musée fait')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /masquer les faits/i }));
    expect(screen.queryByText('Musée fait')).not.toBeInTheDocument();
    expect(screen.getByText('Café à faire')).toBeInTheDocument();
  });
});
