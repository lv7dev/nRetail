import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';

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

import QuickActionsGrid from './QuickActionsGrid';

beforeEach(() => {
  vi.clearAllMocks();
  mockNavigate.mockClear();
});

describe('QuickActionsGrid', () => {
  it('renders the outlet name from store', () => {
    render(<QuickActionsGrid />);
    expect(screen.getByText('Test Outlet')).toBeInTheDocument();
  });

  it('renders 4 action tiles with correct i18n label keys', () => {
    render(<QuickActionsGrid />);
    expect(screen.getByText('quickActions.outletManagement')).toBeInTheDocument();
    expect(screen.getByText('quickActions.suggestedOrder')).toBeInTheDocument();
    expect(screen.getByText('quickActions.tradePrograms')).toBeInTheDocument();
    expect(screen.getByText('quickActions.orderHistory')).toBeInTheDocument();
  });

  it('renders 4 action buttons plus the outlet header button', () => {
    render(<QuickActionsGrid />);
    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(5);
  });

  it('calls onAction with the correct key when a tile is clicked', async () => {
    const user = userEvent.setup();
    const onAction = vi.fn();
    render(<QuickActionsGrid onAction={onAction} />);

    await user.click(screen.getByText('quickActions.outletManagement'));
    expect(onAction).toHaveBeenCalledWith('outletManagement');

    await user.click(screen.getByText('quickActions.suggestedOrder'));
    expect(onAction).toHaveBeenCalledWith('suggestedOrder');
  });

  it('renders an icon for each action tile', () => {
    render(<QuickActionsGrid />);
    const icons = screen.getAllByTestId(/^icon-/);
    expect(icons.length).toBeGreaterThanOrEqual(4);
  });

  it('tapping the outlet header row navigates to /outlets', async () => {
    const user = userEvent.setup();
    render(<QuickActionsGrid />);
    await user.click(screen.getByRole('button', { name: /test outlet/i }));
    expect(mockNavigate).toHaveBeenCalledWith('/outlets');
  });

  it('renders a chevron-right icon in the outlet header row', () => {
    render(<QuickActionsGrid />);
    expect(screen.getByTestId('icon-chevron-right')).toBeInTheDocument();
  });
});
