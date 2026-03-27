import { get, post } from './axios'
import type { AuthResponse, OtpVerifyResponse, User } from '@/types/auth'

export const authService = {
  login(phone: string, password: string): Promise<AuthResponse> {
    return post<AuthResponse>('/auth/login', { phone, password })
  },

  requestRegisterOtp(phone: string): Promise<void> {
    return post<void>('/auth/otp/register', { phone })
  },

  requestForgotPasswordOtp(phone: string): Promise<void> {
    return post<void>('/auth/otp/forgot-password', { phone })
  },

  verifyOtp(phone: string, otp: string): Promise<OtpVerifyResponse> {
    return post<OtpVerifyResponse>('/auth/otp/verify', { phone, otp })
  },

  register(otpToken: string, name: string, password: string, confirmPassword: string): Promise<AuthResponse> {
    return post<AuthResponse>('/auth/register', { otpToken, name, password, confirmPassword })
  },

  resetPassword(otpToken: string, newPassword: string, confirmPassword: string): Promise<AuthResponse> {
    return post<AuthResponse>('/auth/reset-password', { otpToken, newPassword, confirmPassword })
  },

  refresh(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    return post('/auth/refresh', { refreshToken })
  },

  logout(refreshToken: string): Promise<void> {
    return post<void>('/auth/logout', { refreshToken })
  },

  getMe(): Promise<User> {
    return get<User>('/auth/me')
  },
}
