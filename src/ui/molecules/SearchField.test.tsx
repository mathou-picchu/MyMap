import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import SearchField from './SearchField';

const searchAddressMock = vi.hoisted(() => vi.fn());
vi.mock('../../geocoding', () => ({ searchAddress: searchAddressMock }));

describe('SearchField', () => {
  it('affiche les résultats après saisie et déclenche onSelect', async () => {
    searchAddressMock.mockResolvedValue([
      { name: 'Tour Eiffel', address: '5 Avenue Anatole France, Paris', lat: 48.85, lng: 2.29 },
    ]);
    const onSelect = vi.fn();
    render(<SearchField onSelect={onSelect} />);
    await userEvent.type(screen.getByPlaceholderText(/rechercher/i), 'tour eiffel');
    const button = await screen.findByRole('button', { name: /tour eiffel — 5 avenue/i });
    await userEvent.click(button);
    expect(onSelect).toHaveBeenCalledWith({
      name: 'Tour Eiffel',
      address: '5 Avenue Anatole France, Paris',
      lat: 48.85,
      lng: 2.29,
    });
  });

  it('affiche une erreur si la recherche échoue', async () => {
    searchAddressMock.mockRejectedValue(new Error('indisponible'));
    render(<SearchField onSelect={vi.fn()} />);
    await userEvent.type(screen.getByPlaceholderText(/rechercher/i), 'tour eiffel');
    expect(await screen.findByText(/recherche indisponible/i)).toBeInTheDocument();
  });
});
