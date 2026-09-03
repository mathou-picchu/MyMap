import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import EmptyState from './EmptyState';

describe('EmptyState', () => {
  it('shows icon, text and action', () => {
    render(
      <EmptyState icon={<span data-testid="icon" />} action={<button type="button">Add</button>}>
        No places <span className="ha-accent">just yet</span>.
      </EmptyState>,
    );
    expect(screen.getByTestId('icon')).toBeInTheDocument();
    expect(screen.getByText(/no places/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Add' })).toBeInTheDocument();
  });
});
