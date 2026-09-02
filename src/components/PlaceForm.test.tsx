import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import type { Place } from '../types';
import PlaceForm from './PlaceForm';

vi.mock('../photoUtils', () => ({
  compressPhoto: vi.fn(async (_file: Blob) => new Blob(['compresse'], { type: 'image/jpeg' })),
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
  it('refuse la soumission sans adresse', async () => {
    const { onSave } = renderForm();
    await userEvent.type(screen.getByLabelText(/nom \*/i), 'Parc des Buttes-Chaumont');
    await userEvent.click(screen.getByRole('button', { name: /créer/i }));
    expect(await screen.findByText(/l'adresse est obligatoire/i)).toBeInTheDocument();
    expect(onSave).not.toHaveBeenCalled();
  });

  it('refuse la soumission sans nom', async () => {
    const { onSave } = renderForm();
    await userEvent.type(screen.getByLabelText(/adresse \*/i), 'Paris');
    await userEvent.click(screen.getByRole('button', { name: /créer/i }));
    expect(await screen.findByText(/le nom est obligatoire/i)).toBeInTheDocument();
    expect(onSave).not.toHaveBeenCalled();
  });

  it('affiche le champ prix uniquement si non gratuit', async () => {
    renderForm();
    expect(screen.queryByLabelText(/^prix/i)).not.toBeInTheDocument();
    await userEvent.click(screen.getByLabelText(/gratuit/i));
    expect(screen.getByLabelText(/^prix/i)).toBeInTheDocument();
    await userEvent.click(screen.getByLabelText(/gratuit/i));
    expect(screen.queryByLabelText(/^prix/i)).not.toBeInTheDocument();
  });

  it('appelle onSave avec le point complet', async () => {
    const { onSave } = renderForm({
      draft: { ...draft, name: 'Tour Eiffel', address: 'Paris' },
    });
    await userEvent.selectOptions(screen.getByLabelText(/^type/i), 'visit');
    await userEvent.type(screen.getByLabelText(/horaires/i), 'Lun-Ven 9h-18h');
    await userEvent.click(screen.getByLabelText(/gratuit/i));
    await userEvent.type(screen.getByLabelText(/^prix/i), '12 €');
    await userEvent.click(screen.getByRole('button', { name: /créer/i }));
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

  it('pré-remplit le formulaire en édition', () => {
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
    expect(screen.getByLabelText(/nom \*/i)).toHaveValue('Musée d\'Orsay');
    expect(screen.getByRole('button', { name: /enregistrer/i })).toBeInTheDocument();
  });

  it('conserve le statut fait en édition', async () => {
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
    await userEvent.click(screen.getByRole('button', { name: /enregistrer/i }));
    await waitFor(() => expect(onSave).toHaveBeenCalledTimes(1));
    expect((onSave.mock.calls[0][0] as Place).isDone).toBe(true);
  });

  it('enregistre le milieu extérieur', async () => {
    const { onSave } = renderForm({
      draft: { ...draft, name: 'Parc des Buttes-Chaumont', address: 'Paris' },
    });
    await userEvent.click(screen.getByLabelText(/extérieur/i));
    await userEvent.click(screen.getByRole('button', { name: /créer/i }));
    await waitFor(() => expect(onSave).toHaveBeenCalledTimes(1));
    expect((onSave.mock.calls[0][0] as Place).isOutdoor).toBe(true);
  });

  it('pré-coche le milieu extérieur en édition et le conserve', async () => {
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
    expect(screen.getByLabelText(/extérieur/i)).toBeChecked();
    await userEvent.click(screen.getByRole('button', { name: /enregistrer/i }));
    await waitFor(() => expect(onSave).toHaveBeenCalledTimes(1));
    expect((onSave.mock.calls[0][0] as Place).isOutdoor).toBe(true);
  });

  it('ajoute une photo compressée avec miniature', async () => {
    renderForm();
    const file = new File(['abc'], 'photo.jpg', { type: 'image/jpeg' });
    await userEvent.upload(screen.getByLabelText(/photos/i), file);
    const img = await screen.findByAltText('');
    expect(img.getAttribute('src')).toMatch(/^blob:/);
  });

  it('annule avec Esc', () => {
    const { onCancel } = renderForm();
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onCancel).toHaveBeenCalled();
  });
});
