import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Input } from '@/components/ui/Input/Input'
import { Button } from '@/components/ui/Button/Button'
import { Alert } from '@/components/ui/Alert/Alert'
import { forgotPasswordSchema, type ForgotPasswordFormData } from './schema'
import { useRequestOtp } from '@/hooks/useAuth'
import { resolveApiError } from '@/utils/apiError'

export default function ForgotPasswordPage() {
  const { t } = useTranslation('auth')
  const { t: tCommon } = useTranslation('common')
  const { t: tErrors } = useTranslation('errors')
  const navigate = useNavigate()

  const requestOtpMutation = useRequestOtp('forgot')

  const schema = forgotPasswordSchema(tCommon)
  const { register, handleSubmit, formState: { errors } } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = (data: ForgotPasswordFormData) => {
    requestOtpMutation.mutate(data.phone, {
      onSuccess: () => {
        navigate('/otp', { state: { flow: 'forgot', phone: data.phone } })
      },
    })
  }

  return (
    <div className="flex flex-1 items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-6">
        <h1 className="text-2xl font-bold text-content text-center">{t('forgotPassword.title')}</h1>
        <p className="text-sm text-content-muted text-center">{t('forgotPassword.description')}</p>
        <Alert
          message={requestOtpMutation.isError ? resolveApiError(requestOtpMutation.error, tErrors) : ''}
          variant="error"
        />
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          <Input
            label={t('forgotPassword.phone')}
            type="tel"
            placeholder="09xxxxxxxx"
            error={errors.phone?.message}
            {...register('phone')}
          />
          <Button type="submit" className="w-full" loading={requestOtpMutation.isPending}>
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
