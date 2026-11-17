import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { Thumb } from './Thumb.js';

describe('Thumb', () => {
  it('minimal props: no src shows the placeholder named by alt, md size, 1:1 ratio', () => {
    const { container } = render(<Thumb alt="Example thumb" />);
    expect(screen.getByRole('img', { name: 'Example thumb' })).toBeInTheDocument();
    expect(container.querySelector('img')).toBeNull();
    expect(container.querySelector('.rds-thumb--empty svg')).not.toBeNull();
    expect(container.querySelector('.rds-thumb')).toHaveClass('rds-thumb--md', 'rds-thumb--ratio-1-1');
  });

  it('every prop: src, size, ratio and fallback', () => {
    const { container } = render(<Thumb src="https://example.invalid/a.png" alt="Example image" size="lg" ratio="16:9" />);
    const img = screen.getByRole('img', { name: 'Example image' });
    expect(img.tagName).toBe('IMG');
    expect(img).toHaveAttribute('src', 'https://example.invalid/a.png');
    expect(img).toHaveAttribute('loading', 'lazy');
    expect(img).toHaveClass('rds-thumb--lg', 'rds-thumb--ratio-16-9');
    expect(container.querySelector('.rds-thumb--empty')).toBeNull();
  });

  it('fallback replaces the default placeholder icon', () => {
    const { container } = render(<Thumb alt="Example thumb" fallback="Example fallback" />);
    expect(screen.getByRole('img', { name: 'Example thumb' })).toHaveTextContent('Example fallback');
    expect(container.querySelector('svg')).toBeNull();
  });

  it('a failed image shows the fallback instead of a broken image', () => {
    const { container } = render(<Thumb src="https://example.invalid/missing.png" alt="Example image" fallback="Example fallback" />);
    fireEvent.error(container.querySelector('img') as HTMLImageElement);
    expect(screen.getByRole('img', { name: 'Example image' })).toHaveTextContent('Example fallback');
    expect(container.querySelector('img')).toBeNull();
  });
});
