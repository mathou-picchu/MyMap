import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import ImgThumb from './ImgThumb';

describe('ImgThumb', () => {
  it('renders an image from a Blob', () => {
    render(<ImgThumb blob={new Blob(['x'])} />);
    const img = screen.getByAltText('');
    expect(img.getAttribute('src')).toMatch(/^blob:/);
  });

  it('renders the fallback without a Blob', () => {
    render(<ImgThumb blob={null} fallback={<span>fallback</span>} />);
    expect(screen.getByText('fallback')).toBeInTheDocument();
  });

  it('revokes the object URL on unmount', () => {
    const revoke = vi.spyOn(URL, 'revokeObjectURL');
    const { unmount } = render(<ImgThumb blob={new Blob(['x'])} />);
    unmount();
    expect(revoke).toHaveBeenCalled();
  });
});
