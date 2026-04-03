import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TabBar } from './TabBar';

const tabs = [
  { key: 'overview', label: 'Overview' },
  { key: 'details', label: 'Details' },
  { key: 'reviews', label: 'Reviews' },
];

describe('TabBar', () => {
  it('renders all tab labels', () => {
    render(<TabBar tabs={tabs} activeTab="overview" onChange={vi.fn()} />);
    expect(screen.getByText('Overview')).toBeInTheDocument();
    expect(screen.getByText('Details')).toBeInTheDocument();
    expect(screen.getByText('Reviews')).toBeInTheDocument();
  });

  it('active tab has aria-selected="true"', () => {
    render(<TabBar tabs={tabs} activeTab="details" onChange={vi.fn()} />);
    expect(screen.getByRole('tab', { name: 'Details' })).toHaveAttribute('aria-selected', 'true');
  });

  it('inactive tabs have aria-selected="false"', () => {
    render(<TabBar tabs={tabs} activeTab="details" onChange={vi.fn()} />);
    expect(screen.getByRole('tab', { name: 'Overview' })).toHaveAttribute('aria-selected', 'false');
    expect(screen.getByRole('tab', { name: 'Reviews' })).toHaveAttribute('aria-selected', 'false');
  });

  it('clicking an inactive tab calls onChange with its key', async () => {
    const onChange = vi.fn();
    render(<TabBar tabs={tabs} activeTab="overview" onChange={onChange} />);
    await userEvent.click(screen.getByRole('tab', { name: 'Details' }));
    expect(onChange).toHaveBeenCalledWith('details');
  });

  it('clicking the active tab does NOT call onChange', async () => {
    const onChange = vi.fn();
    render(<TabBar tabs={tabs} activeTab="overview" onChange={onChange} />);
    await userEvent.click(screen.getByRole('tab', { name: 'Overview' }));
    expect(onChange).not.toHaveBeenCalled();
  });
});
