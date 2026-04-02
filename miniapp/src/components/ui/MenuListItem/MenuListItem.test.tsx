import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MenuListItem } from './MenuListItem';

describe('MenuListItem', () => {
  it('renders label text', () => {
    render(<MenuListItem icon="user" label="My Profile" onClick={vi.fn()} />);
    expect(screen.getByText('My Profile')).toBeInTheDocument();
  });

  it('calls onClick when clicked', async () => {
    const onClick = vi.fn();
    render(<MenuListItem icon="user" label="My Profile" onClick={onClick} />);
    await userEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('applies default text class when variant is omitted', () => {
    render(<MenuListItem icon="user" label="My Profile" onClick={vi.fn()} />);
    const button = screen.getByRole('button');
    expect(button.className).toMatch(/text-content/);
  });

  it('applies destructive text class when variant="destructive"', () => {
    render(
      <MenuListItem icon="trash" label="Delete Account" onClick={vi.fn()} variant="destructive" />,
    );
    const button = screen.getByRole('button');
    expect(button.className).toMatch(/text-destructive/);
  });
});
