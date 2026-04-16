import { act, render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import {
  cloneElement,
  createContext,
  isValidElement,
  useContext,
  useState,
  type ReactNode,
  type ReactElement,
} from 'react';
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

const refetch = vi.fn();
const isRefreshing = false;
let lastScrollablePageOnRefresh: (() => void) | undefined;
let lastScrollablePageIsRefreshing: boolean | undefined;
vi.mock('./useHomeRefresh', () => ({
  useHomeRefresh: () => ({ refetch, isRefreshing }),
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
    isRefreshing,
    onCollapsedChange,
  }: {
    children?: ReactNode;
    onRefresh?: () => void;
    isRefreshing?: boolean;
    onCollapsedChange?: (collapsed: boolean) => void;
  }) => {
    lastScrollablePageOnRefresh = onRefresh;
    lastScrollablePageIsRefreshing = isRefreshing;

    return (
      <div data-testid="scrollable-page">
        <button type="button" onClick={onRefresh}>
          trigger-refresh
        </button>
        <button type="button" onClick={() => onCollapsedChange?.(true)}>
          trigger-collapse
        </button>
        {children}
      </div>
    );
  },
  TabbedView: (() => {
    interface TabContextValue {
      activeTab: string;
      onTabChange: (key: string) => void;
      tabs: { key: string; label: string }[];
    }

    const TabContext = createContext<TabContextValue | null>(null);

    const Root = ({
      children,
      tabs = [],
      defaultTab,
      activeTab,
      onTabChange,
    }: {
      children?: ReactNode;
      tabs?: { key: string; label: string }[];
      defaultTab?: string;
      activeTab?: string;
      onTabChange?: (key: string) => void;
    }) => {
      const [internalActiveTab, setInternalActiveTab] = useState(defaultTab ?? tabs[0]?.key ?? '');
      const currentActiveTab = activeTab ?? internalActiveTab;

      return (
        <TabContext.Provider
          value={{
            activeTab: currentActiveTab,
            tabs,
            onTabChange: (key: string) => {
              if (activeTab === undefined) {
                setInternalActiveTab(key);
              }
              onTabChange?.(key);
            },
          }}
        >
          {children}
        </TabContext.Provider>
      );
    };

    const TabBar = ({ className }: { className?: string }) => {
      const context = useContext(TabContext);
      if (!context) return null;

      return (
        <div data-testid="tabbed-view-tab-bar" className={className}>
          {context.tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              className={context.activeTab === tab.key ? 'bg-primary' : 'border'}
              onClick={() => context.onTabChange(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      );
    };

    const Panels = ({
      children,
      mode,
      outerScrollRef,
    }: {
      children?: ReactNode;
      mode: 'self' | 'outer';
      outerScrollRef?: { current: HTMLDivElement | null };
    }) => (
      <div
        data-testid="tabbed-view-panels"
        data-mode={mode}
        data-has-outer-scroll-ref={outerScrollRef ? 'true' : 'false'}
      >
        {children}
      </div>
    );

    const Panel = ({ tabKey, children }: { tabKey: string; children?: ReactNode }) => {
      const context = useContext(TabContext);
      if (!context) return null;

      return (
        <div style={context.activeTab === tabKey ? undefined : { display: 'none' }}>{children}</div>
      );
    };

    return Object.assign(Root, { TabBar, Panels, Panel });
  })(),
}));

import HomePage from './index';

const renderPage = () =>
  render(
    <MemoryRouter>
      <HomePage />
    </MemoryRouter>,
  );

describe('HomePage', () => {
  beforeEach(() => {
    refetch.mockClear();
    lastScrollablePageOnRefresh = undefined;
    lastScrollablePageIsRefreshing = undefined;
  });

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

  it('renders the home products section with TabbedView in outer mode', () => {
    renderPage();

    expect(screen.getByTestId('tabbed-view-panels')).toHaveAttribute('data-mode', 'outer');
    expect(screen.getByTestId('tabbed-view-panels')).toHaveAttribute(
      'data-has-outer-scroll-ref',
      'true',
    );
  });

  it('renders a sticky tab bar for the products section', () => {
    renderPage();

    expect(screen.getByTestId('tabbed-view-tab-bar')).toHaveClass('sticky', 'top-0');
  });

  it('switches between bought and viewed tabs', async () => {
    renderPage();

    const boughtTab = screen.getByRole('button', { name: 'products.boughtProducts' });
    const viewedTab = screen.getByRole('button', { name: 'products.viewedProducts' });

    expect(boughtTab).toHaveClass('bg-primary');
    expect(viewedTab).toHaveClass('border');

    await act(() => viewedTab.click());

    expect(viewedTab).toHaveClass('bg-primary');
  });

  it('renders section headers with i18n keys', () => {
    renderPage();
    const headers = screen.getAllByTestId('section-header');
    expect(headers.length).toBeGreaterThanOrEqual(5);
  });

  it('wires onRefresh to the home refetch hook', async () => {
    renderPage();
    expect(lastScrollablePageOnRefresh).toBe(refetch);
  });

  it('forwards isRefreshing from useHomeRefresh into ScrollablePage', () => {
    renderPage();
    expect(lastScrollablePageIsRefreshing).toBe(isRefreshing);
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
