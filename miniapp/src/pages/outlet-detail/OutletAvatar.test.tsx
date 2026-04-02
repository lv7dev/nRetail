import { render, screen } from '@testing-library/react';
import OutletAvatar from './OutletAvatar';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('@/components/ui', () => ({
  Icon: ({ name }: { name: string }) => <span data-testid={`icon-${name}`} />,
}));

describe('OutletAvatar', () => {
  it('renders outlet name', () => {
    render(<OutletAvatar name="Quản Đại An" />);
    expect(screen.getByText('Quản Đại An')).toBeInTheDocument();
  });

  it('renders subtitle text', () => {
    render(<OutletAvatar name="Test Outlet" subtitle="subtitle" />);
    expect(screen.getByText('subtitle')).toBeInTheDocument();
  });

  it('renders globe icon as avatar placeholder', () => {
    render(<OutletAvatar name="Test Outlet" />);
    expect(screen.getByTestId('icon-globe')).toBeInTheDocument();
  });
});
