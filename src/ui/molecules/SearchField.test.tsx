import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import SearchField from './SearchField';

const searchAddressMock = vi.hoisted(() => vi.fn());
vi.mock('../../geocoding', () => ({ searchAddress: searchAddressMock }));

const tourEiffel = {
  name: 'Tour Eiffel',
  address: '5 Avenue Anatole France, Paris',
  lat: 48.85,
  lng: 2.29,
};

describe('SearchField', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('affiche les résultats après saisie et déclenche onSelect', async () => {
    searchAddressMock.mockResolvedValue([tourEiffel]);
    const onSelect = vi.fn();
    render(<SearchField onSelect={onSelect} />);
    await userEvent.type(screen.getByPlaceholderText(/rechercher/i), 'tour eiffel');
    const button = await screen.findByRole('button', { name: /tour eiffel — 5 avenue/i });
    await userEvent.click(button);
    expect(onSelect).toHaveBeenCalledWith(tourEiffel);
  });

  it('affiche une erreur si la recherche échoue', async () => {
    searchAddressMock.mockRejectedValue(new Error('indisponible'));
    render(<SearchField onSelect={vi.fn()} />);
    await userEvent.type(screen.getByPlaceholderText(/rechercher/i), 'tour eiffel');
    expect(await screen.findByText(/recherche indisponible/i)).toBeInTheDocument();
  });

  it('affiche le spinner pendant le debounce puis remplace par les résultats', async () => {
    vi.useFakeTimers();
    searchAddressMock.mockResolvedValue([tourEiffel]);
    render(<SearchField onSelect={vi.fn()} />);
    const input = screen.getByLabelText(/rechercher une adresse/i);
    fireEvent.change(input, { target: { value: 'tour eiffel' } });
    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(screen.getByRole('status')).toBeInTheDocument();
    await act(async () => {
      vi.advanceTimersByTime(200);
    });
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /tour eiffel — 5 avenue/i })).toBeInTheDocument();
  });

  it('vide le champ et ferme le dropdown après sélection', async () => {
    vi.useFakeTimers();
    searchAddressMock.mockResolvedValue([tourEiffel]);
    const onSelect = vi.fn();
    render(<SearchField onSelect={onSelect} />);
    const input = screen.getByLabelText(/rechercher une adresse/i);
    fireEvent.change(input, { target: { value: 'tour eiffel' } });
    await act(async () => {
      vi.advanceTimersByTime(400);
    });
    fireEvent.click(screen.getByRole('button', { name: /tour eiffel — 5 avenue/i }));
    expect(onSelect).toHaveBeenCalledWith(tourEiffel);
    expect(input).toHaveValue('');
    expect(screen.queryByRole('button', { name: /tour eiffel — 5 avenue/i })).not.toBeInTheDocument();
  });

  it('ferme le dropdown et repasse en idle sous 3 caractères', async () => {
    vi.useFakeTimers();
    searchAddressMock.mockResolvedValue([tourEiffel]);
    render(<SearchField onSelect={vi.fn()} />);
    const input = screen.getByLabelText(/rechercher une adresse/i);
    fireEvent.change(input, { target: { value: 'tour eiffel' } });
    await act(async () => {
      vi.advanceTimersByTime(400);
    });
    expect(screen.getByRole('button', { name: /tour eiffel — 5 avenue/i })).toBeInTheDocument();
    fireEvent.change(input, { target: { value: 'to' } });
    expect(screen.queryByRole('button', { name: /tour eiffel — 5 avenue/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('ferme le dropdown avec Escape sans vider le champ', async () => {
    vi.useFakeTimers();
    searchAddressMock.mockResolvedValue([tourEiffel]);
    render(<SearchField onSelect={vi.fn()} />);
    const input = screen.getByLabelText(/rechercher une adresse/i);
    fireEvent.change(input, { target: { value: 'tour eiffel' } });
    await act(async () => {
      vi.advanceTimersByTime(400);
    });
    expect(screen.getByRole('button', { name: /tour eiffel — 5 avenue/i })).toBeInTheDocument();
    fireEvent.keyDown(input, { key: 'Escape' });
    expect(screen.queryByRole('button', { name: /tour eiffel — 5 avenue/i })).not.toBeInTheDocument();
    expect(input).toHaveValue('tour eiffel');
  });
});
