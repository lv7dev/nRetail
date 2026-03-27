import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Input } from '@/components/ui/Input/Input'
import { PasswordInput } from '@/components/ui/PasswordInput/PasswordInput'
import { Button } from '@/components/ui/Button/Button'
import { Alert } from '@/components/ui/Alert/Alert'
import { loginSchema, type LoginFormData } from './schema'
import { useLogin } from '@/hooks/useAuth'
import { resolveApiError } from '@/utils/apiError'

export default function LoginPage() {
  const { t } = useTranslation('auth')
  const { t: tErrors } = useTranslation('errors')
  const { t: tCommon } = useTranslation('common')
  const navigate = useNavigate()
  const loginMutation = useLogin()

  const schema = loginSchema(tCommon)
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = (data: LoginFormData) => {
    loginMutation.mutate(
      { phone: data.phone, password: data.password },
      {
        onSuccess: () => {
          navigate('/', { replace: true })
        },
      },
    )
  }

  return (
    <div className="flex flex-1 items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-6">
        <h1 className="text-2xl font-bold text-content text-center">{t('login.title')}</h1>
        <Alert
          message={loginMutation.isError ? resolveApiError(loginMutation.error, tErrors) : ''}
          variant="error"
        />
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
          <Button type="submit" className="w-full" loading={loginMutation.isPending}>
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
