"use client"

import { useState, useEffect, useMemo, useRef } from "react"
import { ShoppingBag, Minus, Plus, Trash2, Tag, Receipt } from "lucide-react"

import { useCartStore } from "@/store/cartStore"
import { formatCurrency } from "@/lib/utils"
import { calculateBestPromotion, Promotion } from "@/lib/promotionEngine"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"

interface MobileCartSheetProps {
  promotions: Promotion[]
  onCheckout: () => void
}

export function MobileCartSheet({ promotions, onCheckout }: MobileCartSheetProps) {
  const [open, setOpen] = useState(false)
  const [bounce, setBounce] = useState(false)
  const prevCount = useRef(0)

  const items = useCartStore((state) => state.items)
  const clearCart = useCartStore((state) => state.clearCart)
  const updateQty = useCartStore((state) => state.updateQty)
  const removeItem = useCartStore((state) => state.removeItem)
  const manualDiscount = useCartStore((state) => state.manualDiscount)
  const setManualDiscount = useCartStore((state) => state.setManualDiscount)

  const subtotal = useCartStore((state) => state.subtotal())
  const totalItems = useCartStore((state) => state.totalItems())

  // Calculate promotion
  const promotionResult = useMemo(() => {
    return calculateBestPromotion(items, promotions)
  }, [items, promotions])

  const totalDiscount = promotionResult.discount + manualDiscount
  const finalTotal = Math.max(0, subtotal - totalDiscount)

  // Bounce animation when item count changes
  useEffect(() => {
    if (totalItems > prevCount.current && totalItems > 0) {
      setBounce(true)
      const timer = setTimeout(() => setBounce(false), 400)
      return () => clearTimeout(timer)
    }
    prevCount.current = totalItems
  }, [totalItems])

  const handleCheckout = () => {
    setOpen(false)
    // Small delay so sheet closes smoothly before dialog opens
    setTimeout(() => onCheckout(), 200)
  }

  return (
    <>
      {/* Floating Action Button — only visible on mobile when cart has items */}
      {totalItems > 0 && (
        <button
          onClick={() => setOpen(true)}
          aria-label={`ตะกร้าสินค้า ${totalItems} ชิ้น`}
          className={`lg:hidden fixed right-4 bottom-22 z-40 flex items-center gap-2.5 rounded-full bg-white px-5 py-3.5 shadow-[0_4px_24px_rgba(0,0,0,0.10),0_1px_3px_rgba(0,0,0,0.06)] border border-border/30 will-change-transform transition-all duration-[var(--duration-normal)] ease-[var(--ease-out-expo)] active:scale-[0.93] active:shadow-[0_2px_8px_rgba(0,0,0,0.08)] ${
            bounce ? "animate-[cartBounce_0.35s_var(--ease-spring)]" : ""
          }`}
        >
          <div className="relative">
            <ShoppingBag className="h-5 w-5 text-foreground" />
          </div>
          <span className="text-sm font-bold text-foreground">
            {formatCurrency(subtotal)}
          </span>
          <div className="flex h-6 min-w-6 items-center justify-center rounded-full bg-primary px-1.5 text-[11px] font-bold text-primary-foreground transition-transform duration-[var(--duration-fast)] ease-[var(--ease-out-back)]">
            {totalItems}
          </div>
        </button>
      )}

      {/* Bottom Sheet */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="bottom"
          className="rounded-t-3xl bg-white p-0 max-h-[85vh] flex flex-col"
        >
          {/* Drag handle */}
          <div className="flex justify-center pt-3 pb-1 shrink-0">
            <div className="h-1 w-10 rounded-full bg-border" />
          </div>

          {/* Header */}
          <SheetHeader className="px-5 pb-3 border-b border-border/50 shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="bg-primary/10 p-2 rounded-xl">
                  <ShoppingBag className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <SheetTitle className="text-left text-lg">ตะกร้าสินค้า</SheetTitle>
                  <SheetDescription className="text-left text-xs">
                    {totalItems} รายการ
                  </SheetDescription>
                </div>
              </div>
              {items.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-destructive text-xs h-9"
                  onClick={clearCart}
                >
                  <Trash2 className="h-3.5 w-3.5 mr-1" />
                  ล้าง
                </Button>
              )}
            </div>
          </SheetHeader>

          {/* Cart Items */}
          <ScrollArea className="flex-1 min-h-0">
            <div className="px-5 py-3 space-y-1">
              {items.map((item) => (
                <div
                  key={item.productId}
                  className="flex items-center justify-between py-3 border-b border-border/40"
                >
                  <div className="flex-1 min-w-0 pr-3">
                    <h4 className="text-sm font-semibold leading-tight truncate">
                      {item.name}
                    </h4>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      {formatCurrency(item.price)} / ชิ้น
                    </p>
                    <p className="text-sm text-primary font-bold mt-0.5">
                      {formatCurrency(item.price * item.quantity)}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {/* Qty controls */}
                    <div className="flex items-center gap-0.5 bg-muted/60 rounded-xl p-0.5 border">
                      <button
                        onClick={() => updateQty(item.productId, item.quantity - 1)}
                        className="h-9 w-9 flex items-center justify-center rounded-lg hover:bg-white active:scale-[0.90] transition-all duration-[var(--duration-fast)] ease-[var(--ease-out-expo)]"
                        aria-label={`ลดจำนวน ${item.name}`}
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="w-7 text-center text-sm font-semibold tabular-nums">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQty(item.productId, item.quantity + 1)}
                        disabled={item.quantity >= item.stock}
                        className="h-9 w-9 flex items-center justify-center rounded-lg hover:bg-white active:scale-[0.90] transition-all duration-[var(--duration-fast)] ease-[var(--ease-out-expo)] disabled:opacity-40"
                        aria-label={`เพิ่มจำนวน ${item.name}`}
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    {/* Delete — always visible on mobile */}
                    <button
                      onClick={() => removeItem(item.productId)}
                      className="h-9 w-9 flex items-center justify-center rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 active:scale-[0.88] transition-all duration-[var(--duration-fast)] ease-[var(--ease-out-expo)]"
                      aria-label={`ลบ ${item.name}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          {/* Summary + Checkout */}
          {items.length > 0 && (
            <div className="px-5 pt-4 pb-6 border-t border-border/50 bg-background/60 shrink-0 space-y-3">
              {/* Subtotal */}
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>รวม ({totalItems} ชิ้น)</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>

              {/* Promotion */}
              {promotionResult.discount > 0 && (
                <div className="flex justify-between items-start text-[var(--success)] text-sm">
                  <div className="flex flex-col">
                    <span className="flex items-center gap-1">
                      <Tag className="h-3.5 w-3.5" /> โปรโมชั่น
                    </span>
                    <span className="text-[10px] opacity-80">
                      {promotionResult.label}
                    </span>
                  </div>
                  <span>-{formatCurrency(promotionResult.discount)}</span>
                </div>
              )}

              {/* Manual Discount */}
              <div className="flex items-center justify-between">
                <Label htmlFor="mobile-discount" className="text-sm text-muted-foreground">
                  ส่วนลดเพิ่มเติม
                </Label>
                <div className="relative w-24">
                  <Input
                    id="mobile-discount"
                    type="number"
                    min="0"
                    max={subtotal - promotionResult.discount}
                    className="h-9 text-right pr-6 text-sm"
                    value={manualDiscount || ""}
                    onChange={(e) => setManualDiscount(Number(e.target.value))}
                  />
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                    ฿
                  </span>
                </div>
              </div>

              <Separator />

              {/* Total */}
              <div className="flex justify-between items-end">
                <span className="font-medium text-muted-foreground">ยอดสุทธิ</span>
                <div className="flex flex-col items-end">
                  <span className="text-2xl font-extrabold text-primary leading-none">
                    {formatCurrency(finalTotal)}
                  </span>
                  {totalDiscount > 0 && (
                    <span className="text-xs text-[var(--success)] mt-1">
                      ประหยัดไป {formatCurrency(totalDiscount)}
                    </span>
                  )}
                </div>
              </div>

              {/* Checkout Button */}
              <Button
                className="w-full h-13 text-base font-bold gap-2 rounded-2xl"
                onClick={handleCheckout}
              >
                <Receipt className="h-5 w-5" />
                ชำระเงิน
              </Button>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </>
  )
}
