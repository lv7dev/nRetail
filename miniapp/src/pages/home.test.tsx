import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import HomePage from './home';

describe('HomePage', () => {
  it('renders without error', () => {
    render(<HomePage />);
    expect(screen.getByRole('heading', { name: 'Home' })).toBeInTheDocument();
  });
});
