import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

import BrandSection from './BrandSection';

describe('BrandSection', () => {
  it('renders 3 brand items', () => {
    render(<BrandSection />);
    const brands = screen.getAllByRole('listitem');
    expect(brands).toHaveLength(3);
  });

  it('renders brand names', () => {
    render(<BrandSection />);
    expect(screen.getByText('CHILL')).toBeInTheDocument();
    expect(screen.getByText('SPECIAL')).toBeInTheDocument();
    expect(screen.getByText('LAGER')).toBeInTheDocument();
  });

  it('renders a horizontally scrollable container', () => {
    const { container } = render(<BrandSection />);
    expect(container.querySelector('.overflow-x-auto')).not.toBeNull();
  });

  it('renders logo boxes with fixed width', () => {
    const { container } = render(<BrandSection />);
    const logoBoxes = container.querySelectorAll('[data-testid="brand-logo"]');
    expect(logoBoxes).toHaveLength(3);
  });
});
