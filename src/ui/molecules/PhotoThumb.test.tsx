import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import PhotoThumb from './PhotoThumb';

describe('PhotoThumb', () => {
  it('shows a remove button when onRemove is provided', async () => {
    const onRemove = vi.fn();
    render(<PhotoThumb blob={new Blob(['x'])} onRemove={onRemove} />);
    await userEvent.click(screen.getByRole('button', { name: 'Remove photo' }));
    expect(onRemove).toHaveBeenCalledTimes(1);
  });

  it('does not show a button without onRemove', () => {
    render(<PhotoThumb blob={new Blob(['x'])} />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
