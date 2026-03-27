import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Input } from '@/components/ui/Input/Input';
import { Button } from '@/components/ui/Button/Button';
import { Alert } from '@/components/ui/Alert/Alert';
import { phoneSchema, type PhoneFormData } from './schema';
import { useRequestOtp } from '@/hooks/useAuth';
import { resolveApiError } from '@/utils/apiError';

export default function RegisterPage() {
  const { t } = useTranslation('auth');
  const { t: tErrors } = useTranslation('errors');
  const { t: tCommon } = useTranslation('common');
  const navigate = useNavigate();

  const requestOtpMutation = useRequestOtp('register');

  const schema = phoneSchema(tCommon);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PhoneFormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = (data: PhoneFormData) => {
    requestOtpMutation.mutate(data.phone, {
      onSuccess: () => {
        navigate('/otp', { state: { flow: 'register', phone: data.phone } });
      },
    });
  };

  return (
    <div className="flex flex-1 items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-6">
        <h1 className="text-2xl font-bold text-content text-center">{t('register.title')}</h1>
        <Alert
          message={
            requestOtpMutation.isError ? resolveApiError(requestOtpMutation.error, tErrors) : ''
          }
          variant="error"
        />
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          <Input
            label={t('register.phone')}
            type="tel"
            placeholder="09xxxxxxxx"
            error={errors.phone?.message}
            {...register('phone')}
          />
          <Button type="submit" className="w-full" loading={requestOtpMutation.isPending}>
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
  );
}
