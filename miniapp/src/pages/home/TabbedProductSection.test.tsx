import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

import TabbedProductSection from './TabbedProductSection';
import type { ProductCardData } from './ProductCard';

const PRODUCTS: ProductCardData[] = [
  { name: 'Saigon CHILL 330 Can', code: 'P00001', unit: 'Carton' },
];

describe('TabbedProductSection', () => {
  it('renders both tab labels', () => {
    render(<TabbedProductSection boughtProducts={PRODUCTS} viewedProducts={[]} />);
    expect(screen.getByText('products.boughtProducts')).toBeInTheDocument();
    expect(screen.getByText('products.viewedProducts')).toBeInTheDocument();
  });

  it('shows bought products tab as active by default', () => {
    render(<TabbedProductSection boughtProducts={PRODUCTS} viewedProducts={[]} />);
    const boughtTab = screen.getByRole('button', { name: 'products.boughtProducts' });
    expect(boughtTab).toHaveClass('bg-primary');
  });

  it('shows bought products content by default', () => {
    render(<TabbedProductSection boughtProducts={PRODUCTS} viewedProducts={[]} />);
    expect(screen.getByText('Saigon CHILL 330 Can')).toBeInTheDocument();
  });

  it('switches to viewed products when that tab is clicked', async () => {
    const user = userEvent.setup();
    const viewed: ProductCardData[] = [
      { name: 'Saigon LAGER 330 Can', code: 'P00003', unit: 'Carton' },
    ];
    render(<TabbedProductSection boughtProducts={PRODUCTS} viewedProducts={viewed} />);

    await user.click(screen.getByRole('button', { name: 'products.viewedProducts' }));
    expect(screen.getByText('Saigon LAGER 330 Can')).toBeInTheDocument();
    expect(screen.queryByText('Saigon CHILL 330 Can')).not.toBeInTheDocument();
  });

  it('marks the active tab with primary style', async () => {
    const user = userEvent.setup();
    render(<TabbedProductSection boughtProducts={PRODUCTS} viewedProducts={[]} />);

    const viewedTab = screen.getByRole('button', { name: 'products.viewedProducts' });
    await user.click(viewedTab);
    expect(viewedTab).toHaveClass('bg-primary');
  });

  it('keeps bought products active when the bought tab is clicked again', async () => {
    const user = userEvent.setup();
    render(<TabbedProductSection boughtProducts={PRODUCTS} viewedProducts={[]} />);

    const boughtTab = screen.getByRole('button', { name: 'products.boughtProducts' });
    await user.click(boughtTab);

    expect(boughtTab).toHaveClass('bg-primary');
  });
});
