"use client"

import { useEffect, useState, useCallback } from "react"
import { toast } from "sonner"

import { ProductGrid } from "@/components/pos/ProductGrid"
import { CartPanel } from "@/components/pos/CartPanel"
import { CheckoutDialog } from "@/components/pos/CheckoutDialog"
import { MobileCartSheet } from "@/components/pos/MobileCartSheet"
import { Product } from "@/types"
import { calculateBestPromotion, Promotion } from "@/lib/promotionEngine"
import { useCartStore } from "@/store/cartStore"

import { useProductStore } from "@/store/productStore"
import { usePromotionStore } from "@/store/promotionStore"
import { useDashboardStore } from "@/store/dashboardStore"
import { useSaleHistoryStore } from "@/store/saleHistoryStore"

export default function POSPage() {
  const products = useProductStore((state) => state.products)
  const fetchProducts = useProductStore((state) => state.fetchProducts)
  const promotions = usePromotionStore((state) => state.promotions)
  const fetchPromotions = usePromotionStore((state) => state.fetchPromotions)
  const [isLoading, setIsLoading] = useState(true)
  
  // Checkout Dialog State
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)

  // Store selections
  const items = useCartStore((state) => state.items)
  const manualDiscount = useCartStore((state) => state.manualDiscount)
  const subtotal = useCartStore((state) => state.subtotal())
  const clearCart = useCartStore((state) => state.clearCart)

  const loadData = useCallback(async () => {
    try {
      // Fetch promotions via store (cached unless forced)
      await fetchPromotions()
      
      // Fetch products via store (cached unless forced)
      await fetchProducts()
    } catch (error) {
      console.error(error)
      throw error
    }
  }, [fetchPromotions, fetchProducts])

  useEffect(() => {
    let isMounted = true

    const loadInitialData = async () => {
      try {
        await loadData()
      } catch (error) {
        toast.error("ไม่สามารถโหลดข้อมูลสินค้าและโปรโมชั่นได้")
        console.error(error)
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadInitialData()

    return () => {
      isMounted = false
    }
  }, [loadData])

  const handleCheckoutSuccess = (soldItems: { productId: number; quantity: number }[]) => {
    setIsCheckoutOpen(false)
    clearCart()
    // Force refresh products in the store to sync stock with DB
    fetchProducts(true)
    // Clear dashboard stats cache so it recalculates on next visit
    useDashboardStore.getState().clearCache()
    // Clear sales history cache so it re-fetches the latest sales data
    useSaleHistoryStore.getState().clearCache()
  }

  // Calculate totals for checkout
  const promotionResult = calculateBestPromotion(items, promotions)
  const total = Math.max(0, subtotal - promotionResult.discount - manualDiscount)

  return (
    <div className="flex flex-col lg:flex-row h-full w-full overflow-hidden">
      {/* Product Grid — full height on mobile, shared on desktop */}
      <div className="flex-1 p-4 lg:p-6 overflow-hidden h-full">
        <ProductGrid products={products} isLoading={isLoading} />
      </div>

      {/* Cart Panel — desktop only */}
      <div className="hidden lg:block w-full lg:w-[400px] xl:w-[450px] shrink-0 h-full">
        <CartPanel 
          promotions={promotions} 
          onCheckout={() => setIsCheckoutOpen(true)} 
        />
      </div>

      {/* Mobile: Floating Cart FAB + Bottom Sheet */}
      <MobileCartSheet
        promotions={promotions}
        onCheckout={() => setIsCheckoutOpen(true)}
      />

      <CheckoutDialog
        open={isCheckoutOpen}
        onOpenChange={setIsCheckoutOpen}
        subtotal={subtotal}
        promotionDiscount={promotionResult.discount}
        manualDiscount={manualDiscount}
        total={total}
        promotionId={promotionResult.appliedPromotion?.id || null}
        onSuccess={handleCheckoutSuccess}
      />
    </div>
  )
}
