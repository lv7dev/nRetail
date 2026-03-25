import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useState } from 'react'
import { Input } from '@/components/ui/Input/Input'
import { PasswordInput } from '@/components/ui/PasswordInput/PasswordInput'
import { Button } from '@/components/ui/Button/Button'
import { Alert } from '@/components/ui/Alert/Alert'
import { loginSchema, type LoginFormData } from './schema'
import { useAuthStore } from '@/store/useAuthStore'

export default function LoginPage() {
  const { t } = useTranslation('auth')
  const { t: tCommon } = useTranslation('common')
  const navigate = useNavigate()
  const setUser = useAuthStore((s) => s.setUser)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const schema = loginSchema(tCommon)
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: LoginFormData) => {
    setLoading(true)
    setError('')
    // TODO(BE): replace with real API call
    await new Promise((r) => setTimeout(r, 1000))
    setUser({ id: '1', name: data.phone })
    navigate('/', { replace: true })
    setLoading(false)
  }

  return (
    <div className="flex flex-1 items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-6">
        <h1 className="text-2xl font-bold text-content text-center">{t('login.title')}</h1>
        <Alert message={error} variant="error" />
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          <Input
            label={t('login.phone')}
            type="tel"
            placeholder="09xxxxxxxx"
            error={errors.phone?.message}
            {...register('phone')}
          />
          <PasswordInput
            label={t('login.password')}
            error={errors.password?.message}
            {...register('password')}
          />
          <Button type="submit" className="w-full" disabled={loading}>
            {t('login.submit')}
          </Button>
        </form>
        <div className="text-center space-y-2">
          <Link to="/forgot-password" className="block text-sm text-primary hover:underline">
            {t('login.forgotPassword')}
          </Link>
          <p className="text-sm text-content-muted">
            {t('login.noAccount')}{' '}
            <Link to="/register" className="text-primary hover:underline">
              {t('login.registerLink')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
