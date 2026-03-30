import { useLocation, useNavigate, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { OtpInput } from '@/components/ui/OtpInput/OtpInput';
import { Alert } from '@/components/ui/Alert/Alert';
import { useVerifyOtp, useRequestOtp } from '@/hooks/useAuth';
import { resolveApiError } from '@/utils/apiError';

type OtpState = { flow: 'register' | 'forgot'; phone: string };

export default function OtpPage() {
  const { t } = useTranslation('auth');
  const { t: tErrors } = useTranslation('errors');
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as OtpState | null;
  const [error, setError] = useState('');

  const verifyOtpMutation = useVerifyOtp();
  const resendMutation = useRequestOtp(state?.flow ?? 'register');

  if (!state?.flow || !state?.phone) {
    return <Navigate to="/login" replace />;
  }

  const handleComplete = (code: string) => {
    setError('');
    verifyOtpMutation.mutate(
      { phone: state.phone, otp: code },
      {
        onSuccess: (data) => {
          if (state.flow === 'register') {
            navigate('/register/complete', {
              state: { phone: state.phone, otpToken: data.otpToken },
            });
          } else {
            navigate('/new-password', {
              state: { phone: state.phone, otpToken: data.otpToken },
            });
          }
        },
        onError: (err) => {
          setError(resolveApiError(err, tErrors));
        },
      },
    );
  };

  const handleResend = () => {
    resendMutation.mutate(state.phone);
  };

  return (
    <div className="flex flex-1 items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-6 text-center">
        <h1 className="text-2xl font-bold text-content dark:text-content-dark">{t('otp.title')}</h1>
        <p className="text-sm text-content-muted dark:text-content-dark-muted">
          {t('otp.description')}
        </p>
        <p className="text-sm text-content-muted dark:text-content-dark-muted">
          {t('otp.codeSentTo')}{' '}
          <span className="font-medium text-content dark:text-content-dark">{state.phone}</span>
        </p>
        {resendMutation.isSuccess && <Alert variant="success" message={t('otp.resendSuccess')} />}
        {resendMutation.isError && (
          <Alert variant="error" message={resolveApiError(resendMutation.error, tErrors)} />
        )}
        {error && <Alert variant="error" message={error} />}
        <OtpInput onComplete={handleComplete} className="justify-center" />
        {verifyOtpMutation.isPending && (
          <p className="text-sm text-content-muted dark:text-content-dark-muted">...</p>
        )}
        <button
          type="button"
          onClick={handleResend}
          disabled={resendMutation.isPending}
          className="text-sm text-primary hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {resendMutation.isPending ? t('otp.resending') : t('otp.resend')}
        </button>
      </div>
    </div>
  );
}
