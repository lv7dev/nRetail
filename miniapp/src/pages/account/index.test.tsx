import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('@/components/ui', () => ({
  MenuListItem: ({ label, onClick }: { label: string; onClick: () => void }) => (
    <button onClick={onClick} data-testid="menu-list-item">
      {label}
    </button>
  ),
  Icon: ({ name }: { name: string }) => <span data-testid={`icon-${name}`} />,
}));

vi.mock('./AccountProfileHeader', () => ({
  default: ({ outletName, phone }: { outletName: string; phone: string }) => (
    <div data-testid="account-profile-header">
      <span>{outletName}</span>
      <span>{phone}</span>
    </div>
  ),
}));

const mockOutletState = { selectedOutlet: { name: 'Quán Đại An', id: '1' } };
vi.mock('@/store/useOutletStore', () => ({
  useOutletStore: (selector: (s: typeof mockOutletState) => unknown) => selector(mockOutletState),
}));

vi.mock('@/store/useAuthStore', () => ({
  useAuthStore: (selector: (s: { user: { phone: string } | null }) => unknown) =>
    selector({ user: { phone: '0901234567' } }),
}));

import AccountPage from './index';

const renderPage = () =>
  render(
    <MemoryRouter>
      <AccountPage />
    </MemoryRouter>,
  );

describe('AccountPage', () => {
  it('renders the profile header', () => {
    renderPage();
    expect(screen.getByTestId('account-profile-header')).toBeInTheDocument();
  });

  it('passes outlet name to profile header', () => {
    renderPage();
    expect(screen.getByText('Quán Đại An')).toBeInTheDocument();
  });

  it('passes phone to profile header', () => {
    renderPage();
    expect(screen.getByText('0901234567')).toBeInTheDocument();
  });

  it('renders menu items', () => {
    renderPage();
    const items = screen.getAllByTestId('menu-list-item');
    expect(items.length).toBeGreaterThanOrEqual(5);
  });

  it('renders the logout item', () => {
    renderPage();
    expect(screen.getByText('menu.logout')).toBeInTheDocument();
  });
});
