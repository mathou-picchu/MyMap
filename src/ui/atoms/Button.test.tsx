import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import Button from './Button';

describe('Button', () => {
  it('applique variante et taille par classes', () => {
    render(
      <Button variant="accent" size="lg">
        Go
      </Button>,
    );
    const btn = screen.getByRole('button', { name: 'Go' });
    expect(btn).toHaveClass('ha-button--accent');
    expect(btn).toHaveClass('ha-button--lg');
  });

  it('désactive pendant le chargement', () => {
    render(
      <Button loading>
        Go
      </Button>,
    );
    const btn = screen.getByRole('button', { name: 'Go' });
    expect(btn).toBeDisabled();
    expect(btn).toHaveAttribute('aria-busy', 'true');
    const spinner = btn.querySelector('.ha-spinner');
    expect(spinner).not.toBeNull();
    expect(spinner?.parentElement).toHaveAttribute('aria-hidden', 'true');
  });

  it('transmet type submit', () => {
    render(
      <Button type="submit">
        Ok
      </Button>,
    );
    expect(screen.getByRole('button', { name: 'Ok' })).toHaveAttribute('type', 'submit');
  });
});
