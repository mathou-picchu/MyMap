import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import DoneToggle from './DoneToggle';

describe('DoneToggle', () => {
  it('round variant: aria-label depends on state and done class', () => {
    const { rerender } = render(<DoneToggle done={false} onToggle={() => {}} variant="round" />);
    expect(screen.getByRole('button', { name: 'Mark as done' })).not.toHaveClass('done');
    rerender(<DoneToggle done onToggle={() => {}} variant="round" />);
    const btn = screen.getByRole('button', { name: 'Mark as to do' });
    expect(btn).toHaveClass('done');
    expect(btn).toHaveAttribute('aria-pressed', 'true');
  });

  it('line variant: label depends on state', () => {
    const { rerender } = render(<DoneToggle done={false} onToggle={() => {}} variant="line" />);
    expect(screen.getByRole('button', { name: '✓ Mark as done' })).toBeInTheDocument();
    rerender(<DoneToggle done onToggle={() => {}} variant="line" />);
    expect(screen.getByRole('button', { name: '✓ Done' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '✓ Done' })).toHaveAttribute('aria-pressed', 'true');
  });

  it('triggers onToggle', async () => {
    const onToggle = vi.fn();
    render(<DoneToggle done={false} onToggle={onToggle} variant="round" />);
    await userEvent.click(screen.getByRole('button', { name: 'Mark as done' }));
    expect(onToggle).toHaveBeenCalledTimes(1);
  });
});
