import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import MilieuChip from './MilieuChip';

describe('MilieuChip', () => {
  it('affiche le label du milieu', () => {
    render(<MilieuChip milieu="outdoor" />);
    expect(screen.getByText(/extérieur/i)).toBeInTheDocument();
  });

  it('affiche le label du milieu intérieur', () => {
    render(<MilieuChip milieu="indoor" />);
    expect(screen.getByText(/intérieur/i)).toBeInTheDocument();
  });
});
