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
  render(<PlaceDetails place={place} onBack={onBack} onEdit={onEdit} onDelete={onDelete} />);
  return { onBack, onEdit, onDelete };
}

describe('PlaceDetails', () => {
  it('affiche toutes les informations', () => {
    renderDetails();
    expect(screen.getByRole('heading', { name: 'Tour Eiffel' })).toBeInTheDocument();
    expect(screen.getByText(/5 Avenue Anatole France/)).toBeInTheDocument();
    expect(screen.getByText('Lun-Ven 9h-18h')).toBeInTheDocument();
    expect(screen.getByText('12 €')).toBeInTheDocument();
    expect(screen.getByText(/visite/i)).toBeInTheDocument();
  });

  it('demande confirmation avant suppression', async () => {
    const { onDelete } = renderDetails();
    await userEvent.click(screen.getByRole('button', { name: /^supprimer$/i }));
    expect(onDelete).not.toHaveBeenCalled();
    await userEvent.click(screen.getByRole('button', { name: /oui, supprimer/i }));
    expect(onDelete).toHaveBeenCalledWith('p1');
  });

  it('déclenche la modification', async () => {
    const { onEdit } = renderDetails();
    await userEvent.click(screen.getByRole('button', { name: /modifier/i }));
    expect(onEdit).toHaveBeenCalled();
  });

  it('ouvre et ferme la visionneuse photo', async () => {
    renderDetails();
    await userEvent.click(screen.getByRole('button', { name: /^voir la photo/i }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
