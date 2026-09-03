import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import StorageBanner from './StorageBanner';

describe('StorageBanner', () => {
  it('is an alert with its content', () => {
    render(<StorageBanner>Storage unavailable.</StorageBanner>);
    expect(screen.getByRole('alert')).toHaveTextContent('Storage unavailable.');
  });
});
