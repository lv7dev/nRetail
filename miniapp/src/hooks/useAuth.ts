import { useMutation, useQuery } from '@tanstack/react-query';
import { authService } from '@/services/authService';
import { storage } from '@/utils/storage';
import { useAuthStore } from '@/store/useAuthStore';

export function useLogin() {
  const setAuth = useAuthStore((s) => s.setAuth);
  return useMutation({
    mutationFn: ({ phone, password }: { phone: string; password: string }) =>
      authService.login(phone, password),
    onSuccess: (data) => {
      storage.setTokens(data.accessToken, data.refreshToken);
      setAuth(data.user);
    },
  });
}

export function useRequestOtp(flow: 'register' | 'forgot') {
  return useMutation({
    mutationFn: (phone: string) =>
      flow === 'register'
        ? authService.requestRegisterOtp(phone)
        : authService.requestForgotPasswordOtp(phone),
  });
}

export function useVerifyOtp() {
  return useMutation({
    mutationFn: ({ phone, otp }: { phone: string; otp: string }) =>
      authService.verifyOtp(phone, otp),
  });
}

export function useRegister() {
  const setAuth = useAuthStore((s) => s.setAuth);
  return useMutation({
    mutationFn: ({
      otpToken,
      name,
      password,
      confirmPassword,
    }: {
      otpToken: string;
      name: string;
      password: string;
      confirmPassword: string;
    }) => authService.register(otpToken, name, password, confirmPassword),
    onSuccess: (data) => {
      storage.setTokens(data.accessToken, data.refreshToken);
      setAuth(data.user);
    },
  });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: ({
      otpToken,
      newPassword,
      confirmPassword,
    }: {
      otpToken: string;
      newPassword: string;
      confirmPassword: string;
    }) => authService.resetPassword(otpToken, newPassword, confirmPassword),
  });
}

export function useLogout() {
  const clearAuth = useAuthStore((s) => s.clearAuth);
  return useMutation({
    mutationFn: () => {
      const refreshToken = storage.getRefreshToken() ?? '';
      return authService.logout(refreshToken);
    },
    onSettled: () => {
      clearAuth();
    },
  });
}

export function useMe() {
  return useQuery({
    queryKey: ['me'],
    queryFn: authService.getMe,
    enabled: false,
  });
}
