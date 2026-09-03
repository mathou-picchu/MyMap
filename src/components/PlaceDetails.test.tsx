import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import type { Place } from '../types';
import PlaceDetails from './PlaceDetails';

const place: Place = {
  id: 'p1',
  name: 'Tour Eiffel',
  address: '5 Avenue Anatole France, Paris',
  lat: 48.85,
  lng: 2.29,
  hours: 'Lun-Ven 9h-18h',
  isFree: false,
  price: '12 €',
  type: 'visit',
  photos: [{ id: 'ph1', blob: new Blob(['x'], { type: 'image/jpeg' }) }],
  createdAt: 1000,
  updatedAt: 1000,
};

function renderDetails() {
  const onBack = vi.fn();
  const onEdit = vi.fn();
  const onDelete = vi.fn();
  const onToggleDone = vi.fn();
  render(
    <PlaceDetails
      place={place}
      onBack={onBack}
      onEdit={onEdit}
      onDelete={onDelete}
      onToggleDone={onToggleDone}
    />,
  );
  return { onBack, onEdit, onDelete, onToggleDone };
}

describe('PlaceDetails', () => {
  it('displays all the information', () => {
    renderDetails();
    expect(screen.getByRole('heading', { name: 'Tour Eiffel' })).toBeInTheDocument();
    expect(screen.getByText(/5 Avenue Anatole France/)).toBeInTheDocument();
    expect(screen.getByText('Lun-Ven 9h-18h')).toBeInTheDocument();
    expect(screen.getByText('12 €')).toBeInTheDocument();
    expect(screen.getByText(/visit/i)).toBeInTheDocument();
  });

  it('asks for confirmation before deleting', async () => {
    const { onDelete } = renderDetails();
    await userEvent.click(screen.getByRole('button', { name: /^delete$/i }));
    expect(onDelete).not.toHaveBeenCalled();
    await userEvent.click(screen.getByRole('button', { name: /yes, delete/i }));
    expect(onDelete).toHaveBeenCalledWith('p1');
  });

  it('triggers edit', async () => {
    const { onEdit } = renderDetails();
    await userEvent.click(screen.getByRole('button', { name: /edit/i }));
    expect(onEdit).toHaveBeenCalled();
  });

  it('toggles done status from the details view', async () => {
    const { onToggleDone } = renderDetails();
    await userEvent.click(screen.getByRole('button', { name: '✓ Mark as done' }));
    expect(onToggleDone).toHaveBeenCalledWith('p1');
  });

  it('shows “✓ Done” for an already checked place', () => {
    render(
      <PlaceDetails
        place={{ ...place, isDone: true }}
        onBack={() => {}}
        onEdit={() => {}}
        onDelete={() => {}}
        onToggleDone={() => {}}
      />,
    );
    expect(screen.getByRole('button', { name: '✓ Done' })).toBeInTheDocument();
  });

  it('shows the indoor setting badge by default', () => {
    renderDetails();
    expect(screen.getByText(/indoor/i)).toBeInTheDocument();
  });

  it('shows the outdoor setting badge', () => {
    render(
      <PlaceDetails
        place={{ ...place, isOutdoor: true }}
        onBack={() => {}}
        onEdit={() => {}}
        onDelete={() => {}}
        onToggleDone={() => {}}
      />,
    );
    expect(screen.getByText(/outdoor/i)).toBeInTheDocument();
  });

  it('opens and closes the photo viewer', async () => {
    renderDetails();
    await userEvent.click(screen.getByRole('button', { name: /^view photo/i }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
