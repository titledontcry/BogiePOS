// types/index.ts

export interface Product {
  id: number
  name: string
  category: string
  price: number
  costPrice: number
  stock: number
  barcode?: string | null
  isActive: boolean
  createdAt: string
  updatedAt?: string
}

export interface Promotion {
  id: number
  name: string
  type: 'FIXED_DISCOUNT' | 'PERCENT_DISCOUNT' | 'BUNDLE'
  value: number
  quantityRequired: number
  specialPrice: number
  applicableCategories: string[]
  isActive: boolean
  createdAt?: string
}

export interface SaleItem {
  id: number
  productId: number
  product?: Product
  quantity: number
  unitPrice: number
  subtotal: number
}

export interface Sale {
  id: number
  subtotal: number
  promotionDiscount: number
  manualDiscount: number
  total: number
  note?: string | null
  paymentMethod?: string
  createdAt: string
  promotionId?: number | null
  promotion?: Promotion | null
  items: SaleItem[]
}

export interface DashboardStats {
  revenue: number
  transactions: number
  itemsSold: number
  totalDiscount: number
  profit: number
  dailySales: { date: string; revenue: number; transactions: number }[]
  monthlySales: { month: string; revenue: number }[]
  bestSellers: { productName: string; totalQty: number; totalRevenue: number }[]
}

export interface CartItem {
  productId: number
  name: string
  price: number
  quantity: number
  stock: number
  category: string
}

export interface CheckoutPayload {
  items: {
    productId: number
    quantity: number
    unitPrice: number
  }[]
  promotionId: number | null
  promotionDiscount: number
  manualDiscount: number
  subtotal: number
  total: number
  note: string
}
