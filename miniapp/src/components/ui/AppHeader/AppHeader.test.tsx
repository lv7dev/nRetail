import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AppHeader } from './AppHeader';

describe('AppHeader', () => {
  it('renders title text', () => {
    render(<AppHeader title="My Page" />);
    expect(screen.getByText('My Page')).toBeInTheDocument();
  });

  it('does not render back button when onBack is undefined', () => {
    render(<AppHeader title="My Page" />);
    expect(screen.queryByRole('button', { name: /back/i })).not.toBeInTheDocument();
  });

  it('renders back button when onBack is provided', () => {
    const onBack = vi.fn();
    render(<AppHeader title="My Page" onBack={onBack} />);
    expect(screen.getByRole('button', { name: /back/i })).toBeInTheDocument();
  });

  it('calls onBack when back button is clicked', async () => {
    const onBack = vi.fn();
    render(<AppHeader title="My Page" onBack={onBack} />);
    await userEvent.click(screen.getByRole('button', { name: /back/i }));
    expect(onBack).toHaveBeenCalledOnce();
  });

  it('renders right slot content', () => {
    render(<AppHeader title="My Page" right={<button>Settings</button>} />);
    expect(screen.getByRole('button', { name: 'Settings' })).toBeInTheDocument();
  });

  it('keeps the title centered when no back button is provided', () => {
    render(<AppHeader title="My Page" />);
    expect(screen.getByRole('heading', { name: 'My Page' })).toHaveClass('text-center');
    expect(screen.getByRole('heading', { name: 'My Page' })).not.toHaveClass('text-left');
  });

  it('forwards className to root element', () => {
    const { container } = render(<AppHeader title="My Page" className="custom-class" />);
    expect(container.firstChild).toHaveClass('custom-class');
  });
});
