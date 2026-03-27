import { vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { forwardRef } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import LoginPage from './index'

// Mock navigation
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
})

// Mock i18n
vi.mock('react-i18next', () => ({
  useTranslation: (ns?: string) => ({
    t: (k: string) => k,
    i18n: { language: 'vi', changeLanguage: vi.fn() },
  }),
}))

// Mock PasswordInput to avoid dynamic icon imports
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
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

const renderLogin = () => {
  const Wrapper = createWrapper()
  return render(<Wrapper><MemoryRouter><LoginPage /></MemoryRouter></Wrapper>)
}

describe('LoginPage', () => {
  beforeEach(() => mockNavigate.mockClear())

  it('renders phone and password fields', () => {
    renderLogin()
    expect(document.querySelector('input[type="tel"]')).toBeInTheDocument()
    expect(document.querySelector('input[type="password"]')).toBeInTheDocument()
  })

  it('shows phone validation error on invalid phone', async () => {
    renderLogin()
    const submit = screen.getByRole('button', { name: /login\.submit/i })
    await userEvent.click(submit)
    await waitFor(() => expect(screen.getByText('validation.phone')).toBeInTheDocument())
  })

  it('shows password validation error on short password', async () => {
    renderLogin()
    await userEvent.type(document.querySelector('input[type="tel"]')!, '0901234567')
    const submit = screen.getByRole('button', { name: /login\.submit/i })
    await userEvent.click(submit)
    await waitFor(() => expect(screen.getByText('validation.passwordMin')).toBeInTheDocument())
  })

  it('has a link to register', () => {
    renderLogin()
    expect(screen.getByRole('link', { name: /register/i }) ?? screen.getByText(/register/i)).toBeTruthy()
  })

  it('has a link to forgot-password', () => {
    renderLogin()
    expect(screen.getByText(/forgotPassword/i)).toBeTruthy()
  })
})
