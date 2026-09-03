import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import Badge from './Badge';

describe('Badge', () => {
  it('shows its content with the type class', () => {
    render(<Badge color="visit">Visit</Badge>);
    expect(screen.getByText('Visit')).toHaveClass('ha-badge--visit');
  });

  it('shows an icon before the content', () => {
    render(
      <Badge color="success" icon={<span data-testid="fake-icon" />}>
        Done
      </Badge>,
    );
    expect(screen.getByTestId('fake-icon')).toBeInTheDocument();
    expect(screen.getByText('Done')).toBeInTheDocument();
  });
});
