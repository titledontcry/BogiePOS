"use client"

import { useState } from "react"
import { CheckCircle2, Receipt } from "lucide-react"
import { toast } from "sonner"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useCartStore } from "@/store/cartStore"
import { formatCurrency } from "@/lib/utils"

interface CheckoutDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  subtotal: number
  promotionDiscount: number
  manualDiscount: number
  total: number
  promotionId: number | null
  onSuccess: (soldItems: { productId: number; quantity: number }[]) => void
}

export function CheckoutDialog({ 
  open, 
  onOpenChange, 
  subtotal, 
  promotionDiscount, 
  manualDiscount, 
  total,
  promotionId,
  onSuccess
}: CheckoutDialogProps) {
  const [cashReceived, setCashReceived] = useState<string>("")
  const [note, setNote] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const items = useCartStore((state) => state.items)
  
  const cash = parseFloat(cashReceived) || 0
  const change = Math.max(0, cash - total)
  const isEnoughCash = cash >= total || cash === 0 // Allow 0 for non-cash payments (simplification)

  const handleCheckout = async () => {
    if (cash > 0 && cash < total) {
      toast.error("รับเงินมาไม่พอดีกับยอดชำระ")
      return
    }

    setIsLoading(true)
    try {
      const payload = {
        items: items.map(i => ({
          productId: i.productId,
          quantity: i.quantity,
          unitPrice: i.price,
        })),
        promotionId,
        promotionDiscount,
        manualDiscount,
        subtotal,
        total,
        note: note || undefined
      }

      const res = await fetch("/api/sales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "ชำระเงินไม่สำเร็จ")
      }

      toast.success("บันทึกการขายสำเร็จ")
      setCashReceived("")
      setNote("")
      onSuccess(items.map(i => ({ productId: i.productId, quantity: i.quantity })))
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "ชำระเงินไม่สำเร็จ")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Receipt className="h-5 w-5 text-primary" /> ยืนยันการชำระเงิน
          </DialogTitle>
          <DialogDescription>
            ตรวจสอบยอดเงินและรับชำระจากลูกค้า
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="bg-muted/30 p-4 rounded-xl space-y-2 border">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>ยอดรวมสินค้า</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            {(promotionDiscount > 0 || manualDiscount > 0) && (
              <div className="flex justify-between text-sm text-[var(--success)]">
                <span>ส่วนลดรวม</span>
                <span>-{formatCurrency(promotionDiscount + manualDiscount)}</span>
              </div>
            )}
            <div className="flex justify-between items-end pt-2 border-t border-border/50">
              <span className="font-medium">ยอดสุทธิ</span>
              <span className="text-3xl font-extrabold text-primary">
                {formatCurrency(total)}
              </span>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cash">รับเงินสด (บาท)</Label>
              <Input
                id="cash"
                type="number"
                placeholder="จำนวนเงินที่รับมา (เว้นว่างได้)"
                value={cashReceived}
                onChange={(e) => setCashReceived(e.target.value)}
                className="text-lg"
                autoFocus
              />
            </div>

            {cash > 0 && (
              <div className={`p-4 rounded-xl border flex justify-between items-center ${
                isEnoughCash 
                  ? 'bg-[var(--success-soft)] border-transparent text-[var(--success)]' 
                  : 'bg-destructive/10 border-destructive/20 text-destructive'
              }`}>
                <span className="font-medium">เงินทอน</span>
                <span className="text-xl font-bold">
                  {isEnoughCash ? formatCurrency(change) : "รับเงินไม่พอ"}
                </span>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="note">หมายเหตุ (ถ้ามี)</Label>
              <Input
                id="note"
                placeholder="เช่น จ่ายโอน, ลูกค้า VIP..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>ยกเลิก</Button>
          <Button 
            onClick={handleCheckout} 
            disabled={isLoading || (cash > 0 && cash < total)}
            className="gap-2"
          >
            {isLoading ? "กำลังบันทึก..." : (
              <>
                <CheckCircle2 className="h-4 w-4" /> ยืนยันชำระเงิน
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
