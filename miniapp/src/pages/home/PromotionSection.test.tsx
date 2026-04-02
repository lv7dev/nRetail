import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

import PromotionSection from './PromotionSection';

describe('PromotionSection', () => {
  it('renders at least 2 promotion cards', () => {
    render(<PromotionSection />);
    const cards = screen.getAllByRole('article');
    expect(cards.length).toBeGreaterThanOrEqual(2);
  });

  it('each card has text content', () => {
    render(<PromotionSection />);
    const cards = screen.getAllByRole('article');
    cards.forEach((card) => {
      expect(card.textContent?.trim()).not.toBe('');
    });
  });

  it('renders a horizontally scrollable container', () => {
    const { container } = render(<PromotionSection />);
    const scrollContainer = container.querySelector('.overflow-x-auto');
    expect(scrollContainer).not.toBeNull();
  });
});
