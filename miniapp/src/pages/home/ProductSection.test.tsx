import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

import ProductSection from './ProductSection';
import type { ProductCardData } from './ProductCard';

const PRODUCTS: ProductCardData[] = [
  { name: 'Saigon CHILL 330 Can', code: 'P00001', unit: 'Carton' },
  { name: 'Saigon LAGER 330 Can', code: 'P00003', unit: 'Carton' },
];

describe('ProductSection', () => {
  it('renders all product cards', () => {
    render(<ProductSection products={PRODUCTS} />);
    expect(screen.getByText('Saigon CHILL 330 Can')).toBeInTheDocument();
    expect(screen.getByText('Saigon LAGER 330 Can')).toBeInTheDocument();
  });

  it('does not render pagination when showPagination is false', () => {
    const { container } = render(<ProductSection products={PRODUCTS} />);
    expect(container.querySelector('[data-testid="pagination"]')).toBeNull();
  });

  it('renders pagination when showPagination is true', () => {
    const { container } = render(<ProductSection products={PRODUCTS} showPagination />);
    expect(container.querySelector('[data-testid="pagination"]')).toBeInTheDocument();
  });
});
