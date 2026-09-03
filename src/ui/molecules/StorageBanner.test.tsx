import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import StorageBanner from './StorageBanner';

describe('StorageBanner', () => {
  it('est une alerte avec son contenu', () => {
    render(<StorageBanner>Stockage indisponible.</StorageBanner>);
    expect(screen.getByRole('alert')).toHaveTextContent('Stockage indisponible.');
  });
});
