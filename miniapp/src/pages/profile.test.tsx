import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ProfilePage from './profile';

describe('ProfilePage', () => {
  it('renders without error', () => {
    render(<ProfilePage />);
    expect(screen.getByRole('heading', { name: 'Profile' })).toBeInTheDocument();
  });
});
