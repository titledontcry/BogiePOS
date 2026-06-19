// store/promotionStore.ts
import { create } from 'zustand'
import { Promotion } from '@/types'

interface PromotionStore {
  promotions: Promotion[]
  isLoaded: boolean
  isLoading: boolean
  error: string | null

  // Actions
  fetchPromotions: (force?: boolean) => Promise<void>
  addPromotion: (promo: Promotion) => void
  updatePromotion: (promo: Promotion) => void
  deletePromotion: (promoId: number) => void
}

export const usePromotionStore = create<PromotionStore>((set, get) => ({
  promotions: [],
  isLoaded: false,
  isLoading: false,
  error: null,

  fetchPromotions: async (force = false) => {
    // Skip if already loaded and not forced
    if (get().isLoaded && !force) {
      return
    }

    set({ isLoading: true, error: null })
    try {
      const res = await fetch('/api/promotions')
      if (!res.ok) throw new Error('Failed to fetch promotions')
      
      const data = await res.json()
      set({
        promotions: data,
        isLoaded: true,
        isLoading: false
      })
    } catch (err: any) {
      set({ error: err.message || 'Unknown error', isLoading: false })
    }
  },

  addPromotion: (promo) => set((state) => ({
    promotions: [promo, ...state.promotions]
  })),

  updatePromotion: (promo) => set((state) => ({
    promotions: state.promotions.map(p => p.id === promo.id ? promo : p)
  })),

  deletePromotion: (promoId) => set((state) => ({
    promotions: state.promotions.filter(p => p.id !== promoId)
  }))
}))
