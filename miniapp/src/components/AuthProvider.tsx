import { useEffect, type ReactNode } from 'react'
import { authService } from '@/services/authService'
import { storage } from '@/utils/storage'
import { useAuthStore } from '@/store/useAuthStore'
import SplashPage from '@/pages/splash'

interface AuthProviderProps {
  children: ReactNode
}

export default function AuthProvider({ children }: AuthProviderProps) {
  const { isReady, setAuth, clearAuth } = useAuthStore()

  useEffect(() => {
    const token = storage.getAccessToken()
    if (!token) {
      // No token — mark ready immediately; router will redirect to /login
      useAuthStore.setState({ isReady: true })
      return
    }

    authService
      .getMe()
      .then((user) => {
        setAuth(user)
      })
      .catch(() => {
        clearAuth()
        useAuthStore.setState({ isReady: true })
      })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  if (!isReady) {
    return <SplashPage />
  }

  return <>{children}</>
}
