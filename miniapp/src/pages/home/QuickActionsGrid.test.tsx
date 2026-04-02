import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));
vi.mock('@/components/ui', () => ({
  Icon: ({ name }: { name: string }) => <span data-testid={`icon-${name}`} />,
}));

import QuickActionsGrid from './QuickActionsGrid';

describe('QuickActionsGrid', () => {
  it('renders 4 action tiles with correct i18n label keys', () => {
    render(<QuickActionsGrid />);

    expect(screen.getByText('quickActions.outletManagement')).toBeInTheDocument();
    expect(screen.getByText('quickActions.suggestedOrder')).toBeInTheDocument();
    expect(screen.getByText('quickActions.tradePrograms')).toBeInTheDocument();
    expect(screen.getByText('quickActions.orderHistory')).toBeInTheDocument();
  });

  it('renders 4 buttons', () => {
    render(<QuickActionsGrid />);
    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(4);
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
    // Icons are rendered — at least 4 icon spans
    const icons = screen.getAllByTestId(/^icon-/);
    expect(icons.length).toBeGreaterThanOrEqual(4);
  });
});
