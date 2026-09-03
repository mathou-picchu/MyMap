import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import type { Place } from '../types';
import PlaceForm from './PlaceForm';

vi.mock('../photoUtils', () => ({
  compressPhoto: vi.fn(async (_file: Blob) => new Blob(['compressed'], { type: 'image/jpeg' })),
}));

const draft = { lat: 48.85, lng: 2.29 };

function renderForm(props: Partial<Parameters<typeof PlaceForm>[0]> = {}) {
  const onCancel = vi.fn();
  const onSave = vi.fn().mockResolvedValue(undefined);
  render(
    <PlaceForm
      place={null}
      draft={draft}
      onCancel={onCancel}
      onSave={onSave}
      {...props}
    />,
  );
  return { onCancel, onSave };
}

describe('PlaceForm', () => {
  it('rejects submission without an address', async () => {
    const { onSave } = renderForm();
    await userEvent.type(screen.getByLabelText(/name \*/i), 'Parc des Buttes-Chaumont');
    await userEvent.click(screen.getByRole('button', { name: /create/i }));
    expect(await screen.findByText(/address is required/i)).toBeInTheDocument();
    expect(onSave).not.toHaveBeenCalled();
  });

  it('rejects submission without a name', async () => {
    const { onSave } = renderForm();
    await userEvent.type(screen.getByLabelText(/address \*/i), 'Paris');
    await userEvent.click(screen.getByRole('button', { name: /create/i }));
    expect(await screen.findByText(/name is required/i)).toBeInTheDocument();
    expect(onSave).not.toHaveBeenCalled();
  });

  it('shows the price field only when not free', async () => {
    renderForm();
    expect(screen.queryByLabelText(/^price/i)).not.toBeInTheDocument();
    await userEvent.click(screen.getByLabelText(/^free$/i));
    expect(screen.getByLabelText(/^price/i)).toBeInTheDocument();
    await userEvent.click(screen.getByLabelText(/^free$/i));
    expect(screen.queryByLabelText(/^price/i)).not.toBeInTheDocument();
  });

  it('calls onSave with the complete place', async () => {
    const { onSave } = renderForm({
      draft: { ...draft, name: 'Tour Eiffel', address: 'Paris' },
    });
    await userEvent.selectOptions(screen.getByLabelText(/^type/i), 'visit');
    await userEvent.type(screen.getByLabelText(/opening hours/i), 'Lun-Ven 9h-18h');
    await userEvent.click(screen.getByLabelText(/^free$/i));
    await userEvent.type(screen.getByLabelText(/^price/i), '12 €');
    await userEvent.click(screen.getByRole('button', { name: /create/i }));
    await waitFor(() => expect(onSave).toHaveBeenCalledTimes(1));
    const saved = onSave.mock.calls[0][0] as Place;
    expect(saved).toMatchObject({
      name: 'Tour Eiffel',
      address: 'Paris',
      lat: 48.85,
      lng: 2.29,
      type: 'visit',
      hours: 'Lun-Ven 9h-18h',
      isFree: false,
      price: '12 €',
    });
    expect(saved.id).toBeTruthy();
    expect(saved.createdAt).toBeGreaterThan(0);
    expect(saved.isDone).toBe(false);
    expect(saved.isOutdoor).toBe(false);
  });

  it('pre-fills the form in edit mode', () => {
    renderForm({
      place: {
        id: 'p1',
        name: 'Musée d\'Orsay',
        address: 'Paris',
        lat: 1,
        lng: 2,
        isFree: false,
        price: '16 €',
        type: 'visit',
        photos: [],
        createdAt: 1000,
        updatedAt: 1000,
      },
      draft: null,
    });
    expect(screen.getByLabelText(/name \*/i)).toHaveValue('Musée d\'Orsay');
    expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
  });

  it('keeps the done status in edit mode', async () => {
    const { onSave } = renderForm({
      place: {
        id: 'p1',
        name: 'Musée d\'Orsay',
        address: 'Paris',
        lat: 1,
        lng: 2,
        isFree: false,
        price: '16 €',
        type: 'visit',
        photos: [],
        isDone: true,
        createdAt: 1000,
        updatedAt: 1000,
      },
      draft: null,
    });
    await userEvent.click(screen.getByRole('button', { name: /save/i }));
    await waitFor(() => expect(onSave).toHaveBeenCalledTimes(1));
    expect((onSave.mock.calls[0][0] as Place).isDone).toBe(true);
  });

  it('saves the outdoor setting', async () => {
    const { onSave } = renderForm({
      draft: { ...draft, name: 'Parc des Buttes-Chaumont', address: 'Paris' },
    });
    await userEvent.click(screen.getByLabelText(/^outdoor$/i));
    await userEvent.click(screen.getByRole('button', { name: /create/i }));
    await waitFor(() => expect(onSave).toHaveBeenCalledTimes(1));
    expect((onSave.mock.calls[0][0] as Place).isOutdoor).toBe(true);
  });

  it('pre-checks the outdoor setting in edit mode and keeps it', async () => {
    const { onSave } = renderForm({
      place: {
        id: 'p1',
        name: 'Parc Montsouris',
        address: 'Paris',
        lat: 1,
        lng: 2,
        isFree: true,
        type: 'balade',
        photos: [],
        isOutdoor: true,
        createdAt: 1000,
        updatedAt: 1000,
      },
      draft: null,
    });
    expect(screen.getByLabelText(/^outdoor$/i)).toBeChecked();
    await userEvent.click(screen.getByRole('button', { name: /save/i }));
    await waitFor(() => expect(onSave).toHaveBeenCalledTimes(1));
    expect((onSave.mock.calls[0][0] as Place).isOutdoor).toBe(true);
  });

  it('adds a compressed photo with a thumbnail', async () => {
    renderForm();
    const file = new File(['abc'], 'photo.jpg', { type: 'image/jpeg' });
    await userEvent.upload(screen.getByLabelText(/photos/i), file);
    const img = await screen.findByAltText('');
    expect(img.getAttribute('src')).toMatch(/^blob:/);
  });

  it('cancels with Esc', () => {
    const { onCancel } = renderForm();
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onCancel).toHaveBeenCalled();
  });
});
