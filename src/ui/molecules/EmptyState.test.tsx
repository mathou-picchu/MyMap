import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import EmptyState from './EmptyState';

describe('EmptyState', () => {
  it('affiche icône, texte et action', () => {
    render(
      <EmptyState icon={<span data-testid="icon" />} action={<button type="button">Ajouter</button>}>
        Aucun point <span className="ha-accent">pour l'instant</span>.
      </EmptyState>,
    );
    expect(screen.getByTestId('icon')).toBeInTheDocument();
    expect(screen.getByText(/aucun point/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Ajouter' })).toBeInTheDocument();
  });
});
