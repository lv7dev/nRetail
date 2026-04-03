import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

import ProductCard from './ProductCard';

const defaultProps = {
  name: 'Saigon CHILL 330 Can',
  code: 'P00001',
  unit: 'Carton',
};

describe('ProductCard', () => {
  it('renders product name', () => {
    render(<ProductCard {...defaultProps} />);
    expect(screen.getByText('Saigon CHILL 330 Can')).toBeInTheDocument();
  });

  it('renders product code with label', () => {
    render(<ProductCard {...defaultProps} />);
    expect(screen.getByText(/products\.code/)).toBeInTheDocument();
    expect(screen.getByText(/P00001/)).toBeInTheDocument();
  });

  it('renders unit with label', () => {
    render(<ProductCard {...defaultProps} />);
    expect(screen.getByText(/products\.unit/)).toBeInTheDocument();
    expect(screen.getByText(/Carton/)).toBeInTheDocument();
  });

  it('renders add to cart button', () => {
    render(<ProductCard {...defaultProps} />);
    expect(screen.getByRole('button', { name: 'products.addToCart' })).toBeInTheDocument();
  });

  it('calls onAddToCart when button is clicked', async () => {
    const user = userEvent.setup();
    const onAddToCart = vi.fn();
    render(<ProductCard {...defaultProps} onAddToCart={onAddToCart} />);
    await user.click(screen.getByRole('button', { name: 'products.addToCart' }));
    expect(onAddToCart).toHaveBeenCalledOnce();
  });

  it('renders image placeholder when no image provided', () => {
    const { container } = render(<ProductCard {...defaultProps} />);
    expect(container.querySelector('[data-testid="product-image"]')).toBeInTheDocument();
  });

  it('renders actual image when src provided', () => {
    render(<ProductCard {...defaultProps} imageSrc="https://example.com/img.png" />);
    expect(screen.getByRole('img', { name: 'Saigon CHILL 330 Can' })).toBeInTheDocument();
  });
});
