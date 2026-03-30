import { vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import OtpPage from './index';

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

vi.mock('@/components/ui/OtpInput/OtpInput', () => ({
  OtpInput: ({ onComplete }: { onComplete: (code: string) => void }) => (
    <button data-testid="otp-complete" onClick={() => onComplete('123456')}>
      Fill OTP
    </button>
  ),
}));

vi.mock('@/services/authService', () => ({
  authService: {
    verifyOtp: vi.fn().mockResolvedValue({ otpToken: 'otp-token-123' }),
    requestForgotPasswordOtp: vi.fn().mockResolvedValue(undefined),
    requestRegisterOtp: vi.fn().mockResolvedValue(undefined),
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

const renderOtp = (state?: object) => {
  const Wrapper = createWrapper();
  return render(
    <Wrapper>
      <MemoryRouter initialEntries={[{ pathname: '/otp', state }]}>
        <Routes>
          <Route path="/otp" element={<OtpPage />} />
          <Route path="/login" element={<div>Login</div>} />
          <Route path="/new-password" element={<div>NewPassword</div>} />
          <Route path="/register/complete" element={<div>RegisterComplete</div>} />
          <Route path="/" element={<div>Home</div>} />
        </Routes>
      </MemoryRouter>
    </Wrapper>,
  );
};

describe('OtpPage', () => {
  beforeEach(() => mockNavigate.mockClear());

  it('redirects to login when state is missing', () => {
    renderOtp(undefined);
    expect(screen.getByText('Login')).toBeInTheDocument();
  });

  it('renders OtpInput when state is valid', () => {
    renderOtp({ flow: 'forgot', phone: '0901234567' });
    expect(screen.getByTestId('otp-complete')).toBeInTheDocument();
  });

  it('navigates to new-password after OTP for forgot flow', async () => {
    renderOtp({ flow: 'forgot', phone: '0901234567' });
    await userEvent.click(screen.getByTestId('otp-complete'));
    await waitFor(() =>
      expect(mockNavigate).toHaveBeenCalledWith(
        '/new-password',
        expect.objectContaining({
          state: expect.objectContaining({ phone: '0901234567', otpToken: 'otp-token-123' }),
        }),
      ),
    );
  });

  it('navigates to register/complete after OTP for register flow', async () => {
    renderOtp({ flow: 'register', phone: '0901234567' });
    await userEvent.click(screen.getByTestId('otp-complete'));
    await waitFor(() =>
      expect(mockNavigate).toHaveBeenCalledWith(
        '/register/complete',
        expect.objectContaining({
          state: expect.objectContaining({ phone: '0901234567', otpToken: 'otp-token-123' }),
        }),
      ),
    );
  });

  it('shows resend success alert on resend click', async () => {
    renderOtp({ flow: 'forgot', phone: '0901234567' });
    await userEvent.click(screen.getByText(/otp\.resend/i));
    await waitFor(() => expect(screen.getByText('otp.resendSuccess')).toBeInTheDocument());
  });

  it('h1 has dark mode class', () => {
    renderOtp({ flow: 'register', phone: '0901234567' });
    expect(screen.getByRole('heading', { level: 1 }).className).toMatch(/dark:text-content-dark/);
  });

  it('muted paragraphs have dark mode class', () => {
    renderOtp({ flow: 'register', phone: '0901234567' });
    const mutedParas = document.querySelectorAll('p.text-content-muted');
    expect(mutedParas.length).toBeGreaterThan(0);
    mutedParas.forEach((p) => {
      expect(p.className).toMatch(/dark:text-content-dark-muted/);
    });
  });

  it('inline phone span has dark mode class', () => {
    renderOtp({ flow: 'register', phone: '0901234567' });
    const phoneSpan = screen.getByText('0901234567');
    expect(phoneSpan.className).toMatch(/dark:text-content-dark/);
  });

  it('pending indicator paragraph has dark mode class when isPending', async () => {
    const { authService } = await import('@/services/authService');
    (authService.verifyOtp as ReturnType<typeof vi.fn>).mockImplementationOnce(
      () => new Promise(() => {}),
    );
    renderOtp({ flow: 'register', phone: '0901234567' });
    await userEvent.click(screen.getByTestId('otp-complete'));
    await waitFor(() => expect(document.querySelector('p.text-sm.text-content-muted')).toBeInTheDocument());
    const pendingPara = document.querySelector('p.text-sm.text-content-muted')!;
    expect(pendingPara.className).toMatch(/dark:text-content-dark-muted/);
  });
});
