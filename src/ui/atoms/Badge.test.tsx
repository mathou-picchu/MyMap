import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import Badge from './Badge';

describe('Badge', () => {
  it('affiche son contenu avec la classe du type', () => {
    render(<Badge color="visit">Visite</Badge>);
    expect(screen.getByText('Visite')).toHaveClass('ha-badge--visit');
  });

  it('affiche une icône devant le contenu', () => {
    render(
      <Badge color="success" icon={<span data-testid="fake-icon" />}>
        Fait
      </Badge>,
    );
    expect(screen.getByTestId('fake-icon')).toBeInTheDocument();
    expect(screen.getByText('Fait')).toBeInTheDocument();
  });
});
