import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import CartPage from './cart';

describe('CartPage', () => {
  it('renders without error', () => {
    render(<CartPage />);
    expect(screen.getByRole('heading', { name: 'Cart' })).toBeInTheDocument();
  });
});
