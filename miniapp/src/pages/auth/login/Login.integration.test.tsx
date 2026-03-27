import { forwardRef } from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { http, HttpResponse } from 'msw'
import { server } from '@/mocks/server'
import LoginPage from './index'

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
vi.mock('@/components/ui/PasswordInput/PasswordInput', () => ({
  PasswordInput: forwardRef(({ label, error, ...props }: any, ref: any) => (
    <div>
      {label && <label>{label}</label>}
      <input type="password" data-testid="password-input" ref={ref} {...props} />
      {error && <span>{error}</span>}
    </div>
  )),
}))

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>{children}</MemoryRouter>
    </QueryClientProvider>
  )
}

const renderLogin = () => {
  const Wrapper = createWrapper()
  return render(<Wrapper><LoginPage /></Wrapper>)
}

describe('LoginPage integration', () => {
  beforeEach(() => mockNavigate.mockClear())

  it('navigates to / after successful login', async () => {
    // Default MSW handler returns a successful login response
    renderLogin()

    const user = userEvent.setup()
    await user.type(document.querySelector('input[type="tel"]')!, '0901234567')
    await user.type(document.querySelector('input[type="password"]')!, 'password123')
    await user.click(screen.getByRole('button', { name: /login\.submit/i }))

    await waitFor(() =>
      expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true })
    )
  })

  it('shows error message when INVALID_CREDENTIALS error is returned', async () => {
    // Override MSW handler to return 401 INVALID_CREDENTIALS
    server.use(
      http.post('*/auth/login', () =>
        HttpResponse.json(
          { message: 'Invalid credentials', code: 'INVALID_CREDENTIALS' },
          { status: 401 }
        )
      )
    )

    renderLogin()

    const user = userEvent.setup()
    await user.type(document.querySelector('input[type="tel"]')!, '0901234567')
    await user.type(document.querySelector('input[type="password"]')!, 'wrongpassword')
    await user.click(screen.getByRole('button', { name: /login\.submit/i }))

    await waitFor(() =>
      expect(screen.getByRole('alert')).toBeInTheDocument()
    )
    expect(screen.getByRole('alert')).toHaveTextContent('errors.INVALID_CREDENTIALS')
    expect(mockNavigate).not.toHaveBeenCalled()
  })
})
