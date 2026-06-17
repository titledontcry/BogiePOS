"use client"

import { useEffect, useState, useCallback } from "react"
import { toast } from "sonner"

import { ProductGrid } from "@/components/pos/ProductGrid"
import { CartPanel } from "@/components/pos/CartPanel"
import { CheckoutDialog } from "@/components/pos/CheckoutDialog"
import { Product } from "@/types"
import { calculateBestPromotion, Promotion } from "@/lib/promotionEngine"
import { useCartStore } from "@/store/cartStore"

export default function POSPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [promotions, setPromotions] = useState<Promotion[]>([])
  const [isLoading, setIsLoading] = useState(true)
  
  // Checkout Dialog State
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)

  // Store selections
  const items = useCartStore((state) => state.items)
  const manualDiscount = useCartStore((state) => state.manualDiscount)
  const subtotal = useCartStore((state) => state.subtotal())
  const clearCart = useCartStore((state) => state.clearCart)

  const fetchData = useCallback(async () => {
    setIsLoading(true)
    try {
      // Fetch only active products and promotions
      const [productsRes, promosRes] = await Promise.all([
        fetch("/api/products?active=true&limit=1000"), // Get a large number for POS
        fetch("/api/promotions")
      ])

      if (!productsRes.ok || !promosRes.ok) {
        throw new Error("Failed to fetch data")
      }

      const productsData = await productsRes.json()
      const promosData = await promosRes.json()

      setProducts(productsData.products)
      setPromotions(promosData)
    } catch (error) {
      toast.error("ไม่สามารถโหลดข้อมูลสินค้าและโปรโมชั่นได้")
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleCheckoutSuccess = () => {
    setIsCheckoutOpen(false)
    clearCart()
    fetchData() // Refresh stock after sale
  }

  // Calculate totals for checkout
  const promotionResult = calculateBestPromotion(items, promotions)
  const total = Math.max(0, subtotal - promotionResult.discount - manualDiscount)

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-64px)] overflow-hidden">
      {/* Left Area: Product Grid */}
      <div className="flex-1 p-4 lg:p-6 overflow-hidden h-[50vh] lg:h-full">
        <ProductGrid products={products} isLoading={isLoading} />
      </div>

      {/* Right Area: Cart Panel */}
      <div className="w-full lg:w-[400px] xl:w-[450px] shrink-0 h-[50vh] lg:h-full pb-16 lg:pb-0 z-10 lg:z-auto">
        <CartPanel 
          promotions={promotions} 
          onCheckout={() => setIsCheckoutOpen(true)} 
        />
      </div>

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
