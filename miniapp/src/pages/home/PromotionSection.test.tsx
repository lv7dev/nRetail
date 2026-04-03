import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

import PromotionSection from './PromotionSection';

describe('PromotionSection', () => {
  it('renders at least 2 promotion cards', () => {
    render(<PromotionSection />);
    const cards = screen.getAllByRole('article');
    expect(cards.length).toBeGreaterThanOrEqual(2);
  });

  it('renders a horizontally scrollable container', () => {
    const { container } = render(<PromotionSection />);
    expect(container.querySelector('.overflow-x-auto')).not.toBeNull();
  });

  it('each card has fixed dimensions for horizontal scroll', () => {
    render(<PromotionSection />);
    const cards = screen.getAllByRole('article');
    cards.forEach((card) => {
      expect(card).toHaveClass('w-72');
    });
  });
});
