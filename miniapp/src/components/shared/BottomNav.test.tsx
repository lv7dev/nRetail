import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import BottomNav from './BottomNav';
import { useCartStore, cartItemCount } from '@/store/useCartStore';

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

const renderNav = (initialPath = '/') =>
  render(
    <MemoryRouter initialEntries={[initialPath]}>
      <BottomNav />
    </MemoryRouter>,
  );

describe('BottomNav', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    useCartStore.setState({ items: [] });
  });

  it('renders all five tabs', () => {
    renderNav();
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Products')).toBeInTheDocument();
    expect(screen.getByText('Cart')).toBeInTheDocument();
    expect(screen.getByText('Orders')).toBeInTheDocument();
    expect(screen.getByText('Profile')).toBeInTheDocument();
  });

  it('applies active style to Home tab at root path', () => {
    renderNav('/');
    const homeBtn = screen.getByRole('button', { name: /home/i });
    expect(homeBtn).toHaveStyle({ fontWeight: 700 });
  });

  it('applies active style to Products tab at /products sub-path', () => {
    renderNav('/products/123');
    const productsBtn = screen.getByRole('button', { name: /products/i });
    expect(productsBtn).toHaveStyle({ fontWeight: 700 });
  });

  it('Home is NOT active at /products', () => {
    renderNav('/products');
    const homeBtn = screen.getByRole('button', { name: /home/i });
    expect(homeBtn).toHaveStyle({ fontWeight: 400 });
  });

  it('navigates to /products on Products tab click', async () => {
    renderNav();
    await userEvent.click(screen.getByRole('button', { name: /products/i }));
    expect(mockNavigate).toHaveBeenCalledWith('/products');
  });

  it('navigates to / on Home tab click', async () => {
    renderNav('/products');
    await userEvent.click(screen.getByRole('button', { name: /home/i }));
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  it('shows cart badge when cart has items', () => {
    useCartStore.setState({
      items: [{ id: 'a', name: 'Item', price: 100, quantity: 2 }],
    });
    renderNav();
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('hides cart badge when cart is empty', () => {
    renderNav();
    // Cart count badge should not be present
    expect(screen.queryByText('0')).not.toBeInTheDocument();
    // No numeric badge visible
    const badges = screen.queryAllByText(/^\d+$/);
    expect(badges).toHaveLength(0);
  });

  it('nav container has dark mode classes', () => {
    const { container } = renderNav();
    const nav = container.querySelector('nav')!;
    expect(nav.className).toMatch(/dark:bg-surface-dark/);
    expect(nav.className).toMatch(/dark:border-border-dark/);
  });
});
