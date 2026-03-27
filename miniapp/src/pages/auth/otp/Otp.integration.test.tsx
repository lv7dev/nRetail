import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import OtpPage from './index'

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

function createWrapper(initialEntries: Array<string | { pathname: string; state: unknown }>) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={initialEntries}>
        <Routes>
          <Route path="/otp" element={<OtpPage />} />
          <Route path="/login" element={<div>Login</div>} />
          <Route path="/new-password" element={<div>NewPassword</div>} />
          <Route path="/register/complete" element={<div>RegisterComplete</div>} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  )
}

const fillOtp = (code: string) => {
  // getAllByRole('textbox') selects all OTP input boxes.
  // This assumes OtpPage renders no other textbox elements — true for the current page.
  // If OtpPage ever adds other inputs, scope this query with { container: otpWrapper }.
  const inputs = screen.getAllByRole('textbox')
  code.split('').forEach((digit, i) => {
    fireEvent.change(inputs[i], { target: { value: digit } })
  })
}

describe('OtpPage integration', () => {
  beforeEach(() => mockNavigate.mockClear())

  it('navigates to /register/complete after valid OTP in register flow', async () => {
    // Default MSW handler returns { data: { otpToken: 'default-otp-token' } }
    const Wrapper = createWrapper([
      { pathname: '/otp', state: { flow: 'register', phone: '0901234567' } },
    ])
    render(<Wrapper><></></Wrapper>)

    fillOtp('123456')

    await waitFor(() =>
      expect(mockNavigate).toHaveBeenCalledWith('/register/complete', {
        state: { phone: '0901234567', otpToken: 'default-otp-token' },
      })
    )
  })

  it('navigates to /new-password after valid OTP in forgot flow', async () => {
    // Default MSW handler returns { data: { otpToken: 'default-otp-token' } }
    const Wrapper = createWrapper([
      { pathname: '/otp', state: { flow: 'forgot', phone: '0901234567' } },
    ])
    render(<Wrapper><></></Wrapper>)

    fillOtp('123456')

    await waitFor(() =>
      expect(mockNavigate).toHaveBeenCalledWith('/new-password', {
        state: { phone: '0901234567', otpToken: 'default-otp-token' },
      })
    )
  })
})
