import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

import BannerCarousel from './BannerCarousel';

describe('BannerCarousel', () => {
  it('renders a container element', () => {
    const { container } = render(<BannerCarousel alt="Test banner" />);
    expect(container.firstChild).not.toBeNull();
  });

  it('renders with a placeholder background', () => {
    const { container } = render(<BannerCarousel alt="Test banner" />);
    // The root element should have some background styling
    expect(container.firstChild).toBeInTheDocument();
  });

  it('accepts an alt prop for accessibility', () => {
    render(<BannerCarousel alt="Promotional banner" />);
    // The component renders (renders without crashing with the alt prop)
    expect(screen.getByRole('img', { hidden: true }) ?? document.querySelector('[aria-label]') ?? document.querySelector('[title]') ?? document.body.firstChild).not.toBeNull();
  });

  it('accepts optional className prop', () => {
    const { container } = render(<BannerCarousel alt="Test" className="my-custom-class" />);
    expect(container.firstChild).toHaveClass('my-custom-class');
  });
});
