import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ProfilePage from './profile';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

const mockClearAuth = vi.fn();
vi.mock('@/store/useAuthStore', () => ({
  useAuthStore: (selector: (s: { clearAuth: () => void }) => unknown) =>
    selector({ clearAuth: mockClearAuth }),
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (k: string) => k }),
}));

vi.mock('@/components/shared/ThemeSwitcher', () => ({
  ThemeSwitcher: () => <div data-testid="theme-switcher" />,
}));

describe('ProfilePage', () => {
  it('renders without error', () => {
    render(
      <MemoryRouter>
        <ProfilePage />
      </MemoryRouter>,
    );
    expect(screen.getByRole('heading', { name: 'Profile' })).toBeInTheDocument();
  });

  it('logout button calls clearAuth and navigates to /login', () => {
    render(
      <MemoryRouter>
        <ProfilePage />
      </MemoryRouter>,
    );
    fireEvent.click(screen.getByTestId('logout-btn'));
    expect(mockClearAuth).toHaveBeenCalledOnce();
    expect(mockNavigate).toHaveBeenCalledWith('/login', { replace: true });
  });

  it('renders theme settings row with label and ThemeSwitcher', () => {
    render(
      <MemoryRouter>
        <ProfilePage />
      </MemoryRouter>,
    );
    expect(screen.getByText('theme')).toBeInTheDocument();
    expect(screen.getByTestId('theme-switcher')).toBeInTheDocument();
  });

  it('theme label span has dark mode class', () => {
    render(
      <MemoryRouter>
        <ProfilePage />
      </MemoryRouter>,
    );
    const themeLabel = screen.getByText('theme');
    expect(themeLabel.className).toMatch(/dark:text-content-dark/);
  });
});
