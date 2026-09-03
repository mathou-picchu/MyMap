import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import PhotoThumb from './PhotoThumb';

describe('PhotoThumb', () => {
  it('affiche un bouton de suppression quand onRemove est fourni', async () => {
    const onRemove = vi.fn();
    render(<PhotoThumb blob={new Blob(['x'])} onRemove={onRemove} />);
    await userEvent.click(screen.getByRole('button', { name: 'Retirer la photo' }));
    expect(onRemove).toHaveBeenCalledTimes(1);
  });

  it("n'affiche pas de bouton sans onRemove", () => {
    render(<PhotoThumb blob={new Blob(['x'])} />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
