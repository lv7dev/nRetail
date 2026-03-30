import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { forwardRef as reactForwardRef } from 'react';
import RegisterCompletePage from './complete';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (k: string) => k,
    i18n: { language: 'vi', changeLanguage: vi.fn() },
  }),
}));

// Avoid dynamic SVG imports from PasswordInput — forward ref so react-hook-form can read values
vi.mock('@/components/ui/PasswordInput/PasswordInput', () => ({
  PasswordInput: reactForwardRef<HTMLInputElement, { label?: string; error?: string } & React.InputHTMLAttributes<HTMLInputElement>>(
    ({ label, error, ...props }, ref) => (
      <div>
        {label && <label>{label}</label>}
        <input type="password" ref={ref} aria-label={label ?? 'password'} {...props} />
        {error && <span>{error}</span>}
      </div>
    ),
  ),
}));

const mockMutate = vi.fn();
vi.mock('@/hooks/useAuth', () => ({
  useRegister: () => ({
    mutate: mockMutate,
    isPending: false,
  }),
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

function renderWithState(state: Record<string, string> | null) {
  const Wrapper = createWrapper();
  return render(
    <Wrapper>
      <MemoryRouter
        initialEntries={[{ pathname: '/register/complete', state }]}
      >
        <Routes>
          <Route path="/register/complete" element={<RegisterCompletePage />} />
          <Route path="/login" element={<div>login page</div>} />
        </Routes>
      </MemoryRouter>
    </Wrapper>,
  );
}

describe('RegisterCompletePage', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    mockMutate.mockReset();
  });

  it('redirects to /login when state is missing', () => {
    renderWithState(null);
    expect(screen.getByText('login page')).toBeInTheDocument();
  });

  it('redirects to /login when otpToken is missing', () => {
    renderWithState({ phone: '0901234567' });
    expect(screen.getByText('login page')).toBeInTheDocument();
  });

  it('renders form when state is valid', () => {
    renderWithState({ phone: '0901234567', otpToken: 'tok' });
    expect(screen.getByRole('button', { name: /register\.submit/i })).toBeInTheDocument();
  });

  it('navigates to / on success', async () => {
    mockMutate.mockImplementation(
      (_data: unknown, { onSuccess }: { onSuccess: () => void }) => onSuccess(),
    );
    renderWithState({ phone: '0901234567', otpToken: 'tok' });
    await userEvent.type(document.querySelector('input[name="name"]')!, 'Alice');
    const pwdInputs = document.querySelectorAll('input[type="password"]');
    await userEvent.type(pwdInputs[0], 'secret123');
    await userEvent.type(pwdInputs[1], 'secret123');
    await userEvent.click(screen.getByRole('button', { name: /register\.submit/i }));
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true }));
  });

  it('shows API error on mutation failure', async () => {
    const { ApiError } = await import('@/utils/apiError');
    mockMutate.mockImplementation(
      (_data: unknown, { onError }: { onError: (e: unknown) => void }) =>
        onError(new ApiError(400, 'Phone already registered', 'PHONE_ALREADY_EXISTS')),
    );
    renderWithState({ phone: '0901234567', otpToken: 'tok' });
    await userEvent.type(document.querySelector('input[name="name"]')!, 'Alice');
    const pwdInputs = document.querySelectorAll('input[type="password"]');
    await userEvent.type(pwdInputs[0], 'secret123');
    await userEvent.type(pwdInputs[1], 'secret123');
    await userEvent.click(screen.getByRole('button', { name: /register\.submit/i }));
    // resolveApiError returns t('errors.PHONE_ALREADY_EXISTS') which with t=k=>k is 'errors.PHONE_ALREADY_EXISTS'
    await waitFor(() =>
      expect(screen.getByText('errors.PHONE_ALREADY_EXISTS')).toBeInTheDocument(),
    );
  });
});
