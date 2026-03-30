import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { Input } from '@/components/ui/Input/Input';
import { PasswordInput } from '@/components/ui/PasswordInput/PasswordInput';
import { Button } from '@/components/ui/Button/Button';
import { Alert } from '@/components/ui/Alert/Alert';
import { registerCompleteSchema, type RegisterCompleteFormData } from './schema';
import { useRegister } from '@/hooks/useAuth';
import { resolveApiError } from '@/utils/apiError';

interface LocationState {
  phone?: string;
  otpToken?: string;
}

export default function RegisterCompletePage() {
  const { t } = useTranslation('auth');
  const { t: tErrors } = useTranslation('errors');
  const { t: tCommon } = useTranslation('common');
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state ?? {}) as LocationState;
  const [error, setError] = useState('');

  const registerMutation = useRegister();

  const schema = registerCompleteSchema(tCommon);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterCompleteFormData>({
    resolver: zodResolver(schema),
  });

  if (!state.phone || !state.otpToken) {
    return <Navigate to="/login" replace />;
  }

  const { otpToken } = state;

  const onSubmit = (data: RegisterCompleteFormData) => {
    setError('');
    registerMutation.mutate(
      { otpToken, name: data.name, password: data.password, confirmPassword: data.confirmPassword },
      {
        onSuccess: () => {
          navigate('/', { replace: true });
        },
        onError: (err) => {
          setError(resolveApiError(err, tErrors));
        },
      },
    );
  };

  return (
    <div className="flex flex-1 items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-6">
        <h1 className="text-2xl font-bold text-content text-center dark:text-content-dark">
          {t('register.title')}
        </h1>
        <Alert message={error} variant="error" />
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          <Input
            label={t('register.name')}
            type="text"
            error={errors.name?.message}
            {...register('name')}
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
          <Button type="submit" className="w-full" loading={registerMutation.isPending}>
            {t('register.submit')}
          </Button>
        </form>
      </div>
    </div>
  );
}
