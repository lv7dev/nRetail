import { nativeStorage } from 'zmp-sdk'

const ACCESS_TOKEN_KEY = 'accessToken'
const REFRESH_TOKEN_KEY = 'refreshToken'

export const storage = {
  getAccessToken(): string | null {
    return nativeStorage.getItem(ACCESS_TOKEN_KEY) || null
  },
  getRefreshToken(): string | null {
    return nativeStorage.getItem(REFRESH_TOKEN_KEY) || null
  },
  setTokens(accessToken: string, refreshToken: string): void {
    nativeStorage.setItem(ACCESS_TOKEN_KEY, accessToken)
    nativeStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)
  },
  clearTokens(): void {
    nativeStorage.removeItem(ACCESS_TOKEN_KEY)
    nativeStorage.removeItem(REFRESH_TOKEN_KEY)
  },
}
