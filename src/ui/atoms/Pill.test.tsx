import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import Pill from './Pill';

describe('Pill', () => {
  it("marque l'état actif par classe et aria-pressed", () => {
    render(<Pill active>Restaurant</Pill>);
    const pill = screen.getByRole('button', { name: 'Restaurant' });
    expect(pill).toHaveClass('active');
    expect(pill).toHaveAttribute('aria-pressed', 'true');
  });

  it('applique la couleur demandée', () => {
    render(<Pill color="balade">Balade</Pill>);
    expect(screen.getByRole('button', { name: 'Balade' })).toHaveClass('ha-pill--balade');
  });

  it("n'est pas actif par défaut", () => {
    render(<Pill>Visite</Pill>);
    const pill = screen.getByRole('button', { name: 'Visite' });
    expect(pill).not.toHaveClass('active');
    expect(pill).toHaveAttribute('aria-pressed', 'false');
  });
});
