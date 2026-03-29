import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ProductsPage from './products';

describe('ProductsPage', () => {
  it('renders without error', () => {
    render(<ProductsPage />);
    expect(screen.getByRole('heading', { name: 'Products' })).toBeInTheDocument();
  });
});
