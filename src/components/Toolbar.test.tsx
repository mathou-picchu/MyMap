import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import Toolbar from './Toolbar';

describe('Toolbar', () => {
  it('triggers export and locate', async () => {
    const onExport = vi.fn();
    const onLocate = vi.fn();
    render(<Toolbar onExport={onExport} onImport={vi.fn()} onLocate={onLocate} />);
    await userEvent.click(screen.getByRole('button', { name: /export/i }));
    expect(onExport).toHaveBeenCalled();
    await userEvent.click(screen.getByRole('button', { name: /locate me/i }));
    expect(onLocate).toHaveBeenCalled();
  });

  it('passes the chosen file to onImport', async () => {
    const onImport = vi.fn();
    const { container } = render(<Toolbar onExport={vi.fn()} onImport={onImport} onLocate={vi.fn()} />);
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(['{}'], 'export.json', { type: 'application/json' });
    await userEvent.upload(input, file);
    expect(onImport).toHaveBeenCalledWith(file);
  });
});
