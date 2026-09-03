import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { PLACE_TYPES } from '../constants';
import type { MilieuId, PlaceTypeId } from '../types';
import TypeFilter from './TypeFilter';

function renderFilter(
  active: PlaceTypeId[],
  onToggle = vi.fn(),
  activeMilieu: MilieuId[] = ['outdoor', 'indoor'],
  onToggleMilieu = vi.fn(),
  hideDone = false,
  onToggleHideDone = vi.fn(),
) {
  render(
    <TypeFilter
      active={new Set(active)}
      onToggle={onToggle}
      activeMilieu={new Set(activeMilieu)}
      onToggleMilieu={onToggleMilieu}
      hideDone={hideDone}
      onToggleHideDone={onToggleHideDone}
    />,
  );
  return { onToggle, onToggleMilieu, onToggleHideDone };
}

describe('TypeFilter', () => {
  it('renders one pill per type', () => {
    renderFilter(PLACE_TYPES.map((t) => t.id));
    for (const t of PLACE_TYPES) {
      expect(screen.getByRole('button', { name: new RegExp(t.label, 'i') })).toBeInTheDocument();
    }
  });

  it('marks active pills', () => {
    renderFilter(['restaurant', 'visit']);
    expect(screen.getByRole('button', { name: /restaurant/i })).toHaveClass('active');
    expect(screen.getByRole('button', { name: /walk/i })).not.toHaveClass('active');
  });

  it('calls onToggle with the clicked type', async () => {
    const onToggle = vi.fn();
    renderFilter(['restaurant'], onToggle);
    await userEvent.click(screen.getByRole('button', { name: /dessert/i }));
    expect(onToggle).toHaveBeenCalledWith('gourmandise');
  });

  it('indicates pressed state', () => {
    renderFilter(['restaurant']);
    expect(screen.getByRole('button', { name: /restaurant/i })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: /visit/i })).toHaveAttribute('aria-pressed', 'false');
  });

  it('renders the Hide done pill with its state', () => {
    renderFilter(PLACE_TYPES.map((t) => t.id));
    const pill = screen.getByRole('button', { name: /hide done/i });
    expect(pill).toHaveAttribute('aria-pressed', 'false');
  });

  it('groups setting segments and Hide done in a modifiers zone', () => {
    renderFilter(PLACE_TYPES.map((t) => t.id), vi.fn(), ['outdoor']);
    const modifiers = screen.getByRole('group', { name: 'Filter modifiers' });
    expect(modifiers).toBeInTheDocument();
    expect(modifiers).toContainElement(screen.getByRole('button', { name: /outdoor/i }));
    expect(modifiers).toContainElement(screen.getByRole('button', { name: /hide done/i }));
    expect(screen.getByRole('button', { name: /outdoor/i })).toHaveClass('active');
    expect(screen.getByRole('button', { name: /indoor/i })).not.toHaveClass('active');
  });

  it('renders setting pills active by default', () => {
    renderFilter(PLACE_TYPES.map((t) => t.id));
    expect(screen.getByRole('button', { name: /outdoor/i })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: /indoor/i })).toHaveAttribute('aria-pressed', 'true');
  });

  it('triggers onToggleMilieu on click', async () => {
    const { onToggleMilieu } = renderFilter([], vi.fn(), ['indoor']);
    expect(screen.getByRole('button', { name: /outdoor/i })).toHaveAttribute('aria-pressed', 'false');
    await userEvent.click(screen.getByRole('button', { name: /outdoor/i }));
    expect(onToggleMilieu).toHaveBeenCalledWith('outdoor');
  });

  it('triggers onToggleHideDone on click', async () => {
    const { onToggleHideDone } = renderFilter(['restaurant'], vi.fn(), ['outdoor', 'indoor'], vi.fn(), true);
    const pill = screen.getByRole('button', { name: /hide done/i });
    expect(pill).toHaveClass('active');
    await userEvent.click(pill);
    expect(onToggleHideDone).toHaveBeenCalled();
  });
});
