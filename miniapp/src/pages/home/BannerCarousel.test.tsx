import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

import BannerCarousel from './BannerCarousel';

describe('BannerCarousel', () => {
  it('renders a container element', () => {
    const { container } = render(<BannerCarousel alt="Test banner" />);
    expect(container.firstChild).not.toBeNull();
  });

  it('renders with accessible label', () => {
    render(<BannerCarousel alt="Promotional banner" />);
    expect(screen.getByRole('img', { name: 'Promotional banner' })).toBeInTheDocument();
  });

  it('accepts optional className prop', () => {
    const { container } = render(<BannerCarousel alt="Test" className="my-custom-class" />);
    expect(container.firstChild).toHaveClass('my-custom-class');
  });

  it('renders pagination dots', () => {
    const { container } = render(<BannerCarousel alt="Test banner" totalSlides={6} />);
    const dots = container.querySelectorAll('[data-testid="banner-dot"]');
    expect(dots).toHaveLength(6);
  });

  it('highlights the active dot', () => {
    const { container } = render(
      <BannerCarousel alt="Test banner" totalSlides={3} activeSlide={1} />,
    );
    const dots = container.querySelectorAll('[data-testid="banner-dot"]');
    expect(dots[1]).toHaveClass('bg-destructive');
    expect(dots[0]).not.toHaveClass('bg-destructive');
  });
});
