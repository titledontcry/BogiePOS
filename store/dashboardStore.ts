// store/dashboardStore.ts
import { create } from 'zustand'

interface DashboardData {
  revenue: number
  transactions: number
  itemsSold: number
  totalDiscount: number
  profit: number
  dailySales: { date: string; revenue: number; transactions: number }[]
  monthlySales: { month: string; revenue: number }[]
  bestSellers: { productName: string; totalQty: number; totalRevenue: number }[]
}

interface DashboardStore {
  cache: Record<string, DashboardData>
  isLoading: boolean
  error: string | null

  // Actions
  fetchDashboard: (period: string, force?: boolean) => Promise<void>
  clearCache: () => void
}

export const useDashboardStore = create<DashboardStore>((set, get) => ({
  cache: {},
  isLoading: false,
  error: null,

  fetchDashboard: async (period: string, force = false) => {
    // If already in cache and not forced to refresh, skip fetching
    if (get().cache[period] && !force) {
      return
    }

    set({ isLoading: true, error: null })
    try {
      const res = await fetch(`/api/dashboard?period=${period}`)
      if (!res.ok) throw new Error('Failed to fetch dashboard data')
      
      const data = await res.json()
      set((state) => ({
        cache: {
          ...state.cache,
          [period]: data
        },
        isLoading: false
      }))
    } catch (err: any) {
      set({ error: err.message || 'Unknown error', isLoading: false })
    }
  },

  clearCache: () => set({ cache: {} })
}))
