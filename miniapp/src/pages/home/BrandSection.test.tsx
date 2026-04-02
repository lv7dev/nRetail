import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

import BrandSection from './BrandSection';

describe('BrandSection', () => {
  it('renders 3 brand items', () => {
    render(<BrandSection />);
    const brands = screen.getAllByRole('listitem');
    expect(brands).toHaveLength(3);
  });

  it('renders brand names: 333, BIA SAIGON, BIA LẠC VIỆT', () => {
    render(<BrandSection />);
    // Use selector:'span' to target the name label, not the initials circle which may share the same text
    expect(screen.getByText('333', { selector: 'span' })).toBeInTheDocument();
    expect(screen.getByText('BIA SAIGON', { selector: 'span' })).toBeInTheDocument();
    expect(screen.getByText('BIA LẠC VIỆT', { selector: 'span' })).toBeInTheDocument();
  });

  it('renders a horizontally scrollable container', () => {
    const { container } = render(<BrandSection />);
    const scrollContainer = container.querySelector('.overflow-x-auto');
    expect(scrollContainer).not.toBeNull();
  });
});
