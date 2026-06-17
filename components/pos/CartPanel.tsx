"use client"

import { useMemo } from "react"
import { ShoppingBag, Tag, Trash2 } from "lucide-react"

import { useCartStore } from "@/store/cartStore"
import { formatCurrency } from "@/lib/utils"
import { calculateBestPromotion, Promotion } from "@/lib/promotionEngine"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { CartItem } from "./CartItem"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"

interface CartPanelProps {
  promotions: Promotion[]
  onCheckout: () => void
}

export function CartPanel({ promotions, onCheckout }: CartPanelProps) {
  const items = useCartStore((state) => state.items)
  const clearCart = useCartStore((state) => state.clearCart)
  const manualDiscount = useCartStore((state) => state.manualDiscount)
  const setManualDiscount = useCartStore((state) => state.setManualDiscount)
  const setPromotionId = useCartStore((state) => state.setPromotion)

  const subtotal = useCartStore((state) => state.subtotal())
  const totalItems = useCartStore((state) => state.totalItems())

  // Calculate promotion
  const promotionResult = useMemo(() => {
    const result = calculateBestPromotion(items, promotions)
    setPromotionId(result.appliedPromotion?.id || null)
    return result
  }, [items, promotions, setPromotionId])

  const totalDiscount = promotionResult.discount + manualDiscount
  const finalTotal = Math.max(0, subtotal - totalDiscount)

  return (
    <div className="flex flex-col h-full bg-card border-l border-border shadow-2xl lg:shadow-none">
      {/* Header */}
      <div className="p-4 border-b border-border flex items-center justify-between shrink-0 bg-background/50 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <div className="bg-violet-100 dark:bg-violet-900/50 p-2 rounded-lg">
            <ShoppingBag className="h-5 w-5 text-violet-600 dark:text-violet-400" />
          </div>
          <h2 className="font-bold text-lg">ตะกร้าสินค้า</h2>
        </div>
        {items.length > 0 && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-muted-foreground hover:text-destructive text-xs h-8"
            onClick={clearCart}
          >
            <Trash2 className="h-3.5 w-3.5 mr-1.5" />
            ล้างตะกร้า
          </Button>
        )}
      </div>

      {/* Cart Items */}
      <ScrollArea className="flex-1 p-4">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-20 text-muted-foreground">
            <ShoppingBag className="h-12 w-12 mb-4 opacity-20" />
            <p>ยังไม่มีสินค้าในตะกร้า</p>
            <p className="text-sm opacity-70">เลือกสินค้าจากรายการด้านซ้าย</p>
          </div>
        ) : (
          <div className="space-y-1 pb-4">
            {items.map(item => (
              <CartItem key={item.productId} productId={item.productId} />
            ))}
          </div>
        )}
      </ScrollArea>

      {/* Summary Footer */}
      {items.length > 0 && (
        <div className="p-4 border-t border-border bg-muted/20 shrink-0 space-y-4">
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>รวม ({totalItems} ชิ้น)</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>

            {/* Promotion Area */}
            {promotionResult.discount > 0 && (
              <div className="flex justify-between items-start text-emerald-600 dark:text-emerald-400">
                <div className="flex flex-col">
                  <span className="flex items-center gap-1">
                    <Tag className="h-3.5 w-3.5" /> โปรโมชั่น
                  </span>
                  <span className="text-[10px] opacity-80">{promotionResult.label}</span>
                </div>
                <span>-{formatCurrency(promotionResult.discount)}</span>
              </div>
            )}

            {/* Manual Discount Area */}
            <div className="flex items-center justify-between pt-2">
              <Label htmlFor="manual-discount" className="text-muted-foreground">ส่วนลดเพิ่มเติม</Label>
              <div className="relative w-24">
                <Input 
                  id="manual-discount"
                  type="number" 
                  min="0"
                  max={subtotal - promotionResult.discount}
                  className="h-8 text-right pr-6" 
                  value={manualDiscount || ""}
                  onChange={(e) => setManualDiscount(Number(e.target.value))}
                />
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">฿</span>
              </div>
            </div>
          </div>

          <Separator />

          <div className="flex justify-between items-end">
            <span className="font-medium text-muted-foreground">ยอดสุทธิ</span>
            <div className="flex flex-col items-end">
              <span className="text-2xl font-bold text-violet-600 dark:text-violet-400 leading-none">
                {formatCurrency(finalTotal)}
              </span>
              {totalDiscount > 0 && (
                <span className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
                  ประหยัดไป {formatCurrency(totalDiscount)}
                </span>
              )}
            </div>
          </div>

          <Button 
            className="w-full h-12 text-lg shadow-md shadow-violet-500/20" 
            onClick={onCheckout}
          >
            ชำระเงิน
          </Button>
        </div>
      )}
    </div>
  )
}
