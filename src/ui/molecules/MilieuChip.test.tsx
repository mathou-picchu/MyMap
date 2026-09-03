import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import MilieuChip from './MilieuChip';

describe('MilieuChip', () => {
  it('shows the outdoor label', () => {
    render(<MilieuChip milieu="outdoor" />);
    expect(screen.getByText(/outdoor/i)).toBeInTheDocument();
  });

  it('shows the indoor label', () => {
    render(<MilieuChip milieu="indoor" />);
    expect(screen.getByText(/indoor/i)).toBeInTheDocument();
  });
});
