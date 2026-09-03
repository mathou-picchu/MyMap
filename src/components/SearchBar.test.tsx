import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import SearchBar from './SearchBar';

const searchAddressMock = vi.hoisted(() => vi.fn());
vi.mock('../geocoding', () => ({ searchAddress: searchAddressMock }));

describe('SearchBar', () => {
  it('shows results after typing and triggers onSelect', async () => {
    searchAddressMock.mockResolvedValue([
      { name: 'Tour Eiffel', address: '5 Avenue Anatole France, Paris', lat: 48.85, lng: 2.29 },
    ]);
    const onSelect = vi.fn();
    render(<SearchBar onSelect={onSelect} />);
    await userEvent.type(screen.getByPlaceholderText(/search an address/i), 'tour eiffel');
    const button = await screen.findByRole('button', { name: /tour eiffel — 5 avenue/i });
    await userEvent.click(button);
    expect(onSelect).toHaveBeenCalledWith({
      name: 'Tour Eiffel',
      address: '5 Avenue Anatole France, Paris',
      lat: 48.85,
      lng: 2.29,
    });
  });

  it('shows an error when search fails', async () => {
    searchAddressMock.mockRejectedValue(new Error('indisponible'));
    render(<SearchBar onSelect={vi.fn()} />);
    await userEvent.type(screen.getByPlaceholderText(/search an address/i), 'tour eiffel');
    expect(await screen.findByText(/search unavailable/i)).toBeInTheDocument();
  });
});
