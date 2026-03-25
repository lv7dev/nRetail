import { vi } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import OtpPage from './index'

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
})

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (k: string) => k, i18n: { language: 'vi', changeLanguage: vi.fn() } }),
}))

vi.mock('@/components/ui/OtpInput/OtpInput', () => ({
  OtpInput: ({ onComplete }: { onComplete: (code: string) => void }) => (
    <button data-testid="otp-complete" onClick={() => onComplete('123456')}>
      Fill OTP
    </button>
  ),
}))

const mockSetUser = vi.fn()
vi.mock('@/store/useAuthStore', () => ({
  useAuthStore: (selector: any) => {
    const store = { user: null, setUser: mockSetUser, clearUser: vi.fn() }
    return selector ? selector(store) : store
  },
}))

const renderOtp = (state?: object) =>
  render(
    <MemoryRouter initialEntries={[{ pathname: '/otp', state }]}>
      <Routes>
        <Route path="/otp" element={<OtpPage />} />
        <Route path="/login" element={<div>Login</div>} />
        <Route path="/new-password" element={<div>NewPassword</div>} />
        <Route path="/" element={<div>Home</div>} />
      </Routes>
    </MemoryRouter>
  )

describe('OtpPage', () => {
  beforeEach(() => { mockNavigate.mockClear(); mockSetUser.mockClear() })

  it('redirects to login when state is missing', () => {
    renderOtp(undefined)
    expect(screen.getByText('Login')).toBeInTheDocument()
  })

  it('renders OtpInput when state is valid', () => {
    renderOtp({ flow: 'forgot', phone: '0901234567' })
    expect(screen.getByTestId('otp-complete')).toBeInTheDocument()
  })

  it('navigates to new-password after OTP for forgot flow', async () => {
    renderOtp({ flow: 'forgot', phone: '0901234567' })
    await userEvent.click(screen.getByTestId('otp-complete'))
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/new-password', expect.objectContaining({
      state: expect.objectContaining({ phone: '0901234567' }),
    })))
  })

  it('sets user and navigates home after OTP for register flow', async () => {
    renderOtp({ flow: 'register', phone: '0901234567' })
    await userEvent.click(screen.getByTestId('otp-complete'))
    await waitFor(() => {
      expect(mockSetUser).toHaveBeenCalled()
      expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true })
    })
  })

  it('shows resend success alert on resend click', async () => {
    renderOtp({ flow: 'forgot', phone: '0901234567' })
    await userEvent.click(screen.getByText(/otp\.resend/i))
    expect(screen.getByText('otp.resendSuccess')).toBeInTheDocument()
  })
})
