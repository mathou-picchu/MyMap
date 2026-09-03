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

  it('shows results after typing and triggers onSelect', async () => {
    searchAddressMock.mockResolvedValue([tourEiffel]);
    const onSelect = vi.fn();
    render(<SearchField onSelect={onSelect} />);
    await userEvent.type(screen.getByPlaceholderText(/search/i), 'tour eiffel');
    const button = await screen.findByRole('button', { name: /tour eiffel — 5 avenue/i });
    await userEvent.click(button);
    expect(onSelect).toHaveBeenCalledWith(tourEiffel);
  });

  it('shows an error when the search fails', async () => {
    searchAddressMock.mockRejectedValue(new Error('unavailable'));
    render(<SearchField onSelect={vi.fn()} />);
    await userEvent.type(screen.getByPlaceholderText(/search/i), 'tour eiffel');
    expect(await screen.findByText(/search unavailable/i)).toBeInTheDocument();
  });

  it('shows the spinner during the debounce then replaces it with results', async () => {
    vi.useFakeTimers();
    searchAddressMock.mockResolvedValue([tourEiffel]);
    render(<SearchField onSelect={vi.fn()} />);
    const input = screen.getByLabelText(/search an address/i);
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

  it('clears the field and closes the dropdown after selection', async () => {
    vi.useFakeTimers();
    searchAddressMock.mockResolvedValue([tourEiffel]);
    const onSelect = vi.fn();
    render(<SearchField onSelect={onSelect} />);
    const input = screen.getByLabelText(/search an address/i);
    fireEvent.change(input, { target: { value: 'tour eiffel' } });
    await act(async () => {
      vi.advanceTimersByTime(400);
    });
    fireEvent.click(screen.getByRole('button', { name: /tour eiffel — 5 avenue/i }));
    expect(onSelect).toHaveBeenCalledWith(tourEiffel);
    expect(input).toHaveValue('');
    expect(screen.queryByRole('button', { name: /tour eiffel — 5 avenue/i })).not.toBeInTheDocument();
  });

  it('closes the dropdown and goes idle below 3 characters', async () => {
    vi.useFakeTimers();
    searchAddressMock.mockResolvedValue([tourEiffel]);
    render(<SearchField onSelect={vi.fn()} />);
    const input = screen.getByLabelText(/search an address/i);
    fireEvent.change(input, { target: { value: 'tour eiffel' } });
    await act(async () => {
      vi.advanceTimersByTime(400);
    });
    expect(screen.getByRole('button', { name: /tour eiffel — 5 avenue/i })).toBeInTheDocument();
    fireEvent.change(input, { target: { value: 'to' } });
    expect(screen.queryByRole('button', { name: /tour eiffel — 5 avenue/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('closes the dropdown with Escape without clearing the field', async () => {
    vi.useFakeTimers();
    searchAddressMock.mockResolvedValue([tourEiffel]);
    render(<SearchField onSelect={vi.fn()} />);
    const input = screen.getByLabelText(/search an address/i);
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
