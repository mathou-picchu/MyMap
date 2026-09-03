import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import Pill from './Pill';

describe('Pill', () => {
  it('marks the active state via class and aria-pressed', () => {
    render(<Pill active>Restaurant</Pill>);
    const pill = screen.getByRole('button', { name: 'Restaurant' });
    expect(pill).toHaveClass('active');
    expect(pill).toHaveAttribute('aria-pressed', 'true');
  });

  it('applies the requested color', () => {
    render(<Pill color="balade">Walk</Pill>);
    expect(screen.getByRole('button', { name: 'Walk' })).toHaveClass('ha-pill--balade');
  });

  it('is not active by default', () => {
    render(<Pill>Visit</Pill>);
    const pill = screen.getByRole('button', { name: 'Visit' });
    expect(pill).not.toHaveClass('active');
    expect(pill).toHaveAttribute('aria-pressed', 'false');
  });
});
