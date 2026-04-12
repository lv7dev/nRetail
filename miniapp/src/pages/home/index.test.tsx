import { act, render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { cloneElement, isValidElement, type ReactNode, type ReactElement } from 'react';
import { useCartStore } from '@/store/useCartStore';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('@/components/ui', () => ({
  Icon: ({ name }: { name: string }) => <span data-testid={`icon-${name}`} />,
  SectionHeader: ({ title }: { title: string }) => <div data-testid="section-header">{title}</div>,
  AppHeader: ({ title, right }: { title: string; right?: ReactNode }) => (
    <div data-testid="app-header">
      <span>{title}</span>
      <div data-testid="app-header-right">{right}</div>
    </div>
  ),
}));

vi.mock('./SearchBar', () => ({
  default: () => <div data-testid="search-bar" />,
}));

vi.mock('./OutletContextCard', () => ({
  default: ({ collapsed = false }: { collapsed?: boolean }) => (
    <div data-testid="outlet-context-card">{collapsed ? 'collapsed' : 'expanded'}</div>
  ),
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

const refetch = vi.fn();
vi.mock('./useHomeRefresh', () => ({
  useHomeRefresh: () => ({ refetch }),
}));

vi.mock('@/components/shared', () => ({
  CollapsibleHeader: ({
    topBar,
    children,
    card,
    collapsed,
    decoration,
  }: {
    topBar?: ReactNode;
    children?: ReactNode;
    card?: ReactElement<{ collapsed?: boolean }>;
    collapsed?: boolean;
    decoration?: ReactNode;
  }) => (
    <div data-testid="collapsible-header">
      <div data-testid="collapsible-top-bar">{topBar}</div>
      <div data-testid="collapsible-children">{children}</div>
      <div data-testid="collapsible-decoration">{decoration}</div>
      <div data-testid="collapsible-card">
        {isValidElement(card) ? cloneElement(card, { collapsed }) : card}
      </div>
    </div>
  ),
  ScrollablePage: ({
    children,
    onRefresh,
    onCollapsedChange,
  }: {
    children?: ReactNode;
    onRefresh?: () => void;
    onCollapsedChange?: (collapsed: boolean) => void;
  }) => (
    <div data-testid="scrollable-page">
      <button type="button" onClick={onRefresh}>
        trigger-refresh
      </button>
      <button type="button" onClick={() => onCollapsedChange?.(true)}>
        trigger-collapse
      </button>
      {children}
    </div>
  ),
}));

import HomePage from './index';

const renderPage = () =>
  render(
    <MemoryRouter>
      <HomePage />
    </MemoryRouter>,
  );

describe('HomePage', () => {
  it('shows the cart badge count in the AppHeader actions', () => {
    useCartStore.setState({
      items: [{ id: 'cart-1', name: 'Cart item', price: 10_000, quantity: 3 }],
    });

    renderPage();

    expect(screen.getByTestId('app-header-right')).toHaveTextContent('3');
    expect(screen.getByTestId('icon-cart-shopping')).toBeInTheDocument();
  });

  it('hides the cart badge when the cart is empty', () => {
    useCartStore.setState({ items: [] });

    renderPage();

    expect(screen.queryByTestId('cart-badge')).not.toBeInTheDocument();
  });

  it('renders the notification bell icon in the AppHeader actions', () => {
    renderPage();
    expect(screen.getByTestId('icon-bell')).toBeInTheDocument();
  });

  it('renders the collapsible header', () => {
    renderPage();
    expect(screen.getByTestId('collapsible-header')).toBeInTheDocument();
  });

  it('renders the search bar', () => {
    renderPage();
    expect(screen.getByTestId('search-bar')).toBeInTheDocument();
  });

  it('renders the outlet context card in the header card slot', () => {
    renderPage();
    expect(screen.getByTestId('outlet-context-card')).toBeInTheDocument();
    expect(screen.getByTestId('collapsible-card')).toContainElement(
      screen.getByTestId('outlet-context-card'),
    );
  });

  it('wraps the home sections in ScrollablePage', () => {
    renderPage();
    expect(screen.getByTestId('scrollable-page')).toBeInTheDocument();
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

  it('wires onRefresh to the home refetch hook', async () => {
    renderPage();
    screen.getByRole('button', { name: 'trigger-refresh' }).click();
    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it('collapses the outlet context card when ScrollablePage reports scrolled state', async () => {
    renderPage();

    expect(screen.getByTestId('outlet-context-card')).toHaveTextContent('expanded');

    await act(() => {
      screen.getByRole('button', { name: 'trigger-collapse' }).click();
    });

    expect(screen.getByTestId('outlet-context-card')).toHaveTextContent('collapsed');
  });

  it('passes the wave decoration into the collapsible header', () => {
    renderPage();
    expect(screen.getByTestId('collapsible-decoration').querySelector('img')).toBeInTheDocument();
  });
});
