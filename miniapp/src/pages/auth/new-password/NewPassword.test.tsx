import { vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import NewPasswordPage from './index';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (k: string) => k,
    i18n: { language: 'vi', changeLanguage: vi.fn() },
  }),
}));

vi.mock('@/components/ui/PasswordInput/PasswordInput', () => ({
  PasswordInput: ({ label, error, ...props }: any) => (
    <div>
      {label && <label>{label}</label>}
      <input type="password" {...props} />
      {error && <span>{error}</span>}
    </div>
  ),
}));

vi.mock('@/services/authService', () => ({
  authService: {
    resetPassword: vi.fn().mockResolvedValue({}),
  },
}));

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

const renderNewPwd = (state?: object) => {
  const Wrapper = createWrapper();
  return render(
    <Wrapper>
      <MemoryRouter initialEntries={[{ pathname: '/new-password', state }]}>
        <Routes>
          <Route path="/new-password" element={<NewPasswordPage />} />
          <Route path="/login" element={<div>Login</div>} />
        </Routes>
      </MemoryRouter>
    </Wrapper>,
  );
};

describe('NewPasswordPage', () => {
  beforeEach(() => mockNavigate.mockClear());

  it('redirects to login when state is missing', () => {
    renderNewPwd(undefined);
    expect(screen.getByText('Login')).toBeInTheDocument();
  });

  it('renders two password fields', () => {
    renderNewPwd({ phone: '0901234567', otpToken: 'test-token' });
    expect(document.querySelectorAll('input[type="password"]')).toHaveLength(2);
  });

  it('shows password mismatch error', async () => {
    renderNewPwd({ phone: '0901234567', otpToken: 'test-token' });
    const inputs = document.querySelectorAll('input[type="password"]');
    await userEvent.type(inputs[0], 'newpass1');
    await userEvent.type(inputs[1], 'newpass2');
    await userEvent.click(screen.getByRole('button', { name: /newPassword\.submit/i }));
    await waitFor(() =>
      expect(screen.getByText('validation.passwordMismatch')).toBeInTheDocument(),
    );
  });

  it('navigates to login on successful submit', async () => {
    renderNewPwd({ phone: '0901234567', otpToken: 'test-token' });
    const inputs = document.querySelectorAll('input[type="password"]');
    await userEvent.type(inputs[0], 'newpass1');
    await userEvent.type(inputs[1], 'newpass1');
    await userEvent.click(screen.getByRole('button', { name: /newPassword\.submit/i }));
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/login', expect.anything()));
  });

  it('h1 has dark mode class', () => {
    renderNewPwd({ phone: '0901234567', otpToken: 'test-token' });
    expect(screen.getByRole('heading', { level: 1 }).className).toMatch(/dark:text-content-dark/);
  });
});
