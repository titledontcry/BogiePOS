// store/authStore.ts
import { create } from 'zustand'

export interface User {
  id: number
  username: string
  name: string
  role: string
}

interface AuthStore {
  user: User | null
  isAuthenticated: boolean
  isInitialized: boolean
  isLoading: boolean
  error: string | null

  // Actions
  login: (username: string, password: string) => Promise<boolean>
  logout: () => Promise<void>
  checkSession: () => Promise<void>
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isInitialized: false,
  isLoading: false,
  error: null,

  login: async (username, password) => {
    set({ isLoading: true, error: null })
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'การเข้าสู่ระบบล้มเหลว')
      }

      set({
        user: data.user,
        isAuthenticated: true,
        isLoading: false,
        isInitialized: true
      })
      return true
    } catch (err: any) {
      set({
        error: err.message || 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ',
        isLoading: false
      })
      return false
    }
  },

  logout: async () => {
    set({ isLoading: true })
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
    } catch (err) {
      console.error('Error during logout api call:', err)
    } finally {
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        isInitialized: true
      })
    }
  },

  checkSession: async () => {
    // If already initialized and authenticated, we can avoid redundant requests
    // but checkSession is usually run once on app load
    if (get().isInitialized) return

    set({ isLoading: true })
    try {
      const res = await fetch('/api/auth/me')
      if (res.ok) {
        const data = await res.json()
        set({
          user: data.user,
          isAuthenticated: true,
          isLoading: false,
          isInitialized: true
        })
      } else {
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          isInitialized: true
        })
      }
    } catch (err) {
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        isInitialized: true
      })
    }
  }
}))
