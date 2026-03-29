import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import SplashPage from './index';

describe('SplashPage', () => {
  it('renders the app name', () => {
    render(<SplashPage />);
    expect(screen.getByText('nRetail')).toBeInTheDocument();
  });

  it('renders a loading spinner', () => {
    render(<SplashPage />);
    expect(screen.getByLabelText('Loading')).toBeInTheDocument();
  });
});
