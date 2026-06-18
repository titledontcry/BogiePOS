// store/cartStore.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface CartItem {
  productId: number
  name: string
  price: number
  quantity: number
  stock: number
  category: string
}

interface CartStore {
  items: CartItem[]
  promotionId: number | null
  manualDiscount: number

  // Actions
  addItem: (product: CartItem) => void
  removeItem: (productId: number) => void
  updateQty: (productId: number, qty: number) => void
  setManualDiscount: (amount: number) => void
  setPromotion: (id: number | null) => void
  clearCart: () => void

  // Computed
  subtotal: () => number
  totalItems: () => number
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      promotionId: null,
      manualDiscount: 0,

      addItem: (product) => set((state) => {
        const existing = state.items.find(i => i.productId === product.productId)
        if (existing) {
          return {
            items: state.items.map(i =>
              i.productId === product.productId
                ? { ...i, quantity: Math.min(i.quantity + 1, i.stock), category: i.category || "อื่นๆ" }
                : { ...i, category: i.category || "อื่นๆ" }
            )
          }
        }
        return { items: [...state.items, { ...product, category: product.category || "อื่นๆ", quantity: 1 }] }
      }),

      removeItem: (productId) => set((state) => ({
        items: state.items.filter(i => i.productId !== productId)
      })),

      updateQty: (productId, qty) => set((state) => ({
        items: qty <= 0
          ? state.items.filter(i => i.productId !== productId)
          : state.items.map(i => i.productId === productId ? { ...i, quantity: Math.min(qty, i.stock) } : i)
      })),

      setManualDiscount: (amount) => set({ manualDiscount: amount }),
      setPromotion: (id) => set({ promotionId: id }),
      clearCart: () => set({ items: [], promotionId: null, manualDiscount: 0 }),

      subtotal: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
      totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
    }),
    { name: 'pos-cart' }
  )
)
