import { useLocation, useNavigate, Navigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useState } from 'react'
import { OtpInput } from '@/components/ui/OtpInput/OtpInput'
import { Alert } from '@/components/ui/Alert/Alert'
import { Button } from '@/components/ui/Button/Button'
import { useAuthStore } from '@/store/useAuthStore'

type OtpState = { flow: 'register' | 'forgot'; phone: string }

export default function OtpPage() {
  const { t } = useTranslation('auth')
  const navigate = useNavigate()
  const location = useLocation()
  const state = location.state as OtpState | null
  const setUser = useAuthStore((s) => s.setUser)
  const [resent, setResent] = useState(false)
  const [loading, setLoading] = useState(false)

  if (!state?.flow || !state?.phone) {
    return <Navigate to="/login" replace />
  }

  const handleComplete = async (code: string) => {
    setLoading(true)
    // TODO(BE): replace with real OTP verification API call
    await new Promise((r) => setTimeout(r, 1000))
    if (state.flow === 'forgot') {
      navigate('/new-password', { state: { phone: state.phone } })
    } else {
      setUser({ id: '1', name: state.phone })
      navigate('/', { replace: true })
    }
    setLoading(false)
  }

  const handleResend = () => {
    // TODO(BE): replace with real resend OTP API call
    setResent(true)
  }

  return (
    <div className="flex flex-1 items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-6 text-center">
        <h1 className="text-2xl font-bold text-content">{t('otp.title')}</h1>
        <p className="text-sm text-content-muted">{t('otp.description')}</p>
        <p className="text-sm text-content-muted">
          {t('otp.codeSentTo')} <span className="font-medium text-content">{state.phone}</span>
        </p>
        {resent && <Alert variant="success" message={t('otp.resendSuccess')} />}
        <OtpInput onComplete={handleComplete} className="justify-center" />
        {loading && <p className="text-sm text-content-muted">...</p>}
        <button
          type="button"
          onClick={handleResend}
          className="text-sm text-primary hover:underline"
        >
          {t('otp.resend')}
        </button>
      </div>
    </div>
  )
}
