"use client"

import { useState, useEffect } from "react"
import { CheckCircle2, Receipt, Coins, QrCode, Loader2 } from "lucide-react"
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
  const [paymentMethod, setPaymentMethod] = useState<"CASH" | "PROMPTPAY">("CASH")
  const [cashReceived, setCashReceived] = useState<string>("")
  const [note, setNote] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const items = useCartStore((state) => state.items)
  
  // Omise states
  const [chargeId, setChargeId] = useState<string | null>(null)
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null)
  const [paymentStatus, setPaymentStatus] = useState<"idle" | "generating" | "pending" | "successful" | "failed">("idle")
  
  const cash = parseFloat(cashReceived) || 0
  const change = Math.max(0, cash - total)
  const isEnoughCash = cash >= total || cash === 0

  // Reset states on dialog close
  useEffect(() => {
    if (!open) {
      setPaymentMethod("CASH")
      setCashReceived("")
      setNote("")
      setChargeId(null)
      setQrCodeUrl(null)
      setPaymentStatus("idle")
      setIsLoading(false)
    }
  }, [open])

  // Poll status when charge is pending
  useEffect(() => {
    if (paymentStatus !== "pending" || !chargeId) return

    let isMounted = true
    let intervalId: NodeJS.Timeout

    const checkStatus = async () => {
      try {
        const res = await fetch(`/api/checkout/omise/status?chargeId=${chargeId}`)
        if (!res.ok) throw new Error("Failed to check status")
        const data = await res.json()

        if (isMounted) {
          if (data.status === "successful") {
            setPaymentStatus("successful")
            setTimeout(() => {
              if (isMounted) {
                submitSaleRecord("PROMPTPAY")
              }
            }, 1200)
          } else if (data.status === "failed") {
            setPaymentStatus("failed")
            toast.error("การชำระเงินล้มเหลว หรือหมดเวลาทำรายการ")
          }
        }
      } catch (err) {
        console.error("Status polling error:", err)
      }
    }

    checkStatus()
    intervalId = setInterval(checkStatus, 3000)

    return () => {
      isMounted = false
      clearInterval(intervalId)
    }
  }, [paymentStatus, chargeId])

  const generateQrCode = async () => {
    setPaymentStatus("generating")
    try {
      const res = await fetch("/api/checkout/omise", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: total }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "สร้างคิวอาร์โค้ดไม่สำเร็จ")

      setChargeId(data.chargeId)
      setQrCodeUrl(data.qrCodeImageUrl)
      setPaymentStatus("pending")
    } catch (error: any) {
      setPaymentStatus("idle")
      toast.error(error.message || "ไม่สามารถสร้างคิวอาร์โค้ดได้")
    }
  }

  const simulatePaymentSuccess = async () => {
    if (!chargeId) return
    try {
      const res = await fetch("/api/checkout/omise/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chargeId }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "จำลองจ่ายเงินไม่สำเร็จ")
      toast.success("จำลองการจ่ายเงินสำเร็จ รอยืนยันการชำระ...")
    } catch (error: any) {
      toast.error(error.message || "จำลองการจ่ายเงินล้มเหลว")
    }
  }

  const submitSaleRecord = async (overrideMethod?: "CASH" | "PROMPTPAY") => {
    const methodToUse = overrideMethod || paymentMethod
    if (methodToUse === "CASH" && cash > 0 && cash < total) {
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
        paymentMethod: methodToUse,
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
      if (methodToUse === "PROMPTPAY") {
        setPaymentStatus("idle")
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="sm:max-w-[425px]"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Receipt className="h-5 w-5 text-primary" /> ยืนยันการชำระเงิน
          </DialogTitle>
          <DialogDescription>
            เลือกวิธีชำระเงินและตรวจสอบยอดสุทธิ
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-3">
          {/* Top Invoice Card */}
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

          {/* Payment Method Toggle Selector */}
          <div className="grid grid-cols-2 gap-1.5 p-1 bg-muted/60 rounded-xl border select-none">
            <button
              type="button"
              onClick={() => {
                if (paymentStatus === "idle" || paymentStatus === "failed") {
                  setPaymentMethod("CASH")
                }
              }}
              disabled={paymentStatus === "generating" || paymentStatus === "pending" || paymentStatus === "successful"}
              className={`flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg transition-all duration-200 cursor-pointer ${
                paymentMethod === "CASH"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-card/30"
              }`}
            >
              <Coins className="h-3.5 w-3.5" />
              ชำระเงินสด
            </button>
            <button
              type="button"
              onClick={() => {
                if (paymentStatus === "idle" || paymentStatus === "failed") {
                  setPaymentMethod("PROMPTPAY")
                }
              }}
              disabled={paymentStatus === "generating" || paymentStatus === "pending" || paymentStatus === "successful"}
              className={`flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg transition-all duration-200 cursor-pointer ${
                paymentMethod === "PROMPTPAY"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-card/30"
              }`}
            >
              <QrCode className="h-3.5 w-3.5" />
              PromptPay QR
            </button>
          </div>

          {/* Payment Method Screens */}
          {paymentMethod === "CASH" ? (
            <div className="space-y-4 pt-1 animate-fade-in-scale">
              <div className="space-y-2">
                <Label htmlFor="cash">รับเงินสด (บาท)</Label>
                <Input
                  id="cash"
                  type="number"
                  placeholder="จำนวนเงินที่รับมา (เว้นว่างได้)"
                  value={cashReceived}
                  onChange={(e) => setCashReceived(e.target.value)}
                  className="text-lg rounded-xl h-11"
                  autoFocus
                />
              </div>

              {cash > 0 && (
                <div className={`p-4 rounded-xl border flex justify-between items-center ${
                  isEnoughCash 
                    ? 'bg-[var(--success-soft)] border-transparent text-[var(--success)]' 
                    : 'bg-destructive/10 border-destructive/20 text-destructive'
                }`}>
                  <span className="font-medium text-sm">เงินทอน</span>
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
                  className="rounded-xl"
                />
              </div>
            </div>
          ) : (
            // PromptPay View State Machine
            <div className="border rounded-xl p-4 bg-muted/10 min-h-[220px] flex flex-col justify-center">
              {paymentStatus === "idle" && (
                <div className="flex flex-col items-center justify-center text-center space-y-4 animate-fade-in-scale">
                  <QrCode className="h-14 w-14 text-primary/40 stroke-[1.5]" />
                  <div className="space-y-1">
                    <p className="text-sm font-bold">สแกนชำระด้วย PromptPay QR</p>
                    <p className="text-xs text-muted-foreground">ระบบจะสร้างคิวอาร์ความปลอดภัยพร้อมล็อกยอดเงินสุทธิ</p>
                  </div>
                  <Button 
                    onClick={generateQrCode}
                    className="w-full max-w-[200px] rounded-xl h-10 font-bold"
                  >
                    สร้าง QR Code โอนเงิน
                  </Button>
                </div>
              )}

              {paymentStatus === "generating" && (
                <div className="flex flex-col items-center justify-center text-center space-y-3">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="text-xs font-semibold text-muted-foreground">กำลังเจเนอเรต QR Code จาก Omise...</p>
                </div>
              )}

              {paymentStatus === "pending" && (
                <div className="flex flex-col items-center justify-center text-center space-y-4 animate-fade-in-scale">
                  <div className="relative p-2 bg-white rounded-xl border shadow-sm">
                    <img 
                      src={qrCodeUrl!} 
                      alt="PromptPay QR Code" 
                      className="h-44 w-44 object-contain select-none" 
                    />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-primary animate-pulse flex items-center gap-1.5 justify-center">
                      <Loader2 className="h-3 w-3 animate-spin" /> กำลังตรวจสอบยอดชำระเงิน...
                    </p>
                    <p className="text-[10px] text-muted-foreground">ลูกค้าสแกน QR Code เพื่อชำระยอดเงิน {formatCurrency(total)}</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={simulatePaymentSuccess}
                    className="text-[10px] h-8 border-dashed text-primary border-primary/30 bg-primary/5 hover:bg-primary/10 rounded-xl"
                  >
                    จำลองชำระเงินสำเร็จ (Test Mode)
                  </Button>
                </div>
              )}

              {paymentStatus === "successful" && (
                <div className="flex flex-col items-center justify-center text-center space-y-3 animate-fade-in-scale">
                  <div className="h-12 w-12 bg-[var(--success-soft)] text-[var(--success)] flex items-center justify-center rounded-full shadow-inner animate-[fadeInScale_0.3s_var(--ease-spring)]">
                    <CheckCircle2 className="h-8 w-8 stroke-[2.5]" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[var(--success)]">ชำระเงินเสร็จสมบูรณ์!</p>
                    <p className="text-xs text-muted-foreground mt-1">กำลังบันทึกประวัติเข้าระบบ...</p>
                  </div>
                </div>
              )}

              {paymentStatus === "failed" && (
                <div className="flex flex-col items-center justify-center text-center space-y-3 animate-fade-in-scale">
                  <p className="text-xs font-bold text-destructive">ชำระเงินล้มเหลว หรือหมดเวลา</p>
                  <Button 
                    onClick={generateQrCode}
                    className="rounded-xl h-8 text-xs"
                  >
                    สร้าง QR Code อีกครั้ง
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="mt-2">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={isLoading || paymentStatus === "generating" || paymentStatus === "pending" || paymentStatus === "successful"}
            className="rounded-xl"
          >
            ยกเลิก
          </Button>
          {paymentMethod === "CASH" && (
            <Button 
              onClick={() => submitSaleRecord("CASH")} 
              disabled={isLoading || (cash > 0 && cash < total)}
              className="gap-2 rounded-xl"
            >
              {isLoading ? "กำลังบันทึก..." : (
                <>
                  <CheckCircle2 className="h-4 w-4" /> ยืนยันชำระเงิน
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
