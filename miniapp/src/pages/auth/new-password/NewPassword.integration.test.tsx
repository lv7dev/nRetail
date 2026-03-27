import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import NewPasswordPage from './index'

// Mock navigation
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
})

// Mock i18n — t(key) returns key, making assertions language-neutral
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (k: string) => k,
    i18n: { language: 'vi', changeLanguage: vi.fn() },
  }),
}))

// Mock PasswordInput to avoid dynamic icon imports in jsdom
vi.mock('@/components/ui/PasswordInput/PasswordInput', () =>
  import('@/mocks/components/PasswordInput.mock')
)

function createWrapper(state: { phone: string; otpToken: string }) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[{ pathname: '/new-password', state }]}>
        <Routes>
          <Route path="/new-password" element={<NewPasswordPage />} />
          <Route path="/login" element={<div>Login</div>} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  )
}

const renderNewPassword = (state = { phone: '0901234567', otpToken: 'valid-otp-token' }) => {
  const Wrapper = createWrapper(state)
  return render(<Wrapper><></></Wrapper>)
}

describe('NewPasswordPage integration', () => {
  beforeEach(() => mockNavigate.mockClear())

  it('navigates to /login after successful password reset', async () => {
    // Default MSW handler returns a successful reset-password response
    renderNewPassword()

    const user = userEvent.setup()
    const passwordInputs = document.querySelectorAll('input[type="password"]')
    await user.type(passwordInputs[0], 'newPassword123')
    await user.type(passwordInputs[1], 'newPassword123')
    await user.click(screen.getByRole('button', { name: /newPassword\.submit/i }))

    await waitFor(() =>
      expect(mockNavigate).toHaveBeenCalledWith('/login', expect.objectContaining({
        state: expect.objectContaining({ success: 'newPassword.successMessage' }),
      }))
    )
  })
})
