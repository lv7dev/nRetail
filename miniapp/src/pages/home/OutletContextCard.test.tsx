import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('@/components/ui', () => ({
  Icon: ({ name }: { name: string }) => <span data-testid={`icon-${name}`} />,
}));

vi.mock('@/store/useOutletStore', () => ({
  useOutletStore: (selector: (s: { selectedOutlet: { name: string } | null }) => unknown) =>
    selector({ selectedOutlet: { name: 'Test Outlet' } }),
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

import OutletContextCard from './OutletContextCard';

beforeEach(() => {
  vi.clearAllMocks();
  mockNavigate.mockClear();
});

describe('OutletContextCard', () => {
  it('renders outlet name and all 4 quick actions when expanded', () => {
    render(<OutletContextCard />);

    expect(screen.getByRole('button', { name: /test outlet/i })).toBeInTheDocument();
    expect(screen.getByText('quickActions.outletManagement')).toBeInTheDocument();
    expect(screen.getByText('quickActions.suggestedOrder')).toBeInTheDocument();
    expect(screen.getByText('quickActions.tradePrograms')).toBeInTheDocument();
    expect(screen.getByText('quickActions.orderHistory')).toBeInTheDocument();
  });

  it('hides the quick actions grid when collapsed', () => {
    render(<OutletContextCard collapsed />);

    expect(screen.getByRole('button', { name: /test outlet/i })).toBeInTheDocument();

    const actionsGrid = screen
      .getByText('quickActions.outletManagement')
      .closest('[class*="overflow-hidden"]');
    expect(actionsGrid).toBeInTheDocument();

    const animationWrapper = actionsGrid!.parentElement!;
    expect(animationWrapper).toHaveStyle({ gridTemplateRows: '0fr' });
  });

  it('navigates to /outlets when the expanded card header is tapped', async () => {
    const user = userEvent.setup();
    render(<OutletContextCard />);

    await user.click(screen.getByRole('button', { name: /test outlet/i }));

    expect(mockNavigate).toHaveBeenCalledWith('/outlets');
  });

  it('navigates to /outlets when the collapsed pill is tapped', async () => {
    const user = userEvent.setup();
    render(<OutletContextCard collapsed />);

    await user.click(screen.getByRole('button', { name: /test outlet/i }));

    expect(mockNavigate).toHaveBeenCalledWith('/outlets');
  });
});
