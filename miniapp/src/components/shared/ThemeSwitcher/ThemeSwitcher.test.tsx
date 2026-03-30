import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeSwitcher } from './ThemeSwitcher';
import { useThemeStore } from '@/store/useThemeStore';

vi.mock('@/components/ui/Icon/Icon', () => ({
  Icon: ({ name }: { name: string }) => <span data-testid={`icon-${name}`} />,
}));

beforeEach(() => {
  localStorage.removeItem('theme-preference');
  useThemeStore.setState({ preference: 'system' });
});

describe('ThemeSwitcher', () => {
  it('dropdown is closed initially', () => {
    render(<ThemeSwitcher />);
    expect(screen.queryByText('Sáng')).not.toBeInTheDocument();
    expect(screen.queryByText('Hệ thống')).not.toBeInTheDocument();
    expect(screen.queryByText('Tối')).not.toBeInTheDocument();
  });

  it('opens dropdown on button click', async () => {
    render(<ThemeSwitcher />);
    await userEvent.click(screen.getByRole('button', { name: 'Change theme' }));
    expect(screen.getByText('Sáng')).toBeInTheDocument();
    expect(screen.getByText('Hệ thống')).toBeInTheDocument();
    expect(screen.getByText('Tối')).toBeInTheDocument();
  });

  it('clicking light option calls setTheme with light and closes dropdown', async () => {
    render(<ThemeSwitcher />);
    await userEvent.click(screen.getByRole('button', { name: 'Change theme' }));
    await userEvent.click(screen.getByText('Sáng'));
    expect(useThemeStore.getState().preference).toBe('light');
    expect(screen.queryByText('Sáng')).not.toBeInTheDocument();
  });

  it('clicking dark option calls setTheme with dark and closes dropdown', async () => {
    render(<ThemeSwitcher />);
    await userEvent.click(screen.getByRole('button', { name: 'Change theme' }));
    await userEvent.click(screen.getByText('Tối'));
    expect(useThemeStore.getState().preference).toBe('dark');
    expect(screen.queryByText('Tối')).not.toBeInTheDocument();
  });

  it('clicking system option calls setTheme with system and closes dropdown', async () => {
    useThemeStore.setState({ preference: 'dark' });
    render(<ThemeSwitcher />);
    await userEvent.click(screen.getByRole('button', { name: 'Change theme' }));
    await userEvent.click(screen.getByText('Hệ thống'));
    expect(useThemeStore.getState().preference).toBe('system');
    expect(screen.queryByText('Hệ thống')).not.toBeInTheDocument();
  });

  it('closes dropdown on click outside', async () => {
    render(
      <div>
        <ThemeSwitcher />
        <button data-testid="outside">outside</button>
      </div>,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Change theme' }));
    expect(screen.getByText('Hệ thống')).toBeInTheDocument();
    fireEvent.mouseDown(screen.getByTestId('outside'));
    expect(screen.queryByText('Hệ thống')).not.toBeInTheDocument();
  });

  it('active option (system) has text-primary font-medium class', async () => {
    useThemeStore.setState({ preference: 'system' });
    render(<ThemeSwitcher />);
    await userEvent.click(screen.getByRole('button', { name: 'Change theme' }));
    expect(screen.getByText('Hệ thống')).toHaveClass('text-primary', 'font-medium');
  });

  it('inactive options have text-content class', async () => {
    useThemeStore.setState({ preference: 'system' });
    render(<ThemeSwitcher />);
    await userEvent.click(screen.getByRole('button', { name: 'Change theme' }));
    expect(screen.getByText('Sáng')).toHaveClass('text-content');
    expect(screen.getByText('Tối')).toHaveClass('text-content');
  });
});
