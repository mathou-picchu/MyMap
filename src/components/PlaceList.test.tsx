import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import type { Place, PlaceTypeId } from '../types';
import PlaceList from './PlaceList';

function makePlace(id: string, name: string, type: PlaceTypeId = 'food'): Place {
  return {
    id,
    name,
    address: `Adresse ${id}`,
    lat: 0,
    lng: 0,
    isFree: true,
    type,
    photos: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

describe('PlaceList', () => {
  it('affiche une carte par point dans l\'ordre reçu', () => {
    render(
      <PlaceList
        places={[makePlace('a', 'Café Jean'), makePlace('b', 'Musée d\'Orsay', 'visit')]}
        selectedId={null}
        onSelect={vi.fn()}
        onToggleDone={vi.fn()}
      />,
    );
    const titles = screen
      .getAllByRole('listitem')
      .map((li) => li.querySelector('.card-title')?.textContent);
    expect(titles).toEqual(['Café Jean', 'Musée d\'Orsay']);
  });

  it('sélectionne un point au clic', async () => {
    const onSelect = vi.fn();
    render(<PlaceList places={[makePlace('a', 'Café Jean')]} selectedId={null} onSelect={onSelect} onToggleDone={vi.fn()} />);
    await userEvent.click(screen.getByRole('button', { name: /café jean/i }));
    expect(onSelect).toHaveBeenCalledWith('a');
  });

  it('met en évidence le point sélectionné', () => {
    render(<PlaceList places={[makePlace('a', 'Café Jean')]} selectedId="a" onSelect={vi.fn()} onToggleDone={vi.fn()} />);
    expect(screen.getByRole('listitem')).toHaveClass('selected');
  });

  it('affiche un message si la liste est vide', () => {
    render(<PlaceList places={[]} selectedId={null} onSelect={vi.fn()} onToggleDone={vi.fn()} />);
    expect(screen.getByText(/aucun point/i)).toBeInTheDocument();
  });

  it('coche un point sans le sélectionner', async () => {
    const onSelect = vi.fn();
    const onToggleDone = vi.fn();
    render(
      <PlaceList
        places={[makePlace('a', 'Café Jean')]}
        selectedId={null}
        onSelect={onSelect}
        onToggleDone={onToggleDone}
      />,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Marquer comme fait' }));
    expect(onToggleDone).toHaveBeenCalledWith('a');
    expect(onSelect).not.toHaveBeenCalled();
  });

  it('marque la carte d\'un point fait', () => {
    render(
      <PlaceList
        places={[{ ...makePlace('a', 'Café Jean'), isDone: true }]}
        selectedId={null}
        onSelect={vi.fn()}
        onToggleDone={vi.fn()}
      />,
    );
    expect(screen.getByRole('listitem')).toHaveClass('done');
    expect(screen.getByRole('button', { name: 'Marquer comme à faire' })).toHaveClass('done');
  });

  it('affiche le message d\'état vide personnalisé', () => {
    render(
      <PlaceList
        places={[]}
        selectedId={null}
        onSelect={vi.fn()}
        onToggleDone={vi.fn()}
        emptyHint="Tous faits !"
      />,
    );
    expect(screen.getByText('Tous faits !')).toBeInTheDocument();
  });
});
