import { vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import ForgotPasswordPage from './index'

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
})

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (k: string) => k, i18n: { language: 'vi', changeLanguage: vi.fn() } }),
}))

const renderFP = () => render(<MemoryRouter><ForgotPasswordPage /></MemoryRouter>)

describe('ForgotPasswordPage', () => {
  beforeEach(() => mockNavigate.mockClear())

  it('renders phone field and submit button', () => {
    renderFP()
    expect(document.querySelector('input[type="tel"]')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /forgotPassword\.submit/i })).toBeInTheDocument()
  })

  it('shows phone validation error on invalid phone', async () => {
    renderFP()
    await userEvent.click(screen.getByRole('button', { name: /forgotPassword\.submit/i }))
    await waitFor(() => expect(screen.getByText('validation.phone')).toBeInTheDocument())
  })

  it('navigates to OTP with forgot flow on valid submit', async () => {
    renderFP()
    await userEvent.type(document.querySelector('input[type="tel"]')!, '0901234567')
    await userEvent.click(screen.getByRole('button', { name: /forgotPassword\.submit/i }))
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/otp', expect.objectContaining({
      state: expect.objectContaining({ flow: 'forgot' }),
    })))
  })

  it('has back to login link', () => {
    renderFP()
    expect(screen.getByText(/forgotPassword\.backToLogin/i)).toBeTruthy()
  })
})
