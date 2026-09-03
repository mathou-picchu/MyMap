import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import type { Place } from '../../types';
import PlaceCard from './PlaceCard';

const place: Place = {
  id: 'p1',
  name: 'Café Jean',
  address: '10 rue de la Paix, Paris',
  lat: 48.86,
  lng: 2.33,
  isFree: true,
  type: 'restaurant',
  photos: [],
  createdAt: 0,
  updatedAt: 0,
};

describe('PlaceCard', () => {
  it('shows the name (card-title class) and address', () => {
    render(<PlaceCard place={place} selected={false} onSelect={() => {}} onToggleDone={() => {}} />);
    expect(screen.getByText('Café Jean')).toHaveClass('card-title');
    expect(screen.getByText(/10 rue de la Paix/)).toBeInTheDocument();
  });

  it('selects on click and toggles done', async () => {
    const onSelect = vi.fn();
    const onToggleDone = vi.fn();
    render(
      <PlaceCard place={place} selected={false} onSelect={onSelect} onToggleDone={onToggleDone} />,
    );
    await userEvent.click(screen.getByRole('button', { name: /café jean/i }));
    expect(onSelect).toHaveBeenCalledWith('p1');
    await userEvent.click(screen.getByRole('button', { name: 'Mark as done' }));
    expect(onToggleDone).toHaveBeenCalledWith('p1');
  });
});
