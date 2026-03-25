import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useState } from 'react'
import { Input } from '@/components/ui/Input/Input'
import { PasswordInput } from '@/components/ui/PasswordInput/PasswordInput'
import { Button } from '@/components/ui/Button/Button'
import { Alert } from '@/components/ui/Alert/Alert'
import { registerSchema, type RegisterFormData } from './schema'

export default function RegisterPage() {
  const { t } = useTranslation('auth')
  const { t: tCommon } = useTranslation('common')
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const schema = registerSchema(tCommon)
  const { register, handleSubmit, formState: { errors } } = useForm<RegisterFormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: RegisterFormData) => {
    setLoading(true)
    setError('')
    // TODO(BE): replace with real API call
    await new Promise((r) => setTimeout(r, 1000))
    navigate('/otp', { state: { flow: 'register', phone: data.phone } })
    setLoading(false)
  }

  return (
    <div className="flex flex-1 items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-6">
        <h1 className="text-2xl font-bold text-content text-center">{t('register.title')}</h1>
        <Alert message={error} variant="error" />
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          <Input
            label={t('register.phone')}
            type="tel"
            placeholder="09xxxxxxxx"
            error={errors.phone?.message}
            {...register('phone')}
          />
          <PasswordInput
            label={t('register.password')}
            error={errors.password?.message}
            {...register('password')}
          />
          <PasswordInput
            label={t('register.confirmPassword')}
            error={errors.confirmPassword?.message}
            {...register('confirmPassword')}
          />
          <Button type="submit" className="w-full" disabled={loading}>
            {t('register.submit')}
          </Button>
        </form>
        <p className="text-center text-sm text-content-muted">
          {t('register.hasAccount')}{' '}
          <Link to="/login" className="text-primary hover:underline">
            {t('register.loginLink')}
          </Link>
        </p>
      </div>
    </div>
  )
}
