import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('@/components/ui', () => ({
  Icon: ({ name }: { name: string }) => <span data-testid={`icon-${name}`} />,
  SectionHeader: ({ title }: { title: string }) => <div data-testid="section-header">{title}</div>,
}));

vi.mock('./SearchBar', () => ({
  default: () => <div data-testid="search-bar" />,
}));

vi.mock('./QuickActionsGrid', () => ({
  default: () => <div data-testid="quick-actions-grid" />,
}));

vi.mock('./BannerCarousel', () => ({
  default: ({ alt }: { alt: string }) => <div data-testid="banner-carousel" aria-label={alt} />,
}));

vi.mock('./PromotionSection', () => ({
  default: () => <div data-testid="promotion-section" />,
}));

vi.mock('./BrandSection', () => ({
  default: () => <div data-testid="brand-section" />,
}));

vi.mock('./ProductSection', () => ({
  default: () => <div data-testid="product-section" />,
}));

vi.mock('./TabbedProductSection', () => ({
  default: () => <div data-testid="tabbed-product-section" />,
}));

import HomePage from './index';

const renderPage = () =>
  render(
    <MemoryRouter>
      <HomePage />
    </MemoryRouter>,
  );

describe('HomePage', () => {
  it('renders the search bar', () => {
    renderPage();
    expect(screen.getByTestId('search-bar')).toBeInTheDocument();
  });

  it('renders the quick actions grid', () => {
    renderPage();
    expect(screen.getByTestId('quick-actions-grid')).toBeInTheDocument();
  });

  it('renders the banner carousel', () => {
    renderPage();
    expect(screen.getByTestId('banner-carousel')).toBeInTheDocument();
  });

  it('renders the promotion section', () => {
    renderPage();
    expect(screen.getByTestId('promotion-section')).toBeInTheDocument();
  });

  it('renders the brand section', () => {
    renderPage();
    expect(screen.getByTestId('brand-section')).toBeInTheDocument();
  });

  it('renders product sections', () => {
    renderPage();
    expect(screen.getAllByTestId('product-section').length).toBeGreaterThanOrEqual(1);
  });

  it('renders the tabbed product section', () => {
    renderPage();
    expect(screen.getByTestId('tabbed-product-section')).toBeInTheDocument();
  });

  it('renders section headers with i18n keys', () => {
    renderPage();
    const headers = screen.getAllByTestId('section-header');
    expect(headers.length).toBeGreaterThanOrEqual(5);
  });
});
