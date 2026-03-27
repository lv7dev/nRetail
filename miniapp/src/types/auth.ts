export interface User {
  id: string
  phone: string
  name: string
  role: string
}

export interface TokenPair {
  accessToken: string
  refreshToken: string
}

export interface AuthResponse extends TokenPair {
  user: User
}

export interface OtpVerifyResponse {
  otpToken: string
}
