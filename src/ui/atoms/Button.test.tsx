import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import Button from './Button';

describe('Button', () => {
  it('applies variant and size via classes', () => {
    render(
      <Button variant="accent" size="lg">
        Go
      </Button>,
    );
    const btn = screen.getByRole('button', { name: 'Go' });
    expect(btn).toHaveClass('ha-button--accent');
    expect(btn).toHaveClass('ha-button--lg');
  });

  it('is disabled while loading', () => {
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

  it('passes the submit type', () => {
    render(
      <Button type="submit">
        Ok
      </Button>,
    );
    expect(screen.getByRole('button', { name: 'Ok' })).toHaveAttribute('type', 'submit');
  });
});
