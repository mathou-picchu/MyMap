import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import App from './App';
import { listPlaces } from './db';

vi.mock('./db', () => ({
  listPlaces: vi.fn(async () => []),
  savePlace: vi.fn(),
  deletePlace: vi.fn(),
  replaceAllPlaces: vi.fn(),
}));

vi.mock('./components/MapView', () => ({
  default: () => <div data-testid="map-view-mock" />,
}));

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
});
