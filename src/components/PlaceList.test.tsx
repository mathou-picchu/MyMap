import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import type { Place, PlaceTypeId } from '../types';
import PlaceList from './PlaceList';

function makePlace(id: string, name: string, type: PlaceTypeId = 'restaurant'): Place {
  return {
    id,
    name,
    address: `Address ${id}`,
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
  it('renders one card per place in the received order', () => {
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

  it('selects a place on click', async () => {
    const onSelect = vi.fn();
    render(<PlaceList places={[makePlace('a', 'Café Jean')]} selectedId={null} onSelect={onSelect} onToggleDone={vi.fn()} />);
    await userEvent.click(screen.getByRole('button', { name: /café jean/i }));
    expect(onSelect).toHaveBeenCalledWith('a');
  });

  it('highlights the selected place', () => {
    render(<PlaceList places={[makePlace('a', 'Café Jean')]} selectedId="a" onSelect={vi.fn()} onToggleDone={vi.fn()} />);
    expect(screen.getByRole('listitem')).toHaveClass('selected');
  });

  it('shows a message when the list is empty', () => {
    render(<PlaceList places={[]} selectedId={null} onSelect={vi.fn()} onToggleDone={vi.fn()} />);
    expect(screen.getByText(/no places yet/i)).toBeInTheDocument();
  });

  it('checks a place without selecting it', async () => {
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
    await userEvent.click(screen.getByRole('button', { name: 'Mark as done' }));
    expect(onToggleDone).toHaveBeenCalledWith('a');
    expect(onSelect).not.toHaveBeenCalled();
  });

  it('marks the card of a done place', () => {
    render(
      <PlaceList
        places={[{ ...makePlace('a', 'Café Jean'), isDone: true }]}
        selectedId={null}
        onSelect={vi.fn()}
        onToggleDone={vi.fn()}
      />,
    );
    expect(screen.getByRole('listitem')).toHaveClass('done');
    expect(screen.getByRole('button', { name: 'Mark as to do' })).toHaveClass('done');
  });

  it('shows the custom empty-state message', () => {
    render(
      <PlaceList
        places={[]}
        selectedId={null}
        onSelect={vi.fn()}
        onToggleDone={vi.fn()}
        emptyHint="All done!"
      />,
    );
    expect(screen.getByText('All done!')).toBeInTheDocument();
  });
});
