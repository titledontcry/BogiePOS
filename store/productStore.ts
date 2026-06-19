// store/productStore.ts
import { create } from 'zustand'
import { Product } from '@/types'

interface ProductSummary {
  total: number
  inStock: number
  lowStock: number
  outOfStock: number
}

interface ProductStore {
  products: Product[]
  summary: ProductSummary
  categories: string[]
  isLoaded: boolean
  isLoading: boolean
  error: string | null

  // Actions
  fetchProducts: (force?: boolean) => Promise<void>
  addProduct: (product: Product) => void
  updateProduct: (product: Product) => void
  deleteProduct: (productId: number) => void
}

const calculateStats = (products: Product[]): ProductSummary => {
  return {
    total: products.length,
    inStock: products.filter(p => p.stock > 0).length,
    lowStock: products.filter(p => p.stock > 0 && p.stock <= 5).length,
    outOfStock: products.filter(p => p.stock <= 0).length
  }
}

const getUniqueCategories = (products: Product[]): string[] => {
  return Array.from(new Set(products.map(p => p.category)))
    .filter(Boolean)
    .sort()
}

export const useProductStore = create<ProductStore>((set, get) => ({
  products: [],
  summary: { total: 0, inStock: 0, lowStock: 0, outOfStock: 0 },
  categories: [],
  isLoaded: false,
  isLoading: false,
  error: null,

  fetchProducts: async (force = false) => {
    // If already loaded and not forced to refresh, skip fetching
    if (get().isLoaded && !force && get().products.length > 0) {
      return
    }

    set({ isLoading: true, error: null })
    try {
      // Fetch all active products (limit 1000 to get the entire list)
      const res = await fetch('/api/products?limit=1000')
      if (!res.ok) throw new Error('Failed to fetch products')
      
      const data = await res.json()
      const fetchedProducts: Product[] = data.products || []
      
      set({
        products: fetchedProducts,
        summary: calculateStats(fetchedProducts),
        categories: getUniqueCategories(fetchedProducts),
        isLoaded: true,
        isLoading: false
      })
    } catch (err: any) {
      set({ error: err.message || 'Unknown error', isLoading: false })
    }
  },

  addProduct: (product) => set((state) => {
    const updated = [product, ...state.products]
    return {
      products: updated,
      summary: calculateStats(updated),
      categories: getUniqueCategories(updated)
    }
  }),

  updateProduct: (product) => set((state) => {
    const updated = state.products.map(p => p.id === product.id ? product : p)
    return {
      products: updated,
      summary: calculateStats(updated),
      categories: getUniqueCategories(updated)
    }
  }),

  deleteProduct: (productId) => set((state) => {
    const updated = state.products.filter(p => p.id !== productId)
    return {
      products: updated,
      summary: calculateStats(updated),
      categories: getUniqueCategories(updated)
    }
  })
}))
