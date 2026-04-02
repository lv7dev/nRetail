import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

import OutletActionButtons from './OutletActionButtons';

describe('OutletActionButtons', () => {
  it('renders the order control button', () => {
    render(<OutletActionButtons />);
    expect(screen.getByRole('button', { name: 'actions.orderControl' })).toBeInTheDocument();
  });

  it('renders the deactivate button', () => {
    render(<OutletActionButtons />);
    expect(screen.getByRole('button', { name: 'actions.deactivate' })).toBeInTheDocument();
  });

  it('calls onOrderControl when order control button is clicked', async () => {
    const onOrderControl = vi.fn();
    render(<OutletActionButtons onOrderControl={onOrderControl} />);
    await userEvent.click(screen.getByRole('button', { name: 'actions.orderControl' }));
    expect(onOrderControl).toHaveBeenCalledOnce();
  });

  it('calls onDeactivate when deactivate button is clicked', async () => {
    const onDeactivate = vi.fn();
    render(<OutletActionButtons onDeactivate={onDeactivate} />);
    await userEvent.click(screen.getByRole('button', { name: 'actions.deactivate' }));
    expect(onDeactivate).toHaveBeenCalledOnce();
  });

  it('deactivate button has destructive styling', () => {
    render(<OutletActionButtons />);
    const btn = screen.getByRole('button', { name: 'actions.deactivate' });
    expect(btn.className).toMatch(/text-destructive|border-destructive/);
  });
});
