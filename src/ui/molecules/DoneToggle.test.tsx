import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import DoneToggle from './DoneToggle';

describe('DoneToggle', () => {
  it("variante ronde : aria-label selon l'état et classe done", () => {
    const { rerender } = render(<DoneToggle done={false} onToggle={() => {}} variant="round" />);
    expect(screen.getByRole('button', { name: 'Marquer comme fait' })).not.toHaveClass('done');
    rerender(<DoneToggle done onToggle={() => {}} variant="round" />);
    const btn = screen.getByRole('button', { name: 'Marquer comme à faire' });
    expect(btn).toHaveClass('done');
    expect(btn).toHaveAttribute('aria-pressed', 'true');
  });

  it("variante ligne : libellé selon l'état", () => {
    const { rerender } = render(<DoneToggle done={false} onToggle={() => {}} variant="line" />);
    expect(screen.getByRole('button', { name: 'Marquer comme fait' })).toBeInTheDocument();
    rerender(<DoneToggle done onToggle={() => {}} variant="line" />);
    expect(screen.getByRole('button', { name: 'Fait' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Fait' })).toHaveAttribute('aria-pressed', 'true');
  });

  it('déclenche onToggle', async () => {
    const onToggle = vi.fn();
    render(<DoneToggle done={false} onToggle={onToggle} variant="round" />);
    await userEvent.click(screen.getByRole('button', { name: 'Marquer comme fait' }));
    expect(onToggle).toHaveBeenCalledTimes(1);
  });
});
