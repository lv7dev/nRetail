import { create } from 'zustand'
import { storage } from '@/utils/storage'
import type { User } from '@/types/auth'

interface AuthState {
  user: User | null
  isReady: boolean
  setAuth: (user: User) => void
  clearAuth: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isReady: false,
  setAuth: (user) => set({ user, isReady: true }),
  clearAuth: () => {
    storage.clearTokens()
    set({ user: null })
  },
}))
