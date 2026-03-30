/**
 * Integration tests for RegisterCompletePage — uses real TanStack Query +
 * real authService + MSW intercepting POST /auth/register.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { forwardRef as reactForwardRef } from 'react';
import { http, HttpResponse } from 'msw';
import { server } from '@/mocks/server';
import RegisterCompletePage from './complete';
import { useAuthStore } from '@/store/useAuthStore';
import { storage } from '@/utils/storage';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (k: string) => k,
    i18n: { language: 'vi', changeLanguage: vi.fn() },
  }),
}));

vi.mock('@/components/ui/PasswordInput/PasswordInput', () => ({
  PasswordInput: reactForwardRef<
    HTMLInputElement,
    { label?: string; error?: string } & React.InputHTMLAttributes<HTMLInputElement>
  >(({ label, error, ...props }, ref) => (
    <div>
      {label && <label>{label}</label>}
      <input type="password" aria-label={label ?? 'password'} ref={ref} {...props} />
      {error && <span>{error}</span>}
    </div>
  )),
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
      <MemoryRouter initialEntries={[{ pathname: '/register/complete', state }]}>
        <Routes>
          <Route path="/register/complete" element={<RegisterCompletePage />} />
          <Route path="/login" element={<div>login page</div>} />
        </Routes>
      </MemoryRouter>
    </Wrapper>,
  );
}

beforeEach(() => {
  localStorage.clear();
  useAuthStore.setState({ user: null, isReady: false });
  mockNavigate.mockClear();
});

describe('RegisterCompletePage integration', () => {
  it('stores tokens, sets user and navigates to / on success', async () => {
    renderWithState({ phone: '0901234567', otpToken: 'valid-token' });

    const nameInput = document.querySelector('input[name="name"]') as HTMLInputElement;
    await userEvent.type(nameInput, 'Alice');
    const pwdInputs = document.querySelectorAll('input[type="password"]');
    await userEvent.type(pwdInputs[0], 'secret123');
    await userEvent.type(pwdInputs[1], 'secret123');
    await userEvent.click(screen.getByRole('button', { name: /register\.submit/i }));

    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true }));
    expect(storage.getAccessToken()).toBe('default-access-token');
    expect(useAuthStore.getState().user).not.toBeNull();
  });

  it('shows server error message when register returns 400', async () => {
    server.use(
      http.post('*/auth/register', () =>
        HttpResponse.json(
          { message: 'Phone already registered', code: 'PHONE_ALREADY_EXISTS' },
          { status: 400 },
        ),
      ),
    );
    renderWithState({ phone: '0901234567', otpToken: 'valid-token' });

    const nameInput = document.querySelector('input[name="name"]') as HTMLInputElement;
    await userEvent.type(nameInput, 'Alice');
    const pwdInputs = document.querySelectorAll('input[type="password"]');
    await userEvent.type(pwdInputs[0], 'secret123');
    await userEvent.type(pwdInputs[1], 'secret123');
    await userEvent.click(screen.getByRole('button', { name: /register\.submit/i }));

    await waitFor(() =>
      expect(screen.getByText('PHONE_ALREADY_EXISTS')).toBeInTheDocument(),
    );
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('redirects to /login when router state is missing (no API call)', async () => {
    let registerCalled = false;
    server.use(
      http.post('*/auth/register', () => {
        registerCalled = true;
        return HttpResponse.json({ data: {} });
      }),
    );
    renderWithState(null);
    expect(screen.getByText('login page')).toBeInTheDocument();
    expect(registerCalled).toBe(false);
  });
});
