import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useState } from 'react'
import { Input } from '@/components/ui/Input/Input'
import { Button } from '@/components/ui/Button/Button'
import { Alert } from '@/components/ui/Alert/Alert'
import { forgotPasswordSchema, type ForgotPasswordFormData } from './schema'

export default function ForgotPasswordPage() {
  const { t } = useTranslation('auth')
  const { t: tCommon } = useTranslation('common')
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const schema = forgotPasswordSchema(tCommon)
  const { register, handleSubmit, formState: { errors } } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setLoading(true)
    setError('')
    // TODO(BE): replace with real API call
    await new Promise((r) => setTimeout(r, 1000))
    navigate('/otp', { state: { flow: 'forgot', phone: data.phone } })
    setLoading(false)
  }

  return (
    <div className="flex flex-1 items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-6">
        <h1 className="text-2xl font-bold text-content text-center">{t('forgotPassword.title')}</h1>
        <p className="text-sm text-content-muted text-center">{t('forgotPassword.description')}</p>
        <Alert message={error} variant="error" />
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          <Input
            label={t('forgotPassword.phone')}
            type="tel"
            placeholder="09xxxxxxxx"
            error={errors.phone?.message}
            {...register('phone')}
          />
          <Button type="submit" className="w-full" disabled={loading}>
            {t('forgotPassword.submit')}
          </Button>
        </form>
        <Link to="/login" className="block text-center text-sm text-primary hover:underline">
          {t('forgotPassword.backToLogin')}
        </Link>
      </div>
    </div>
  )
}
