import { vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { forwardRef } from 'react'
import RegisterPage from './index'

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
})

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (k: string) => k, i18n: { language: 'vi', changeLanguage: vi.fn() } }),
}))

vi.mock('@/components/ui/PasswordInput/PasswordInput', () => ({
  PasswordInput: forwardRef(({ label, error, ...props }: any, ref: any) => (
    <div>
      {label && <label>{label}</label>}
      <input type="password" ref={ref} {...props} />
      {error && <span>{error}</span>}
    </div>
  )),
}))

const renderRegister = () => render(<MemoryRouter><RegisterPage /></MemoryRouter>)

describe('RegisterPage', () => {
  beforeEach(() => mockNavigate.mockClear())

  it('renders phone, password, confirm password fields', () => {
    renderRegister()
    expect(document.querySelector('input[type="tel"]')).toBeInTheDocument()
    expect(document.querySelectorAll('input[type="password"]')).toHaveLength(2)
  })

  it('shows password mismatch error', async () => {
    renderRegister()
    await userEvent.type(document.querySelector('input[type="tel"]')!, '0901234567')
    const pwdInputs = document.querySelectorAll('input[type="password"]')
    await userEvent.type(pwdInputs[0], 'pass123')
    await userEvent.type(pwdInputs[1], 'pass456')
    await userEvent.click(screen.getByRole('button', { name: /register\.submit/i }))
    await waitFor(() => expect(screen.getByText('validation.passwordMismatch')).toBeInTheDocument())
  })

  it('navigates to OTP with register flow on valid submit', async () => {
    renderRegister()
    await userEvent.type(document.querySelector('input[type="tel"]')!, '0901234567')
    const pwdInputs = document.querySelectorAll('input[type="password"]')
    await userEvent.type(pwdInputs[0], 'pass123')
    await userEvent.type(pwdInputs[1], 'pass123')
    await userEvent.click(screen.getByRole('button', { name: /register\.submit/i }))
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/otp', expect.objectContaining({
      state: expect.objectContaining({ flow: 'register' }),
    })))
  })

  it('has back to login link', () => {
    renderRegister()
    expect(screen.getByText(/loginLink/i)).toBeTruthy()
  })
})
