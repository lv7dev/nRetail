import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LanguageSwitcher } from './LanguageSwitcher';

// Mock i18next
const mockChangeLanguage = vi.fn();
let mockLanguage = 'vi';
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (k: string) => k,
    i18n: {
      get language() {
        return mockLanguage;
      },
      changeLanguage: mockChangeLanguage,
    },
  }),
}));

// Mock Icon
vi.mock('@/components/ui/Icon/Icon', () => ({
  Icon: ({ name }: { name: string }) => <span data-testid={`icon-${name}`} />,
}));

describe('LanguageSwitcher', () => {
  beforeEach(() => {
    mockChangeLanguage.mockClear();
    mockLanguage = 'vi';
  });

  it('renders a globe button', () => {
    render(<LanguageSwitcher />);
    expect(screen.getByRole('button')).toBeInTheDocument();
    expect(screen.getByTestId('icon-globe')).toBeInTheDocument();
  });

  it('dropdown is hidden by default', () => {
    render(<LanguageSwitcher />);
    expect(screen.queryByText('Tiếng Việt')).not.toBeInTheDocument();
  });

  it('dropdown opens on click', async () => {
    render(<LanguageSwitcher />);
    await userEvent.click(screen.getByRole('button'));
    expect(screen.getByText('Tiếng Việt')).toBeInTheDocument();
    expect(screen.getByText('English')).toBeInTheDocument();
  });

  it('dropdown closes on second click', async () => {
    render(<LanguageSwitcher />);
    const toggle = screen.getByRole('button', { name: 'Change language' });
    await userEvent.click(toggle);
    await userEvent.click(toggle);
    expect(screen.queryByText('Tiếng Việt')).not.toBeInTheDocument();
  });

  it('selecting English calls changeLanguage with "en"', async () => {
    render(<LanguageSwitcher />);
    await userEvent.click(screen.getByRole('button'));
    await userEvent.click(screen.getByText('English'));
    expect(mockChangeLanguage).toHaveBeenCalledWith('en');
  });

  it('selecting a language closes the dropdown', async () => {
    render(<LanguageSwitcher />);
    await userEvent.click(screen.getByRole('button'));
    await userEvent.click(screen.getByText('English'));
    expect(screen.queryByText('Tiếng Việt')).not.toBeInTheDocument();
  });

  it('click outside closes the dropdown', async () => {
    render(
      <div>
        <LanguageSwitcher />
        <button data-testid="outside">outside</button>
      </div>,
    );
    // Open the dropdown
    await userEvent.click(screen.getByRole('button', { name: 'Change language' }));
    expect(screen.getByText('Tiếng Việt')).toBeInTheDocument();
    // Click outside the component
    fireEvent.mouseDown(screen.getByTestId('outside'));
    expect(screen.queryByText('Tiếng Việt')).not.toBeInTheDocument();
  });

  it('highlights active language when i18n.language is a region-tagged locale (vi-VN → vi)', async () => {
    mockLanguage = 'vi-VN';
    render(<LanguageSwitcher />);
    await userEvent.click(screen.getByRole('button', { name: 'Change language' }));
    const vietButton = screen.getByText('Tiếng Việt');
    expect(vietButton).toHaveClass('text-primary');
    expect(vietButton).toHaveClass('font-medium');
  });
});
