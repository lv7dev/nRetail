import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLocation, useNavigate, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { PasswordInput } from '@/components/ui/PasswordInput/PasswordInput';
import { Button } from '@/components/ui/Button/Button';
import { Alert } from '@/components/ui/Alert/Alert';
import { newPasswordSchema, type NewPasswordFormData } from './schema';
import { useResetPassword } from '@/hooks/useAuth';
import { resolveApiError } from '@/utils/apiError';

export default function NewPasswordPage() {
  const { t } = useTranslation('auth');
  const { t: tCommon } = useTranslation('common');
  const { t: tErrors } = useTranslation('errors');
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as { phone: string; otpToken: string } | null;

  if (!state?.phone || !state?.otpToken) {
    return <Navigate to="/login" replace />;
  }

  const resetPasswordMutation = useResetPassword();

  const schema = newPasswordSchema(tCommon);
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<NewPasswordFormData>({
    resolver: zodResolver(schema),
    defaultValues: { password: '', confirmPassword: '' },
  });

  const onSubmit = (data: NewPasswordFormData) => {
    resetPasswordMutation.mutate(
      {
        otpToken: state.otpToken,
        newPassword: data.password,
        confirmPassword: data.confirmPassword,
      },
      {
        onSuccess: () => {
          navigate('/login', { state: { success: t('newPassword.successMessage') } });
        },
      },
    );
  };

  return (
    <div className="flex flex-1 items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-6">
        <h1 className="text-2xl font-bold text-content text-center dark:text-content-dark">
          {t('newPassword.title')}
        </h1>
        <Alert
          message={
            resetPasswordMutation.isError
              ? resolveApiError(resetPasswordMutation.error, tErrors)
              : ''
          }
          variant="error"
        />
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
          <Button type="submit" className="w-full" loading={resetPasswordMutation.isPending}>
            {t('newPassword.submit')}
          </Button>
        </form>
      </div>
    </div>
  );
}
