import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import OrdersPage from './orders';

describe('OrdersPage', () => {
  it('renders without error', () => {
    render(<OrdersPage />);
    expect(screen.getByRole('heading', { name: 'Orders' })).toBeInTheDocument();
  });
});
