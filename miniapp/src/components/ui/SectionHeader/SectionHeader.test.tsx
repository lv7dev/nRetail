import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SectionHeader } from './SectionHeader';

describe('SectionHeader', () => {
  it('renders title text', () => {
    render(<SectionHeader title="Featured Products" />);
    expect(screen.getByText('Featured Products')).toBeInTheDocument();
  });

  it('does not render "View all" button when onViewAll is undefined', () => {
    render(<SectionHeader title="Featured Products" />);
    expect(screen.queryByRole('button', { name: /view all/i })).not.toBeInTheDocument();
  });

  it('renders "View all" button when onViewAll is provided', () => {
    const onViewAll = vi.fn();
    render(<SectionHeader title="Featured Products" onViewAll={onViewAll} />);
    expect(screen.getByRole('button', { name: 'View all' })).toBeInTheDocument();
  });

  it('calls onViewAll when button is clicked', async () => {
    const onViewAll = vi.fn();
    render(<SectionHeader title="Featured Products" onViewAll={onViewAll} />);
    await userEvent.click(screen.getByRole('button', { name: 'View all' }));
    expect(onViewAll).toHaveBeenCalledOnce();
  });

  it('uses custom viewAllLabel when provided', () => {
    const onViewAll = vi.fn();
    render(
      <SectionHeader title="Featured Products" onViewAll={onViewAll} viewAllLabel="See more" />,
    );
    expect(screen.getByRole('button', { name: 'See more' })).toBeInTheDocument();
  });
});
