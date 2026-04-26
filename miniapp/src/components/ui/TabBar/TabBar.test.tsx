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
  it('renders one button per tab entry', () => {
    render(<TabBar tabs={tabs} activeTab="overview" onChange={vi.fn()} />);

    expect(screen.getAllByRole('button')).toHaveLength(tabs.length);
    expect(screen.getByText('Overview')).toBeInTheDocument();
    expect(screen.getByText('Details')).toBeInTheDocument();
    expect(screen.getByText('Reviews')).toBeInTheDocument();
  });

  it('applies active and inactive tab styles', () => {
    render(<TabBar tabs={tabs} activeTab="details" onChange={vi.fn()} />);

    expect(screen.getByRole('button', { name: 'Details' })).toHaveClass(
      'bg-primary',
      'text-content-inverse',
    );
    expect(screen.getByRole('button', { name: 'Overview' })).toHaveClass(
      'border',
      'border-border',
      'text-content-muted',
    );
    expect(screen.getByRole('button', { name: 'Reviews' })).toHaveClass(
      'border',
      'border-border',
      'text-content-muted',
    );
  });

  it('applies on-primary variant styles for active and inactive tabs', () => {
    render(<TabBar tabs={tabs} activeTab="details" onChange={vi.fn()} variant="on-primary" />);

    expect(screen.getByRole('button', { name: 'Details' })).toHaveClass('bg-white', 'text-primary');
    expect(screen.getByRole('button', { name: 'Overview' })).toHaveClass(
      'border',
      'border-white/50',
      'text-white/80',
    );
    expect(screen.getByRole('button', { name: 'Reviews' })).toHaveClass(
      'border',
      'border-white/50',
      'text-white/80',
    );
  });

  it('calls onChange with the clicked tab key', async () => {
    const onChange = vi.fn();
    render(<TabBar tabs={tabs} activeTab="overview" onChange={onChange} />);

    await userEvent.click(screen.getByRole('button', { name: 'Details' }));

    expect(onChange).toHaveBeenCalledWith('details');
  });

  it('still calls onChange when clicking the active tab', async () => {
    const onChange = vi.fn();
    render(<TabBar tabs={tabs} activeTab="overview" onChange={onChange} />);

    await userEvent.click(screen.getByRole('button', { name: 'Overview' }));

    expect(onChange).toHaveBeenCalledWith('overview');
  });

  it('forwards className to the root element', () => {
    const { container } = render(
      <TabBar tabs={tabs} activeTab="overview" onChange={vi.fn()} className="sticky top-0" />,
    );

    expect(container.firstElementChild).toHaveClass('sticky', 'top-0');
  });

  it('uses horizontal overflow on the root and no-wrap sizing on each button', () => {
    const { container } = render(<TabBar tabs={tabs} activeTab="overview" onChange={vi.fn()} />);

    expect(container.firstElementChild).toHaveClass('overflow-x-auto');

    for (const tab of tabs) {
      expect(screen.getByRole('button', { name: tab.label })).toHaveClass(
        'flex-1',
        'min-w-max',
        'whitespace-nowrap',
        'py-2',
        'text-sm',
        'rounded-lg',
      );
    }
  });

  it('keeps a long tab label on a single line', () => {
    render(
      <TabBar
        tabs={[{ key: 'recent', label: 'San pham da mua gan day' }]}
        activeTab="recent"
        onChange={vi.fn()}
      />,
    );

    expect(screen.getByRole('button', { name: 'San pham da mua gan day' })).toHaveClass(
      'whitespace-nowrap',
    );
  });
});
