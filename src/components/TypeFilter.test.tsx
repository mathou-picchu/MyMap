import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { PLACE_TYPES } from '../constants';
import type { PlaceTypeId } from '../types';
import TypeFilter from './TypeFilter';

function renderFilter(
  active: PlaceTypeId[],
  onToggle = vi.fn(),
  hideDone = false,
  onToggleHideDone = vi.fn(),
) {
  render(
    <TypeFilter
      active={new Set(active)}
      onToggle={onToggle}
      hideDone={hideDone}
      onToggleHideDone={onToggleHideDone}
    />,
  );
  return { onToggle, onToggleHideDone };
}

describe('TypeFilter', () => {
  it('affiche une pastille par type', () => {
    renderFilter(PLACE_TYPES.map((t) => t.id));
    for (const t of PLACE_TYPES) {
      expect(screen.getByRole('button', { name: new RegExp(t.label, 'i') })).toBeInTheDocument();
    }
  });

  it('marque les pastilles actives', () => {
    renderFilter(['restaurant', 'visit']);
    expect(screen.getByRole('button', { name: /restaurant/i })).toHaveClass('active');
    expect(screen.getByRole('button', { name: /balade/i })).not.toHaveClass('active');
  });

  it('appelle onToggle avec le type cliqué', async () => {
    const onToggle = vi.fn();
    renderFilter(['restaurant'], onToggle);
    await userEvent.click(screen.getByRole('button', { name: /gourmandise/i }));
    expect(onToggle).toHaveBeenCalledWith('gourmandise');
  });

  it('indique l\'état pressé', () => {
    renderFilter(['restaurant']);
    expect(screen.getByRole('button', { name: /restaurant/i })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: /visite/i })).toHaveAttribute('aria-pressed', 'false');
  });

  it('affiche la pilule « Masquer les faits » avec son état', () => {
    renderFilter(PLACE_TYPES.map((t) => t.id));
    const pill = screen.getByRole('button', { name: /masquer les faits/i });
    expect(pill).toHaveAttribute('aria-pressed', 'false');
  });

  it('déclenche onToggleHideDone au clic', async () => {
    const { onToggleHideDone } = renderFilter(['restaurant'], vi.fn(), true);
    const pill = screen.getByRole('button', { name: /masquer les faits/i });
    expect(pill).toHaveClass('active');
    await userEvent.click(pill);
    expect(onToggleHideDone).toHaveBeenCalled();
  });
});
