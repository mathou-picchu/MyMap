import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import ImgThumb from './ImgThumb';

describe('ImgThumb', () => {
  it('affiche une image depuis un Blob', () => {
    render(<ImgThumb blob={new Blob(['x'])} />);
    const img = screen.getByAltText('');
    expect(img.getAttribute('src')).toMatch(/^blob:/);
  });

  it('affiche le contenu de secours sans Blob', () => {
    render(<ImgThumb blob={null} fallback={<span>secours</span>} />);
    expect(screen.getByText('secours')).toBeInTheDocument();
  });

  it('révoque l\'object URL au démontage', () => {
    const revoke = vi.spyOn(URL, 'revokeObjectURL');
    const { unmount } = render(<ImgThumb blob={new Blob(['x'])} />);
    unmount();
    expect(revoke).toHaveBeenCalled();
  });
});
