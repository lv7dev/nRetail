import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import RegisterPage from './index';

// Mock navigation
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

// Mock i18n — t(key) returns key, making assertions language-neutral
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (k: string) => k,
    i18n: { language: 'vi', changeLanguage: vi.fn() },
  }),
}));

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>{children}</MemoryRouter>
    </QueryClientProvider>
  );
}

const renderRegister = () => {
  const Wrapper = createWrapper();
  return render(
    <Wrapper>
      <RegisterPage />
    </Wrapper>,
  );
};

describe('RegisterPage integration', () => {
  beforeEach(() => mockNavigate.mockClear());

  it('navigates to /otp with register flow after phone submit', async () => {
    // Default MSW handler returns a successful OTP request response
    renderRegister();

    const user = userEvent.setup();
    await user.type(document.querySelector('input[type="tel"]')!, '0901234567');
    await user.click(screen.getByRole('button', { name: /register\.submit/i }));

    await waitFor(() =>
      expect(mockNavigate).toHaveBeenCalledWith('/otp', {
        state: { flow: 'register', phone: '0901234567' },
      }),
    );
  });
});
