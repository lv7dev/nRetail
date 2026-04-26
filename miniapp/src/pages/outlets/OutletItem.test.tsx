import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { Outlet } from '@/types/outlet';
import { OutletItem } from './OutletItem';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

vi.mock('@/components/ui', () => ({
  Button: ({
    children,
    ...props
  }: React.ButtonHTMLAttributes<HTMLButtonElement> & { children: React.ReactNode }) => (
    <button type="button" {...props}>
      {children}
    </button>
  ),
  Icon: ({ name }: { name: string }) => <span data-testid={`icon-${name}`} />,
}));

const connectedOutlet: Outlet = {
  id: 'outlet-1',
  name: 'Main Store',
  code: 'CU000014603',
  address: '123 Main St, District 1',
  imageUrl: 'https://example.com/outlets/main-store.jpg',
  role: 'OWNER',
};

const notConnectedOutlet: Outlet = {
  id: 'outlet-2',
  name: 'Panda Shop',
  code: null,
  address: '456 Panda Ave, District 2',
  imageUrl: null,
  role: null,
};

describe('OutletItem', () => {
  it('renders the outlet image when imageUrl is provided', () => {
    render(<OutletItem outlet={connectedOutlet} connected />);

    expect(screen.getByRole('img', { name: /Main Store/i })).toHaveAttribute(
      'src',
      'https://example.com/outlets/main-store.jpg',
    );
  });

  it('renders initials fallback when imageUrl is missing', () => {
    render(<OutletItem outlet={notConnectedOutlet} connected={false} />);

    expect(screen.getByText('PS')).toBeInTheDocument();
  });

  it('renders the outlet code when present', () => {
    render(<OutletItem outlet={connectedOutlet} connected />);

    expect(screen.getByText('CU000014603')).toBeInTheDocument();
  });

  it('does not render actions for connected outlets', () => {
    render(<OutletItem outlet={connectedOutlet} connected />);

    expect(screen.queryByText('outlets.notMyOutlet')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'outlets.connect' })).not.toBeInTheDocument();
  });

  it('renders outlined reject button and connect button for pending outlets', () => {
    render(
      <OutletItem
        outlet={{ ...notConnectedOutlet, membershipStatus: 'PENDING' }}
        connected={false}
      />,
    );

    expect(screen.getByRole('button', { name: 'outlets.notMyOutlet' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'outlets.connect' })).toBeInTheDocument();
  });

  it('renders informational label and connect button only for rejected outlets', () => {
    render(
      <OutletItem
        outlet={{ ...notConnectedOutlet, membershipStatus: 'REJECTED' }}
        connected={false}
      />,
    );

    expect(screen.getByText('outlets.notMyOutlet')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'outlets.connect' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'outlets.notMyOutlet' })).not.toBeInTheDocument();
  });

  it('stops click propagation when connect button is clicked', async () => {
    const user = userEvent.setup();
    const parentClick = vi.fn();

    render(
      <div role="button" onClick={parentClick}>
        <OutletItem
          outlet={{ ...notConnectedOutlet, membershipStatus: 'PENDING' }}
          connected={false}
        />
      </div>,
    );

    await user.click(screen.getByRole('button', { name: 'outlets.connect' }));

    expect(parentClick).not.toHaveBeenCalled();
  });

  it('calls onReject without bubbling for pending outlets', async () => {
    const user = userEvent.setup();
    const parentClick = vi.fn();
    const onReject = vi.fn();

    render(
      <div role="button" onClick={parentClick}>
        <OutletItem
          outlet={{ ...notConnectedOutlet, membershipStatus: 'PENDING' }}
          connected={false}
          onReject={onReject}
        />
      </div>,
    );

    await user.click(screen.getByRole('button', { name: 'outlets.notMyOutlet' }));

    expect(onReject).toHaveBeenCalledTimes(1);
    expect(parentClick).not.toHaveBeenCalled();
  });
});
