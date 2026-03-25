import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useLocation, useNavigate, Navigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useState } from 'react'
import { PasswordInput } from '@/components/ui/PasswordInput/PasswordInput'
import { Button } from '@/components/ui/Button/Button'
import { Alert } from '@/components/ui/Alert/Alert'
import { newPasswordSchema, type NewPasswordFormData } from './schema'

export default function NewPasswordPage() {
  const { t } = useTranslation('auth')
  const { t: tCommon } = useTranslation('common')
  const navigate = useNavigate()
  const location = useLocation()
  const state = location.state as { phone: string } | null
  const [loading, setLoading] = useState(false)

  if (!state?.phone) {
    return <Navigate to="/login" replace />
  }

  const schema = newPasswordSchema(tCommon)
  const { control, handleSubmit, formState: { errors } } = useForm<NewPasswordFormData>({
    resolver: zodResolver(schema),
    defaultValues: { password: '', confirmPassword: '' },
  })

  const onSubmit = async (_data: NewPasswordFormData) => {
    setLoading(true)
    // TODO(BE): replace with real password reset API call
    await new Promise((r) => setTimeout(r, 1000))
    navigate('/login', { state: { success: t('newPassword.successMessage') } })
    setLoading(false)
  }

  return (
    <div className="flex flex-1 items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-6">
        <h1 className="text-2xl font-bold text-content text-center">{t('newPassword.title')}</h1>
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          <Controller
            name="password"
            control={control}
            render={({ field }) => (
              <PasswordInput
                label={t('newPassword.password')}
                error={errors.password?.message}
                {...field}
              />
            )}
          />
          <Controller
            name="confirmPassword"
            control={control}
            render={({ field }) => (
              <PasswordInput
                label={t('newPassword.confirmPassword')}
                error={errors.confirmPassword?.message}
                {...field}
              />
            )}
          />
          <Button type="submit" className="w-full" disabled={loading}>
            {t('newPassword.submit')}
          </Button>
        </form>
      </div>
    </div>
  )
}
