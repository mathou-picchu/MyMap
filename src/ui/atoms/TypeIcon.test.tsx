import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import TypeIcon from './TypeIcon';

describe('TypeIcon', () => {
  it('renders an svg for each type', () => {
    const types = [
      'visit',
      'balade',
      'restaurant',
      'gourmandise',
      'lodging',
      'shopping',
      'other',
    ] as const;
    for (const type of types) {
      const { container } = render(<TypeIcon type={type} />);
      expect(container.querySelector('svg')).toBeInTheDocument();
    }
  });
});
