// store/saleHistoryStore.ts
import { create } from 'zustand'
import { Sale } from '@/types'

interface SaleHistoryStore {
  cache: Record<string, Sale[]> // Keyed by "fromDate_toDate"
  isLoading: boolean
  error: string | null

  // Actions
  fetchSales: (fromDate: string, toDate: string, force?: boolean) => Promise<void>
  clearCache: () => void
}

export const useSaleHistoryStore = create<SaleHistoryStore>((set, get) => ({
  cache: {},
  isLoading: false,
  error: null,

  fetchSales: async (fromDate: string, toDate: string, force = false) => {
    const key = `${fromDate || 'all'}_${toDate || 'all'}`
    
    // If already in cache and not forced to refresh, skip fetching
    if (get().cache[key] && !force) {
      return
    }

    set({ isLoading: true, error: null })
    try {
      const url = new URL('/api/sales', window.location.origin)
      url.searchParams.append('limit', '100')
      if (fromDate) url.searchParams.append('from', fromDate)
      if (toDate) url.searchParams.append('to', toDate)

      const res = await fetch(url.toString())
      if (!res.ok) throw new Error('Failed to fetch sales history')

      const data = await res.json()
      const sales: Sale[] = data.sales || []

      set((state) => ({
        cache: {
          ...state.cache,
          [key]: sales
        },
        isLoading: false
      }))
    } catch (err: any) {
      set({ error: err.message || 'Unknown error', isLoading: false })
    }
  },

  clearCache: () => set({ cache: {} })
}))
