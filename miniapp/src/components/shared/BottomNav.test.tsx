import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import BottomNav from './BottomNav';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

// Mock Icon to avoid dynamic SVG imports
vi.mock('@/components/ui', () => ({
  Icon: ({ name }: { name: string }) => <span data-testid={`icon-${name}`} />,
  IconVariant: {},
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

// ResizeObserver mock (not available in jsdom)
const mockDisconnect = vi.fn();
const mockObserve = vi.fn();
let capturedCallback: ResizeObserverCallback | undefined;

vi.stubGlobal(
  'ResizeObserver',
  class {
    constructor(cb: ResizeObserverCallback) {
      capturedCallback = cb;
    }
    observe = mockObserve;
    disconnect = mockDisconnect;
    unobserve = vi.fn();
  },
);

const renderNav = (initialPath = '/') =>
  render(
    <MemoryRouter initialEntries={[initialPath]}>
      <BottomNav />
    </MemoryRouter>,
  );

describe('BottomNav', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    mockDisconnect.mockClear();
    mockObserve.mockClear();
    capturedCallback = undefined;
  });

  afterEach(() => {
    document.documentElement.style.removeProperty('--bottom-nav-height');
  });

  it('renders exactly 4 tabs', () => {
    renderNav();
    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(4);
  });

  it('renders all four tab labels using i18n keys', () => {
    renderNav();
    expect(screen.getByText('nav.home')).toBeInTheDocument();
    expect(screen.getByText('nav.order')).toBeInTheDocument();
    expect(screen.getByText('nav.outlet')).toBeInTheDocument();
    expect(screen.getByText('nav.account')).toBeInTheDocument();
  });

  it('does not render old tabs', () => {
    renderNav();
    expect(screen.queryByText('nav.products')).not.toBeInTheDocument();
    expect(screen.queryByText('nav.cart')).not.toBeInTheDocument();
    expect(screen.queryByText('nav.orders')).not.toBeInTheDocument();
    expect(screen.queryByText('nav.profile')).not.toBeInTheDocument();
  });

  it('Home tab is active when pathname is /', () => {
    renderNav('/');
    const homeBtn = screen.getByRole('button', { name: /home/i });
    expect(homeBtn.className).toMatch(/text-primary/);
    expect(homeBtn.className).toMatch(/font-bold/);
  });

  it('Home tab is NOT active at /orders', () => {
    renderNav('/orders');
    const homeBtn = screen.getByRole('button', { name: /home/i });
    expect(homeBtn.className).toMatch(/font-normal/);
    expect(homeBtn.className).not.toMatch(/text-primary/);
  });

  it('Order tab is active when pathname starts with /orders', () => {
    renderNav('/orders/123');
    const orderBtn = screen.getByRole('button', { name: /order/i });
    expect(orderBtn.className).toMatch(/text-primary/);
    expect(orderBtn.className).toMatch(/font-bold/);
  });

  it('Outlet tab is active when pathname starts with /outlet-detail', () => {
    renderNav('/outlet-detail');
    const outletBtn = screen.getByRole('button', { name: /outlet/i });
    expect(outletBtn.className).toMatch(/text-primary/);
    expect(outletBtn.className).toMatch(/font-bold/);
  });

  it('Account tab is active when pathname starts with /account', () => {
    renderNav('/account/settings');
    const accountBtn = screen.getByRole('button', { name: /account/i });
    expect(accountBtn.className).toMatch(/text-primary/);
    expect(accountBtn.className).toMatch(/font-bold/);
  });

  it('navigates to / on Home tab click', async () => {
    renderNav('/orders');
    await userEvent.click(screen.getByRole('button', { name: /home/i }));
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  it('navigates to /orders on Order tab click', async () => {
    renderNav('/');
    await userEvent.click(screen.getByRole('button', { name: /order/i }));
    expect(mockNavigate).toHaveBeenCalledWith('/orders');
  });

  it('navigates to /outlet-detail on Outlet tab click', async () => {
    renderNav('/');
    await userEvent.click(screen.getByRole('button', { name: /outlet/i }));
    expect(mockNavigate).toHaveBeenCalledWith('/outlet-detail');
  });

  it('navigates to /account on Account tab click', async () => {
    renderNav('/');
    await userEvent.click(screen.getByRole('button', { name: /account/i }));
    expect(mockNavigate).toHaveBeenCalledWith('/account');
  });

  it('inactive tab buttons have text-content-muted class', () => {
    renderNav('/');
    const orderBtn = screen.getByRole('button', { name: /order/i });
    expect(orderBtn.className).toMatch(/text-content-muted/);
  });

  it('nav container has dark mode classes', () => {
    const { container } = renderNav();
    const nav = container.querySelector('nav')!;
    expect(nav.className).toMatch(/dark:bg-surface-dark/);
    expect(nav.className).toMatch(/dark:border-border-dark/);
  });

  it('no cart badge is rendered', () => {
    renderNav('/');
    const badges = screen.queryAllByText(/^\d+$/);
    expect(badges).toHaveLength(0);
  });

  it('sets --bottom-nav-height CSS variable on mount via ResizeObserver', () => {
    renderNav();
    expect(mockObserve).toHaveBeenCalled();
    const mockEntry = { contentRect: { height: 54 } } as unknown as ResizeObserverEntry;
    capturedCallback!([mockEntry], {} as ResizeObserver);
    expect(document.documentElement.style.getPropertyValue('--bottom-nav-height')).toBe('54px');
  });

  it('disconnects ResizeObserver on unmount', () => {
    const { unmount } = renderNav();
    unmount();
    expect(mockDisconnect).toHaveBeenCalled();
  });
});
